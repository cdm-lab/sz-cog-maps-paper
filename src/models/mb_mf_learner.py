"""
Class based approach to the reinforcement learning model used in the rep2step
experiments, still needs some work but it should soon
be able to handle arbitrary transition matrices as long as you are willing to
overwrite a couple builtin functions for the class with your custom implementation
"""

import numpy as np
from scipy.special import logsumexp


def generate_default_tm():
    Tm = np.zeros((4, 2, 2))
    Tm[0] = [[1, 0], [0, 1]]
    Tm[1] = [[1, 0], [0, 1]]
    Tm[2] = [[1, 0], [0, 1]]
    Tm[3] = [[1, 0], [0, 1]]
    return Tm


class ModelBasedModelFreeLearner:
    def __init__(
        self,
        params: dict,
        transition_matrix: np.ndarray,
        final: bool,
        kappa_equivalent: bool,
        high_arm: int,
        stakes: str,
    ):
        # assert len(params) == 11, "incorrect number of params"
        self.beta = params["beta"]  # softmax param
        self.lr = params["alpha"]  # alpha or learning rate parameter
        self.lamb = params["lambda"]
        self.w_lo = params["w_lo"]  # model-based vs model-free mixture param
        self.w_hi = params["w_hi"]  # if stakes == 2 this will be w_hi
        self.st = params["pi"]  # stickiness (how much people like a single item)
        self.respst = params[
            "rho"
        ]  # resp_stickiness (how much they like a response key
        self.eta = params[
            "eta"
        ]  # transition matrix learning rate # TODO make better parameter definitions instead of just reading off a list
        if kappa_equivalent is True:
            self.kappa = self.eta
        elif kappa_equivalent is False:
            self.kappa = params["kappa"]  # transition matrix sophistication
        else:
            return ValueError(
                f"unaccepted kappa_equivalent parameter {kappa_equivalent}"
            )
        self.num_fs = transition_matrix.shape[0]
        self.dtQ = np.zeros((2, 1))
        self.Qmf = np.ones((self.num_fs, 2)) * 0.5
        self.Qmb = 0
        self.Q = []
        self.Q2 = np.ones((2, 1)) * 0.5
        self.M = np.zeros((self.num_fs, 2))
        self.R = np.zeros((2, 1))
        acceptable_stakes = ["1", "2", "2c", "4"]
        if stakes not in acceptable_stakes:
            raise ValueError(f"unnaccepted stake parameter {stakes}")
        self.stakes = stakes
        if isinstance(final, bool):
            self.final = final
        else:
            raise ValueError(f'unaccepted "final" parameter {final}')

        if high_arm == 1:
            self.envs = [3, 4]
        elif high_arm == 2:
            self.envs = [1, 2]
        else:
            raise ValueError(f'unaccepted "high arm" parameter {high_arm}')
        self.Tm = transition_matrix

    def fit_step(
        self,
        stim_left_num: int,
        s1: int,
        s2: int,
        a: int,
        curr_stake: int,
        loglikelihood: float,
        curr_points: float,
    ) -> float:
        """
        Step through a single trial of model fitting
        :param loglikelihood:
        :param stim_left_num: uses left number stim to decide stickiness
        :param s1: first-stage state encountered
        :param s2: second-stage state encountered
        :param a: action selected by ppt
        :param curr_stake: current stake
        :param curr_points: points received by ppt
        :return: negative loglikelihood
        """
        if stim_left_num % 2 == 0:
            self.R = np.flipud(self.R)
        obj_choice = a
        a = a - (s1 - 1) * 2
        self.Qmb = (
            np.atleast_2d(self.Tm[s1 - 1]).T @ self.Q2
        )  # computing model based value function
        w = self.select_w(curr_stake)
        self.update_Q(w, s1)
        new_loglikelihood = self.loglikelihood_calc(a, loglikelihood)
        self.M = np.zeros((self.num_fs, 2))
        self.M[s1 - 1, a - 1] = 1

        self.R = np.zeros((2, 1))
        if obj_choice == stim_left_num:
            self.R[0] = 1
        else:
            self.R[1] = 1
        if not self.final:
            self.update_Tm(s1, s2, a)
        self.update_TD(s1, s2, a, curr_points)
        return new_loglikelihood

    def sim_step(
        self, s1: int, curr_stake: int, curr_rews: list, coin_flip: object = None
    ) -> tuple:
        """
        Step through a trial of a sarsa agent simulation and see what it decides
        :param s1: first-stage state
        :param curr_stake: current stake of the trial
        :param curr_rews: rewards available unbeknownst to agent
        :param coin_flip: whether to select randomly or use mb-mf to select decision
        :return: a tuple consisting of action for the trial, points earned, and states encountered
        """
        self.Qmb = (
            np.atleast_2d(self.Tm[s1 - 1]).T @ self.Q2
        )  # computing model based value function
        w = self.select_w(curr_stake)
        self.update_Q(w, s1)
        a = self.decide(coin_flip)
        s2 = a
        self.M = np.zeros((self.num_fs, 2))
        self.M[s1 - 1, a - 1] = 1

        self.R = np.zeros((2, 1))
        if a == 1:
            self.R[0] = 1
        else:
            self.R[1] = 1
        if not self.final:
            self.update_Tm(s1, s2, a)
        points = curr_rews[s2 - 1]
        self.update_TD(s1, s2, a, points)

        return a, points, [s1, s2]

    def select_w(self, curr_stake: int) -> float:
        """
        Selects which w parameter to update using based on the current stake and env
        :param curr_stake: the current stake multiplier for that trial
        :param s1: first-stage state
        :return: returns the w parameter for the trial
        """
        if self.stakes == "2":
            if curr_stake == 1:
                w = self.w_lo
            else:
                w = self.w_hi
        elif self.stakes == "1":
            w = self.w_lo
        else:
            print("unmatched stake to input!")
            w = None
        return w

    def loglikelihood_calc(self, a: int, loglikelihood: float) -> float:
        """
        Updates the loglikelihood so far of the action sequence
        :param a: action
        :param loglikelihood: loglikelihood before this action
        :return: updated loglikelihood
        """
        loglikelihood = (
            loglikelihood + self.beta * self.Q[a - 1] - logsumexp(self.beta * self.Q)
        )
        return loglikelihood

    def update_Q(self, w: float, s1: int):
        self.Q = (
            w * self.Qmb
            + (1 - w) * np.atleast_2d(self.Qmf[s1 - 1, :]).T
            + self.st * np.atleast_2d(self.M[s1 - 1, :]).T
            + self.respst * self.R
        )

    def decide(self, coin_flip: object = None) -> int:
        """
        Decision function for simulation (uses softmax)
        :param coin_flip: whether or not to choose randomly (useful for sims to exclude ppts)
        :return: selected action as an int
        """
        if coin_flip is None:
            if np.random.uniform(0, 1) > np.exp(self.beta * self.Q[1]) / sum(
                np.exp(self.beta * self.Q)
            ):  # make choice using softmax
                a = 1
            else:
                a = 2
        else:
            if np.random.uniform(0, 1) < 0.5:  # make choice using coin flip
                a = 1
            else:
                a = 2
        return a

    def update_Tm(self, s1: int, s2: int, a: int):
        """
        Updates the transition matrix based on the eta and kappa parameters
        :param s1: first-stage state
        :param s2: second-stage state
        :param a: action
        """
        s1_idx = s1 - 1
        s2_idx = s2 - 1
        a_idx = a - 1
        s2_alt_idx = (
            abs(s2 - 3) - 1
        )  # TODO FIX THIS TO BE ABLE TO UPDATE DIFFERENT TM TYPES
        a_alt_idx = abs(a - 3) - 1
        spe = 1 - self.Tm[s1_idx, :][s2_idx, a_idx]
        self.Tm[s1_idx][s2_idx, a_idx] = self.Tm[s1_idx][s2_idx, a_idx] + self.eta * spe
        self.Tm[s1_idx][s2_alt_idx, a_idx] = self.Tm[s1_idx][s2_alt_idx, a_idx] * (
            1 - self.eta
        )

        virtual_spe = 1 - self.Tm[s1_idx][s2_alt_idx, a_alt_idx]
        self.Tm[s1_idx][s2_alt_idx, a_alt_idx] = (
            self.Tm[s1_idx][s2_alt_idx, a_alt_idx] + (self.kappa) * virtual_spe
        )
        self.Tm[s1_idx][s2_idx, a_alt_idx] = self.Tm[s1_idx][s2_idx, a_alt_idx] * (
            1 - (self.kappa)
        )

    def update_TD(self, s1: int, s2: int, a: int, points: float):
        """
        Update the temporal difference Q values for the class
        :param s1: first-stage state
        :param s2: second-stage state
        :param a: action
        :param points: points received
        """
        s1_idx = s1 - 1
        s2_idx = s2 - 1
        a_idx = a - 1
        self.dtQ[0] = (
            self.Q2[s2_idx] - self.Qmf[s1_idx, a_idx]
        )  # backup with actual choice (i.e., sarsa)
        self.Qmf[s1_idx, a_idx] = (
            self.Qmf[s1_idx, a_idx] + self.lr * self.dtQ[0]
        )  # update TD value function

        self.dtQ[1] = points - self.Q2[s2_idx]  # prediction error (2nd choice)

        self.Q2[s2_idx] = (
            self.Q2[s2_idx] + self.lr * self.dtQ[1]
        )  # update TD value function
        self.Qmf[s1_idx, a_idx] = (
            self.Qmf[s1_idx, a_idx] + self.lamb * self.lr * self.dtQ[1]
        )  # eligibility trace


