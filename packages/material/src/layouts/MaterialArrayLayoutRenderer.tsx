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
import React, { useCallback, useMemo, useState } from 'react';

import type { JsonSchema } from '@jsonforms/core';
import {
  ArrayLayoutProps,
  composePaths,
  computeLabel,
  createDefaultValue,
  isObjectArrayWithNesting,
  pathsAreEqual,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { Hidden, Typography } from '@mui/material';
import { withJsonFormsArrayLayoutProps } from '@jsonforms/react';
import { ArrayLayoutToolbar } from './ArrayToolbar';
import map from 'lodash/map';
import range from 'lodash/range';
import ExpandPanelRenderer from './ExpandPanelRenderer';

export const MaterialArrayLayoutRenderer = ({
  visible,
  uischema,
  schema,
  label,
  rootSchema,
  renderers,
  cells,
  data: dataLength,
  path,
  errors,
  uischemas,
  addItem,
  config,
  required,
}: ArrayLayoutProps) => {
  const [expanded, setExpanded] = useState<string[]>(composePaths(path, null));
  const {itemsSchema, innerCreateDefaultValue} = useMemo(() => ({
    itemsSchema: schema.items as JsonSchema,
    innerCreateDefaultValue: () => createDefaultValue(itemsSchema)
  }), [schema]);
  const handleChange = useCallback((panel: string[]) => (_event: any, expandedPanel: boolean) => {
    setExpanded(expandedPanel ? panel : null);
  }, []);
  const isExpanded = (index: number) =>
    expanded ? pathsAreEqual(expanded, composePaths(path, `${index}`)) : false;

  const addItemCb = useCallback(() => {
    setExpanded(composePaths(path, String(dataLength)));
    return addItem(path, innerCreateDefaultValue())();
  }, [dataLength, innerCreateDefaultValue, addItem]);

  const appliedUiSchemaOptions = {...config, ...uischema.options};

  return (
    <Hidden xsUp={!visible}>
      <ArrayLayoutToolbar
        label={computeLabel(
          label,
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk,
        )}
        description={uischema.description ?? schema.description}
        errors={errors}
        addItem={addItemCb}
      />
      <div>
        {dataLength > 0 ? (
          map(range(dataLength), index => {
            return (
              <ExpandPanelRenderer
                index={index}
                expanded={isExpanded(index)}
                schema={itemsSchema}
                path={path}
                handleExpansion={handleChange}
                uischema={uischema}
                renderers={renderers}
                cells={cells}
                key={index}
                rootSchema={rootSchema}
                enableMoveUp={index > 0}
                enableMoveDown={index < dataLength - 1}
                config={config}
                childLabelProp={appliedUiSchemaOptions.elementLabelProp}
                uischemas={uischemas}
              />
            );
          })
        ) : (
          <Typography>No data</Typography>
        )}
      </div>
    </Hidden>
  );
};

export const materialArrayLayoutTester: RankedTester = rankWith(
  4,
  isObjectArrayWithNesting
);
export default React.memo(withJsonFormsArrayLayoutProps(React.memo(MaterialArrayLayoutRenderer)));
