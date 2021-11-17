import * as React from 'react';
import Popover from '@material-ui/core/Popover';

import { Icon, IconColor, IconNames, ListIcon, Search } from '../../components';

import './PopoverActions.scss';
import { IconSize } from '../Icon/Icon';
import { ListItemType } from '../ListItem/ListItem';
import { ListIconProps } from '../ListIcon/ListIcon';

interface Config {
  defaultView: string;
  views: {
    [key: string]: ActionView;
  };
}

interface ActionView {
  title: string;
  actions?: ListIconProps[];
  list: ListItemType[];
  emptyListMessage: string;
}

interface Props {
  anchorEl: null | HTMLElement | ((element: HTMLElement) => HTMLElement);
  className?: string;
  clickElement: React.ReactNode;
  config: Config;
  currentView: string;
  onBack?: () => void;
  onClose: () => void;
  open: boolean;
}

interface State {
  search: string;
}

export default class PopoverActions extends React.Component<Props, State> {
  state: State = {
    search: '',
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.currentView !== this.props.currentView) {
      this.setState({ search: '' });
    }
  }

  /** Handles search changes */
  handleSearchChange = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  /** Filters the list */
  filterList = (item: ListItemType) => item.value.toLowerCase().includes(this.state.search.toLowerCase());

  render() {
    const {
      anchorEl,
      className,
      clickElement,
      config,
      currentView,
      onBack,
      onClose,
      open
    } = this.props;
    const listLength = config.views[currentView].list.length;
    const filteredList = config.views[currentView].list.filter(this.filterList);
    return (
      <div className={className}>
        {clickElement}
        <Popover
          id="simple-popper"
          transitionDuration={0}
          open={open}
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <div className="l-popover-actions">
            <div className="__header">
              {config.defaultView !== currentView &&
                <Icon
                  className="__header-back-icon"
                  icon={IconNames.ARROW_BACK}
                  color={IconColor.DARK}
                  size={IconSize.SMALL}
                  onClick={onBack}
                />
              }
              <h4>{config.views[currentView].title}</h4>
            </div>
            <div className="__search-container">
              <Search
                search={this.state.search}
                onChange={this.handleSearchChange}
                placeholder="Search"
              />
            </div>
            {
              config.views[currentView].actions &&
              <div className="__button-container">
                {config.views[currentView].actions!.map(action =>
                  <ListIcon {...action} key={action.label} />
                )}
              </div>
            }
            {
              !listLength
                ? (<div className="__default-container">
                  <Icon
                    icon={IconNames.INFO}
                    color={IconColor.TWILIGHT}
                    size={IconSize.MEDIUM}
                    onClick={onBack}
                  />
                  <p className="__default-message">{config.views[currentView].emptyListMessage}</p>
                </div>)
                : (filteredList.length
                  ? (<div className="__itemList-container">
                    {filteredList.map(listItem => listItem.element)}
                  </div>)
                  : (<div className="__default-container">
                    <Icon
                      icon={IconNames.INFO}
                      color={IconColor.TWILIGHT}
                      size={IconSize.MEDIUM}
                      onClick={onBack}
                    />
                    <p className="__default-message">No results found</p>
                  </div>)
                )
            }
          </div>
        </Popover>
      </div>
    );
  }
}