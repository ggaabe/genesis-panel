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

Some tradeoffs with this is you can have a little less flexibility in the component design / implementation but it's good for when delivering features in a crunch. The injectable endpoints benefits can vary as well for applications that can change a lot over time, as different endpoints could move from more rarely used to more frequently used and the benefit of lazy loading them could become diminished.

With more time I'd like to wire up the chat agent with a real LLM, and add in-chat features like telling the agent to create a mission, or gathering information about existing missions. I'd probably also want to mock out the network calls with the mock service worker library and add some more robust testing across stories. I'd also likely incorporate i8n across the application.