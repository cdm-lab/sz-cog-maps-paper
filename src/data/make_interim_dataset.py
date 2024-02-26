import argparse
import os
import src.data.dataset_utils as ds_utils


def make_dataset(input_path, output_path, subjects, exp):
    print(f"making stakes df at {output_path}")
    ds_utils.make_overall_stake_df(input_path, output_path, subjects)
    print(f"making slider df and slider_hvl_df at {output_path}")
    ds_utils.make_slider_df(input_path, output_path, subjects)
    ds_utils.make_slider_df(input_path, output_path, subjects, hvl=True)


def main():
    parser = argparse.ArgumentParser(
        description="Code to generate working dataset csvs for 2step analyses"
    )
    parser.add_argument(
        "-e",
        "--exp",
        required=False,
        help="whether you want analyses on cohort 1 or cohort 2 (for memory)",
        default=1,
        type=int,
    )
    args = parser.parse_args()
    exp = args.exp
    input_path = f"data/raw/experiment_{exp}"
    if exp == 1:
        ds_utils.make_sub_dicts(input_path, 4, 256)
    else:
        ds_utils.make_sub_dicts(input_path, 2, 200)
    output_path = f"data/interim/experiment_{exp}"
    subject_csvs_dir = os.path.join(output_path, "subject_csvs")
    if not os.path.exists(output_path):
        os.mkdir(output_path)
    if not os.path.exists(subject_csvs_dir):
        os.mkdir(subject_csvs_dir)
    exp = args.exp
    print("creating clean list of subjects because one was not provided")
    subjects = ds_utils.make_good_subjects_list(
        input_path, output_path, exp
    )  # TODO this sublist code is not working for the current batch of subjects (find out why and fix)
    # with open("sublist.txt", "r") as f:
    #     subjects = f.read().splitlines()
    print("making interim dataset!")
    print(f"subjects: {subjects}")
    make_dataset(input_path, output_path, subjects, exp)


if __name__ == "__main__":
    main()
