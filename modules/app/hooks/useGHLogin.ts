import { useEffect, useState } from "react";

export const useGHLogin = (code: string | null) => {
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    if (code) {
      fetch(`/api/verify?code=${code}`).then((res) => {
        res.json().then((data) => {
          if(data.token == "bad_verification_code") return
          setToken(data.token);
        });
      });
    }
  }, [code]);
  return token;
};
