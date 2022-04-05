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
import isEmpty from 'lodash/isEmpty';
import {
  ControlElement,
  findUISchema,
  GroupLayout,
  isObjectControl,
  RankedTester,
  rankWith,
  StatePropsOfControlWithDetail,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsDetailProps } from '@jsonforms/react';
import { Hidden } from '@mui/material';
import React, { useMemo } from 'react';

/**
 * @deprecated This renderer is deprecated! Use
 *   {@link MaterialDynamicGroupRenderer `MaterialDynamicGroup`} instead.
 * @constructor
 */
export const MaterialObjectRenderer = ({
  renderers,
  cells,
  uischemas,
  schema,
  label,
  path,
  visible,
  enabled,
  uischema,
  rootSchema
}: StatePropsOfControlWithDetail) => {
  const detailUiSchema = useMemo(
    () =>
      findUISchema(
        uischemas,
        schema,
        uischema.scope,
        path,
        'Group',
        uischema,
        rootSchema
      ),
    [uischemas, schema, uischema.scope, path, uischema, rootSchema]
  );
  if (isEmpty(path)) {
    detailUiSchema.type = 'VerticalLayout';
  } else {
    (detailUiSchema as GroupLayout).label = label;
  }
  if (uischema.scope) {
    (detailUiSchema as ControlElement).scope = uischema.scope;
  }
  return (
    <Hidden xsUp={!visible}>
      <JsonFormsDispatch
        visible={visible}
        enabled={enabled}
        schema={schema}
        uischema={detailUiSchema}
        path={path}
        renderers={renderers}
        cells={cells}
      />
    </Hidden>
  );
};

export const materialObjectControlTester: RankedTester = rankWith(
  -1, // This renderer is deprecated! Use `MaterialDynamicGroupRenderer` instead.
  isObjectControl
);

export default withJsonFormsDetailProps(MaterialObjectRenderer);
