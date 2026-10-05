'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';
import { useThemeMode } from '@/store/ThemeModeProvider';

const DRAWER_WIDTH = 240;
// Below this width a persistent sidebar would leave no room for content, so the drawer
// switches to MUI's `temporary` variant: an overlay with a backdrop that never pushes
// <main>. 768 = the usual tablet/phone boundary (MUI's own `md` of 900 is too eager).
const DRAWER_BREAKPOINT = 768;

// Logout: clear the httpOnly JWT cookie on the server, then clear client state.
async function handleLogout(dispatch: ReturnType<typeof useDispatch>) {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Network error — still clear client state so the UI logs out locally.
  }
  dispatch(logout());
  window.location.href = '/login';
}

const navItems = [
  { label: 'Dashboard', href: '/', icon: <DashboardIcon /> },
  { label: 'Applications', href: '/applications', icon: <WorkIcon /> },
  { label: 'Companies', href: '/companies', icon: <BusinessIcon /> },
  { label: 'Calendar', href: '/calendar', icon: <CalendarMonthIcon /> },
  { label: 'Analytics', href: '/analytics', icon: <QueryStatsIcon /> },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const sidebarOpen = useDashboardUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useDashboardUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useDashboardUIStore((s) => s.setSidebarOpen);
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  // defaultMatches: true -> SSR and the hydration render paint the desktop layout
  // (the common case for a dashboard), then matchMedia corrects it immediately after.
  const isDesktop = useMediaQuery(theme.breakpoints.up(DRAWER_BREAKPOINT), {
    defaultMatches: true,
  });
  const pathname = usePathname();
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The overlay (mobile) drawer keeps its own open state, starting closed. Sharing the
  // store's `sidebarOpen` — which defaults to open for the desktop layout — would mount
  // the Modal open and close it again before it ever painted, which strands MUI's Modal
  // mid-transition: an invisible full-screen layer that swallows every click on the page.
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Drop the overlay whenever the route or the breakpoint changes, so it can neither
  // survive a navigation nor arrive stale (open) when re-entering mobile widths.
  useEffect(() => {
    setOverlayOpen(false);
  }, [isDesktop, pathname]);

  const drawerOpen = isDesktop ? sidebarOpen : overlayOpen;
  const openDrawer = () => (isDesktop ? toggleSidebar() : setOverlayOpen((v) => !v));
  const closeDrawer = () => (isDesktop ? setSidebarOpen(false) : setOverlayOpen(false));
  // Dismissing the overlay only: safe to call unconditionally (already false on desktop).
  const closeOverlay = () => setOverlayOpen(false);

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Job Hunt
        </Typography>
      </Toolbar>
      <List sx={{ mt: 1, px: 0.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            // Overlay mode: dismiss the drawer as soon as a choice is made, without
            // waiting for the route to change (no-op on desktop, where the persistent
            // sidebar is meant to stay put).
            onClick={closeOverlay}
            sx={{
              mx: 1.5,
              my: 1,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              '&.Mui-selected': {
                background: 'rgba(34,211,238,0.10)',
                border: '1px solid rgba(34,211,238,0.40)',
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="body2" color="text.secondary" noWrap>
          {mounted ? user?.email : ''}
        </Typography>
        <Button
          fullWidth
          color="primary"
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={() => handleLogout(dispatch)}
          sx={{ mt: 1 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={openDrawer}
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }} noWrap component="div">
            Job Hunt Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme" sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'persistent' : 'temporary'}
        open={drawerOpen}
        // Backdrop click / Escape (temporary variant only) close the overlay.
        onClose={closeDrawer}
        sx={{
          // Only the docked (persistent) variant may size the root: for `temporary` the
          // root is the fixed-position Modal wrapper, so a width here would shrink the
          // backdrop. This root is the flex item that reserves the row's space, so
          // collapsing it is what makes <main> reflow instead of leaving a dead gap.
          ...(isDesktop
            ? {
                width: drawerOpen ? DRAWER_WIDTH : 0,
                flexShrink: 0,
                transition: (t) =>
                  t.transitions.create('width', {
                    easing: drawerOpen
                      ? t.transitions.easing.easeOut
                      : t.transitions.easing.sharp,
                    duration: drawerOpen
                      ? t.transitions.duration.enteringScreen
                      : t.transitions.duration.leavingScreen,
                  }),
              }
            : {}),
          // SSR can't know the viewport, so the first paint on a phone still carries the
          // desktop variant. Hide the docked slot below the breakpoint (0.02 = MUI's
          // `down()` convention, so this never disagrees with `up(DRAWER_BREAKPOINT)`)
          // and that frame gets full-width <main> instead of a 240px dead sidebar.
          '&.MuiDrawer-docked': {
            [`@media (max-width: ${DRAWER_BREAKPOINT - 0.02}px)`]: { display: 'none' },
          },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
