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

import { DynamicUISchemaElement, Scopable, UISchemaElement } from '../models';

export const compose = (path1: string[], path2: string[] | string) => {
  return path1
    ? path2 ? path1.concat(path2) : path1
    : path2 instanceof Array
      ? path2
      : path2 ? [path2] : [];
};

export { compose as composePaths };

/**
 * Convert a schema path (i.e. JSON pointer) to an array by splitting
 * at the '/' character and removing all schema-specific keywords.
 *
 * The returned value can be used to de-reference a root object by folding over it
 * and de-referencing the single segments to obtain a new object.
 *
 * @param {string|string[]} scope Encoded schema-path (using AJV-instancePath encoding method) or
 *   an array of raw (not-encoded) segments
 * @returns {string[]} An array containing only non-schema-specific segments in a raw (not-encoded)
 * format
 */
export const toDataPathSegments = (scope: string | string[], dynamicDataFields?: string[] | string): string[] => {
  const schemaPath = Array.isArray(scope)
    ? toStringSchemaPath(scope)
    : scope;

  const dataFieldKeys = dynamicDataFields instanceof Array ? dynamicDataFields : [dynamicDataFields];
  let i = 0;
  const s = schemaPath
    .replace(/^#?\/?/, '') // https://regex101.com/r/cmx2ki/1
    .replace(
      /properties\/|(anyOf|allOf|oneOf)\/[\d]+\/|patternProperties\/[^\/]*|additionalProperties($|\/)/g,
      match => /^(patternProperties|additionalProperties)/.test(match) ? `${dataFieldKeys[i++]}` : '',
    );
  // console.debug({schemaPath, dynamicDataFields, s}, s.split('/'));
  return s ? s.split('/') : [];
};
// TODO: `toDataPathSegments` and `toDataPath` are the same!
/**
 * Remove all schema-specific keywords (e.g. 'properties') from a given path.
 * @example
 * toDataPath('#/properties/foo/properties/bar') === ['foo', 'bar']
 * toDataPath(['#', 'properties', 'foo', 'properties', 'bar']) === ['foo', 'bar']
 *
 * @param {string} schemaPath the schema path to be converted
 * @returns {string[]} the path without schema-specific keywords
 */
export const toDataPath = (schemaPath: string): string[] => toDataPathSegments(schemaPath);

export const composeWithUi = (
  scopableUi: Scopable | UISchemaElement & Scopable | DynamicUISchemaElement & Scopable,
  path: string[]
): string[] => {
  const segments = toDataPathSegments(
    scopableUi.scope,
    'dataFieldKey' in scopableUi ? scopableUi.dataFieldKey : undefined
  );
  return compose(path, segments);
};

/**
 * Check if two paths are equal (section by section)
 */
export const pathsAreEqual = (path1: string[], path2: string[]) =>
  path2.length === path1.length && path2.every((section, i) => section === path1[i]);

/**
 * Check if a path starts with another path (`subPath`)
 */
export const pathStartsWith = (path: string[], subPath: string[]) =>
  subPath.length <= path.length && subPath.every((section, i) => section === path[i]);

/**
 * Convert path `array` to a `string`, injectively (in a reversible way)
 */
export const stringifyPath = (path: string[]) =>
  path.map(segment => ajvInstancePathEncoder(segment)).join('/');

export const ajvInstancePathEncoder = (pathSegment: string) =>
  pathSegment.replace(/[~\/]/g, match => match === '~' ? '~0' : '~1');

export const ajvInstancePathDecoder = (pathSegment: string) =>
  pathSegment.replace(/~0|~1/g, match => match === '~0' ? '~' : '/');

export const toStringSchemaPath = (schemaPathSegments: string[]): string =>
  schemaPathSegments.map(segment => ajvInstancePathEncoder(segment)).join('/');

export const toSchemaPathSegments = (schemaPath: string): string[] =>
  schemaPath.split('/').map(segment => ajvInstancePathDecoder(segment));
