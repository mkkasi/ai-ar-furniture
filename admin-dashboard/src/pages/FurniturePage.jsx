import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Typography,
  Avatar,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { furnitureApi } from '../api/furnitureApi';

export default function FurniturePage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await furnitureApi.list({
        limit: 100,
      });

      console.log('Furniture API response:', res.data);

      const furniture = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const formattedRows = furniture.map((furnitureItem) => ({
        ...furnitureItem,

        // DataGrid requires a unique id
        id: furnitureItem._id,

        // Create a simple field instead of using valueGetter
        categoryName:
          furnitureItem.category &&
          typeof furnitureItem.category === 'object'
            ? furnitureItem.category.name || '—'
            : '—',
      }));

      console.log('Formatted furniture rows:', formattedRows);

      setRows(formattedRows);
    } catch (error) {
      console.error('Failed to load furniture:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to load furniture'
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Delete this furniture item? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await furnitureApi.remove(id);

      toast.success('Furniture deleted');

      fetchData();
    } catch (error) {
      console.error('Delete error:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to delete item'
      );
    }
  };

  const columns = [
    {
      field: 'images',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Avatar
          src={params.row?.images?.[0]?.url || ''}
          variant="rounded"
          sx={{
            width: 40,
            height: 40,
          }}
        >
          {params.row?.name?.charAt(0)?.toUpperCase() || 'F'}
        </Avatar>
      ),
    },

    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
    },

    {
      field: 'categoryName',
      headerName: 'Category',
      width: 160,
    },

    {
      field: 'stock',
      headerName: 'Stock',
      width: 90,
    },

    {
      field: 'isAvailable',
      headerName: 'Status',
      width: 120,

      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.row?.isAvailable
              ? 'Available'
              : 'Hidden'
          }
          color={
            params.row?.isAvailable
              ? 'success'
              : 'default'
          }
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() =>
              navigate(
                `/furniture/${params.row.id}/edit`
              )
            }
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() =>
              handleDelete(params.row.id)
            }
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Furniture ({rows.length})
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate('/furniture/new')
          }
        >
          Add Furniture
        </Button>
      </Box>

      {/* DataGrid */}
      <Box
        sx={{
          height: 600,
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}