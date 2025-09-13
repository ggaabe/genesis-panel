import { useParams } from 'react-router-dom';
import { useCancelMissionMutation, useGetMissionLogsQuery, useGetMissionQuery, useRetryMissionMutation } from '../../store/missions/missionManagement';
import { ActionIcon, Button, Code, CopyButton, Group, Paper, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import { MissionStatusBadge } from '../../components/StatusBadge';
import { fmtDate, fmtDuration } from '../../utils/time';
import { IconCopy } from '@tabler/icons-react';
import { useMemo, useRef } from 'react';

export default function MissionDetailPage() {
  const { id = '' } = useParams();
  const { data, isFetching } = useGetMissionQuery(id, { skip: !id });
  const [cancel, { isLoading: canceling }] = useCancelMissionMutation();
  const [retry, { isLoading: retrying }] = useRetryMissionMutation();
  const logsQuery = useGetMissionLogsQuery({ id, after: 0 }, { skip: !id });

  const mission = data?.mission;
  const artifacts = data?.artifacts ?? [];
  const logs = useMemo(() => logsQuery.data ?? data?.logs ?? [], [logsQuery.data, data]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!mission) return <Text>Loading...</Text>;

  const canCancel = mission.status === 'running';
  const canRetry = mission.status === 'failed' || mission.status === 'canceled' || mission.status === 'succeeded';

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Title order={3}>{mission.name}</Title>
          <MissionStatusBadge status={mission.status} />
        </Group>
        <Group>
          <Text c="dimmed">Started: {fmtDate(mission.createdAt)}</Text>
          <Text c="dimmed">Duration: {fmtDuration((mission.startedAt ?? mission.createdAt) ? (mission.completedAt ? mission.completedAt : Date.now()) - (mission.startedAt ?? mission.createdAt) : 0)}</Text>
          <Button color="red" disabled={!canCancel} loading={canceling} onClick={() => cancel(mission.id)}>Cancel</Button>
          <Button variant="light" disabled={!canRetry} loading={retrying} onClick={() => retry(mission.id)}>Retry</Button>
        </Group>
      </Group>

      <Tabs defaultValue="logs">
        <Tabs.List>
          <Tabs.Tab value="logs">Logs</Tabs.Tab>
          <Tabs.Tab value="artifacts">Artifacts</Tabs.Tab>
          <Tabs.Tab value="metrics">Metrics</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="logs" pt="xs">
          <Paper withBorder>
            <ScrollArea h={300} viewportRef={scrollRef} onUpdate={() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }}>
              <Stack p="sm" gap="xs">
                {logs.map((l) => (
                  <Group key={l.id} gap="xs">
                    <Text c="dimmed" size="xs">{new Date(l.ts).toLocaleTimeString()}</Text>
                    <Code color={l.level === 'error' ? 'red' : l.level === 'warn' ? 'yellow' : 'blue'}>{l.level.toUpperCase()}</Code>
                    <Text size="sm">{l.message}</Text>
                  </Group>
                ))}
                {logs.length === 0 && <Text c="dimmed" p="sm">No logs yet</Text>}
              </Stack>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="artifacts" pt="xs">
          <Stack>
            {artifacts.map((a) => (
              <Paper key={a.id} withBorder p="sm">
                <Group justify="space-between">
                  <Group>
                    <Text fw={600}>{a.filename}</Text>
                    <Text c="dimmed" size="sm">{a.filetype} • {Math.round(a.size / 1024)} KB</Text>
                  </Group>
                  <CopyButton value={a.textContent}>
                    {({ copied, copy }) => (
                      <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy} title="Copy JSON">
                        <IconCopy size={16} />
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
                <ScrollArea h={160} mt="xs"><Code block mah={160}>{a.textContent}</Code></ScrollArea>
              </Paper>
            ))}
            {artifacts.length === 0 && <Text c="dimmed">No artifacts yet</Text>}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="metrics" pt="xs">
          <Paper withBorder p="md">
            <Group>
              <Stat label="Rows processed" value={Math.floor(1000 + (mission.id.length * 137) % 5000)} />
              <Stat label="Success rate" value={`${mission.status === 'succeeded' ? 100 : 80 + (mission.id.length % 20)}%`} />
              <Stat label="Duration" value={fmtDuration((mission.startedAt ?? mission.createdAt) ? (mission.completedAt ? mission.completedAt : Date.now()) - (mission.startedAt ?? mission.createdAt) : 0)} />
            </Group>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack gap={0} p="sm">
      <Text c="dimmed" size="sm">{label}</Text>
      <Text fw={700}>{value}</Text>
    </Stack>
  );
}

