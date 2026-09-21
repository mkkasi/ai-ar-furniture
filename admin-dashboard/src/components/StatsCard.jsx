import { Paper, Box, Typography } from '@mui/material';

export default function StatsCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: color,
          color: '#fff',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}
