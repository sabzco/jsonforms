import { RankedTester } from '../../core/testers';
import { Control, ControlProps, ControlState } from './Control';
/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export declare const textControlTester: RankedTester;
export declare class TextControl extends Control<ControlProps, ControlState> {
    render(): any;
}
declare const _default: any;
export default _default;