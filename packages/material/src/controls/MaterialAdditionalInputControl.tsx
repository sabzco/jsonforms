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
import React from 'react';
import { MuiInputInteger, MuiInputNumber, MuiInputText } from '../mui-controls';
import { withDynamicControlProps } from '@jsonforms/react';
import { Grid, IconButton, Tooltip } from '@mui/material';
import { MaterialInputControl } from './index';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { DynamicControlProps, RankedTester } from '@jsonforms/core';
import {
  and,
  deriveTypes,
  isIntegerControl,
  isNumberControl,
  isStringControl,
  or,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';

const typeToControlMap: { [key: string]: any } = {
  number: MuiInputNumber,
  integer: MuiInputInteger,
  string: MuiInputText,
};

export const MaterialAdditionalInputControl = React.memo((props: DynamicControlProps) => (
  <Grid container direction='row' wrap='nowrap'>
    <Grid item xs>
      <MaterialInputControl {...props} input={typeToControlMap[deriveTypes(props.schema)[0]]}/>
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
));

export const materialAdditionalInputControlTester: RankedTester = rankWith(
  4,
  and(
    scopeEndsWith('additionalProperties'),
    or(isNumberControl, isIntegerControl, isStringControl),
  )
);

export default withDynamicControlProps(MaterialAdditionalInputControl);
