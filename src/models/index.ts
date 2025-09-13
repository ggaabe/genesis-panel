export type MissionStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

export interface Mission {
  id: string;
  name: string;
  source: string;
  goal: string;
  status: MissionStatus;
  createdAt: number; // ms epoch
  startedAt?: number; // when moved to running
  completedAt?: number; // when reached terminal state
}

export interface Log {
  id: string;
  missionId: string;
  ts: number; // ms epoch
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface Artifact {
  id: string;
  missionId: string;
  filetype: 'json' | 'text' | 'csv';
  filename: string;
  size: number; // bytes
  textContent: string; // inline content for modal display
}

export interface Dataset {
  id: string;
  name: string;
  rows: number;
  lastUpdated: number;
}

export type PipelineNodeStatus = 'up_to_date' | 'stale' | 'failed';

export interface PipelineNode {
  id: string;
  name: string;
  status: PipelineNodeStatus;
  owners: string[];
  lastRun: number;
  x: number; // layout x
  y: number; // layout y
}

export interface PipelineEdge {
  from: string;
  to: string;
}

export interface PipelineGraph {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  ts: number;
  content: string;
}

