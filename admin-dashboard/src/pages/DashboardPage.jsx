import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ChairIcon from '@mui/icons-material/ChairOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import ReviewsIcon from '@mui/icons-material/RateReviewOutlined';

import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import StatsCard from '../components/StatsCard';
import { statsApi } from '../api/statsApi';

// Register Chart.js components.
// NOTE: LineController (the dataset controller for the <Line> chart type)
// must be registered separately from LineElement in Chart.js v4's
// tree-shakeable API. Without it, react-chartjs-2's <Line> throws
// '"line" is not a registered controller' on mount, and with no error
// boundary in this app that crash blanks the entire screen right after
// login. Do not remove this without also adding an ErrorBoundary.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    statsApi
      .dashboard()
      .then((res) => {
        setStats(res.data.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || 'Failed to load stats'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Loading
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // No data protection
  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>
          No dashboard data available.
        </Typography>
      </Box>
    );
  }

  // Chart data
  const chartData = {
    labels: (stats.signupsLast30Days || []).map(
      (d) => d._id
    ),

    datasets: [
      {
        label: 'New Signups',
        data: (stats.signupsLast30Days || []).map(
          (d) => d.count
        ),

        borderColor: '#2E5945',
        backgroundColor: 'rgba(46, 89, 69, 0.15)',

        borderWidth: 2,
        tension: 0.35,

        // Filler plugin is now registered
        fill: true,

        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: true,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Box>
      {/* ================= STATS CARDS ================= */}
      <Grid container spacing={2.5}>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PeopleIcon />}
            label="Total Users"
            value={stats.totals?.totalUsers ?? 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ChairIcon />}
            label="Furniture Items"
            value={stats.totals?.totalFurniture ?? 0}
            color="secondary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CategoryIcon />}
            label="Categories"
            value={stats.totals?.totalCategories ?? 0}
            color="#4A6FA5"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ReviewsIcon />}
            label="Reviews"
            value={stats.totals?.totalReviews ?? 0}
            color="#B5895B"
          />
        </Grid>

      </Grid>

      {/* ================= CHART + TOP FURNITURE ================= */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>

        {/* Signups Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              gutterBottom
            >
              Signups — Last 30 Days
            </Typography>

            <Box sx={{ height: 300 }}>
              <Line
                data={chartData}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Top Rated Furniture */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              gutterBottom
            >
              Top Rated Furniture
            </Typography>

            <List dense>
              {(stats.topRatedFurniture || []).length > 0 ? (
                stats.topRatedFurniture.map((item) => (
                  <ListItem
                    key={item._id}
                    disableGutters
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={item.images?.[0]?.url}
                        variant="rounded"
                      >
                        {item.name?.charAt(0) || 'F'}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={item.name}
                      secondary={`★ ${
                        Number(item.ratingsAverage || 0).toFixed(1)
                      } (${item.ratingsCount || 0})`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No rated furniture available.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

      </Grid>

      {/* ================= NEWEST USERS ================= */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          mt: 2.5,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
        >
          Newest Users
        </Typography>

        <List dense>
          {(stats.newestUsers || []).length > 0 ? (
            stats.newestUsers.map((user) => (
              <ListItem
                key={user._id}
                disableGutters
              >
                <ListItemAvatar>
                  <Avatar>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={user.name}
                  secondary={user.email}
                />
              </ListItem>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No users registered yet.
            </Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
}