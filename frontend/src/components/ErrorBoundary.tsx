import { Component, type ReactNode } from 'react';

// Shows a runtime error on screen instead of leaving a blank page.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('[ARTISRA] render error:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return <pre role="alert" style={{ position: 'fixed', inset: '80px 16px 16px', overflow: 'auto', whiteSpace: 'pre-wrap', zIndex: 5 }}>{String(this.state.error.stack ?? this.state.error)}</pre>;
  }
}
