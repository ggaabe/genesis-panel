import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Artifact, Dataset, Log, Mission, PipelineGraph } from '../models';

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
  datasets: [],
  pipeline: null,
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
