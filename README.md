# Quick Start

`npm install`
`npm run dev`

## Test
`npx playwright install`
`npm run test:e2e`

## Build

`npm run build`

# Design decisions:

I used mantine for the UI library because it has many components that are ready to use which allows for focusing on the logic of the application rather than reinventing the wheel. I lazy-loaded all routes so that the bundle would be smaller on the initial load.

I also split most of the redux store using injectable endpoints so that the initial bundle would remain small and the endpoints themselves would be loaded on demand. 