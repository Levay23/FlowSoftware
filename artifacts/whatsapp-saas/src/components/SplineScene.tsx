import React, { Suspense, useState, Component, type ErrorInfo, type ReactNode } from "react";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class SplineErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Spline Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);

  const fallback = (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 opacity-50" />
  );

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <SplineErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <Spline 
            scene={scene} 
            onLoad={() => setLoaded(true)}
            className={`transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
}
