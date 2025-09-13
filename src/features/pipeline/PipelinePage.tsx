import { Paper, Stack, Text, Title } from '@mantine/core';
import { useGetPipelineQuery } from '../../store/pipeline/pipeline';
import { PipelineNode } from '../../models';
import { PipelineStatusBadge } from '../../components/StatusBadge';

export default function PipelinePage() {
  const { data } = useGetPipelineQuery();
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  return (
    <Stack>
      <Title order={3}>Pipeline</Title>
      <Paper withBorder p="sm" style={{ position: 'relative', height: 420, overflow: 'auto' }}>
        <svg width={800} height={400} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {edges.map((e, i) => {
            const from = nodes.find((n) => n.id === e.from)!;
            const to = nodes.find((n) => n.id === e.to)!;
            if (!from || !to) return null;
            const fx = from.x + 80; const fy = from.y + 24;
            const tx = to.x; const ty = to.y + 24;
            return <line key={i} x1={fx} y1={fy} x2={tx} y2={ty} stroke="#bbb" strokeWidth={2} markerEnd="url(#arrow)" />
          })}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#bbb" />
            </marker>
          </defs>
        </svg>
        {nodes.map((n: PipelineNode) => (
          <div key={n.id} style={{ position: 'absolute', left: n.x, top: n.y, width: 160 }}>
            <NodeCard node={n} />
          </div>
        ))}
      </Paper>
    </Stack>
  );
}

function NodeCard({ node }: { node: PipelineNode }) {
  return (
    <Paper withBorder p="xs" radius="md">
      <Text fw={600}>{node.name}</Text>
      <PipelineStatusBadge status={node.status} />
      <Text size="xs" c="dimmed">Owner: {node.owners[0]}</Text>
      <Text size="xs" c="dimmed">Last: {new Date(node.lastRun).toLocaleString()}</Text>
    </Paper>
  );
}

