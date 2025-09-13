import { Group, Paper, ScrollArea, Stack, Table, TextInput, Title, UnstyledButton } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useGetDatasetsQuery } from '../../store/datasets/datasets';
import type { Dataset } from '../../models';
import { fmtDate } from '../../utils/time';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';

export default function DatasetsPage() {
  const { data: datasets = [] } = useGetDatasetsQuery();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'rows' | 'lastUpdated'>('name');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const ds = datasets.filter((d) => d.name.toLowerCase().includes(q));
    const sorted = ds.sort((a, b) => {
      let cmp = 0;
      if (sort === 'name') cmp = a.name.localeCompare(b.name);
      if (sort === 'rows') cmp = a.rows - b.rows;
      if (sort === 'lastUpdated') cmp = a.lastUpdated - b.lastUpdated;
      return dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [datasets, search, sort]);

  const setSortColumn = (col: 'name' | 'rows' | 'lastUpdated') => {
    if (sort === col) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSort(col); setDir('asc'); }
  };

  const SortIcon = ({ active }: { active: boolean }) => active ? (dir === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />) : <IconSelector size={14} />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Datasets</Title>
      </Group>
      <Group>
        <TextInput placeholder="Search" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
      </Group>
      <Paper withBorder>
        <ScrollArea>
          <Table stickyHeader highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <UnstyledButton onClick={() => setSortColumn('name')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Name <SortIcon active={sort === 'name'} />
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => setSortColumn('rows')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Rows <SortIcon active={sort === 'rows'} />
                  </UnstyledButton>
                </Table.Th>
                <Table.Th>
                  <UnstyledButton onClick={() => setSortColumn('lastUpdated')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Last Updated <SortIcon active={sort === 'lastUpdated'} />
                  </UnstyledButton>
                </Table.Th>
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
