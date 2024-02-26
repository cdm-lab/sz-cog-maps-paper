import os
import pickle

import numpy as np
import pandas as pd
from sklearn import linear_model

import src.data.utils as utils


def stringify(input_df):
    """
    Returns in place a version of the dataframe where the subject id column is changed to a str type if it isn't already
    :param input_df: dataframe you want to change
    :return: nothing (alters df in place)
    """
    if not isinstance(input_df.loc[0, "subid"], str):
        input_df["subid"] = input_df["subid"].astype(str)


def filter_df(input_df, subject_list):
    """
    Returns a filtered version of the input dataframe where subjects that aren't in the list are removed
    :param input_df: any of the interim dataframes
    :param subject_list: list of subjects you want to select
    :return: filtered_df which contains only subjects you want
    """
    if "Unnamed: 0" in input_df.columns:
        input_df = input_df.drop(columns={"Unnamed: 0"})
    filtered_df = input_df[input_df["subid"].isin(subject_list)]
    return filtered_df


def make_sub_dicts(input_path, num_first_stage, len_of_study):
    """
    Generates subject dictionaries containing information about which contexts were high-stake, which objects belong to
    which context, etc.
    :param input_path: path where the data live and where the sub_dict.pickle will be saved
    :return:nothing
    """
    stake_df = pd.read_csv(os.path.join(input_path, "maps_2step_stake_data.csv"))
    stringify(stake_df)
    sub_dict = {}
    for sub in stake_df.subid.unique():
        sub_dict[sub] = utils.create_sub_dict(
            sub, stake_df, num_first_stage, len_of_study
        )

    output_pickle = os.path.join(input_path, "sub_dicts.pickle")
    with open(output_pickle, "wb") as handle:
        pickle.dump(sub_dict, handle)


def make_good_subjects_list(input_path, output_path, exp_num=2):
    stake_df = pd.read_csv(os.path.join(input_path, "maps_2step_stake_data.csv"))
    slider_df = pd.read_csv(os.path.join(input_path, "maps_2step_slider.csv"))
    slider_df = slider_df.drop_duplicates()
    pickle_path = os.path.join(input_path, "sub_dicts.pickle")
    with open(pickle_path, "rb") as handle:
        sub_dict = pickle.load(handle)

    for df in stake_df, slider_df:
        stringify(df)

    num_thresh_stake = 0
    num_thresh_dict = 0
    num_thresh_slider = 0
    bad_subjects = [
        "smorse",
        "atabk",
        "A2R75YFKVALBXE",
        "A1ROEDVMTO9Y3X",
        "A1T3ROSW2LC4FG",
        "A34CPKFZXBX1PO",
        "A3LVLZS8S41ZD7",
        "A1Y0Y6U906ABT5",
        "A26RO8GGTQAXGG",
        "A1FKRZKU1H9YFC",
        "5928",
        "6101",
    ]  # test participants
    subids = stake_df.subid.unique()
    for sub in subids:  # creat bad_subjects list based on RT threshold
        percentages = (
            stake_df[stake_df["subid"] == sub]["rt_2"].value_counts(normalize=True)
            * 100
        )
        sub_slider_df = slider_df[slider_df["subid"] == sub]
        if sub_dict[sub] == "is a bad subject":
            bad_subjects.append(sub)
            num_thresh_dict += 1
            continue
        if -1 in percentages.index:
            if percentages[-1] > 20:
                bad_subjects.append(sub)
                num_thresh_stake += 1
                continue
        # Cleaning based on behavRSA task
        # if len(sub_slider_df) != 180:
        #     bad_subjects.append(sub)
        #     num_thresh_slider += 1
        #     continue
        if sub_slider_df["response"].isna().sum() >= 18:
            bad_subjects.append(sub)
            num_thresh_slider += 1
            continue
        if exp_num == 1:
            stake, isbad = utils.create_stake_sorted_sliders(
                sub_dict, sub, sub_slider_df
            )
        else:
            stake, isbad = utils.create_2stage_sorted_sliders(
                sub_dict, sub, sub_slider_df
            )
        if isbad:
            bad_subjects.append(sub)
            num_thresh_slider += 1
            continue

    good_subjects = [x for x in subids if x not in bad_subjects]
    print(f"thresholded by dict {num_thresh_dict}")
    print(f"thresholded by stakes {num_thresh_stake}")
    print(f"thresholded by slider {num_thresh_slider}")
    filename = os.path.join(output_path, f"exp{exp_num}_good_subjects.txt")
    with open(filename, "w") as f:
        for sub in good_subjects:
            f.write(f"{sub}\n")
    return good_subjects


