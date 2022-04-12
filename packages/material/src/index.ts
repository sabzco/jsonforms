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
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry
} from '@jsonforms/core';
import {
  materialAllOfControlTester,
  MaterialAllOfRenderer,
  materialAnyOfControlTester,
  MaterialAnyOfRenderer,
  MaterialArrayControlRenderer,
  materialArrayControlTester,
  MaterialEnumArrayRenderer,
  materialEnumArrayRendererTester,
  materialObjectControlTester,
  MaterialObjectRenderer,
  materialOneOfControlTester,
  MaterialOneOfRenderer,
} from './complex';
import {
  MaterialLabelRenderer,
  materialLabelRendererTester,
  MaterialListWithDetailRenderer,
  materialListWithDetailTester
} from './additional';
import {
  MaterialAnyOfStringOrEnumControl,
  materialAnyOfStringOrEnumControlTester,
  MaterialBooleanControl,
  materialBooleanControlTester,
  MaterialBooleanToggleControl,
  materialBooleanToggleControlTester,
  MaterialDateControl,
  materialDateControlTester,
  MaterialDateTimeControl,
  materialDateTimeControlTester,
  MaterialEnumControl,
  materialEnumControlTester,
  MaterialIntegerControl,
  materialIntegerControlTester,
  MaterialNativeControl,
  materialNativeControlTester,
  MaterialNumberControl,
  materialNumberControlTester,
  MaterialOneOfEnumControl,
  materialOneOfEnumControlTester,
  MaterialOneOfRadioGroupControl,
  materialOneOfRadioGroupControlTester,
  MaterialRadioGroupControl,
  materialRadioGroupControlTester,
  MaterialSliderControl,
  materialSliderControlTester,
  MaterialTextControl,
  materialTextControlTester,
  MaterialTimeControl,
  materialTimeControlTester,
} from './controls';
import {
  MaterialArrayLayout,
  materialArrayLayoutTester,
  MaterialCategorizationLayout,
  materialCategorizationTester,
  MaterialDynamicGroup,
  materialDynamicGroupTester,
  MaterialGroupLayout,
  materialGroupTester,
  MaterialHorizontalLayout,
  materialHorizontalLayoutTester,
  MaterialVerticalLayout,
  materialVerticalLayoutTester,
} from './layouts';
import {
  MaterialBooleanCell,
  materialBooleanCellTester,
  MaterialBooleanToggleCell,
  materialBooleanToggleCellTester,
  MaterialDateCell,
  materialDateCellTester,
  MaterialEnumCell,
  materialEnumCellTester,
  MaterialIntegerCell,
  materialIntegerCellTester,
  MaterialNumberCell,
  materialNumberCellTester,
  MaterialNumberFormatCell,
  materialNumberFormatCellTester,
  MaterialOneOfEnumCell,
  materialOneOfEnumCellTester,
  MaterialTextCell,
  materialTextCellTester,
  MaterialTimeCell,
  materialTimeCellTester
} from './cells';
import MaterialCategorizationStepperLayout, {
  materialCategorizationStepperTester
} from './layouts/MaterialCategorizationStepperLayout';

export * from './complex';
export * from './controls';
export * from './layouts';
export * from './cells';
export * from './mui-controls';
export * from './util';

