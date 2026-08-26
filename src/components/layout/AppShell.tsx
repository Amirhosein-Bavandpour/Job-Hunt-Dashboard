'use client';

import { ReactNode, useEffect, useState } from 'react';
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
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';
import { useDashboardUIStore } from '@/stores/dashboardUIStore';

const DRAWER_WIDTH = 240;

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
  const pathname = usePathname();
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
          onClick={() => dispatch(logout())}
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
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }} noWrap component="div">
            Job Hunt Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
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
