"use client";

import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Card,
  Flex,
  Timeline,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import { useState } from "react";
import styles from "./page.module.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  return (
    <main className={styles.main}>
      <Button
        color="yellow"
        size="sm"
        sx={{
          margin: "auto",
        }}
        onClick={() => {
          window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,user`;
        }}
      >
        Login with github
      </Button>
    </main>
  );
}
