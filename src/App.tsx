import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppShell from './app/AppShell';
import { routes } from './routes/routes';
import { ChatProvider } from './features/chat/ChatContext';

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="auto" colorSchemeManager={localStorageColorSchemeManager({ key: 'genesis-color-scheme' })}>
        <Notifications />
        <ChatProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppShell />}> 
                {routes.map((r) => (
                  <Route key={r.path} path={r.path} element={<r.element />} />
                ))}
              </Route>
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </MantineProvider>
    </Provider>
  );
}
