import { api } from '../api';
import type { Dataset } from '../../models';

export const datasetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDatasets: builder.query<Dataset[], void>({
      query: () => ({ url: '/datasets', method: 'GET' }),
      providesTags: [{ type: 'Datasets', id: 'LIST' }],
    }),
  }),
});

export const { useGetDatasetsQuery } = datasetsApi;

