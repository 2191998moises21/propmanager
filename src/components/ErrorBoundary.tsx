import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Note: Error boundaries do NOT catch errors for:
 * - Event handlers
 * - Asynchronous code (setTimeout, requestAnimationFrame)
 * - Server side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to logging service (Sentry, LogRocket, etc)
    // Example: logErrorToService(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the page to reset state
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">¡Algo salió mal!</h1>
                <p className="text-sm text-gray-600">La aplicación encontró un error inesperado</p>
              </div>
            </div>

            {import.meta.env.DEV && error && (
              <div className="mb-4">
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold text-red-600">Error:</p>
                      <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-x-auto">
                        {error.toString()}
                      </pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <p className="font-semibold text-red-600">Stack Trace:</p>
                        <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-x-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reiniciar Aplicación
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Volver Atrás
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Si el problema persiste, contacta al soporte técnico
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}
