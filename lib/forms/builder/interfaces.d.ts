import { PromiseResult } from 'aws-sdk/lib/request';
import { PutObjectAclOutput } from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk';

export interface ElementOptions {
  label: string;
  value: string;
}

export interface RuleConditions {
  field: string;
  operator: string;
  value: string;
}

export interface RuleEffects {
  field: string;
  effect: string;
}

export interface RuleOptions {
  conditions: RuleConditions[];
  effects: RuleEffects[];
}

export interface FormTheme {
  'background-color'?: string;
  'button-color'?: string;
  'font-color'?: string;
  'font-family'?: string;
  'font-size'?: string;
}

export interface FormElement {
  type: string;
  label: string;
  value: string;
  validation: {
    required: boolean;
    preset?: string;
  };
  options?: ElementOptions[];
  selected?: number[];
  name: string;
}

export interface IForm {
  layout: Array<FormElement[]>;
  theme: FormTheme;
  rules: RuleOptions[];
  mapping?: any;
}

export interface EmbedProps {
  iframe: string;
  html: {
    content: string;
    script: string;
  };
}

export interface FormBuilderBase {
  build(
    i: string,
    f: IForm,
  ): Promise<
    [PromiseResult<PutObjectAclOutput, AWSError>, PromiseResult<PutObjectAclOutput, AWSError>]
  >;
  embedProperties(i: string): EmbedProps;
}
