import { Suspense, useState } from 'react';
import { AppShell as MantineAppShell, Burger, Group, NavLink, ScrollArea, Text } from '@mantine/core';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { routes } from '../routes/routes';
import { ChatSidebar } from '../features/chat/ChatSidebar';
import AppErrorBoundary from '../components/AppErrorBoundary';

export function AppShell() {
  const [opened, setOpened] = useState(true);
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <MantineAppShell
      header={{ height: 48 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 360, breakpoint: 'sm' }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm"/>
            <Text fw={700}>Genesis Panel</Text>
          </Group>
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Navbar p="xs">
        <ScrollArea>
          {routes.filter(r => !r.path.includes(':')).map((r) => (
            <NavLink
              key={r.path}
              label={r.label}
              active={loc.pathname === r.path}
              onClick={() => navigate(r.path)}
            />
          ))}
        </ScrollArea>
      </MantineAppShell.Navbar>
      <MantineAppShell.Aside p="xs">
        <ChatSidebar />
      </MantineAppShell.Aside>
      <MantineAppShell.Main>
        <AppErrorBoundary>
          <Suspense fallback={<Text>Loading...</Text>}>
            <Outlet />
          </Suspense>
        </AppErrorBoundary>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}

export default AppShell;

