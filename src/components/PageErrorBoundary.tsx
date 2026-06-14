import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
}

class PageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[PageErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const { onBack, backHref = '/', backLabel = 'Go back' } = this.props;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-semibold text-foreground">Something went wrong</p>
          {this.state.message && (
            <p className="max-w-sm text-sm text-muted-foreground">{this.state.message}</p>
          )}
          {onBack ? (
            <Button variant="outline" onClick={onBack}>{backLabel}</Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to={backHref}>{backLabel}</Link>
            </Button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default PageErrorBoundary;
