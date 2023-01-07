import { NextApiResponse, NextApiRequest } from "next";
import axios from "axios";
import { CommitDto } from "../../../common/types/commits.type";
import lint from "@commitlint/lint";
import { LintOutcome } from "@commitlint/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { repo } = req.query;
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
    console.log(lastCursor);
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
    console.log(JSON.stringify(reponse.data, null, 2));
    const edges =
      reponse.data.data.repository.defaultBranchRef.target.history.edges;
    commits.push(...edges);
    lastCursor = edges[edges.length - 1].cursor;
    totalCount -= 100;
  }
}