export const materialRenderers: JsonFormsRendererRegistryEntry[] = [
  // controls
  {
    tester: materialArrayControlTester,
    renderer: MaterialArrayControlRenderer,
    name: 'Array',
  },
  {
    tester: materialBooleanControlTester,
    renderer: MaterialBooleanControl,
    name: 'Boolean',
  },
  {
    tester: materialBooleanToggleControlTester,
    renderer: MaterialBooleanToggleControl,
    name: 'BooleanToggle',
  },
  {
    tester: materialNativeControlTester,
    renderer: MaterialNativeControl,
    name: 'Native',
  },
  {
    tester: materialEnumControlTester,
    renderer: MaterialEnumControl,
    name: 'Enum',
  },
  {
    tester: materialIntegerControlTester,
    renderer: MaterialIntegerControl,
    name: 'Integer',
  },
  {
    tester: materialNumberControlTester,
    renderer: MaterialNumberControl,
    name: 'Number',
  },
  {
    tester: materialTextControlTester,
    renderer: MaterialTextControl,
    name: 'Text',
  },
  {
    tester: materialDateTimeControlTester,
    renderer: MaterialDateTimeControl,
    name: 'DateTime',
  },
  {
    tester: materialDateControlTester,
    renderer: MaterialDateControl,
    name: 'Date',
  },
  {
    tester: materialTimeControlTester,
    renderer: MaterialTimeControl,
    name: 'Time',
  },
  {
    tester: materialSliderControlTester,
    renderer: MaterialSliderControl,
    name: 'Slider',
  },
  {
    tester: materialObjectControlTester,
    renderer: MaterialObjectRenderer,
    name: 'Object',
  },
  {
    tester: materialAllOfControlTester,
    renderer: MaterialAllOfRenderer,
    name: 'AllOf',
  },
  {
    tester: materialAnyOfControlTester,
    renderer: MaterialAnyOfRenderer,
    name: 'AnyOf',
  },
  {
    tester: materialOneOfControlTester,
    renderer: MaterialOneOfRenderer,
    name: 'OneOf',
  },
  {
    tester: materialRadioGroupControlTester,
    renderer: MaterialRadioGroupControl,
    name: 'RadioGroup',
  },
  {
    tester: materialOneOfRadioGroupControlTester,
    renderer: MaterialOneOfRadioGroupControl,
    name: 'OneOfRadioGroup',
  },
  {
    tester: materialOneOfEnumControlTester,
    renderer: MaterialOneOfEnumControl,
    name: 'OneOfEnum',
  },
  // layouts
  {
    tester: materialGroupTester,
    renderer: MaterialGroupLayout,
    name: 'GroupLayout',
  },
  {
    tester: materialHorizontalLayoutTester,
    renderer: MaterialHorizontalLayout,
    name: 'HorizontalLayout',
  },
  {
    tester: materialVerticalLayoutTester,
    renderer: MaterialVerticalLayout,
    name: 'VerticalLayout',
  },
  {
    tester: materialCategorizationTester,
    renderer: MaterialCategorizationLayout,
    name: 'CategorizationLayout',
  },
  {
    tester: materialCategorizationStepperTester,
    renderer: MaterialCategorizationStepperLayout,
    name: 'CategorizationStepperLayout',
  },
  {
    tester: materialArrayLayoutTester,
    renderer: MaterialArrayLayout,
    name: 'ArrayLayout',
  },
  // additional
  {
    tester: materialLabelRendererTester,
    renderer: MaterialLabelRenderer,
    name: 'Label',
  },
  {
    tester: materialListWithDetailTester,
    renderer: MaterialListWithDetailRenderer,
    name: 'ListWithDetail',
  },
  {
    tester: materialAnyOfStringOrEnumControlTester,
    renderer: MaterialAnyOfStringOrEnumControl,
    name: 'AnyOfStringOrEnum',
  },
  {
    tester: materialEnumArrayRendererTester,
    renderer: MaterialEnumArrayRenderer,
    name: 'EnumArray',
  },
  {
    tester: materialDynamicGroupTester,
    renderer: MaterialDynamicGroup,
    name: 'DynamicGroup',
  },
];

export const materialCells: JsonFormsCellRendererRegistryEntry[] = [
  { tester: materialBooleanCellTester, cell: MaterialBooleanCell },
  { tester: materialBooleanToggleCellTester, cell: MaterialBooleanToggleCell },
  { tester: materialDateCellTester, cell: MaterialDateCell },
  { tester: materialEnumCellTester, cell: MaterialEnumCell },
  { tester: materialIntegerCellTester, cell: MaterialIntegerCell },
  { tester: materialNumberCellTester, cell: MaterialNumberCell },
  { tester: materialNumberFormatCellTester, cell: MaterialNumberFormatCell },
  { tester: materialOneOfEnumCellTester, cell: MaterialOneOfEnumCell },
  { tester: materialTextCellTester, cell: MaterialTextCell },
  { tester: materialTimeCellTester, cell: MaterialTimeCell }
];
