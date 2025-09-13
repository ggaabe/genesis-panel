import { Component, type ReactNode } from 'react';
import { Alert } from '@mantine/core';

interface Props { children: ReactNode }
interface State { error?: Error }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('App error:', error); }
  render() {
    if (this.state.error) {
      return <Alert color="red" title="Something went wrong">{this.state.error.message}</Alert>;
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;

