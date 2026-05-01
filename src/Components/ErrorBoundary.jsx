import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

/**
 * ErrorBoundary catches runtime errors in the component tree and shows
 * a friendly fallback UI instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-950">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
                    <p className="text-gray-400 mb-2 max-w-md">
                        An unexpected error occurred. Try reloading the page.
                    </p>
                    {this.state.error?.message && (
                        <p className="text-xs text-gray-600 font-mono mb-6 max-w-sm break-all">
                            {this.state.error.message}
                        </p>
                    )}
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

