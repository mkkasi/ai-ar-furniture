import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import toast from 'react-hot-toast';
import { categoryApi } from '../api/categoryApi';

const emptyForm = { name: '', description: '', icon: '', productType: 'furniture', isActive: true, image: null };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = useCallback(() => {
    categoryApi.list().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      productType: cat.productType || 'furniture',
      isActive: cat.isActive,
      image: null,
    });
    setEditingId(cat._id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('icon', form.icon);
      formData.append('productType', form.productType);
      formData.append('isActive', form.isActive);
      if (form.image) formData.append('image', form.image);

      if (editingId) {
        await categoryApi.update(editingId, formData);
        toast.success('Category updated');
      } else {
        await categoryApi.create(formData);
        toast.success('Category created');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryApi.remove(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat._id}>
            <Card sx={{ borderRadius: 3 }}>
              {cat.image?.url && <CardMedia component="img" height="120" image={cat.image.url} />}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography fontWeight={700}>{cat.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={cat.productType === 'appliance' ? 'Appliance' : 'Furniture'}
                        color={cat.productType === 'appliance' ? 'secondary' : 'default'}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(cat)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(cat._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField
            label="Description"
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField label="Icon name" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Button component="label" variant="outlined">
            Upload Image
            <input hidden type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
          </Button>
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
