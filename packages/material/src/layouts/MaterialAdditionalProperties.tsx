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
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Divider, Grid, Hidden, Tooltip, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { MaterialLayoutRenderer } from '../util';
import { useTheme } from '@mui/material/styles';
import ModalWindow from '../util/ModalWindow';
import type {
  DispatchPropsOfDynamicLayout,
  DynamicLayoutProps,
  GroupLayout,
  JsonSchema,
} from '@jsonforms/core';
import { deriveTypes, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { withAdditionalProperties } from '@jsonforms/react';

export const materialAdditionalPropertiesTester: RankedTester = rankWith(
  1,
  uiTypeIs('DynamicGroup'),
);

export const MaterialAdditionalPropertiesRenderer = React.memo(
  (props: DynamicLayoutProps & DispatchPropsOfDynamicLayout) => {
    const theme = useTheme();
    const {visible, enabled, uischema, ...otherProps} = props;
    const groupLayout = uischema;
    const [isModalOpen, setModalOpen] = useState(false);
    // tslint:disable-next-line:no-empty
    const [onSubmitCallback, setOnSubmitCallback] = useState(() => () => {});
    const [newPropertyType, setNewPropertyType] = useState();

    const showNewPropertyModal = useCallback((propertyType, onSubmit) => {
      setNewPropertyType(propertyType);
      setModalOpen(true);
      setOnSubmitCallback(() => onSubmit);
    }, []);

    const hideNewPropertyModal = useCallback(() => {
      setModalOpen(false);
    }, []);

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
                  onClick={() =>
                    showNewPropertyModal(
                      deriveTypes(props.schema.additionalProperties as JsonSchema)[0],
                      (key: string, value: any) => {
                        if (!key) { return; }
                        props.addNewProperty(props.path, key, value);
                      },
                    )
                  }
                >
                  <Typography>Additional Properties</Typography>&nbsp;
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
          hideModal={hideNewPropertyModal}
          dataType={newPropertyType}
          onSubmit={onSubmitCallback}
          formId={props.path + 'modal-form'}
        />
      </Hidden>
    );
  },
);

export default withAdditionalProperties(MaterialAdditionalPropertiesRenderer);

const typeCastMap: { [key: string]: Function } = {
  number: Number,
  integer: Number,
  string: String,
  boolean: Boolean,
};

const DefineNewPropertyModal = (
  {isModalOpen, hideModal, dataType = 'string', onSubmit, formId}: {
    isModalOpen: boolean,
    hideModal: Function,
    dataType: string,
    onSubmit: Function,
    formId: string,
  },
) => {
  const cast = typeCastMap[dataType] ?? ((x: any) => x ?? null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyValue, setPropertyValue] = useState(cast());
  /**
   * A double-quotation (to quote `string` values) or nothing (don't quote other types)
   */
  const q = dataType === 'string' ? '"' : '';

  useEffect(() => {
    let castedValue = cast(propertyValue);
    // Check if castedValue === NaN (see: https://stackoverflow.com/users/95733/commonpike):
    if (typeof castedValue === 'number' && isNaN(castedValue)) {
      castedValue = 0;
    }

    if (propertyValue !== castedValue) {
      setPropertyValue(castedValue);
    }
  }, [dataType]);

  return (
    <ModalWindow
      // @ts-ignore
      content={(
        <Typography dir='ltr' component='code' style={{fontFamily: 'Monospace'}}>
          <span dir='ltr'>{`{"${propertyName}": `}</span> {/* Use 2 `span`s to keep */}
          <span dir='ltr'>{`${q}${propertyValue}${q}}`}</span> {/* overall direction LTR */}
        </Typography>
      )}
      isModalOpen={isModalOpen}
      hideModal={hideModal}
      // @ts-ignore
      title={<>Define New Property (<code>{dataType}</code>)</>}
      textFields={[{
        label: 'Key',
        defaultValue: propertyName,
        variant: 'standard',
        autoFocus: true,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          setPropertyName(event.target.value),
      }, {
        label: 'Value',
        defaultValue: propertyValue,
        variant: 'standard',
        type: dataType === 'integer' ? 'number' : dataType,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          setPropertyValue(cast(event.target.value)),
      }]}
      buttons={[{
        text: 'Cancel',
      }, {
        text: 'Define',
        variant: 'contained',
        type: 'submit',
        // onClick: () => onSubmit(propertyName, propertyValue),
      }]}
      onSubmit={() => {onSubmit(propertyName, propertyValue); }}
      formId={formId}
    />
  );
};
