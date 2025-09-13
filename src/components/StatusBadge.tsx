import { Badge } from '@mantine/core';
import type { MissionStatus, PipelineNodeStatus } from '../models';

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  const color =
    status === 'queued' ? 'gray' :
    status === 'running' ? 'blue' :
    status === 'succeeded' ? 'green' :
    status === 'failed' ? 'red' : 'orange';
  return <Badge color={color} variant="light">{status}</Badge>;
}

export function PipelineStatusBadge({ status }: { status: PipelineNodeStatus }) {
  const color = status === 'up_to_date' ? 'green' : status === 'stale' ? 'yellow' : 'red';
  return <Badge color={color} variant="light">{status}</Badge>;
}

export default MissionStatusBadge;

