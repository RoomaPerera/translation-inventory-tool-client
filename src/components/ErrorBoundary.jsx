import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Safely update state
        try {
            this.setState({
                error: error,
                errorInfo: errorInfo
            });
        } catch (stateError) {
            console.error('Error updating ErrorBoundary state:', stateError);
        }
    }

    handleRefresh = () => {
        try {
            window.location.reload();
        } catch (error) {
            console.error('Error refreshing page:', error);
        }
    }

    handleTryAgain = () => {
        try {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null
            });
        } catch (error) {
            console.error('Error resetting ErrorBoundary:', error);
            // Fallback to page refresh if state reset fails
            this.handleRefresh();
        }
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI - make it as simple as possible to avoid further errors
            return (
                <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-red-600 mb-4">
                        An error occurred while loading the translation editor. Please try refreshing the page.
                    </p>

                    {/* Only show error details in development and if we have error info */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="text-sm">
                            <summary className="cursor-pointer text-red-700 font-medium mb-2">
                                Error Details (Development Only)
                            </summary>
                            <pre className="bg-red-100 p-3 rounded text-xs overflow-auto max-h-40">
                                {this.state.error.toString()}
                                {this.state.errorInfo && (
                                    <>
                                        <br />
                                        {this.state.errorInfo.componentStack}
                                    </>
                                )}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={this.handleRefresh}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={this.handleTryAgain}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        // Render children normally
        try {
            return this.props.children;
        } catch (renderError) {
            // If there's an error rendering children, log it and show fallback
            console.error('Error rendering children in ErrorBoundary:', renderError);
            return (
                <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Rendering Error
                    </h2>
                    <p className="text-red-600 mb-4">
                        Unable to render the component. Please refresh the page.
                    </p>
                    <button
                        onClick={this.handleRefresh}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
    }
}

export default ErrorBoundary;