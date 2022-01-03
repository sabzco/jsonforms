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
import React, { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import {
  Box,
  Button,
  DialogContentText,
  Divider,
  FormControl,
  Hidden,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { MaterialLayoutRenderer } from '../util';
import ModalWindow from '../util/ModalWindow';
import type {
  DispatchPropsOfDynamicLayout,
  DynamicLayoutProps,
  DynamicProperties,
  DynamicProperty,
} from '@jsonforms/core';
import { RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { withDynamicProperties } from '@jsonforms/react';

export const materialDynamicObjectTester: RankedTester = rankWith(
  1,
  uiTypeIs('DynamicGroup'),
);

export const MaterialDynamicObjectRenderer = React.memo(
  (props: DynamicLayoutProps & DispatchPropsOfDynamicLayout) => {
    const {visible, enabled, uischema, ...otherProps} = props;
    const groupLayout = uischema;
    const [isModalOpen, setModalOpen] = useState(false);

    const onSubmitCallback = useCallback((key: string, value: any) => {
      if (!key) { return; }
      props.addNewProperty(props.path, key, value);
    }, [props.addNewProperty, props.path]);

    return (
      <Hidden xsUp={!visible}>
        <Stack>
          <Divider>
            <Tooltip title={`Add to ${groupLayout.label ?? 'Root-Object'}`} placement='bottom'>
              <Button
                sx={{p: 1, color: 'text.secondary', textTransform: 'none'}}
                aria-label={`Add to ${groupLayout.label ?? 'Root-Object'}`}
                onClick={() => setModalOpen(true)}
              >
                <Typography>Define a Property</Typography>&nbsp;
                <AddIcon/>
              </Button>
            </Tooltip>
          </Divider>

          <MaterialLayoutRenderer
            {...otherProps}
            visible={visible}
            enabled={enabled}
            elements={groupLayout.elements}
          />
        </Stack>

        <DefineNewPropertyModal
          isModalOpen={isModalOpen}
          hideModal={() => setModalOpen(false)}
          dynamicProperties={props.dynamicProperties}
          alreadyDefinedKeys={Object.keys(props.data ?? {})}
          onSubmit={onSubmitCallback}
          formId={props.path + 'modal-form'}
        />
      </Hidden>
    );
  },
);

export default withDynamicProperties(MaterialDynamicObjectRenderer);

const DefineNewPropertyModal = (
  {isModalOpen, hideModal, dynamicProperties, alreadyDefinedKeys, onSubmit, formId}: {
    isModalOpen: boolean,
    hideModal: Function,
    dynamicProperties: DynamicProperties,
    alreadyDefinedKeys: string[],
    onSubmit: Function,
    formId: string,
  },
) => {
  const [newPropertyState, dispatch] = useReducer(reducer, initialNewPropertyState);

  const valueFieldRef = useRef();
  const {selectedDynamicProperty} = newPropertyState;
  const userIsNotSelectedAPatternType = selectedDynamicProperty.pattern === undefined;
  const {pattern, type: propertyType} = selectedDynamicProperty;

  // tslint:disable-next-line:no-shadowed-variable
  const setSelectedDynamicProperty = (selectedDynamicProperty: DynamicProperty) => {
    const {pattern, type: dataType} = selectedDynamicProperty; // tslint:disable-line:no-shadowed-variable
    const {key, value} = newPropertyState;
    const {
      value: newValue,
      valueError: newValueError,
      stringifiedValue,
    } = getValueWithError(value, dataType);

    dispatch({
      keyError: getKeyError(key, pattern, alreadyDefinedKeys),
      value: newValue,
      valueError: newValueError,
      stringifiedValue,
      selectedDynamicProperty: selectedDynamicProperty,
    });
  };

  useLayoutEffect(() => {
    if (valueFieldRef.current) { // @ts-ignore
      // Don't do this in `setSelectedDynamicProperty()`. This should happen after
      // `selectedDynamicProperty.type` change and its side effects:
      valueFieldRef.current.value = newPropertyState.stringifiedValue;
    }
  }, [selectedDynamicProperty]);

  const setPropertyKey = (key: string) => dispatch({
    key,
    keyError: getKeyError(key, selectedDynamicProperty.pattern, alreadyDefinedKeys),
  });

  const setPropertyValue = (value: any) => dispatch(
    getValueWithError(value, propertyType),
  );

  const {key: propertyName, value: propertyValue, keyError, valueError} = newPropertyState;
  return (
    <ModalWindow
      content={(
        <ModalHeader
          dynamicProperties={dynamicProperties}
          propertyName={propertyName}
          propertyValue={propertyValue}
          keyError={keyError}
          valueError={valueError}
          selectedDynamicProperty={selectedDynamicProperty}
          setSelectedDynamicProperty={setSelectedDynamicProperty}
        />
      )}
      isModalOpen={isModalOpen}
      hideModal={hideModal}
      title='Define New Property'
      textFields={[{
        label: 'Key',
        defaultValue: propertyName,
        variant: 'standard',
        autoFocus: true,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setPropertyKey(event.target.value),
        error: !!keyError,
        helperText: keyError
          ? keyError
          : pattern
            ? <Typography component='span' sx={{fontFamily: 'monospace'}}>{pattern}</Typography>
            : ' ',
      }, {
        label: 'Value',
        variant: 'standard',
        defaultValue: newPropertyState.stringifiedValue,
        disabled: propertyType === 'object',
        InputLabelProps: newPropertyState.stringifiedValue ? {shrink: true} : undefined,
        type: propertyType === 'integer' ? 'number' : propertyType,
        inputProps: {step: 'any'},
        inputRef: (node: any) => { valueFieldRef.current = node; },
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setPropertyValue(event.target.value),
        error: !!valueError,
        helperText: valueError
          ? valueError
          : propertyType
            ?
            <Typography component='span' sx={{fontFamily: 'monospace'}}>{propertyType}</Typography>
            : ' ',
      }]}
      buttons={[{
        text: 'Cancel',
      }, {
        text: 'Define',
        variant: 'contained',
        type: 'submit',
        disabled: !!keyError || !propertyName || userIsNotSelectedAPatternType,
      }]}
      onSubmit={() => {
        dispatch(initialNewPropertyState);
        return onSubmit(propertyName, propertyValue);
      }}
      formId={formId}
    />
  );
};

const ModalHeader = (
  {
    dynamicProperties,
    propertyName,
    propertyValue,
    keyError,
    valueError,
    selectedDynamicProperty,
    setSelectedDynamicProperty,
  }: {
    dynamicProperties: DynamicProperties,
    propertyName: string,
    propertyValue: any,
    selectedDynamicProperty: DynamicProperty,
    keyError: string,
    valueError: string,
    setSelectedDynamicProperty(dynamicProperty: DynamicProperty): void;
  }) => {
  const userIsNotSelectedAPatternType = selectedDynamicProperty.pattern === undefined;
  const label = userIsNotSelectedAPatternType ? 'Choose a Pattern/Type combination ...' : 'Pattern/Type';

  return (
    <>
      <FormControl fullWidth sx={{my: 2}}>
        <InputLabel error={userIsNotSelectedAPatternType} id='dynamic-property-select-helper-text'>
          {label}
        </InputLabel>
        <Select
          value={selectedDynamicProperty.pattern ?? ''}
          label={label}
          labelId='dynamic-property-select-helper-text'
          onChange={event => {
            const pattern = event.target.value;
            setSelectedDynamicProperty({
              pattern,
              ...dynamicProperties[pattern],
            });
          }}
          error={userIsNotSelectedAPatternType}
        >
          {Object.entries(dynamicProperties).map(([pattern, {type}]: [string, DynamicProperty]) => (
            <MenuItem
              key={pattern}
              value={pattern}
            >
              <Box sx={{flexGrow: 1, display: 'flex', fontFamily: 'monospace'}}>
                <Box component='span' sx={{flexGrow: 1}}>{pattern}</Box>
                <Box component='span' sx={{mr: 2}}>({type})</Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DialogContentText sx={{my: 2}}>
        <Typography component='span' dir='ltr'>Preview:&nbsp;</Typography>
        <Typography component='code' dir='ltr' sx={{fontFamily: 'Monospace'}}>
          {'{'}
          {/* Use 2 spans (`code`s) to keep overall direction LTR: */}
          <Typography
            component='code'
            dir='ltr'
            color={keyError ? 'error' : undefined}
            sx={{fontFamily: 'Monospace'}}
          >
            {`"${propertyName}"`}
          </Typography>
          {': '}
          <Typography
            component='code'
            dir='ltr'
            color={valueError ? 'error' : undefined}
            sx={{fontFamily: 'Monospace'}}
          >
            {JSON.stringify(propertyValue)}
          </Typography>
          {'}'}
        </Typography>
      </DialogContentText>
    </>
  );
};

const reducer = (state: NewPropertyState, payload: Partial<NewPropertyState>) => ({...state, ...payload});

const getKeyError = (key: string, pattern: string, alreadyDefinedKeys: string[]) =>
  alreadyDefinedKeys.includes(key)
    ? 'This key is already defined'
    : new RegExp(pattern === '*' ? '' : pattern).test(key) ? '' : 'Not matched to the pattern';

const getValueWithError = (value: any, dataType: string) => {
  const softCast = softCastMap[dataType] ?? ((x: any) => x ?? null);
  const hardCast = hardCastMap[dataType] ?? ((x: any) => x ?? null);

  const jsonizedValue = softCast(value); // to be used as `propertyValue`
  const hardCastedValue = hardCast(jsonizedValue); // just to check and validate `propertyValue`
  // to be used in "value" TextField (in a special case):
  const stringifiedValue = typeof jsonizedValue === 'string' ? jsonizedValue : JSON.stringify(jsonizedValue);

  return {
    value: jsonizedValue,
    valueError: jsonizedValue === hardCastedValue ? '' : 'Not matched to the type',
    stringifiedValue,
  };
};

const initialNewPropertyState: NewPropertyState = {
  key: '',
  value: null,
  keyError: '',
  valueError: '',
  /**
   * The value to be used in "value" TextField (in a special case)
   */
  stringifiedValue: '',
  selectedDynamicProperty: {
    pattern: undefined, // will match everything
    type: '',
    dataFieldKeys: [],
  },
};

const softCastMap: { [key: string]: (x: any) => any } = { // @ts-ignore
  number: (x: any) => isNaN(x) ? x : Number(x), // @ts-ignore
  integer: (x: any) => isNaN(x) ? x : Number(x),
  string: (x: any) => typeof x === 'string' ? x : JSON.stringify(x),
  boolean: (x: any) =>
    typeof x === 'string'
      ? ['true', 'false'].includes(x.toLowerCase())
        ? x.length === 4 // === "true".length !== "false".length 
        // @ts-ignore
        : isNaN(x) ? x : Number(x)
      : Boolean(x),
  object: (/*anything*/) => ({}),
};

const hardCastMap: { [key: string]: (x: any) => any } = {
  number: Number, // @ts-ignore
  integer: (x: any) => Number.parseInt(Number(x), 10),
  string: (x: any) => x,
  boolean: Boolean,
  object: (x: any) => x,
};

interface NewPropertyState {
  key: string;
  value: any;
  keyError: string;
  valueError: string;
  stringifiedValue: string;
  selectedDynamicProperty: DynamicProperty;
}
