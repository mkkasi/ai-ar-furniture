import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, IconButton, Rating } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import toast from 'react-hot-toast';
import { statsApi } from '../api/statsApi';

export default function ReviewsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    statsApi
      .reviews()
      .then((res) => setRows(res.data.data.map((r) => ({ ...r, id: r._id }))))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await statsApi.deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const columns = [
    { field: 'furnitureName', headerName: 'Furniture', flex: 1, minWidth: 160, valueGetter: (p) => p.row.furniture?.name || '—' },
    { field: 'userName', headerName: 'User', flex: 1, minWidth: 160, valueGetter: (p) => p.row.user?.name || '—' },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 150,
      renderCell: (p) => <Rating value={p.value} readOnly size="small" />,
    },
    { field: 'comment', headerName: 'Comment', flex: 2, minWidth: 240 },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      renderCell: (p) => (
        <IconButton size="small" onClick={() => handleDelete(p.row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Reviews ({rows.length})
      </Typography>
      <Box sx={{ height: 600, bgcolor: 'background.paper', borderRadius: 3 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} />
      </Box>
    </Box>
  );
}
