import { lazy } from "react";
import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import MissionsPage from "../features/missions/MissionsPage";
const MissionDetailPage = lazy(() => import("../features/missions/MissionDetailPage"));
const DatasetsPage = lazy(() => import("../features/datasets/DatasetsPage"));
const PipelinePage = lazy(() => import("../features/pipeline/PipelinePage"));

// Extend RouteObject for optional UI metadata (e.g., sidebar label/icon)
export type AppRouteObject = RouteObject & {
  label?: string;
  icon?: ReactNode;
};

// Child routes rendered inside <AppShell>'s <Outlet />
export const appRoutes: AppRouteObject[] = [
  {
    index: true,
    label: "Missions",
    element: <MissionsPage />,
  },
  {
    path: "missions/:id",
    element: <MissionDetailPage />,
  },
  {
    path: "datasets",
    label: "Datasets",
    element: <DatasetsPage />,
  },
  {
    path: "pipeline",
    label: "Pipeline",
    element: <PipelinePage />,
  },
];

// Sidebar navigation items (absolute paths for convenience)
export const navRoutes: Array<{ path: string; label: string; icon?: ReactNode }> = [
  { path: "/", label: "Missions" },
  { path: "/datasets", label: "Datasets" },
  { path: "/pipeline", label: "Pipeline" },
];
