import { PromiseResult } from 'aws-sdk/lib/request';
import { PutObjectAclOutput } from 'aws-sdk/clients/s3';
import { AWSError, S3 } from 'aws-sdk';
import styles from './styles';
import {
  FormBuilderBase,
  FormElement,
  FormTheme,
  IForm,
  EmbedProps,
  RuleOptions,
} from './interfaces';

/**
 * Building and storing forms using AWS S3
 * @alias module:FormBuilder
 */
class FormBuilder implements FormBuilderBase {
  private s3: S3;

  /**
   * Creates an instance of FormBuilder object
   * @param bucket S3 bucket name
   */
  constructor(public bucket: string) {
    this.s3 = new S3();
  }

  /**
   * Builds complete HTML for form element with/without label
   * @param id Source API key
   * @param input HTML string of form input element
   * @param element Object representation of form element
   * @param rowClass Evaluated css row class
   */
  private compileLabel(id: string, input: string, element: FormElement, rowClass: string): string {
    if (element.label === '') {
      const noLabelFile = require('./partials/inputs/noLabel.ejs');
      return noLabelFile({
        rowClass,
        input,
        elementId: element.name || element.value,
        checkRadio: element.type === 'radio' || element.type ==='checkbox' ? `check_radio__${id}` : '',
      });
    }

    const labelFile = require('./partials/inputs/label.ejs');
    return labelFile({
      id,
      rowClass,
      label: element.label,
      input,
      elementId: element.name || element.value,
      checkRadio: element.type === 'radio' || element.type ==='checkbox' ? `check_radio__${id}` : '',
    });
  }

  /**
   * Builds HTML for checkbox input element
   * @param id Source API key
   * @param element Object representation of form element
   * @param rowClass Evaluated css row class
   */
  private checkBoxType(id: string, element: FormElement, rowClass: string): string {
    const inputFile = require('./partials/inputs/checkbox.ejs');
    const input = inputFile({
      id,
      element,
      name: element.name || element.value,
      rowClass,
    });

    return this.compileLabel(id, input, element, rowClass);
  }

  /**
   * Builds HTML for radio input element
   * @param id Source API key
   * @param element Object representation of form element
   * @param rowClass Evaluated css row class
   */
  private radioType(id: string, element: FormElement, rowClass: string): string {
    const [checkedIndex] = element.selected;
    const inputFile = require('./partials/inputs/radio.ejs');

    const input = inputFile({
      id,
      element,
      name: element.name || element.value,
      rowClass,
      checkedIndex,
    });

    return this.compileLabel(id, input, element, rowClass);
  }

  /**
   * Builds HTML for select element
   * @param id Source API key
   * @param element Object representation of form element
   * @param rowClass Evaluated css row class
   */
  private dropdownType(id: string, element: FormElement, rowClass: string): string {
    const [selectedIndex] = element.selected;
    const inputFile = require('./partials/inputs/select/options.ejs');

    const input = inputFile({
      id,
      element,
      name: element.name || element.value,
      rowClass,
      selectedIndex,
    });

    if (element.label === '') {
      const noLabelFile = require('./partials/inputs/select/noLabel.ejs');
      return noLabelFile({
        id,
        rowClass,
        input,
      });
    }
    const labelFile = require('./partials/inputs/select/label.ejs');
    return labelFile({
      id,
      rowClass,
      label: element.label,
      input,
    });
  }

  /**
   * Builds HTML for input element
   * @param id Source API key
   * @param element Object representation of form element
   * @param rowClass Evaluated css row class
   */
  private inputType(id: string, element: FormElement, rowClass: string): string {
    const name = element.name || element.value;
    const preset = element.validation.preset ? element.validation.preset.toLowerCase() : 'text';
    const label = element.label !== '' ? `<label for="${name}">${element.label}</label>` : '';
    const inputFile = require('./partials/inputs/text.ejs');

    return inputFile({
      id,
      element,
      preset,
      rowClass,
      name,
      label,
    });
  }

  /**
   * Routes element to compilers based on element type
   * @param id Source API key
   * @param element Object representation of form element
   * @param rowLength Number of elements in current row
   */
  private buildElement(id: string, element: FormElement, rowLength: number): string {
    let rowClass;

    switch (rowLength) {
      case 4:
        rowClass = `field__${id} quarter-width__${id}`;
        break;
      case 3:
        rowClass = `field__${id} third-width__${id}`;
        break;
      case 2:
        rowClass = `field__${id} half-width__${id}`;
        break;
      default:
        rowClass = `field__${id}`;
        break;
    }

    switch (element.type) {
      case 'checkbox':
        return this.checkBoxType(id, element, rowClass);
      case 'dropdown':
        return this.dropdownType(id, element, rowClass);
      case 'radio':
        return this.radioType(id, element, rowClass);
      default:
        return this.inputType(id, element, rowClass);
    }
  }

