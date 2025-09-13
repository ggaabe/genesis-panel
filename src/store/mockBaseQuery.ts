import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { nanoid } from 'nanoid/non-secure';
import type { RootState } from './store';
import type { Artifact, Log, Mission, MissionStatus, PipelineGraph } from '../models';
import { pushArtifact, pushLog, setArtifacts, setDatasets, setLogs, setMission, setMissions, setPipeline, upsertMission } from './mockDbSlice';

type Request = { url: string; method?: 'GET' | 'POST'; body?: any; params?: Record<string, any> };

const rng = () => Math.random();

function pick<T>(arr: T[]): T { return arr[Math.floor(rng() * arr.length)] }

function now() { return Date.now(); }

// Compute status based on time since created
function computeStatusAndMutations(m: Mission, state: RootState, dispatch: any) {
  const current = now();
  const elapsed = current - m.createdAt;
  let nextStatus: MissionStatus = m.status;
  let startedAt = m.startedAt;
  let completedAt = m.completedAt;
  const prevStatus = m.status;

  if (m.status === 'queued' && elapsed >= 10_000) {
    nextStatus = 'running';
    if (!startedAt) startedAt = m.createdAt + 10_000;
  }
  if ((m.status === 'running' || nextStatus === 'running') && elapsed >= 15_000 && (!completedAt || m.status === 'running')) {
    nextStatus = rng() < 0.75 ? 'succeeded' : 'failed';
    completedAt = m.createdAt + 15_000;
  }

  const updated: Mission = { ...m, status: nextStatus, startedAt, completedAt };

  // During running window, on even second, append a log
  const second = Math.floor(current / 1000);
  if ((updated.status === 'running' || (prevStatus !== 'running' && nextStatus === 'running')) && second % 2 === 0) {
    const log: Log = {
      id: nanoid(),
      missionId: updated.id,
      ts: current,
      level: pick(['info', 'info', 'warn', 'info'] as const),
      message: pick([
        'Processing batch',
        'Fetching source records',
        'Transforming rows',
        'Writing artifacts',
        'Validating metrics',
        'Streaming logs...'
      ]),
    } as Log;
    dispatch(pushLog(log));
  }

  // On success, generate one artifact if none exists yet
  if (updated.status === 'succeeded') {
    const existing = (state.mockDb.artifactsByMission[updated.id] || []).length;
    if (existing === 0) {
      const art: Artifact = {
        id: nanoid(),
        missionId: updated.id,
        filetype: pick(['json', 'text', 'csv']),
        filename: `${updated.name.replace(/\s+/g, '_').toLowerCase()}_${updated.id.slice(0, 6)}.json`,
        size: Math.floor(1024 + rng() * 8192),
        textContent: JSON.stringify({ result: 'ok', missionId: updated.id, generatedAt: new Date(current).toISOString() }, null, 2),
      };
      dispatch(pushArtifact(art));
    }
  }

  if (prevStatus !== updated.status || prevStatus === 'queued' || prevStatus === 'running') {
    dispatch(setMission(updated));
  }

  return updated;
}

function ensureDatasets(state: RootState, dispatch: any) {
  if (state.mockDb.datasets.length > 0) return;
  const datasets = Array.from({ length: 15 }, (_, i) => ({
    id: `ds_${i + 1}`,
    name: `dataset_${i + 1}`,
    rows: Math.floor(1_000 + rng() * 50_000),
    lastUpdated: now() - Math.floor(rng() * 7 * 24 * 3600 * 1000),
  }));
  dispatch(setDatasets(datasets));
}

function ensurePipeline(state: RootState, dispatch: any) {
  if (state.mockDb.pipeline) return;
  const nodes = Array.from({ length: 7 }, (_, i) => ({
    id: `n${i + 1}`,
    name: `model_${i + 1}`,
    status: pick(['up_to_date', 'stale', 'failed']) as any,
    owners: ['data@company.com'],
    lastRun: now() - (i + 1) * 3600 * 1000,
    x: 100 + (i % 3) * 220,
    y: 60 + Math.floor(i / 3) * 160,
  }));
  const edges = [
    { from: 'n1', to: 'n4' },
    { from: 'n2', to: 'n4' },
    { from: 'n2', to: 'n5' },
    { from: 'n3', to: 'n5' },
    { from: 'n4', to: 'n6' },
    { from: 'n5', to: 'n7' },
  ];
  const graph: PipelineGraph = { nodes, edges };
  dispatch(setPipeline(graph));
}

