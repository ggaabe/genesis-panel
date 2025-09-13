import { createApi } from '@reduxjs/toolkit/query/react';
import type { Mission } from '../models';
import { mockBaseQuery } from './mockBaseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: mockBaseQuery,
  tagTypes: ['Mission', 'Missions', 'Logs', 'Artifacts', 'Datasets', 'Pipeline'],
  endpoints: (builder) => ({
    getMissions: builder.query<Mission[], void>({
      query: () => ({ url: '/missions', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: 'Mission' as const, id: m.id })),
              { type: 'Missions', id: 'LIST' },
            ]
          : [{ type: 'Missions', id: 'LIST' }],
      pollInterval: 1000,
    }),
  }),
});

export const { useGetMissionsQuery } = api;

