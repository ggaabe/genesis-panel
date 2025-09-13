import { api } from '../api';
import type { PipelineGraph } from '../../models';

export const pipelineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPipeline: builder.query<PipelineGraph, void>({
      query: () => ({ url: '/pipeline', method: 'GET' }),
      providesTags: [{ type: 'Pipeline', id: 'GRAPH' }],
    }),
  }),
});

export const { useGetPipelineQuery } = pipelineApi;

