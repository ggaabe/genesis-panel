import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { ReactNode } from 'react';

export interface AppRoute {
  path: string;
  label: string;
  icon?: ReactNode;
  element: LazyExoticComponent<ComponentType<any>>;
}

export const routes: AppRoute[] = [
  {
    path: '/',
    label: 'Missions',
    element: lazy(() => import('../features/missions/MissionsPage')),
  },
  {
    path: '/missions/:id',
    label: 'Mission Detail',
    element: lazy(() => import('../features/missions/MissionDetailPage')),
  },
  {
    path: '/datasets',
    label: 'Datasets',
    element: lazy(() => import('../features/datasets/DatasetsPage')),
  },
  {
    path: '/pipeline',
    label: 'Pipeline',
    element: lazy(() => import('../features/pipeline/PipelinePage')),
  },
];
