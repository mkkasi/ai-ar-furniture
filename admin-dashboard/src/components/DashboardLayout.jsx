import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/': 'Dashboard',
  '/furniture': 'Furniture',
  '/furniture/new': 'Add Furniture',
  '/categories': 'Categories',
  '/users': 'Users',
  '/reviews': 'Reviews',
  '/saved-designs': 'Saved Designs',
  '/notifications': 'Notifications',
};

export default function DashboardLayout() {
  const location = useLocation();

  let title = pageTitles[location.pathname] || 'Dashboard';

  // Handle /furniture/:id/edit
  if (location.pathname.startsWith('/furniture/') &&
      location.pathname.endsWith('/edit')) {
    title = 'Edit Furniture';
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Topbar title={title} />

        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}