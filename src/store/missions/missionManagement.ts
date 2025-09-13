import { api } from '../api';
import type { Artifact, Log, Mission } from '../../models';

type MissionDetail = { mission: Mission; logs: Log[]; artifacts: Artifact[] };

export const missionManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMission: builder.query<MissionDetail, string>({
      query: (id) => ({ url: `/missions/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [
        { type: 'Mission', id },
        { type: 'Logs', id },
        { type: 'Artifacts', id },
      ],
      pollInterval: 1000,
    }),
    getMissionLogs: builder.query<Log[], { id: string; after?: number }>({
      query: ({ id, after }) => ({ url: `/missions/${id}/logs${after ? `?after=${after}` : ''}`, method: 'GET' }),
      providesTags: (result, err, arg) => [{ type: 'Logs', id: arg.id }],
      pollInterval: 1000,
    }),
    cancelMission: builder.mutation<Mission, string>({
      query: (id) => ({ url: `/missions/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (result, err, id) => [
        { type: 'Mission', id },
        { type: 'Missions', id: 'LIST' },
      ],
    }),
    retryMission: builder.mutation<Mission, string>({
      query: (id) => ({ url: `/missions/${id}/retry`, method: 'POST' }),
      invalidatesTags: (result, err, id) => [
        { type: 'Mission', id },
        { type: 'Missions', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetMissionQuery, useGetMissionLogsQuery, useCancelMissionMutation, useRetryMissionMutation } = missionManagementApi;