def model_fit_threshold(input_path, output_path, subjects, exp_num):
    w1_map_df = pd.read_csv(os.path.join(input_path, "w1_map_df.csv"))
    bad_subjects = []
    num_thresh_model_fit = 0
    subids = subjects
    for sub in subids:
        sub_w1_map_df = w1_map_df[w1_map_df["subid"] == sub]
        assert len(sub_w1_map_df) > 0, f"you need to rerun model fit for {sub}!"
        if sub_w1_map_df["LL"].values[0] > 172.846:
            bad_subjects.append(sub)
            num_thresh_model_fit += 1
            continue
    print(f"thresholded by model fit {num_thresh_model_fit}")
    good_subjects = [x for x in subids if x not in bad_subjects]
    filename = os.path.join(output_path, f"exp{exp_num}_good_subjects.txt")
    with open(filename, "w") as f:
        for sub in good_subjects:
            f.write(f"{sub}\n")
    return good_subjects


def make_overall_stake_df(input_path, output_path, subjects=None):
    """
    Creates overall_stake_df given the input_path, output_path, and subject_list
    :param input_path: path to look for the raw csv data for the 2step task
    :param output_path: path to save out the overall stake_df and sub_dict
    :param subjects: the subids that you would like to include
    :return: outputs overall_stake_df to output_path
    """

    stake_df = pd.read_csv(os.path.join(input_path, "maps_2step_stake_data.csv"))
    stringify(stake_df)
    subids = subjects
    assert (
        len(set(subids) - set(stake_df.subid.unique())) <= 0
    ), "trying to grab subjects that don't exist in raw data!"
    overall_df = pd.DataFrame()
    for sub in subids:
        sub_df = utils.create_fit_df(sub, stake_df)
        filename = f"subject_csvs/sub_{sub}.csv"
        out_file = os.path.join(output_path, filename)
        sub_df.to_csv(out_file)
        overall_df = pd.concat([overall_df, sub_df])
    # fixing stake df
    overall_df["high or low arm"] = "low"
    overall_df = overall_df.reset_index()
    overall_df.loc[
        np.where((overall_df["high_arm"] == 2) & (overall_df["state1"] == 1))[0],
        "high or low arm",
    ] = "high"
    overall_df.loc[
        np.where((overall_df["high_arm"] == 2) & (overall_df["state1"] == 2))[0],
        "high or low arm",
    ] = "high"

    overall_df.loc[
        np.where((overall_df["high_arm"] == 1) & (overall_df["state1"] == 3))[0],
        "high or low arm",
    ] = "high"
    overall_df.loc[
        np.where((overall_df["high_arm"] == 1) & (overall_df["state1"] == 4))[0],
        "high or low arm",
    ] = "high"
    overall_out_file = os.path.join(output_path, "overall_stake_df.csv")
    overall_df = overall_df.drop(columns={"index"})
    overall_df.to_csv(overall_out_file)


