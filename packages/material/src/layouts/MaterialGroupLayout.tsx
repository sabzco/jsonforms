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
import React, { useState } from 'react';
import { Box, Card, CardContent, CardHeader, Hidden, IconButton, Tooltip } from '@mui/material';
import {
  DispatchPropsOfControl,
  GroupLayout,
  isScopeOfDynamicProperty,
  LayoutProps,
  RankedTester,
  rankWith,
  uiTypeIs,
  withIncreasedRank,
} from '@jsonforms/core';
import { MaterialLayoutRenderer, MaterialLayoutRendererProps } from '../util';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Delete as DeleteIcon } from '@mui/icons-material';
import ModalWindow from '../util/ModalWindow';

export const groupTester: RankedTester = rankWith(1, uiTypeIs('Group'));
const style: { [x: string]: any } = { marginBottom: '10px' };

const GroupComponent = React.memo(({visible, enabled, uischema, ...props}:
                                     MaterialLayoutRendererProps & DispatchPropsOfControl) => {
  const groupLayout = uischema as GroupLayout;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Hidden xsUp={!visible}>
      <Card style={style}>
        <CardHeader
          title={(
            <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
              <>{groupLayout.label ?? ''}</>
              {'scope' in groupLayout && isScopeOfDynamicProperty(groupLayout.scope) && (
                <Tooltip title='Remove this object'>
                  <IconButton aria-label='Delete' onClick={() => setDeleteModalOpen(true)} size='large'>
                    <DeleteIcon/>
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        />
        <CardContent>
          <MaterialLayoutRenderer {...props} visible={visible} enabled={enabled} elements={groupLayout.elements}/>
        </CardContent>
      </Card>

      <ModalWindow
        content={`Remove ${groupLayout.label ?? 'this'} object? This action can't be undone!`}
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
    </Hidden>
  );
});

export const MaterializedGroupLayoutRenderer = (
  {uischema, schema, path, visible, enabled, renderers, cells, direction, removeThisProperty }:
    LayoutProps & DispatchPropsOfControl
) => {
  const groupLayout = uischema as GroupLayout;

  return (
    <GroupComponent
      elements={groupLayout.elements}
      schema={schema}
      path={path}
      direction={direction}
      visible={visible}
      enabled={enabled}
      uischema={uischema}
      renderers={renderers}
      cells={cells}
      handleChange={() => undefined} // This doesn't apply to objects
      removeThisProperty={removeThisProperty}
    />
  );
};

export default withJsonFormsLayoutProps(MaterializedGroupLayoutRenderer);

export const materialGroupTester: RankedTester = withIncreasedRank(
  1,
  groupTester
);
