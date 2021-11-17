import * as React from 'react';

import { Button } from '../../../components';
import './LazyLoader.scss';

interface Props {
  dataSize: number;
  isDataLoading: boolean;
  onFetch: (offset: number) => void;
  requestId: number | string | null;
  requestedSize: number;
}

interface State {
  isFetchBackwardExhausted: boolean;
  isFetchBackwardLoading: boolean;
  isFetchForwardLoading: boolean;
}

const initialState = {
  isFetchBackwardExhausted: false,
  isFetchBackwardLoading: false,
  isFetchForwardLoading: false
}

export class LazyLoader extends React.PureComponent<Props, State> {
  state = initialState;
  forwardOffset: number;
  backwardOffset: number;
  constructor(props: Props) {
    super(props);
    this.forwardOffset = -1;
    this.backwardOffset = 0;
  }

  componentDidUpdate(prevProps: Props) {
    // If data was loading and is no longer loading, reset loading states
    if (!this.props.isDataLoading && prevProps.isDataLoading) {
      let isFetchBackwardExhausted = this.state.isFetchBackwardExhausted;
      // If fetching backward and no more results
      if (this.state.isFetchBackwardLoading && this.props.dataSize === prevProps.dataSize) {
        isFetchBackwardExhausted = true;
      }
      this.setState({ isFetchBackwardLoading: false, isFetchForwardLoading: false, isFetchBackwardExhausted });
    }
    // Reset offsets due to new request
    if (this.props.requestId !== prevProps.requestId) {
      this.setState({ isFetchBackwardExhausted: false });
    }
  }

  /** Handles fetching forward */
  handleFetchForward = () => {
    if (!this.props.isDataLoading) {
      this.setState({ isFetchForwardLoading: true });
      this.props.onFetch(this.forwardOffset);
    }
  }

  /** Handles fetching backward */
  handleFetchBackward = () => {
    if (!this.props.isDataLoading) {
      this.setState({ isFetchBackwardLoading: true });
      this.props.onFetch(this.backwardOffset);
    }
  }

  render() {
    return (
      <div className="lazy-loader">
      <div className={`__backward-exhaust ${this.state.isFetchBackwardExhausted && '--visible'}`}>
        You've reached the end!
      </div>
        {!this.state.isFetchBackwardExhausted &&
          <Button
            label="Load Previous"
            isLoading={this.state.isFetchBackwardLoading}
            onClick={this.handleFetchBackward}
            className="__fetch-button"
          />
        }
        {this.props.children}
        <Button
          label="Load More"
          isLoading={this.state.isFetchForwardLoading}
          onClick={this.handleFetchForward}
          className="__fetch-button"
        />
      </div>
    );
  }
}

export default LazyLoader;
