import { Suspense, useState } from 'react';
import { AppShell as MantineAppShell, Burger, Group, NavLink, ScrollArea, Text, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { navRoutes } from '../routes/routes';
import { ChatSidebar } from '../features/chat/ChatSidebar';
import AppErrorBoundary from '../components/AppErrorBoundary';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function AppShell() {
  const [opened, setOpened] = useState(true);
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <MantineAppShell
      header={{ height: 48 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
      aside={{ width: 360, breakpoint: 'sm' }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm"/>
            <Text fw={700}>Genesis Panel</Text>
          </Group>
          <ThemeToggle />
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Navbar p="xs">
        <ScrollArea>
          {navRoutes.map((r) => (
            <NavLink
              key={r.path}
              label={r.label}
              active={loc.pathname === r.path}
              data-testid={`nav-${r.label.toLowerCase()}`}
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

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <ActionIcon variant="subtle" onClick={() => setColorScheme(dark ? 'light' : 'dark')} title="Toggle color scheme">
      {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
    </ActionIcon>
  );
}