def make_slider_df(input_path, output_path, subjects=None, hvl=False):
    """
    Generates the dataframe and slider_dicts that contains the behRSA data
    :param input_path: path to look for the raw csv data for the slider task
    :param output_path: path to save out
    slider_dict and slider_df
    :param subjects: list of subjects to include in analysis (if not provided subids are
    sourced from sub_dict in input path)
    :param hvl: whether you want standard model matrices or are comparing hvl (hvl=True)
    :return: outputs a slider_dict and slider_df containing data for use in further analyses
    """
    slider_df = pd.read_csv(os.path.join(input_path, "maps_2step_slider.csv"))
    slider_df = slider_df.drop_duplicates()
    stringify(slider_df)
    pickle_path = os.path.join(input_path, "sub_dicts.pickle")
    with open(pickle_path, "rb") as handle:
        sub_dict = pickle.load(handle)
    slider_dict = {}
    subids = subjects
    assert (
        len(set(subids) - set(slider_df.subid.unique())) <= 0
    ), "trying to grab subjects that don't exist in raw data!"
    for sub in subids:
        sub_slider_df = slider_df[slider_df["subid"] == sub]
        stake, isbad = utils.create_2stage_sorted_sliders(sub_dict, sub, sub_slider_df)
        slider_dict[sub] = [sub, stake]
    coef_vals = {}
    if not hvl:
        model_mats = utils.create_model_matrices()
        # Fitting standard version of matrices
        for sub in slider_dict:
            post_minus_pre_state1 = slider_dict[sub][1][1][:6, :6]
            np.fill_diagonal(post_minus_pre_state1, 100)
            sub_regr_df = pd.DataFrame()
            lower_indices = np.tril_indices(6, -1, 6)  # m, k n
            sub_regr_df["state1"] = model_mats[0][:6, :6][lower_indices].flatten()
            sub_regr_df["l"] = model_mats[1][:6, :6][lower_indices].flatten()
            sub_regr_df["o"] = model_mats[2][:6, :6][lower_indices].flatten()
            sub_regr_df["subject_data"] = post_minus_pre_state1[lower_indices].flatten()
            sub_regr_df["subid"] = sub
            regr_high = linear_model.LinearRegression()
            X = sub_regr_df[["state1", "l", "o"]]
            y = sub_regr_df["subject_data"]
            regr_high.fit(X, y)
            # adj_rsquared = 1 - (1-regr_high.score(X, y))*(len(y)-1)/(len(y)-X.shape[1]-1) #calculating adjusted_rsquared
            coef_vals[sub] = [
                regr_high.coef_[0],
                regr_high.coef_[1],
                regr_high.coef_[2],
                sub_dict[sub]["high_arm"],
            ]
        model_mat_fits = pd.DataFrame(coef_vals).T.reset_index()
        model_mat_fits = model_mat_fits.rename(
            columns={
                "index": "subid",
                0: "state1_coef",
                1: "l_coef",
                2: "o_coef",
                3: "high_arm",
            }
        )
        model_mat_outfile = os.path.join(output_path, "model_mat_fits.csv")
    if hvl:
        model_mats_highlow = utils.create_model_matrices_hvl()
        coef_vals = {}
        for sub in slider_dict:
            post_minus_pre_state1 = slider_dict[sub][1][1] - slider_dict[sub][1][0]
            np.fill_diagonal(post_minus_pre_state1, 100)
            sub_regr_df = pd.DataFrame()
            lower_indices = np.tril_indices(6, -1, 6)  # m, k n
            sub_regr_df["state1_high"] = model_mats_highlow["state1_high"][
                lower_indices
            ].flatten()
            sub_regr_df["state1_low"] = model_mats_highlow["state1_low"][
                lower_indices
            ].flatten()
            sub_regr_df["l_high"] = model_mats_highlow["l_high"][
                lower_indices
            ].flatten()
            sub_regr_df["l_low"] = model_mats_highlow["l_low"][lower_indices].flatten()
            sub_regr_df["o_high"] = model_mats_highlow["o_high"][
                lower_indices
            ].flatten()
            sub_regr_df["o_low"] = model_mats_highlow["o_low"][lower_indices].flatten()
            sub_regr_df["subject_data"] = post_minus_pre_state1[lower_indices].flatten()
            sub_regr_df["subid"] = sub
            regr_high = linear_model.LinearRegression()
            regr_high.fit(
                sub_regr_df[
                    ["state1_high", "l_high", "o_high", "state1_low", "l_low", "o_low"]
                ],
                sub_regr_df["subject_data"],
            )
            coef_vals[sub] = [
                regr_high.coef_[0],
                regr_high.coef_[1],
                regr_high.coef_[2],
                regr_high.coef_[3],
                regr_high.coef_[4],
                regr_high.coef_[5],
                sub_dict[sub]["high_arm"],
            ]
            model_mat_fits = pd.DataFrame(coef_vals).T.reset_index()
            model_mat_fits = model_mat_fits.rename(
                columns={
                    "index": "subid",
                    0: "state1_high_coef",
                    1: "l_high_coef",
                    2: "o_high_coef",
                    3: "state1_low_coef",
                    4: "l_low_coef",
                    5: "o_low_coef",
                    6: "high_arm",
                }
            )
            model_mat_fits["state1_diff"] = (
                model_mat_fits["state1_high_coef"] - model_mat_fits["state1_low_coef"]
            )
            model_mat_fits["l_diff"] = (
                model_mat_fits["l_high_coef"] - model_mat_fits["l_low_coef"]
            )
            model_mat_fits["o_diff"] = (
                model_mat_fits["o_high_coef"] - model_mat_fits["o_low_coef"]
            )
            model_mat_outfile = os.path.join(output_path, "model_mat_fits_hvl.csv")
    model_mat_fits.to_csv(model_mat_outfile)
    slider_pickle_out = os.path.join(output_path, "slider_dicts.pickle")
    pickle.dump(slider_dict, open(slider_pickle_out, "wb"))


