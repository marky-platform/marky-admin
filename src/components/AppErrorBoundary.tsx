import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import * as Sentry from "@sentry/react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

// Error boundaries must be class components — React has no hook equivalent.
class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado en la aplicación:", error, errorInfo);
    // React no propaga a window.onerror los errores atrapados por un boundary.
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Ocurrió un error inesperado
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Por favor, intenta nuevamente. Si el problema persiste, contacta a
            soporte.
          </Typography>
          <Button variant="contained" onClick={this.handleRetry}>
            Reintentar
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
