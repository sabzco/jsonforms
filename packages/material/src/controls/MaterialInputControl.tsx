/*
  The MIT License

  Copyright (c) 2017-2021 EclipseSource Munich
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
import React from 'react';
import { ControlProps, isDescriptionHidden, isScopeOfDynamicProperty, showAsRequired } from '@jsonforms/core';
import { FormControl, FormHelperText, Grid, Hidden, IconButton, InputLabel, InputProps, Tooltip } from '@mui/material';
import merge from 'lodash/merge';
import { useFocus } from '../util';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { InputLabelProps } from '@mui/material/InputLabel/InputLabel';

export interface WithInput {
  input: any;
  muiInputProps?: InputProps['inputProps'];
  muiInputLabelProps?: Partial<InputLabelProps>;
}

export const MaterialInputControl = (props: ControlProps & WithInput) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    id,
    description,
    errors,
    label,
    uischema,
    visible,
    required,
    config,
    input,
    muiInputLabelProps,
  } = props;
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription,
  );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;
  const InnerComponent = input;
  const isDynamicProperty = isScopeOfDynamicProperty(uischema.scope);

  const formControl = (
    <FormControl
      fullWidth={!appliedUiSchemaOptions.trim}
      onFocus={onFocus}
      onBlur={onBlur}
      id={id}
      variant='standard'
    >
      <InputLabel
        {...muiInputLabelProps}
        htmlFor={id + '-input'}
        error={!isValid}
        required={showAsRequired(required, appliedUiSchemaOptions.hideRequiredAsterisk)}
      >
        {isDynamicProperty ? uischema.dataFieldKeys.at(-1) : label}
      </InputLabel>
      <InnerComponent
        {...props}
        id={id + '-input'}
        isValid={isValid}
        visible={visible}
      />
      <FormHelperText error={!isValid && !showDescription}>
        {firstFormHelperText}
      </FormHelperText>
      <FormHelperText error={!isValid}>
        {secondFormHelperText}
      </FormHelperText>
    </FormControl>
  );

  return (
    <Hidden xsUp={!visible}>
      {isDynamicProperty
        ? (
          <Grid container direction='row' wrap='nowrap'>
            <Grid item xs>
              {formControl}
            </Grid>
            <Grid item>
              <Tooltip title='Remove property' placement='bottom'>
                <IconButton
                  aria-label='Remove property'
                  onClick={() => props.removeThisProperty(props.path)}
                >
                  <DeleteIcon/>
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        )
        : formControl
      }
    </Hidden>
  );
};
