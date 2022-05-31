import merge from 'lodash/merge';
import get from 'lodash/get';
import React, { ComponentType, Dispatch, ReducerAction, useCallback, useEffect, useMemo, useState } from 'react';
import { JsonFormsDispatch, JsonFormsStateContext, withJsonFormsContext } from '@jsonforms/react';
import {
  composePaths,
  ControlElement,
  createId,
  EMPTY_PATH,
  getFirstPrimitiveProp,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  moveDown,
  moveUp,
  removeId,
  Resolve,
  stringifyPath,
  update,
} from '@jsonforms/core';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Grid, IconButton, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

const iconStyle: any = { float: 'right' };

interface OwnPropsOfExpandPanel {
  index: number;
  path: string[];
  uischema: ControlElement;
  schema: JsonSchema;
  expanded: boolean;
  renderers?: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  rootSchema: JsonSchema;
  enableMoveUp: boolean;
  enableMoveDown: boolean;
  config: any;
  childLabelProp?: string;
  handleExpansion(panel: string[]): (event: any, expanded: boolean) => void;
}

interface StatePropsOfExpandPanel extends OwnPropsOfExpandPanel {
  childLabel: string;
  childPath: string[];
  enableMoveUp: boolean;
  enableMoveDown: boolean;
}

/**
 * Dispatch props of a table control
 */
export interface DispatchPropsOfExpandPanel {
  removeItems(path: string[], toDelete: number[]): (event: any) => void;
  moveUp(path: string[], toMove: number): (event: any) => void;
  moveDown(path: string[], toMove: number): (event: any) => void;
}

export interface ExpandPanelProps
  extends StatePropsOfExpandPanel,
    DispatchPropsOfExpandPanel {}

const ExpandPanelRendererComponent = (props: ExpandPanelProps) => {
  const [labelHtmlId] = useState<string>(createId('expand-panel'));

  useEffect(() => {
    return () => {
      removeId(labelHtmlId);
    };
  }, [labelHtmlId]);

  const {
    childLabel,
    childPath,
    index,
    expanded,
    moveDown,
    moveUp,
    enableMoveDown,
    enableMoveUp,
    handleExpansion,
    removeItems,
    path,
    rootSchema,
    uischema,
    renderers,
    cells,
    config
  } = props;

  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  return (
    <Accordion
      aria-labelledby={labelHtmlId}
      expanded={expanded}
      onChange={handleExpansion(childPath)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems={'center'}>
          <Grid item xs={7} md={9}>
            <Stack direction='row' spacing={2} sx={{alignItems: 'baseline'}}>
              <Avatar aria-label='Index'>{index + 1}</Avatar>
              <span id={labelHtmlId}>{childLabel}</span>
            </Stack>
          </Grid>
          <Grid item xs={5} md={3}>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Stack direction='row'>
                  {appliedUiSchemaOptions.showSortButtons && (
                    <>
                      <IconButton
                        onClick={moveUp(path, index)}
                        style={iconStyle}
                        disabled={!enableMoveUp}
                        aria-label={`Move up`}
                        size='small'
                      >
                        <ArrowUpward />
                      </IconButton>
                      <IconButton
                        onClick={moveDown(path, index)}
                        style={iconStyle}
                        disabled={!enableMoveDown}
                        aria-label={`Move down`}
                        size='small'
                      >
                        <ArrowDownward />
                      </IconButton>
                    </>
                  )}
                  <IconButton
                    onClick={removeItems(path, [index])}
                    style={iconStyle}
                    aria-label={`Delete`}
                    size='large'
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <JsonFormsDispatch
          schema={rootSchema}
          uischema={uischema}
          path={EMPTY_PATH}
          key={stringifyPath(childPath)}
          renderers={renderers}
          cells={cells}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const ExpandPanelRenderer = React.memo(ExpandPanelRendererComponent);

/**
 * Maps state to dispatch properties of an expand pandel control.
 *
 * @param dispatch the store's dispatch method
 * @returns {DispatchPropsOfArrayControl} dispatch props of an expand panel control
 */
export const ctxDispatchToExpandPanelProps: (
  dispatch: Dispatch<ReducerAction<any>>
) => DispatchPropsOfExpandPanel = dispatch => ({
  removeItems: useCallback((path: string[], toDelete: number[]) => (event: any): void => {
    event.stopPropagation();
    dispatch(
      update(path, array => {
        toDelete
          .sort()
          .reverse()
          .forEach(s => array.splice(s, 1));
        return array;
      })
    );
  }, [dispatch]),
  moveUp: useCallback((path: string[], toMove: number) => (event: any): void => {
    event.stopPropagation();
    dispatch(
      update(path, array => {
        moveUp(array, toMove);
        return array;
      })
    );
  }, [dispatch]),
  moveDown: useCallback((path: string[], toMove: number) => (event: any): void => {
    event.stopPropagation();
    dispatch(
      update(path, array => {
        moveDown(array, toMove);
        return array;
      })
    );
  }, [dispatch])
});

/**
 * Map state to control props.
 * @param state the JSON Forms state
 * @param ownProps any own props
 * @returns {StatePropsOfControl} state props for a control
 */
export const withContextToExpandPanelProps = (
  Component: ComponentType<ExpandPanelProps>
): ComponentType<OwnPropsOfExpandPanel> => ({
  ctx,
  props
}: JsonFormsStateContext & ExpandPanelProps) => {
  const dispatchProps = ctxDispatchToExpandPanelProps(ctx.dispatch);
  const { childLabelProp, schema, path, index, uischemas } = props;
  const childPath = useMemo(() => composePaths(path, String(index)), [path, index]);
  const childData = useMemo(() => Resolve.data(ctx.core.data, childPath), [ctx.core.data, childPath]);
  const childLabel = childLabelProp
    ? get(childData, childLabelProp, '')
    : get(childData, getFirstPrimitiveProp(schema), '');

  const uischema = useMemo(() => ({
    ...props.uischema,
    type: 'VerticalLayout',
    dataFieldKeys: (props.uischema.dataFieldKeys ?? []).concat(index),
  }), [props.uischema, index]);

  return (
    <Component
      {...props}
      {...dispatchProps}
      uischema={uischema}
      childLabel={childLabel}
      childPath={childPath}
      uischemas={uischemas}
    />
  );
};

export const withJsonFormsExpandPanelProps = (
  Component: ComponentType<ExpandPanelProps>
): ComponentType<OwnPropsOfExpandPanel> =>
  withJsonFormsContext(withContextToExpandPanelProps(Component));

export default withJsonFormsExpandPanelProps(ExpandPanelRenderer);