export const mockBaseQuery: BaseQueryFn<Request, unknown, unknown> = async (
  req,
  api
) => {
  const state = api.getState() as RootState;
  try {
    const { url, method = 'GET', body } = req;
    // Dispatchers ensure data shape exists first
    if (url.startsWith('/datasets')) ensureDatasets(state, api.dispatch);
    if (url.startsWith('/pipeline')) ensurePipeline(state, api.dispatch);

    if (url === '/missions' && method === 'GET') {
      // Compute derived status for all missions on poll
      const missions = Object.values(state.mockDb.missions).map((m) => computeStatusAndMutations(m, state, api.dispatch));
      api.dispatch(setMissions(missions));
      return { data: missions };
    }

    if (url === '/missions' && method === 'POST') {
      const id = `m_${Date.now().toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`;
      const mission: Mission = {
        id,
        name: body.name,
        source: body.source,
        goal: body.goal,
        status: 'queued',
        createdAt: now(),
      };
      api.dispatch(upsertMission(mission));
      // seed first log
      api.dispatch(pushLog({ id: nanoid(), missionId: id, ts: now(), level: 'info', message: 'Mission queued' } as Log));
      return { data: mission };
    }

    const missionDetailMatch = url.match(/^\/missions\/([^\/]+)$/);
    if (missionDetailMatch && method === 'GET') {
      const id = missionDetailMatch[1];
      const mission = state.mockDb.missions[id];
      if (!mission) return { error: { status: 404, data: 'Not found' } } as any;
      const updated = computeStatusAndMutations(mission, state, api.dispatch);
      const artifacts = state.mockDb.artifactsByMission[id] || [];
      // Return mission detail + recent logs
      const logs = (state.mockDb.logsByMission[id] || []).slice(-100);
      api.dispatch(setLogs({ missionId: id, logs }));
      api.dispatch(setArtifacts({ missionId: id, artifacts }));
      return { data: { mission: updated, logs, artifacts } } as any;
    }

    const logsMatch = url.match(/^\/missions\/([^\/]+)\/logs/);
    if (logsMatch && method === 'GET') {
      const id = logsMatch[1];
      const mission = state.mockDb.missions[id];
      if (mission) computeStatusAndMutations(mission, state, api.dispatch);
      const urlObj = new URL('http://x' + url); // hack to parse query
      const after = urlObj.searchParams.get('after');
      const afterTs = after ? Number(after) : 0;
      const logs = (state.mockDb.logsByMission[id] || []).filter((l) => l.ts > afterTs);
      return { data: logs };
    }

    const cancelMatch = url.match(/^\/missions\/([^\/]+)\/cancel$/);
    if (cancelMatch && method === 'POST') {
      const id = cancelMatch[1];
      const mission = state.mockDb.missions[id];
      if (!mission) return { error: { status: 404, data: 'Not found' } } as any;
      const updated: Mission = { ...mission, status: 'canceled', completedAt: now() };
      api.dispatch(setMission(updated));
      api.dispatch(pushLog({ id: nanoid(), missionId: id, ts: now(), level: 'warn', message: 'Mission canceled by user' } as Log));
      return { data: updated };
    }

    const retryMatch = url.match(/^\/missions\/([^\/]+)\/retry$/);
    if (retryMatch && method === 'POST') {
      const id = retryMatch[1];
      const mission = state.mockDb.missions[id];
      if (!mission) return { error: { status: 404, data: 'Not found' } } as any;
      const retried: Mission = { ...mission, status: 'queued', createdAt: now(), startedAt: undefined, completedAt: undefined };
      api.dispatch(setMission(retried));
      api.dispatch(pushLog({ id: nanoid(), missionId: id, ts: now(), level: 'info', message: 'Retry requested. Mission queued' } as Log));
      return { data: retried };
    }

    if (url === '/datasets' && method === 'GET') {
      return { data: state.mockDb.datasets };
    }
    if (url === '/pipeline' && method === 'GET') {
      return { data: state.mockDb.pipeline };
    }

    return { error: { status: 400, data: `Unknown route ${method} ${url}` } } as any;
  } catch (e: any) {
    return { error: { status: 500, data: e?.message || 'Error' } } as any;
  }
};
