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
import React, { useCallback, useReducer, useState } from 'react';
import {
  Box,
  Button,
  DialogContentText,
  Divider,
  FormControl,
  Grid,
  Hidden,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
    const theme = useTheme();
    const {visible, enabled, uischema, ...otherProps} = props;
    const groupLayout = uischema;
    const [isModalOpen, setModalOpen] = useState(false);

    const onSubmitCallback = useCallback((key: string, value: any) => {
      if (!key) { return; }
      props.addNewProperty(props.path, key, value);
    }, [props.addNewProperty, props.path]);

    return (
      <Hidden xsUp={!visible}>
        <Grid container>
          <Grid
            container
            direction='row'
            alignItems='center'
            wrap='nowrap'
            item
            xs={12}
          >
            <Grid item xs style={{marginRight: theme.spacing(1)}}>
              <Divider/>
            </Grid>
            <Grid item>
              <Tooltip title={`Add to ${groupLayout.label ?? 'Root-Object'}`} placement='bottom'>
                <Button
                  style={{
                    textTransform: 'none',
                    padding: theme.spacing(1),
                    color: theme.palette.text.secondary,
                  }}
                  aria-label={`Add to ${groupLayout.label ?? 'Root-Object'}`}
                  onClick={() => setModalOpen(true)}
                >
                  <Typography>Define a Property</Typography>&nbsp;
                  <AddIcon/>
                </Button>
              </Tooltip>
            </Grid>
            <Grid item xs style={{marginLeft: theme.spacing(1)}}>
              <Divider/>
            </Grid>
          </Grid>

          <MaterialLayoutRenderer
            {...otherProps}
            visible={visible}
            enabled={enabled}
            elements={groupLayout.elements}
          />
        </Grid>

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

  const {selectedDynamicProperty} = newPropertyState;
  const userIsNotSelectedAPatternType = selectedDynamicProperty.pattern === undefined;
  const {pattern, type: dataType} = selectedDynamicProperty;

  // tslint:disable-next-line:no-shadowed-variable
  const setSelectedDynamicProperty = (selectedDynamicProperty: DynamicProperty) => {
    const {pattern, type: dataType} = selectedDynamicProperty; // tslint:disable-line:no-shadowed-variable
    const {key, value} = newPropertyState;
    dispatch({
      keyError: getKeyError(key, pattern, alreadyDefinedKeys),
      ...getValueWithError(value ?? '', dataType),
      selectedDynamicProperty: selectedDynamicProperty,
    });
  };

  const setPropertyKey = (key: string) => dispatch({
    key,
    keyError: getKeyError(key, selectedDynamicProperty.pattern, alreadyDefinedKeys),
  });

  const setPropertyValue = (value: any) => dispatch(
    getValueWithError(value, dataType),
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
        defaultValue: propertyValue,
        variant: 'standard',
        type: dataType === 'integer' ? 'number' : dataType,
        inputProps: {step: 'any'},
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setPropertyValue(event.target.value),
        error: !!valueError,
        helperText: valueError
          ? valueError
          : dataType
            ? <Typography component='span' sx={{fontFamily: 'monospace'}}>{dataType}</Typography>
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
  /**
   * A double-quotation (to quote `string` values) or nothing (don't quote other types)
   */
  const q = selectedDynamicProperty.type === 'string' ? '"' : '';
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
            {`${q}${propertyValue}${q}`}
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
  const cast = typeCastMap[dataType] ?? ((x: any) => x ?? null);
  const castedValue = cast(value);
  return {
    value,
    valueError: castedValue == value ? '' : 'Not matched to the type', // tslint:disable-line:triple-equals
  };
};

const initialNewPropertyState: NewPropertyState = {
  key: '',
  value: null,
  keyError: '',
  valueError: '',
  selectedDynamicProperty: {
    pattern: undefined, // will match everything
    type: '',
    dataFieldKeys: [],
  },
};

const typeCastMap: { [key: string]: Function } = {
  number: Number, // @ts-ignore
  integer: (x: any) => Number.parseInt(Number(x), 10),
  string: String,
  boolean: Boolean,
};

interface NewPropertyState {
  key: string;
  value: any;
  keyError: string;
  valueError: string;
  selectedDynamicProperty: DynamicProperty;
}
