import { Paper, Stack, Text, Title, Group, Badge } from "@mantine/core";
import { useGetPipelineQuery } from "../../store/pipeline/pipeline";
import type { PipelineNode } from "../../models";
import { useMemo, useState } from "react";
import { PipelineStatusBadge } from "../../components/StatusBadge";

export default function PipelinePage() {
  const { data } = useGetPipelineQuery();
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selected) || null,
    [nodes, selected]
  );
  const upstream = useMemo(
    () =>
      edges
        .filter((e) => e.to === selected)
        .map((e) => nodes.find((n) => n.id === e.from)!)
        .filter(Boolean),
    [edges, nodes, selected]
  );
  const downstream = useMemo(
    () =>
      edges
        .filter((e) => e.from === selected)
        .map((e) => nodes.find((n) => n.id === e.to)!)
        .filter(Boolean),
    [edges, nodes, selected]
  );

  return (
    <Stack>
      <Title order={3}>Pipeline</Title>
      <Paper
        withBorder
        p="sm"
        style={{ position: "relative", height: 420, overflow: "auto" }}
      >
        <svg
          width={800}
          height={400}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {edges.map((e, i) => {
            const from = nodes.find((n) => n.id === e.from)!;
            const to = nodes.find((n) => n.id === e.to)!;
            if (!from || !to) return null;
            const fx = from.x + 80;
            const fy = from.y + 24;
            const tx = to.x;
            const ty = to.y + 24;
            return (
              <line
                key={i}
                x1={fx}
                y1={fy}
                x2={tx}
                y2={ty}
                stroke="#bbb"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#bbb" />
            </marker>
          </defs>
        </svg>
        {nodes.map((n: PipelineNode) => (
          <div
            key={n.id}
            style={{ position: "absolute", left: n.x, top: n.y, width: 160 }}
          >
            <NodeCard
              node={n}
              active={selected === n.id}
              onClick={() => setSelected(n.id)}
            />
          </div>
        ))}
      </Paper>
      {selectedNode && (
        <Paper withBorder p="sm" data-testid="pipeline-details">
          <Title order={5}>Node: {selectedNode.name}</Title>
          <Group gap="md" mt="xs">
            <Text size="sm">Owner: {selectedNode.owners.join(", ")}</Text>
            <Text size="sm">
              Last run: {new Date(selectedNode.lastRun).toLocaleString()}
            </Text>
          </Group>
          <Group align="start" gap="xl" mt="xs">
            <div>
              <Text size="sm" fw={600} mb={4}>
                Upstream
              </Text>
              <Group gap="xs">
                {upstream.map((n) => (
                  <Badge key={n.id} variant="light">
                    {n.name}
                  </Badge>
                ))}
              </Group>
            </div>
            <div>
              <Text size="sm" fw={600} mb={4}>
                Downstream
              </Text>
              <Group gap="xs">
                {downstream.map((n) => (
                  <Badge key={n.id} variant="light">
                    {n.name}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}

function NodeCard({
  node,
  active,
  onClick,
}: {
  node: PipelineNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Paper
      data-testid={`pipeline-node-${node.id}`}
      withBorder
      p="xs"
      radius="md"
      onClick={onClick}
      style={{
        cursor: "pointer",
        outline: active ? "2px solid var(--mantine-color-blue-5)" : undefined,
      }}
    >
      <Text fw={600}>{node.name}</Text>
      <PipelineStatusBadge status={node.status} />
    </Paper>
  );
}
