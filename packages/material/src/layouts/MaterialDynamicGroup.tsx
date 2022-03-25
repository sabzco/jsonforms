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
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { MaterialLayoutRenderer } from '../util';
import ModalWindow from '../util/ModalWindow';
import type {
  DispatchPropsOfDynamicLayout,
  DynamicLayoutProps,
  DynamicProperties,
  DynamicProperty,
} from '@jsonforms/core';
import {
  EMPTY_PATH,
  isDynamicControl,
  isScopeOfDynamicProperty,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withDynamicProperties } from '@jsonforms/react';

export const materialDynamicGroupTester: RankedTester = rankWith(
  2.5, // more than `isObjectControl` and lower than `isOneOfControl`, `isAllOfControl`, ...
  isDynamicControl,
);

export const MaterialDynamicObjectRenderer = React.memo(
  (props: DynamicLayoutProps & DispatchPropsOfDynamicLayout) => {
    const {visible, enabled, schema, uischema, label, ...otherProps} = props;
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const onSubmitCallback = useCallback((key: string, value: any) => {
      if (!key) { return; }
      props.addNewProperty(props.path, key, value);
    }, [props.addNewProperty, props.path]);

    const elements = props.elements;
    const dynamicElements = props.dynamicElements;

    const isDynamicProperty = uischema.scope && isScopeOfDynamicProperty(uischema.scope);

    const header = (
      <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
        <>{label ?? ''}</>
        {isDynamicProperty && (
          <Tooltip title='Remove this object'>
            <IconButton
              aria-label='Delete'
              onClick={() => setDeleteModalOpen(true)}
              size='large'
            >
              <DeleteIcon/>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );

    const body = (
      <Stack>
        <MaterialLayoutRenderer
          {...otherProps}
          direction={props.direction}
          visible={visible}
          enabled={enabled}
          path={EMPTY_PATH}
          elements={elements}
        />

        {!!Object.keys(props.dynamicProperties).length && (
          <>
            <Divider>
              <Tooltip
                title={`Add to ${label ?? 'Root-Object'}`}
                placement='bottom'
              >
                <Button
                  sx={{textTransform: 'none'}}
                  aria-label={`Add to ${label ?? 'Root-Object'}`}
                  onClick={() => setModalOpen(true)}
                  startIcon={<AddIcon/>}
                >
                  Define a Property
                </Button>
              </Tooltip>
            </Divider>

            <MaterialLayoutRenderer
              {...otherProps}
              direction={props.direction}
              visible={visible}
              enabled={enabled}
              path={EMPTY_PATH}
              elements={dynamicElements}
            />

            <DefineNewPropertyModal
              isModalOpen={isModalOpen}
              hideModal={() => setModalOpen(false)}
              dynamicProperties={props.dynamicProperties}
              alreadyDefinedKeys={Object.keys(props.data ?? {})}
              onSubmit={onSubmitCallback}
              formId={props.path + 'modal-form'}
            />
          </>
        )}
      </Stack>
    );

    const defineNewPropertyModal = (
      <ModalWindow
        dir='ltr'
        content={`Remove ${label ?? 'this'} object? This action can't be undone!`}
        isModalOpen={isDeleteModalOpen}
        hideModal={() => setDeleteModalOpen(false)}
        buttons={[{
          text: 'Cancel',
        }, {
          text: 'Remove',
          variant: 'contained',
          type: 'submit',
        }]}
        onSubmit={() => props.removeThisProperty(props.path)}
      />
    );

    const rootSx = {display: visible ? 'block' : 'none'};

    return (
      uischema.options?.border || (
        uischema.options?.border !== false && (
          uischema.type === 'Group' ||
          (uischema.type === 'Control' && schema.type === 'object')
        )
      )
    )
      ? ( // render in a Card:
        <Card sx={{...rootSx, mb: 1}}>
          {(label || isDynamicProperty) && <CardHeader title={header}/>}
          <CardContent>{body}</CardContent>
          {isDynamicProperty && defineNewPropertyModal}
        </Card>
      )
      : ( // simple render:
        <Stack sx={rootSx}>
          {(label || isDynamicProperty) && <Typography variant='h5'>{header}</Typography>}
          {body}
          {isDynamicProperty && defineNewPropertyModal}
        </Stack>
      );
  },
);

export default withDynamicProperties(MaterialDynamicObjectRenderer);

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
const initializer = ({alreadyDefinedKeys, dynamicProperties}: {
  alreadyDefinedKeys: string[],
  dynamicProperties: DynamicProperties,
}): NewPropertyState => {
  const keys = Object.keys(dynamicProperties); // always is > 0

  if (keys.length > 1) {
    return initialNewPropertyState;
  }
  // (keys.length === 1):
  const selectedDynamicProperty: DynamicProperty = {pattern: keys[0], ...dynamicProperties[keys[0]]};
  return {
    key: '',
    keyError: getKeyError('', selectedDynamicProperty.pattern, alreadyDefinedKeys),
    ...getValueWithError('', selectedDynamicProperty.type),
    selectedDynamicProperty,
  };
};

const reducer = (
  state: NewPropertyState,
  payload: Partial<NewPropertyState> | ((state: NewPropertyState) => Partial<NewPropertyState>),
) => ({
  ...state,
  ...(typeof payload === 'function' ? payload(state) : payload),
});

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
  const [newPropertyState, dispatch] = useReducer(
    reducer,
    {alreadyDefinedKeys, dynamicProperties},
    initializer,
  );

  const valueFieldRef = useRef();
  const {selectedDynamicProperty} = newPropertyState;
  const userIsNotSelectedAPatternType = selectedDynamicProperty.pattern === undefined;
  const {type: propertyType} = selectedDynamicProperty;

  // tslint:disable-next-line:no-shadowed-variable
  const setSelectedDynamicProperty = useCallback((selectedDynamicProperty: DynamicProperty) => {
    dispatch((state: NewPropertyState) => {
      const {pattern, type: dataType} = selectedDynamicProperty; // tslint:disable-line:no-shadowed-variable
      const {key, value} = state;
      return ({
        keyError: getKeyError(key, pattern, alreadyDefinedKeys),
        ...getValueWithError(value, dataType),
        selectedDynamicProperty,
      });
    });
  }, [alreadyDefinedKeys]);

  useLayoutEffect(() => {
    if (valueFieldRef.current) { // @ts-ignore
      // Don't do this in `setSelectedDynamicProperty()`. This should happen after
      // `selectedDynamicProperty.type` change and its side effects:
      valueFieldRef.current.value = newPropertyState.stringifiedValue;
    }
  }, [selectedDynamicProperty]);

  const setPropertyKey = useCallback((key: string) => dispatch((state: NewPropertyState) => ({
    key,
    keyError: getKeyError(key, state.selectedDynamicProperty.pattern, alreadyDefinedKeys),
  })), []);

  const setPropertyValue = useCallback((value: any) => dispatch((state: NewPropertyState) =>
    getValueWithError(value, state.selectedDynamicProperty.type),
  ), []);

  const {key: propertyName, value: propertyValue, keyError, valueError} = newPropertyState;
  return (
    <ModalWindow
      dir='ltr'
      content={(
        <ModalHeader
          dynamicProperties={dynamicProperties}
          keyError={keyError}
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
        helperText: keyError || (selectedDynamicProperty.label ?? selectedDynamicProperty.title) || ' ',
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
        helperText: valueError || (propertyType
            ?
            <Typography component='span' sx={{fontFamily: 'monospace'}}>{propertyType}</Typography>
            : ' '
        ),
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
        dispatch(initializer({alreadyDefinedKeys, dynamicProperties}));
        return onSubmit(propertyName, propertyValue);
      }}
      formId={formId}
    />
  );
};

const ModalHeader = (
  {
    dynamicProperties,
    keyError,
    selectedDynamicProperty,
    setSelectedDynamicProperty,
  }: {
    dynamicProperties: DynamicProperties,
    keyError: string,
    selectedDynamicProperty: DynamicProperty,
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
          {Object.entries(dynamicProperties).map(([pattern, schema]: [string, DynamicProperty]) => {
            const labelOrTitle = schema.label ?? schema.title;
            return (
              <MenuItem
                key={pattern}
                value={pattern}
              >
                <Box sx={{flexGrow: 1, display: 'flex'}}>
                  <Box
                    component='span'
                    sx={{flexGrow: 1, fontFamily: labelOrTitle ? undefined : 'monospace'}}
                  >
                    {labelOrTitle ?? pattern}
                  </Box>
                  <Box component='span' sx={{mr: 2, fontFamily: 'monospace'}}>({schema.type})</Box>
                </Box>
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText error={!!keyError}>
          <Typography
            component='span'
            sx={{fontFamily: 'monospace'}}
          >
            {selectedDynamicProperty.pattern}
          </Typography>
        </FormHelperText>
      </FormControl>
    </>
  );
};

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
