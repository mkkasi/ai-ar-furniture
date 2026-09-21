import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, CircularProgress } from '@mui/material';
import { statsApi } from '../api/statsApi';

export default function SavedDesignsPage() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi
      .savedDesigns()
      .then((res) => setDesigns(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Saved AR Designs ({designs.length})
      </Typography>
      <Grid container spacing={2}>
        {designs.map((d) => (
          <Grid item xs={12} sm={6} md={4} key={d._id}>
            <Card sx={{ borderRadius: 3 }}>
              {d.screenshot?.url && <CardMedia component="img" height="160" image={d.screenshot.url} />}
              <CardContent>
                <Typography fontWeight={700}>{d.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  by {d.user?.name || 'Unknown user'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip size="small" label={`${d.placedItems?.length || 0} item(s)`} sx={{ mr: 1 }} />
                  <Chip size="small" label={d.roomType?.replace('_', ' ')} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
