import { useState, useRef, useCallback, useMemo } from "react";
import { teams } from "../../../common/data/teams";
import { CommitsDto } from "../types/commits.dto";

export function useCommits() {
  const [data, setData] = useState<CommitsDto>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isError = useMemo(() => !!loading, [loading]);

  const inputValue = useRef("");

  const fetchCommits = useCallback(async (repo: string) => {
    try {
      setLoading(true);
      if (!teams.includes(repo)) {
        setError("Invalid repo.");
        return;
      }
      const response = await fetch(
        `http://${location.host}/api/commits/${repo}`
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
    fetchCommits(inputValue.current);
  }, []);

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
