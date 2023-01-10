import { useEffect, useState } from "react";

export const useGHLogin = (code: string | null) => {
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    if (code) {
      fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_NEXT_SECRET,
          code: code,
        }),
        headers: {
          Accept: "application/json",
        },
      }).then((res) => {
        res.json().then((data) => {
          setToken(data.access_token);
        });
      });
    }
  }, [code]);
  return token;
};
