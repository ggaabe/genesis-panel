import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import mockDbReducer from './mockDbSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    mockDb: mockDbReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
