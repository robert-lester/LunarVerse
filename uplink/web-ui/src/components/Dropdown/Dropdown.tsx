import * as React from 'react';
import Downshift from 'downshift';

import './Dropdown.scss';
import { Icon, ListItem, IconNames } from '../';
import { IconColor } from '../Icon/Icon';

export enum DropdownType {
  PRIMARY = 'primary'
}

export enum DropdownSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export interface DropdownItem {
  label: string | number;
  value: any;
}
interface Props {
  className?: string;
  items: DropdownItem[];
  label?: string;
  onChange: (selectedItem: DropdownItem) => void;
  placeholder?: string;
  searchable?: boolean;
  selectedItem?: string | number;
  size?: DropdownSize;
  type?: string;
}

interface State {
  search: string;
}

export default class Dropdown extends React.Component<Props, State> {
  state: State = {
    search: '',
  };

  static defaultProps = {
    className: null,
    label: '',
    onDark: false,
    placeholder: '',
    searchable: false,
    selectedItem: null,
    size: DropdownSize.MEDIUM,
    type: 'primary',
  };

  /** Gets the selected item or placeholder */
  getSelectedItem = () => {
    const { selectedItem, placeholder } = this.props;
    if (selectedItem) {
      const thisItem = this.props.items.find(item => item.value === selectedItem);
      return thisItem ? thisItem.label : '';
    }
    return placeholder || 'Select an item ...';
  }

  /** Handles search input value */
  handleSearch = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  render() {
    const {
      className,
      items,
      label,
      searchable,
      size,
      ...rest
    } = this.props;
    return (
      <Downshift
        {...rest}
        itemToString={item => item.label}
      >
        {({
          getItemProps,
          getToggleButtonProps,
          getInputProps,
          isOpen,
          highlightedIndex,
          selectedItem,
        }) => (
          <div className={`l-dropdown --${size} ${className}`}>
            {label && <div className="l-dropdown__label">{label}</div>}
            <button {...getToggleButtonProps()}>
              {this.getSelectedItem()}
              <Icon
                className="l-dropdown__icon"
                icon={IconNames.ARROW_DROP_DOWN}
                color={IconColor.TWILIGHT}
              />
            </button>
            <div className="l-dropdown__menu">
              {isOpen && (
                <div className="l-dropdown__items">
                  {searchable &&
                    <div className="">
                      <input
                        {...getInputProps()}
                        value={this.state.search}
                        onChange={this.handleSearch}
                        placeholder="Search"
                        className="l-dropdown__search"
                      />
                    </div>
                  }
                  {items.filter(item => !this.state.search || (item.value as string).includes(this.state.search))
                    .map((item, index) => (
                      <ListItem
                        active={(highlightedIndex === index).toString()}
                        {...getItemProps({
                          item,
                          selected: selectedItem === item.value,
                        })}
                        className={`l-dropdown__item l-dropdown__item${selectedItem === item.value && '--selected'}`}
                        key={item.value}
                      >
                        {item.label}
                      </ListItem>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}
