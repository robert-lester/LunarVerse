import * as React from 'react';
import { Media } from '../../../apollo/types';

interface State {
  mediaCompleteCount: number;
}

interface WrappedComponentProps {
  media: Media[];
}

export interface InjectedWithMediaLoaderProps extends State {
  onMediaLoadComplete: () => void;
}

type WithMediaLoaderProps = InjectedWithMediaLoaderProps & WrappedComponentProps;

export const withMediaLoader = <P extends InjectedWithMediaLoaderProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  class WithMediaLoader extends React.Component<any, State> {
    mediaCount: number = 0;
    mediaCompleteCount: number = 0;
    constructor(props: WithMediaLoaderProps) {
      super(props);
      this.mediaCount = props.media.length;
    }

    /** Handles the completion of a single media item */
    handleMediaLoadComplete = () => {
      if (this.mediaCompleteCount + 1 === this.mediaCount) {
        this.props.onMediaLoadComplete();
      } else {
        this.mediaCompleteCount++;
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props as P}
          onMediaLoadComplete={this.handleMediaLoadComplete}
        />
      );
    }
  }

  return WithMediaLoader;
};
