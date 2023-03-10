import { useState, useRef, useCallback, useMemo } from "react";
import { teams } from "../../../common/data/teams";
import { CommitsDto } from "../types/commits.dto";

export function useCommits(token: string) {
  const [data, setData] = useState<CommitsDto>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isError = useMemo(() => !!loading, [loading]);

  const inputValue = useRef("");
  const fetchCommits = useCallback(async (repo: string,token:string) => {
    try {
      setLoading(true);
      if (!teams.includes(repo)) {
        setError("Invalid repo.");
        return;
      }
      const response = await fetch(
        `${location.origin}/api/commits/${repo}?token=${token}`
      );

      if (!response.ok) {
        setError("Error fetching commits.");
        return;
      }
      const resJson: CommitsDto = await response.json();
      setError("");
      setData(resJson);
    } catch (error) {
      setError("Some thing went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = useCallback((e: any) => {
    e.preventDefault();
    fetchCommits(inputValue.current,token);
  }, [token]);

  return {
    data,
    error,
    loading,
    isError,
    inputValue,
    fetchCommits,
    onSearch,
  };
}
