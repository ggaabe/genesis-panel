import {
  Button,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
  Paper,
} from "@mantine/core";
import { useChat } from "./ChatContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

export function ChatSidebar() {
  const { messages, send } = useChat();
  const [input, setInput] = useState("");

  return (
    <Stack h="100%" gap="xs">
      <Title order={5}>Agent Chat</Title>
      <ScrollArea style={{ flex: 1 }}>
        <Stack>
          {messages.map((m) =>
            m.role === "agent" ? (
              <Paper
                key={m.id}
                withBorder
                p="xs"
                radius="md"
                bg="var(--mantine-color-gray-light)"
              >
                <Stack gap={4}>
                  <Group gap="xs">
                    <Text fw={600}>Agent</Text>
                    <Text c="dimmed" size="xs">
                      {new Date(m.ts).toLocaleTimeString()}
                    </Text>
                  </Group>
                  <Text size="sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </Text>
                </Stack>
              </Paper>
            ) : (
              <Stack key={m.id} p="xs">
                <Group gap="xs">
                  <Text fw={600}>You</Text>
                  <Text c="dimmed" size="xs">
                    {new Date(m.ts).toLocaleTimeString()}
                  </Text>
                </Group>
                <Text size="sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </Text>
              </Stack>
            )
          )}
        </Stack>
      </ScrollArea>
      <Textarea
        placeholder="Message the agent..."
        autosize
        minRows={2}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
              send(input.trim());
              setInput("");
            }
          }
        }}
      />
      <Group justify="right">
        <Button
          onClick={() => {
            if (input.trim()) {
              send(input.trim());
              setInput("");
            }
          }}
        >
          Send
        </Button>
      </Group>
    </Stack>
  );
}
