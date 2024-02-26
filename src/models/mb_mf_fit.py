import time
import numpy as np
import pandas as pd
import pickle
import sys
import os
import argparse
import scipy.optimize
from multiprocessing import Pool
from src.models.mb_mf_learner import ModelBasedModelFreeLearner
import scipy.stats as ss
from math import isclose
from src.models.RL_constants import MODELS


def param_init(bounds: list) -> list:
    """

    :param bounds: list of tuples of bounds and param init will return a set of starting points for scipy.optimize
    :return: list of points
    """
    params = []
    for i in range(len(bounds)):
        lower = bounds[i][0]
        higher = bounds[i][1]
        curr_param = np.random.default_rng().uniform(low=lower, high=higher, size=1)
        params.append(curr_param[0])
    return params


def apply_priors(params: list, model_func_params: list) -> float:
    """
    returns log-likelihood of parameters you provide based on the prior distribution.
    Priors used taken from Bolenz et al. 2019
    0: softmax inverse temp
    1: learning rate
    2: eligibility trace decay
    3: weight low stakes low arm(this will be the overall weight if the stakes flag is not triggered)
    4: weight high stakes low arm
    5: weight low stakes high arm
    6: weight high stakes high arm
    7: stickiness
    8: response stickiness
    9: eta (transition matrix updating)
    10: kappa (sophisticated updating of the other action)
    """
    loglikelihood = fit_model(params, **model_func_params)
    beta_ll = np.log(ss.gamma.pdf(params[0], 3, scale=0.2))
    alpha_ll = np.log(ss.beta.pdf(params[1], 2, 2))
    lambda_ll = np.log(ss.beta.pdf(params[2], 2, 2))
    wlolo_ll = np.log(ss.beta.pdf(params[3], 2, 2))
    whilo_ll = np.log(ss.beta.pdf(params[4], 2, 2))

    stick_ll = np.log(ss.norm.pdf(params[5], 0, 1))
    resp_stick_ll = np.log(ss.norm.pdf(params[6], 0, 1))
    if isclose(params[-1], 1.0, rel_tol=1e-8):
        eta_ll = 0
        kappa_ll = 0
    else:
        eta_ll = np.log(ss.beta.pdf(params[7], 2, 2))
        kappa_ll = np.log(ss.beta.pdf(params[8], 2, 2))
    priors_total_ll = (
        beta_ll
        + alpha_ll
        + lambda_ll
        + wlolo_ll
        + whilo_ll
        + stick_ll
        + resp_stick_ll
        + eta_ll
        + kappa_ll
    )
    posterior_ll = loglikelihood - priors_total_ll
    return posterior_ll


def fit_model(params, data, stakes, final, kappa_equivalent, high_arm, Tm):
    param_names = [
        "beta",
        "alpha",
        "lambda",
        "w1",
        "w2",
        "pi",
        "rho",
        "eta",
        "kappa",
    ]  # TODO make this work with either model so the parameter list should be variable
    fin_params = {key: value for (key, value) in zip(param_names, params)}
    MBMF_learner = ModelBasedModelFreeLearner(
        fin_params,
        Tm,
        final,
        kappa_equivalent=kappa_equivalent,
        high_arm=high_arm,
        stakes=stakes,
    )
    data = data[data["rt_2"] != -1].reset_index(drop=True)
    stim_left_nums = data["stim_left_num"].values
    state1s = data["state1"].values
    state2s = data["state2"].values
    actions = data["choice1"].values
    stakes = data["stake"].values
    points = data["points"].values
    loglikelihood = 0
    for i in range(len(stim_left_nums)):
        loglikelihood = MBMF_learner.fit_step(
            stim_left_nums[i],
            state1s[i],
            state2s[i],
            actions[i],
            stakes[i],
            loglikelihood,
            points[i],
        )
    return -loglikelihood


