class ErrorBoundary extends React.Component {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to monitoring service
        console.error('Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong. Please try again.</div>;
        }
        return this.props.children;
    }
} 