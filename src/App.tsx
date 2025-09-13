import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import AppShell from './app/AppShell';
import { appRoutes } from './routes/routes';
import { ChatProvider } from './features/chat/ChatContext';

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="auto" colorSchemeManager={localStorageColorSchemeManager({ key: 'genesis-color-scheme' })}>
        <Notifications />
        <ChatProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ChatProvider>
      </MantineProvider>
    </Provider>
  );
}

function AppRoutes() {
  const element = useRoutes([
    {
      path: '/',
      element: <AppShell />,
      children: appRoutes,
    },
  ]);
  return element;
}
