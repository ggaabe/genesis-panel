import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Artifact, Dataset, Log, Mission, PipelineGraph } from '../models';

function now() { return Date.now(); }
function rng() { return Math.random(); }

function makeDatasets(count = 20): Dataset[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ds_${i + 1}`,
    name: `dataset_${(i + 1).toString().padStart(2, '0')}`,
    rows: Math.floor(1_000 + rng() * 90_000),
    lastUpdated: now() - Math.floor(rng() * 14 * 24 * 3600 * 1000),
  }));
}

function makePipeline(): PipelineGraph {
  const nodes = [
    { id: 'n1', name: 'raw_events', status: 'up_to_date', owners: ['data@company.com'], lastRun: now() - 1 * 3600_000, x: 80,  y: 40 },
    { id: 'n2', name: 'raw_users',  status: 'up_to_date', owners: ['data@company.com'], lastRun: now() - 2 * 3600_000, x: 80,  y: 200 },
    { id: 'n3', name: 'stg_events', status: 'stale',      owners: ['analytics@company.com'], lastRun: now() - 5 * 3600_000, x: 300, y: 40 },
    { id: 'n4', name: 'stg_users',  status: 'up_to_date', owners: ['analytics@company.com'], lastRun: now() - 3 * 3600_000, x: 300, y: 200 },
    { id: 'n5', name: 'fct_sessions', status: 'up_to_date', owners: ['ml@company.com'], lastRun: now() - 6 * 3600_000, x: 520, y: 40 },
    { id: 'n6', name: 'fct_users_daily', status: 'failed', owners: ['ml@company.com'], lastRun: now() - 7 * 3600_000, x: 520, y: 200 },
    { id: 'n7', name: 'dash_activity', status: 'stale', owners: ['bi@company.com'], lastRun: now() - 10 * 3600_000, x: 740, y: 120 },
  ] as PipelineGraph['nodes'];
  const edges: PipelineGraph['edges'] = [
    { from: 'n1', to: 'n3' },
    { from: 'n2', to: 'n4' },
    { from: 'n3', to: 'n5' },
    { from: 'n4', to: 'n6' },
    { from: 'n5', to: 'n7' },
    { from: 'n6', to: 'n7' },
  ];
  return { nodes, edges };
}

export interface MockDbState {
  missions: Record<string, Mission>;
  logsByMission: Record<string, Log[]>;
  artifactsByMission: Record<string, Artifact[]>;
  datasets: Dataset[];
  pipeline: PipelineGraph | null;
}

const initialState: MockDbState = {
  missions: {},
  logsByMission: {},
  artifactsByMission: {},
  datasets: makeDatasets(20),
  pipeline: makePipeline(),
};

export const mockDbSlice = createSlice({
  name: 'mockDb',
  initialState,
  reducers: {
    upsertMission(state, action: PayloadAction<Mission>) {
      state.missions[action.payload.id] = action.payload;
    },
    setMission(state, action: PayloadAction<Mission>) {
      state.missions[action.payload.id] = action.payload;
    },
    setMissions(state, action: PayloadAction<Mission[]>) {
      for (const m of action.payload) state.missions[m.id] = m;
    },
    pushLog(state, action: PayloadAction<Log>) {
      const arr = (state.logsByMission[action.payload.missionId] ||= []);
      arr.push(action.payload);
      arr.sort((a, b) => a.ts - b.ts);
    },
    setLogs(state, action: PayloadAction<{ missionId: string; logs: Log[] }>) {
      state.logsByMission[action.payload.missionId] = action.payload.logs.slice().sort((a, b) => a.ts - b.ts);
    },
    setArtifacts(state, action: PayloadAction<{ missionId: string; artifacts: Artifact[] }>) {
      state.artifactsByMission[action.payload.missionId] = action.payload.artifacts;
    },
    pushArtifact(state, action: PayloadAction<Artifact>) {
      const arr = (state.artifactsByMission[action.payload.missionId] ||= []);
      arr.push(action.payload);
    },
    setDatasets(state, action: PayloadAction<Dataset[]>) {
      state.datasets = action.payload;
    },
    setPipeline(state, action: PayloadAction<PipelineGraph>) {
      state.pipeline = action.payload;
    },
  },
});

export const {
  upsertMission,
  setMission,
  setMissions,
  pushLog,
  setLogs,
  setArtifacts,
  pushArtifact,
  setDatasets,
  setPipeline,
} = mockDbSlice.actions;

export default mockDbSlice.reducer;
