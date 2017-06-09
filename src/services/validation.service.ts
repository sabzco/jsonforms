import { UISchemaElement, ControlElement, Layout } from '../models/uischema';
import { JsonFormsServiceElement, JsonFormService } from '../core';
import {Runtime} from '../core/runtime';
import { JsonSchema } from '../models/jsonSchema';
import { toDataPath } from '../path.util';
import {DataService, DataChangeListener} from '../core/data.service';

import * as AJV from 'ajv';

const ajv = new AJV({allErrors: true, jsonPointers: true, errorDataPath: 'property'});

/**
 * Validator service based on ajv.
 */
@JsonFormsServiceElement({})
export class JsonFormsValidator implements DataChangeListener, JsonFormService {

  private validator: AJV.ValidateFunction;
  private pathToControlMap: {[path: string]: ControlElement} = {};

  /**
   * Constructor.
   *
   * @param {DataService} dataService the data service
   * @param {JsonSchema} dataSchema the JSON schema describing the data
   * @param {UISchemaElement} uiSchema the UI schema to be rendered
   */
  constructor(private dataService: DataService, dataSchema: JsonSchema, uiSchema: UISchemaElement) {
    dataService.registerChangeListener(this);
    this.validator = ajv.compile(dataSchema);
    this.parseUiSchema(uiSchema);
  }

  /**
   * @inheritDoc
   */
  isRelevantKey(_: ControlElement): boolean {
    return true;
  }

  /**
   * @inheritDoc
   */
  notifyChange(uischema: ControlElement, newValue: any, data: any): void {
    this.validate(data);
  }

  /**
   * @inheritDoc
   */
  dispose(): void {
    this.dataService.unregisterChangeListener(this);
  }

  private parseUiSchema(uiSchema: UISchemaElement): void {
    if (uiSchema.hasOwnProperty('elements')) {
      (<Layout>uiSchema).elements.forEach((element, index) =>
          this.parseUiSchema(element)
      );
    } else if (uiSchema.hasOwnProperty('scope')) {
      const control = <ControlElement> uiSchema;
      const instancePath = toDataPath(control.scope.$ref);
      this.pathToControlMap[instancePath] = control;
    }
  }

  private validate(data: any): void {
    this.cleanAllValidationErrors();
    const valid = this.validator(data);
    if (valid) {
      return;
    }
    const errors = this.validator.errors;
    errors.forEach(error => this.mapErrorToControl(error));
  }

  private mapErrorToControl(error: AJV.ErrorObject): void {
    const uiSchema = this.pathToControlMap[error.dataPath.substring(1)];

    if (uiSchema === undefined) {
      // FIXME should we log this at all?
      console.warn('No control for showing validation error @', error.dataPath.substring(1));
      return;
    }

    if (!uiSchema.hasOwnProperty('runtime')) {
      uiSchema['runtime'] = new Runtime();
    }
    const runtime = <Runtime> uiSchema['runtime'];
    runtime.validationErrors = [];
    runtime.validationErrors = runtime.validationErrors.concat(error.message);
  }

  private cleanAllValidationErrors(): void {
    Object.keys(this.pathToControlMap).forEach(key => {
      if (!this.pathToControlMap[key].hasOwnProperty('runtime')) {
        return;
      }
      (<Runtime> this.pathToControlMap[key]['runtime']).validationErrors = undefined;
    });
  }
}