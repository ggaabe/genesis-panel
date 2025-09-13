import { Group, Paper, ScrollArea, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useGetDatasetsQuery } from '../../store/datasets/datasets';
import type { Dataset } from '../../models';
import { fmtDate } from '../../utils/time';

export default function DatasetsPage() {
  const { data: datasets = [] } = useGetDatasetsQuery();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'rows' | 'lastUpdated'>('name');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const ds = datasets.filter((d) => d.name.toLowerCase().includes(q));
    return ds.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'rows') return b.rows - a.rows;
      return b.lastUpdated - a.lastUpdated;
    });
  }, [datasets, search, sort]);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Datasets</Title>
      </Group>
      <Group>
        <TextInput placeholder="Search" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
        <Text c="dimmed">Sort by:</Text>
        <Text c={sort === 'name' ? 'blue' : undefined} style={{ cursor: 'pointer' }} onClick={() => setSort('name')}>name</Text>
        <Text c={sort === 'rows' ? 'blue' : undefined} style={{ cursor: 'pointer' }} onClick={() => setSort('rows')}>rows</Text>
        <Text c={sort === 'lastUpdated' ? 'blue' : undefined} style={{ cursor: 'pointer' }} onClick={() => setSort('lastUpdated')}>updated</Text>
      </Group>
      <Paper withBorder>
        <ScrollArea>
          <Table stickyHeader highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Rows</Table.Th>
                <Table.Th>Last Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((d: Dataset) => (
                <Table.Tr key={d.id}>
                  <Table.Td>{d.name}</Table.Td>
                  <Table.Td>{d.rows.toLocaleString()}</Table.Td>
                  <Table.Td>{fmtDate(d.lastUpdated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
