import { api } from '../api';
import type { Mission } from '../../models';

export const missionCreationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createMission: builder.mutation<Mission, { name: string; source: string; goal: string }>({
      query: (body) => ({ url: '/missions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Missions', id: 'LIST' }],
    }),
  }),
});

export const { useCreateMissionMutation } = missionCreationApi;

