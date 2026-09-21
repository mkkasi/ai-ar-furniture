import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Switch, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import toast from 'react-hot-toast';
import { userApi } from '../api/userApi';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback((q) => {
    setLoading(true);
    userApi
      .list({ q, limit: 100 })
      .then((res) => setRows(res.data.data.map((u) => ({ ...u, id: u.id }))))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 350);
    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

  const handleToggle = async (id, currentlyDisabled) => {
    try {
      await userApi.toggleDisabled(id, !currentlyDisabled);
      toast.success(currentlyDisabled ? 'User enabled' : 'User disabled');
      fetchUsers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    { field: 'phone', headerName: 'Phone', width: 140, valueGetter: (params) => params.value || '—' },
    {
      field: 'isEmailVerified',
      headerName: 'Verified',
      width: 100,
      valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'isDisabled',
      headerName: 'Enabled',
      width: 110,
      renderCell: (params) => (
        <Switch checked={!params.value} onChange={() => handleToggle(params.row.id, params.value)} />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Users
        </Typography>
        <TextField
          size="small"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
      </Box>
      <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 3 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} />
      </Box>
    </Box>
  );
}
