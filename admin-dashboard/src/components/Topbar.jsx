import { AppBar, Toolbar, Typography, Avatar, IconButton, Menu, MenuItem, Box } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #ECECEC' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.name}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