def load_exp_data(data_path):
    # loading slider data
    slider_dicts_path = os.path.join(data_path, "slider_dicts.pickle")
    assert os.path.exists(slider_dicts_path), f"{slider_dicts_path} does not exist!"
    with open(slider_dicts_path, "rb") as file:
        slider_dict = pickle.load(file)
    model_mat_path = os.path.join(data_path, "model_mat_fits.csv")
    assert os.path.exists(model_mat_path), f"{model_mat_path} does not exist!"

    model_mat_fits = pd.read_csv(model_mat_path)
    model_mat_fits = model_mat_fits.drop(columns="Unnamed: 0")
    model_mat_fits = model_mat_fits.rename(
        columns={
            "state1_coef": "Visual cooccurrence",
            "l_coef": "Direct item association",
            "o_coef": "Indirect item association",
        }
    )
    hvl_mat_path = os.path.join(data_path, "model_mat_fits_hvl.csv")
    assert os.path.exists(hvl_mat_path), f"{hvl_mat_path} does not exist!"
    hvl_df = pd.read_csv(hvl_mat_path)
    melted_mmf = hvl_df[["subid", "state1_diff", "l_diff", "o_diff"]].melt(
        id_vars="subid", var_name="coef", value_name="value"
    )

    # loading rl model fit data
    w1_map_file = os.path.join(data_path, "w1_map_df.csv")
    assert os.path.exists(w1_map_file), f"{w1_map_file} does not exist!"
    w1_map_df = pd.read_csv(w1_map_file).drop(columns="Unnamed: 0")

    w4_map_file = os.path.join(data_path, "w4_map_df.csv")

    # loading and formatting stake data
    stake_file = os.path.join(data_path, "overall_stake_df.csv")
    assert os.path.exists(stake_file), f"{stake_file} does not exist!"
    stake_df = pd.read_csv(stake_file)
    good_indices = np.where(stake_df["rt_2"] != -1)[0]
    good_stakes = stake_df.iloc[good_indices]
    good_stakes.loc[:, "rews1"] = good_stakes["rews1"] / 9
    good_stakes.loc[:, "rews2"] = good_stakes["rews2"] / 9
    good_stakes["rews_together"] = (good_stakes["rews1"] + good_stakes["rews2"]) / 2

    grouped_stakes = (
        good_stakes.groupby(["subid"])["points", "rews_together", "rt_1", "rt_2"]
        .mean()
        .reset_index()
    )
    grouped_stakes["Points earned in decision-making task"] = (
        grouped_stakes["points"] - grouped_stakes["rews_together"]
    )

    dprime_file = os.path.join(data_path, "dprime_df.csv")
    if os.path.exists(dprime_file):
        dprime_df = pd.read_csv(dprime_file)
    else:
        print("dprime_df not found")
        dprime_df = ""
    if os.path.exists(w4_map_file):
        w4_map_df = pd.read_csv(w4_map_file).drop(columns="Unnamed: 0")
    else:
        print("w4_map_df not found")
        w4_map_df = ""

    data_dict = {
        "slider_dict": slider_dict,
        "model_mat_fits": model_mat_fits,
        "model_mat_hvl": hvl_df,
        "melted_mmf": melted_mmf,
        "w1_map_df": w1_map_df,
        "w4_map_df": w4_map_df,
        "grouped_stakes": grouped_stakes,
        "dprime_df": dprime_df,
    }
    return data_dict
