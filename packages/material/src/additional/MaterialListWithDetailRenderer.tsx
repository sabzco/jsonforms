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
import {
  and,
  ArrayLayoutProps,
  computeLabel,
  createDefaultValue,
  EMPTY_PATH,
  findUISchema,
  isObjectArray,
  JsonSchema7,
  RankedTester,
  rankWith,
  toStringSchemaPath,
  uiTypeIs,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsArrayLayoutProps } from '@jsonforms/react';
import { Grid, Hidden, List, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { ArrayLayoutToolbar } from '../layouts/ArrayToolbar';
import ListWithDetailMasterItem from './ListWithDetailMasterItem';
import { produce } from 'immer';

export const MaterialListWithDetailRenderer = ({
  uischemas,
  schema,
  rootSchema,
  uischema,
  path,
  errors,
  visible,
  label,
  required,
  removeItems,
  addItem,
  data: dataLength,
  renderers,
  cells,
  config,
}: ArrayLayoutProps) => {
  const [selectedIndex, setSelectedIndex] = useState(undefined);
  const handleRemoveItem = useCallback(
    (thePath: string[], value: any) => () => {
      removeItems(thePath, [value])();
      if (selectedIndex === value) {
        setSelectedIndex(undefined);
      } else if (selectedIndex > value) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [removeItems, setSelectedIndex],
  );
  const handleListItemClick = useCallback(
    (index: number) => () => setSelectedIndex(index),
    [setSelectedIndex],
  );
  const innerCreateDefaultValue = useCallback(
    () => createDefaultValue(schema.items as JsonSchema7),
    [schema],
  );
  const {scope} = uischema;
  const foundUISchema = useMemo(() => findUISchema(
    uischemas,
    schema,
    scope,
    path,
    undefined,
    uischema,
  ), [uischemas, schema, scope, path, uischema]);
  const appliedUiSchemaOptions = {...config, ...uischema.options};

  const addItemCb = useCallback(() => {
    return addItem(path, innerCreateDefaultValue())();
  }, [innerCreateDefaultValue, addItem]);

  const activeItemUiSchema = useMemo(() => selectedIndex === undefined
    ? undefined
    : produce(
      foundUISchema,
      GlobalizeUiSchema(
        (uischema.dataFieldKeys ?? []).concat(selectedIndex),
        typeof scope === 'string' ? scope : toStringSchemaPath(scope)
      )
    ), [foundUISchema, selectedIndex, scope, uischema.dataFieldKeys]);

  return (
    <Hidden xsUp={!visible}>
      <ArrayLayoutToolbar
        label={computeLabel(
          label,
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk,
        )}
        errors={errors}
        addItem={addItemCb}
      />
      <Grid container direction='row' spacing={2}>
        <Grid item xs={3}>
          <List>
            {dataLength > 0 ? (
              Array.from({length: dataLength}).map((_, index) => (
                <ListWithDetailMasterItem
                  index={index}
                  path={path}
                  schema={schema}
                  handleSelect={handleListItemClick}
                  removeItem={handleRemoveItem}
                  selected={selectedIndex === index}
                  key={index}
                />
              ))
            ) : (
              <p>No data</p>
            )}
          </List>
        </Grid>
        <Grid item xs>
          {selectedIndex !== undefined ? (
            <JsonFormsDispatch
              renderers={renderers}
              cells={cells}
              visible={visible}
              schema={rootSchema}
              uischema={activeItemUiSchema}
              path={EMPTY_PATH}
            />
          ) : (
            <Typography variant='h6'>No Selection</Typography>
          )}
        </Grid>
      </Grid>
    </Hidden>
  );
};

export const materialListWithDetailTester: RankedTester = rankWith(
  4,
  and(uiTypeIs('ListWithDetail'), isObjectArray)
);

export default withJsonFormsArrayLayoutProps(MaterialListWithDetailRenderer);

// tslint:disable-next-line:only-arrow-functions
function GlobalizeUiSchema(dataFieldKeys: (number|string)[], parentScope: string) {
  const scopePrefix = parentScope.endsWith('/') ? parentScope.slice(0, -1) : parentScope;
  return globalize;

  // tslint:disable-next-line:only-arrow-functions
  function globalize(uiSchema: any) {
    if (uiSchema.scope) {
      uiSchema.scope = scopePrefix + uiSchema.scope.slice(1); // remove leading `#`
      uiSchema.dataFieldKeys = dataFieldKeys;
    }
    uiSchema.elements?.forEach((subUiSchema: any) => globalize(subUiSchema));
  }
}
