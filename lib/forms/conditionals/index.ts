import { ConditionalsBase, ConditionalsOptions, TElement } from './interfaces';

/**
 * Utility class to handle conditional form elements
 */
class Conditionals implements ConditionalsBase {
  public control: TElement;
  private toggleClass: string;
  private inputType: string;
  private onChangeBound: any;

  /**
   * Creates an instance of the conditionals object
   * @param args Object to define parent control and conditional child controllers
   */
  constructor(private args: ConditionalsOptions) {
    this.control = document.querySelector(args.control);
    if (this.control === null) {
      return;
    }

    /** Bounce out to the parent element to see the Select Element */
    if (this.control.tagName === 'OPTION') {
      this.control = this.control.parentElement as TElement;
    }

    this.toggleClass = this.args.toggleClass;
    this.inputType = this.getInputType();

    if (this.inputType === 'checkbox' || this.inputType === 'radio') {
      this.onChangeBound = this.onChangeMulti.bind(this);
      this.setVisibleMulti(this.multiInputValue());
      Array.from(document.getElementsByName(this.control.name)).forEach((el) => {
        el.addEventListener('change', this.onChangeBound);
      });
    } else {
      this.setVisible(this.inputValue());
      this.onChangeBound = this.onChange.bind(this);
      this.control.addEventListener('change', this.onChangeBound);
    }
  }

  /**
   * Removes required attribute from condtionally hidden fields and stores attribute in data attribute
   * @param element Element to toggle required attribute
   * @param hidden Hidden flag
   */
  static toggleRequired(element: TElement, hidden: boolean): void {
    if (hidden) {
      element.setAttribute('data-required', 'true');
      element.removeAttribute('required');
    } else {
      element.setAttribute('required', '');
    }
  }

  /**
   * On change event handler get current value of control and checks visibility
   */
  onChange() {
    const value = this.inputValue();
    this.setVisible(value);
  }

  /**
   * On change event handler get current value of controls and checks visibility
   */
  onChangeMulti() {
    const values = this.multiInputValue();
    this.setVisibleMulti(values);
  }

  /**
   * Checks if value against visibility arguments
   * @param value current value of changed input
   */
  setVisible(value: string) {
    Object.keys(this.args.visibility).forEach(control => {
      const element = document.querySelector(this.args.visibility[control].split(' ')[0]);
      const required = element.required || element.dataset.required;
      if (value === control.replace(' ', '_')) {
        element.parentElement.classList.remove(this.toggleClass);
        if (required) {
          Conditionals.toggleRequired(element, false);
        }
      } else {
        element.parentElement.classList.add(this.toggleClass);
        if (required) {
          Conditionals.toggleRequired(element, true);
        }
      }
    });
  }

  /**
   * Checks if value against visibility arguments
   * @param values current value(s) of changed input(s)
   */
  setVisibleMulti(values: string[]) {
    Object.keys(this.args.visibility).forEach(control => {
      const visibilityName = this.args.visibility[control].split(' ');
      const label = document.querySelector(visibilityName[0] + ' + label');
      const element = document.querySelector(visibilityName[0]);
      const elements = Array.from(document.getElementsByName(element.name)) as HTMLInputElement[];
      elements.map(el => {
        const required = el.required || el.dataset.required;
        if (values.includes(control)) {
          el.setAttribute('id', visibilityName[1] + '_field');
          label.setAttribute('for', visibilityName[1] + '_field');
          el.parentElement.classList.remove(this.toggleClass);
          if (required) {
            Conditionals.toggleRequired(el, false);
          }
        } else {
          el.parentElement.classList.add(this.toggleClass);
          if (required) {
            Conditionals.toggleRequired(el, true);
          }
        }
      });
    });
  }

  /**
   * Returns input type of specified control;
   */
  getInputType() {
    const type = this.control.tagName.toLowerCase();
    if (type === 'input') {
      return this.control.type;
    }

    return type;
  }

  /**
   * Finds all multi-control inputs and returns checked value if exists
   */
  multiInputValue() {
    const group = Array.from(document.getElementsByName(this.control.name)) as HTMLInputElement[];
    const inputChecked = group.filter(node => node.checked);

    return inputChecked.map(input => input.value);
  }

  /**
   * Returns the value of the specified control
   */
  inputValue() {
    return this.control.value;
  }

  /**
   * Removed the on change event listener
   */
  destroy() {
    this.control.removeEventListener('change', this.onChangeBound);
  }
}

export default Conditionals;