  /**
   * Builds CSS for form theme
   * @param id Source API key
   * @param theme Object representation of form theme
   */
  private buildTheme(id: string, theme: FormTheme): string {
    const variables = {
      BACKGROUND_COLOR: '#fff',
      FONT_FAMILY: "'sans serif'",
      FONT_SIZE: '16px',
      FONT_COLOR: '#32325d',
      BUTTON_COLOR: 'rgba(8, 76, 127, 100)',
    };

    let formTheme = styles(id);

    Object.keys(theme).forEach(prop => {
      if (theme[prop] !== '') {
        const tempProp = prop.toUpperCase().replace('-', '_');
        formTheme = formTheme.replace(new RegExp(tempProp, 'g'), theme[prop]);
      }
    });

    Object.keys(variables).forEach(d => {
      formTheme = formTheme.replace(new RegExp(d, 'g'), variables[d]);
    });

    return formTheme;
  }

  /**
   * Stores HTML and iframe versions of compiled for in S3 bucket
   * @param id Source API key
   * @param html Compiled form html
   * @param iframe Compiled form iframe html
   */
  private store(
    id: string,
    html: string,
    iframe: string,
  ): Promise<
    [PromiseResult<PutObjectAclOutput, AWSError>, PromiseResult<PutObjectAclOutput, AWSError>]
  > {
    return Promise.all([
      this.s3
        .putObject({
          Bucket: this.bucket,
          Key: `forms/${id}/form.html`,
          Body: html,
          ACL: 'public-read',
          ContentType: 'text/html',
        })
        .promise(),
      this.s3
        .putObject({
          Bucket: this.bucket,
          Key: `forms/${id}/iframe.html`,
          Body: iframe,
          ACL: 'public-read',
          ContentType: 'text/html',
        })
        .promise(),
    ]);
  }

  /**
   * String form of script tag containing conditional constructors
   * @param id Source API key
   * @param rules Object representation of form rules
   */
  private createConditionals(id: string, rules: RuleOptions[]): string {
    const result = rules
      .map(
        r => `new Conditionals.default({
              control: '[name=${r.conditions[0].field.replace(' ', '_')}] #${r.conditions[0].value.replace(' ', '_')}',
              toggleClass: 'hidden__${id}',
              visibility: {
                '${r.conditions[0].value}': '[name=${r.effects[0].field.replace(' ', '_')}] #${r.effects[0].field.replace(' ', '_')}',
              },
            });
            `,
      )
      .join('');

    return result.length ? `<script type="text/javascript">${result}</script>` : '';
  }

  /**
   * Builds surrounding HTML structure of form
   * @param id Source API key
   * @param content Inner HTML content of form
   * @param styles Compiled CSS of form
   * @param conditionals Compiled conditional script tag
   */
  private async createHTML(
    id: string,
    content: string,
    styles: string,
    conditionals: string,
  ): Promise<string> {
    const formFile = require('./partials/form.ejs');
    const wrapperFile = require('./partials/wrapper.ejs');
    const htmlFile = require('./partials/html.ejs');

    const compiledForm = await formFile({
      content,
      id,
    });
    const html = await wrapperFile({
      id,
      form: compiledForm,
    });

    return htmlFile({
      styles,
      html,
      conditionals,
    });
  }

  /**
   * Builds form HTML and stores resulting HTML in S3 bucket
   * @param form Object/JSON object representation of form
   */
  async build(
    id: string,
    form: IForm & string,
  ): Promise<
    [PromiseResult<PutObjectAclOutput, AWSError>, PromiseResult<PutObjectAclOutput, AWSError>]
  > {
    let formObject: IForm;
    try {
      formObject = JSON.parse(form);
    } catch (error) {
      formObject = form;
    }
    const { layout = [], theme = {}, rules = [] } = formObject;
    const rowFile = require('./partials/row.ejs');
    const docFile = require('./partials/doc.ejs');

    const rows = await layout.reduce((acc, row) => {
      let markup = row.map(el => this.buildElement(id, el, row.length)).join('');
      markup = rowFile({
        id,
        markup,
      });
      return `${acc}${markup}`;
    }, '');

    const styles = this.buildTheme(id, theme);
    const conditionals = this.createConditionals(id, rules);
    const finalHtml = await this.createHTML(id, rows, styles, conditionals);
    const iframe = await docFile({
      html: finalHtml,
      id,
    });

    return this.store(id, finalHtml, iframe);
  }

  /**
   * Returns embed options for form
   * @param id Source API key
   */
  embedProperties(id: string): EmbedProps {
    return {
      iframe: `<iframe src="https://s3.amazonaws.com/${
        this.bucket
      }/forms/${id}/iframe.html"><p>Your browser does not support iframes.</p></iframe>`,
      html: {
        content: `<div class="shuttle-form" data-id="${id}"></div>`,
        script:
        process.env.STAGE === 'production'
        ? `<script src="https://cdn.belunar.com/formbuilder/client.js"></script>`
        : `<script src="https://cdn.belunar.com/formbuilder/${process.env.STAGE}/client.js"></script>`,
      },
    };
  }
}

/**
 * A module for building and storing forms using AWS S3
 * @module FormBuilder
 */
export default FormBuilder;
