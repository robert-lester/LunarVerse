export interface ConditionalsOptions {
  control: string;
  toggleClass: string;
  visibility: object;
}

export type TElement = Element & HTMLInputElement;

export class ConditionalsBase {
  constructor(args: ConditionalsOptions);
  /**
   * Removes required attribute from condtionally hidden fields and stores attribute in data attribute
   * @param element Element to toggle required attribute
   * @param hidden Hidden flag
   */
  static toggleRequired(e: TElement, h: boolean): void;
  /**
   * On change event handler get current value of control and checks visibility
   */
  onChange(): void;
  /**
   * On change event handler get current value of controls and checks visibility
   */
  onChangeMulti(): void;
  /**
   * Checks if value against visibility arguments
   * @param value current value of changed input
   */
  setVisible(value: string): void;
  /**
   * Checks if value against visibility arguments
   * @param values current value(s) of changed input(s)
   */
  setVisibleMulti(values: string[]): void;
  /**
   * Returns input type of specified control;
   */
  getInputType(): string;
  /**
   * Finds all radio control inputs and returns checked value if exists
   */
  multiInputValue(): string[];
  /**
   * Returns the value of the specified control
   */
  inputValue(): string;
  /**
   * Removed the on change event listener
   */
  destroy(): void;
}