class FullStakes_MBMF_Learner(ModelBasedModelFreeLearner):
    # this version will have a high and low stakes version of each of the parameters in the base class
    # the high stakes version will be used if the stakes are high
    # the low stakes version will be used if the stakes are low
    # params should have the following keys: beta_hi, beta_lo, alpha_hi, alpha_lo, lambda_hi, lambda_lo, w_hi, w_lo, pi_hi, pi_lo, rho_hi, rho_lo, eta, and kappa
    def __init__(
        self,
        params: dict,
        transition_matrix: np.ndarray,
        high_arm: int,
        stakes: str,
    ):
        self.final = True
        self.num_fs = transition_matrix.shape[0]
        self.dtQ = np.zeros((2, 1))
        self.Qmf = np.ones((self.num_fs, 2)) * 0.5
        self.Qmb = 0
        self.Q = []
        self.Q2 = np.ones((2, 1)) * 0.5
        self.M = np.zeros((self.num_fs, 2))
        self.R = np.zeros((2, 1))
        acceptable_stakes = ["1", "2", "2c", "4"]
        if stakes not in acceptable_stakes:
            raise ValueError(f"unnaccepted stake parameter {stakes}")
        self.stakes = stakes

        if high_arm == 1:
            self.envs = [3, 4]
        elif high_arm == 2:
            self.envs = [1, 2]
        else:
            raise ValueError(f'unaccepted "high arm" parameter {high_arm}')
        self.Tm = transition_matrix
        self.beta_hi = params["beta_hi"]
        self.beta_lo = params["beta_lo"]
        self.alpha_hi = params["alpha_hi"]
        self.alpha_lo = params["alpha_lo"]
        self.lambda_hi = params["lambda_hi"]
        self.lambda_lo = params["lambda_lo"]
        self.w_hi = params["w_hi"]
        self.w_lo = params["w_lo"]
        self.pi_hi = params["pi_hi"]
        self.pi_lo = params["pi_lo"]
        self.rho_hi = params["rho_hi"]
        self.rho_lo = params["rho_lo"]

    def param_stake_switch(self, curr_stake: int):
        if curr_stake == 1:
            self.beta = self.beta_lo
            self.lr = self.alpha_lo
            self.lamb = self.lambda_lo
            self.st = self.pi_lo
            self.respst = self.rho_lo
        elif curr_stake == 5:
            self.beta = self.beta_hi
            self.lr = self.alpha_hi
            self.lamb = self.lambda_hi
            self.st = self.pi_hi
            self.respst = self.rho_hi

    def fit_step(
        self,
        stim_left_num: int,
        s1: int,
        s2: int,
        a: int,
        curr_stake: int,
        loglikelihood: float,
        curr_points: float,
    ) -> float:
        # fit step will be fairly different as I need to swap out the parameters to their high or low stakes equivalents based on stakes
        self.param_stake_switch(curr_stake)
        return super().fit_step(
            stim_left_num, s1, s2, a, curr_stake, loglikelihood, curr_points
        )
