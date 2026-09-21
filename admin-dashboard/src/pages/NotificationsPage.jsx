import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import { notificationApi } from '../api/notificationApi';

const TYPES = [
  { value: 'offer', label: 'Offer' },
  { value: 'new_arrival', label: 'New Arrival' },
  { value: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '', type: 'offer' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await notificationApi.create(form);
      toast.success('Notification broadcast to all users');
      setForm({ title: '', body: '', type: 'offer' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Broadcast Notification
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }} component="form" onSubmit={handleSubmit}>
        <TextField
          select
          fullWidth
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          sx={{ mb: 2 }}
        >
          {TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Message"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          sx={{ mb: 3 }}
          required
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send to All Users'}
        </Button>
      </Paper>
    </Box>
  );
}
