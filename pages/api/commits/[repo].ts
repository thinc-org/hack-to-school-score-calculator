import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";
import lint from "@commitlint/lint";
//@ts-ignore
import config from "@commitlint/config-conventional";
import { teams } from "../../../common/data/teams";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { repo } = req.query;
  if (!teams.includes(repo as string)) {
    res.json({ error: "Invalid repo" });
    return;
  }
  const getTotal = {
    query: `{
      repository(name: "${repo}", owner: "thinc-org") {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 100) {
                totalCount
              }
            }
          }
        }
      }
    }`,
  };

  const headers = {
    Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
  };

  const totalResponse = await axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers: headers,
    data: getTotal,
  });

  const total =
    totalResponse.data.data.repository.defaultBranchRef.target.history
      .totalCount;
  let lastCursor = "";
  const commits = [];
  let totalCount = total;
  for (let index = 0; index <= total; index += 100) {
    const query = {
      query: `{
        repository(name: "${repo}", owner: "thinc-org") {
          defaultBranchRef {
            target {
              ... on Commit {
                history(${
                  lastCursor != "" && lastCursor
                    ? `after: "${lastCursor}",`
                    : ""
                }first: ${totalCount < 100 ? totalCount : 100}) {
                  edges {
                    node {
                      message
                      author {
                        name
                        avatarUrl
                      }
                    }
                    cursor
                  }
                }
              }
            }
          }
        }
      }`,
    };
    const reponse = await axios({
      url: "https://api.github.com/graphql",
      method: "post",
      headers: headers,
      data: query,
    });
    const edges =
      reponse.data.data.repository.defaultBranchRef.target.history.edges;
    commits.push(...edges);
    lastCursor = edges[edges.length - 1].cursor;
    totalCount -= 100;
  }

  const lintResult = await Promise.all(
    commits.map((commit) => {
      return new Promise<any>((resolve) => {
        lint(commit.node.message, config.rules).then((result) => {
          resolve({
            ...result,
            author: commit.node.author.name,
            avatarUrl: commit.node.author.avatarUrl,
          });
        });
      });
    })
  );

  res.send({
    ...lintResult.reduce(
      (acc, cur) => {
        if (cur.valid) {
          acc.valid += 1;
        } else {
          acc.invalid += 1;
        }
        return acc;
      },
      { valid: 0, invalid: 0 }
    ),
    lintResult,
  });
}