def fit(data, model_init_params):
    stakes = model_init_params[0]
    final = model_init_params[1]
    kappa_equivalent = model_init_params[2]
    high_arm = model_init_params[3]
    Tm = model_init_params[4]
    bounds = [
        (0.00001, 20),
        (0.00001, 0.9999),
        (0.00001, 0.9999),
        (0.00001, 0.9999),
        (0.00001, 0.9999),
        (-20, 20),
        (-20, 20),
        (0.00001, 0.9999),
        (0.00001, 0.9999),
    ]

    params = param_init(bounds)
    results = scipy.optimize.minimize(
        apply_priors,
        params,
        args=([data, stakes, final, kappa_equivalent, high_arm, Tm]),
        method="L-BFGS-B",
        bounds=bounds,
    )
    return [results, params]


def main():
    start_time = time.time()
    parser = argparse.ArgumentParser(
        description="Model fitting code for two stage task using MAP"
    )
    parser.add_argument(
        "-s", "--sub_path", required=True, help="Source file for subject_csv"
    )
    parser.add_argument(
        "-n",
        "--num_inits",
        required=True,
        help="specify how many parameter intializations you would like",
    )
    parser.add_argument(
        "-x",
        "--stakes",
    )
    parser.add_argument(
        "-c",
        "--num_cores",
        required=True,
        help="How many cores would you like to run in parallel",
    )
    parser.add_argument(
        "-t",
        "--sophistication",
        required=False,
        help="whether or not people make inferences about the other decision given the one they picked",
        action="store_true",
        default=False,
    )
    parser.add_argument(
        "-f",
        "--final",
        required=False,
        help="whether you would like people to start off with final trans_mat",
        action="store_true",
        default=False,
    )
    parser.add_argument(
        "-o", "--output_path", required=True, help="point to where you want data saved"
    )
    args = parser.parse_args()
    sub_path = args.sub_path  # Path to the subject data
    if not os.path.exists(sub_path):
        print("%s does not exist!" % sub_path)
        sys.exit(0)
    parameter_initializations = int(
        args.num_inits
    )  # how many resets for parameter initialization
    stakes = args.stakes  # whether or not to include stakes
    if stakes not in ("1", "2", "full"):
        raise ValueError

    if stakes == "full":
        model = MODELS["fullStakesMBMF"]
    else:
        model = MODELS["baseMBMF"]

    num_cores = int(args.num_cores)
    sophistication = args.sophistication

    final = args.final
    output_path = args.output_path

    sub_df = pd.read_csv(sub_path)
    sub = sub_df.iloc[0].subid
    if final:
        Tm = np.zeros((2, 2, 2))
        Tm[0] = [[1, 0], [0, 1]]
        Tm[1] = [[1, 0], [0, 1]]
    else:
        Tm = np.zeros((2, 2, 2))
        Tm[0] = [[0.5, 0.5], [0.5, 0.5]]
        Tm[1] = [[0.5, 0.5], [0.5, 0.5]]

    data = sub_df[sub_df["rt_2"] != -1].reset_index(drop=True)
    data["state2"] = data["state2"].astype(int)
    data["state1"] = data["state1"].astype(int)
    high_arm = data.iloc[0].high_arm  # not important for experiment 1

    model_init_params = (stakes, final, sophistication, high_arm, Tm)
    my_args = []
    for _ in range(parameter_initializations):
        my_arg_tup = (data, model_init_params)
        my_args.append(my_arg_tup)
    pool = Pool(num_cores)
    results = pool.starmap(fit, my_args)
    if sophistication:
        filename = os.path.join(
            output_path,
            f"{sub}_w{stakes}_{sophistication}_fits.pickle",
        )
    elif not final:
        filename = os.path.join(
            output_path, f"{sub}_w{stakes}_learnedtransmats_fits.pickle"
        )
    else:
        filename = os.path.join(
            output_path, f"{sub}_w{stakes}_finaltransmats_fits.pickle"
        )
    with open(filename, "wb") as handle:
        pickle.dump(results, handle)
    print("--- %s seconds ---" % (time.time() - start_time))


# TODO I think this code needs a lot of reworking to be nice to use with either model and then I can specify the model, as well as get rid of flags that I'm not really even using
if __name__ == "__main__":
    main()
