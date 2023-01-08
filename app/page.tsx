"use client";

import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Card,
  Flex,
  Timeline,
  LoadingOverlay,
} from "@mantine/core";
import styles from "./page.module.css";
import { useRef, useState, useEffect, useCallback } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const input = useRef("");
  const getData = useCallback(async (repo: string) => {
    setLoading(true);
    const res = await fetch(`http://localhost:3000/api/commits/${repo}`);
    if (!res.ok) {
      setData([]);
      return;
    }
    const data = await res.json();
    setData(data);
    setLoading(false);
  }, []);
  return (
    <main className={styles.main}>
      <LoadingOverlay visible={loading} overlayBlur={2} />
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          overflow: "visible",
        }}
        shadow="sm"
        radius="md"
        withBorder
      >
        <Flex
          gap="sm"
          justify="space-around"
          align="flex-end"
          direction="row"
          wrap="wrap"
        >
          <Autocomplete
            label="Your favorite framework/library"
            placeholder="Type to search"
            data={["React", "Angular", "Svelte", "Vue"]}
            dropdownPosition="bottom"
            sx={{
              width: "90%",
            }}
            onChange={(value) => (input.current = value)}
          />
          <ActionIcon
            sx={{
              marginBottom: "0.4rem",
            }}
            loading={loading}
            onClick={() => getData(input.current)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </ActionIcon>
        </Flex>
        {!data ? (
          "no data"
        ) : (
          <>
            <section style={{ margin: "1.5rem 0" }}>
              valid: {data.valid}, invalid: {data.invalid}
            </section>
            <Timeline>
              {data.lintResult.map((item: any, index: number) => {
                return (
                  <Timeline.Item
                    key={index}
                    title={
                      <span style={{ color: item.valid ? "black" : "red" }}>
                        {item.input}
                      </span>
                    }
                    bulletSize={22}
                    bullet={
                      <Avatar size={22} radius="xl" src={item.avatarUrl} />
                    }
                  ></Timeline.Item>
                );
              })}
            </Timeline>
          </>
        )}
      </Card>
    </main>
  );
}
