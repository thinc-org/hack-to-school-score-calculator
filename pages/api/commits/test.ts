import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";
import { CommitDto } from "../../../common/types/commits.type";
import lint from "@commitlint/lint";
import { LintOutcome } from "@commitlint/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headers = {
    Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
  };
  const perPage = 100;
  const promiseCommits = [];
  for (let i = 1; i <= 6; i++) {
    const page = i;
    const url = `https://api.github.com/repos/thinc-org/cugetreg/commits?page=${page}&per_page=${perPage}`;
    promiseCommits.push(axios.get<CommitDto[]>(url, { headers }));
  }
  try {
    const commitsArr = await Promise.allSettled(promiseCommits);
    const commits = commitsArr.flatMap((v) => {
      if (v.status === "fulfilled") {
        return v.value.data;
      }
      return [];
    });
    const promiseParsedCommits = commits.map((commit) =>
      lint(commit.commit.message)
    );
    const parsedCommits = await Promise.allSettled(promiseParsedCommits);
    res.json(
      parsedCommits
        .filter((pc) => pc.status === "rejected")
        .map((pc) => {
          const { reason } = pc as PromiseRejectedResult;
          return reason;
        })
    );
  } catch (error) {
    res.status(500).json(error);
  }
}
