import { JSX } from '../JSX';
import * as _ from 'lodash';
import { and, RankedTester, rankWith, schemaTypeIs, uiTypeIs } from '../../core/testers';
import { connect } from 'inferno-redux';
import { Control, ControlProps } from './Control';
import {
  formatErrorMessage,
  mapStateToControlProps,
  registerStartupRenderer
} from '../renderer.util';

/**
 * Default tester for number controls.
 * @type {RankedTester}
 */
export const numberControlTester: RankedTester = rankWith(2, and(
    uiTypeIs('Control'),
    schemaTypeIs('number')
  ));

export class NumberControl extends Control<ControlProps, void> {

  render() {
    const { data, classNames, id, visible, enabled, errors, label } = this.props;
    const isValid = errors.length === 0;
    const divClassNames = 'validation' + (isValid ? '' : ' validation_error');

    return (
      <div className={classNames.wrapper}>
        <label for={id} className={classNames.label} data-error={errors}>
          {label}
        </label>
        <input type='number'
               step='0.1'
               value={data}
               onInput={ev => this.updateData(_.toNumber(ev.target.value))}
               className={classNames.input}
               id={id}
               hidden={!visible}
               disabled={!enabled}
        />
        <div className={divClassNames}>
          {!isValid ? formatErrorMessage(errors) : ''}
        </div>
      </div>
    );
  }
}

export default registerStartupRenderer(
  numberControlTester,
  connect(mapStateToControlProps)(NumberControl)
);