import { Component } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

/**
 * Catches any uncaught error thrown during rendering anywhere below it in
 * the tree and shows a recoverable screen instead of the blank white page
 * React leaves behind by default. Without this, a single bad render (a
 * stats field with an unexpected shape, a null reference in a chart, etc)
 * unmounts the entire app with nothing on screen and nothing in the UI to
 * tell the user something went wrong.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught a render error:', error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420 }}>
          <Typography variant="h5" fontWeight={700}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The dashboard hit an unexpected error and couldn&apos;t render this page. Reloading usually
            fixes it — if it keeps happening, check the browser console for details.
          </Typography>
          {import.meta.env.DEV && this.state.error && (
            <Typography
              variant="caption"
              component="pre"
              sx={{ textAlign: 'left', whiteSpace: 'pre-wrap', color: 'error.main', opacity: 0.8 }}
            >
              {String(this.state.error?.message || this.state.error)}
            </Typography>
          )}
          <Button variant="contained" onClick={this.handleReload}>
            Reload
          </Button>
        </Stack>
      </Box>
    );
  }
}

export default ErrorBoundary;
