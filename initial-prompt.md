# Task:

Build a small React app that lets a user:

Start a “Mission” (a data-agent job),

See it progress through states (Queued → Running → Succeeded/Failed) with live log updates,

Inspect a simple “dataset” and a “dbt-like” pipeline view,

Chat with the agent (mocked).

All data can be mocked. The point is front-end architecture, UX, and code quality.

## Requirements

### Core user stories
1. Create & track a mission

“Start Mission” form with fields: name, source (select), goal (text).

On submit, create a mission with id, status="queued", then simulate state transitions.

Show a Mission List with: id, name, status badge, startedAt, duration.

Clicking a mission opens a Mission Detail page.

2. Mission Detail

Status header with controls: Cancel (if running), Retry (if failed).

Live Logs panel that appends a new log line every ~500–1000ms (mocked “stream”).

Artifacts tab: show a few output files/JSON blobs (mocked links that open a modal).

Metrics summary (e.g., rows processed, duration, success rate—mock numbers).

3. Dataset & Pipeline

Datasets page: table listing 10–20 rows of mocked tables with columns: name, rows, lastUpdated.

Search + sort.

Pipeline view: render a small DAG (5–8 nodes) with statuses (up-to-date / stale / failed).

Clicking a node shows its metadata (owners, last run, upstream/downstream).

4. Agent Chat (mocked)

Simple chat UI (history + input).

When user sends a message, append a mocked “agent” response after ~1s.

Support markdown in messages (code blocks, lists).

## API & Data (all mocked)
Provide a small mock server (just rtk-query using query builder to treat its store as a pretend server):

GET /missions → array of missions.

POST /missions → creates mission, starts simulated lifecycle.

GET /missions/:id → mission detail + recent logs.

GET /missions/:id/logs?after=<ts> → incremental logs.

POST /missions/:id/cancel / retry.

GET /datasets → array of datasets.

GET /pipeline → nodes/edges with statuses.

Use a redux store to act as the mock database for this.

## IMPLEMENTATION ARCHITECTURE:

1. Configure and Use Mantine Components

2. Use an App Shell with a sidebar menu

3. Use React Router with a routes.ts with all routes defined in an array, with all pages for each route lazy-loaded; use a route outlet in the app (AppShell wraps outlet, also wrap outlet in an AppErrorBoundary)

4. Use rtk-query for the query layer; use polling interval param according to the intervals described in the task. Use split api / injectable endpoints according to this: https://redux-toolkit.js.org/rtk-query/usage/code-splitting; the only endpoint that should be defined in the single createApi definition is GET /missions. all other endpoints should live in resource-specific folders in the store/ folder, injected according to feature usage:
missions/ missionCreation.ts (POST /missions) missionManagement.ts (GET /missions/:id, GET /missions/:id/logs?after=<ts>, POST /missions/:id/cancel, POST /missions/:id/retry)
datasets/ datasets.ts
pipeline/ pipeline.ts

5. The home page should be the list of missions and their statuses, with the Create new mission button up top that shows the create mission form in a modal (form should be lazy-loaded component)

6. Agent chat should live on a right-hand sidebar, like it's in the app shell across all routes.

7. Mission status should be polled every 1 second. The status should be computed as a matter of time-since created. After 10 seconds, a mission should move from queued to running. After 15 seconds, it should randomly move to either succeeded or failed. For queries made during the 10-15 second running interval, the rtk-query should append another randomly-generated log to the mission in redux store for logs if current timestamp is even number (Log should be its own resource in the global store, where logs are retrieved by mission ID and sorted by timestamp). If the mission succeeds, randomly generate an Artifact in the store tied to the mission by ID (should be returned in an artifacts array on GET /missions/:id)

Before beginning, create a models folder with all type interfaces for all resources mentioned here that will act as the ultimate source of truth across the app (frontend and mock backend within the redux store):
Mission
Log
Dataset
Pipeline
Artifact (missionId, filetype, filename, size, textContent)
ChatMessage (agent chat does not need rtk-query or redux storage at all; purely mocked)