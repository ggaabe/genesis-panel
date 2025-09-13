import { ActionIcon, Badge, Button, Group, Modal, Paper, ScrollArea, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Suspense, lazy, useMemo, useState } from 'react';
import { useGetMissionsQuery } from '../../store/api';
import { Mission } from '../../models';
import { MissionStatusBadge } from '../../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { IconRefresh } from '@tabler/icons-react';
import { fmtDate, fmtDuration } from '../../utils/time';

const CreateMissionForm = lazy(() => import('./CreateMissionForm'));

export default function MissionsPage() {
  const { data: missions = [], refetch, isFetching } = useGetMissionsQuery();
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => missions.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())), [missions, search]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Missions</Title>
        <Group>
          <ActionIcon variant="subtle" onClick={() => refetch()} loading={isFetching}><IconRefresh size={16}/></ActionIcon>
          <Button onClick={open}>Create Mission</Button>
        </Group>
      </Group>
      <TextInput placeholder="Search missions" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
      <Paper withBorder>
        <ScrollArea>
          <Table stickyHeader highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Duration</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((m: Mission) => (
                <Table.Tr key={m.id} onClick={() => navigate(`/missions/${m.id}`)} style={{ cursor: 'pointer' }}>
                  <Table.Td><Badge variant="light">{m.id.slice(0, 8)}</Badge></Table.Td>
                  <Table.Td>{m.name}</Table.Td>
                  <Table.Td><MissionStatusBadge status={m.status}/></Table.Td>
                  <Table.Td>{fmtDate(m.createdAt)}</Table.Td>
                  <Table.Td>{fmtDuration((m.startedAt ?? m.createdAt) ? (m.completedAt ? m.completedAt : Date.now()) - (m.startedAt ?? m.createdAt) : 0)}</Table.Td>
                </Table.Tr>
              ))}
              {filtered.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}><Text c="dimmed">No missions</Text></Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal opened={opened} onClose={close} title="Start Mission" size="lg">
        <Suspense fallback={<Text>Loading form...</Text>}>
          <CreateMissionForm onDone={close} />
        </Suspense>
      </Modal>
    </Stack>
  );
}

