/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

import { ControlElement, JsonSchema, UISchemaElement } from '../models';
import { resolveSchema } from './resolvers';
import { findUISchema, JsonFormsUISchemaRegistryEntry } from '../reducers';
import { toSchemaPathSegments } from './path';

export interface CombinatorSubSchemaRenderInfo {
  uischema: UISchemaElement;
  label: string;
}

export type CombinatorKeyword = 'anyOf' | 'oneOf' | 'allOf';

const createLabel = (
  subSchema: JsonSchema,
  subSchemaIndex: number,
  keyword: CombinatorKeyword
): string => {
  if (subSchema.title) {
    return subSchema.title;
  } else {
    return keyword + '-' + subSchemaIndex;
  }
};

export const resolveSubSchemas = (
  schema: JsonSchema,
  rootSchema: JsonSchema,
  keyword: CombinatorKeyword
) => {
  // resolve any $refs, otherwise the generated UI schema can't match the schema???
  const schemas = schema[keyword] as any[];
  if (schemas.findIndex(e => e.$ref !== undefined) !== -1) {
    return {
      ...schema,
      [keyword]: (schema[keyword] as any[]).map(e =>
        e.$ref ? resolveSchema(rootSchema, e.$ref) : e
      )
    };
  }
  return schema;
};

export const createCombinatorRenderInfos = (
  combinatorSubSchemas: JsonSchema[],
  rootSchema: JsonSchema,
  keyword: CombinatorKeyword,
  control: ControlElement,
  path: string[],
  uischemas: JsonFormsUISchemaRegistryEntry[]
): CombinatorSubSchemaRenderInfo[] =>
  combinatorSubSchemas.map((subSchema, subSchemaIndex) => {
    const scope = Array.isArray(control.scope) ? control.scope : toSchemaPathSegments(control.scope);
    const deepScope = scope.concat(keyword, String(subSchemaIndex)); // @ts-ignore
    const {scope: ignoreScopeOfCombinatorsParents, ...uischema} = findUISchema(
      uischemas,
      subSchema,
      deepScope,
      path,
      undefined,
      control,
      rootSchema,
    );
    return {
      uischema,
      label: createLabel(subSchema, subSchemaIndex, keyword),
    };
  });
