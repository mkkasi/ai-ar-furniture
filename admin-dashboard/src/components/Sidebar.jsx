import { NavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import ChairIcon from '@mui/icons-material/ChairOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ReviewsIcon from '@mui/icons-material/RateReviewOutlined';
import ViewInArIcon from '@mui/icons-material/ViewInArOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';

const navItems = [
  { label: 'Dashboard', to: '/', icon: <DashboardIcon /> },
  { label: 'Furniture', to: '/furniture', icon: <ChairIcon /> },
  { label: 'Categories', to: '/categories', icon: <CategoryIcon /> },
  { label: 'Users', to: '/users', icon: <PeopleIcon /> },
  { label: 'Reviews', to: '/reviews', icon: <ReviewsIcon /> },
  { label: 'Saved Designs', to: '/saved-designs', icon: <ViewInArIcon /> },
  { label: 'Notifications', to: '/notifications', icon: <NotificationsIcon /> },
];

export default function Sidebar() {
  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid #ECECEC',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/logo-mark.png"
          alt="AR Furniture Studio"
          sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0 }}
        />
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
            AR Furniture Studio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Dashboard
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': { bgcolor: 'primary.main', color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
