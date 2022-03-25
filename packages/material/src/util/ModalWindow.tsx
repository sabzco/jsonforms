import type { InputBaseProps, InputLabelProps, PropTypes, SxProps } from '@mui/material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React from 'react';
import type { BaseTextFieldProps } from '@mui/material/TextField/TextField';

const ModalWindow = (
  {
    dir,
    isModalOpen,
    hideModal,
    title = '',
    content = '',
    buttons = [],
    textFields = [],
    onClickOutside = () => {}, // tslint:disable-line:no-empty
    autoHideOnLostFocus = true,
    onSubmit = () => {}, // tslint:disable-line:no-empty
    formId = 'global-modal-form',
    dontRefreshOnSubmit = true,
  }: {
    dir?: 'ltr' | 'rtl' | 'auto'
    isModalOpen: boolean,
    hideModal: Function,
    title?: string,
    content?: React.ReactNode,
    buttons?: Partial<ButtonOptions>[],
    textFields?: Partial<TextFieldOptions>[],
    onClickOutside?: Function,
    autoHideOnLostFocus?: boolean,
    onSubmit?: React.FormEventHandler<HTMLFormElement>,
    formId?: string,
    dontRefreshOnSubmit?: boolean,
  },
) => (
  <Dialog
    dir={dir}
    onClose={(...args) => {
      onClickOutside(...args);
      if (autoHideOnLostFocus) { hideModal(); }
    }}
    open={isModalOpen}
  >
    <form
      id={formId}
      onSubmit={(event, ...rest) => {
        if (dontRefreshOnSubmit) {
          event.preventDefault();
        }
        return onSubmit(event, ...rest);
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {content}
        {textFields.map((textField, i) => {
            if (!textField) {
              return;
            }
            const textFieldSpec = new TextFieldOptions(textField);
            const {sx} = textFieldSpec;
            return (
              <TextField
                key={i}
                {...textFieldSpec}
                // https://mui.com/system/the-sx-prop/#passing-sx-prop
                sx={[{mx: 1, mb: 1}, ...(Array.isArray(sx) ? sx : [sx])]}
              />
            );
          },
        )}
      </DialogContent>

      <DialogActions>
        {buttons.map((button, i) => {
            if (!button) {
              return;
            }
            const buttonSpec = new ButtonOptions(button, formId);
            const {sx} = buttonSpec;
            return ( // @ts-ignore
              <Button
                key={i}
                {...buttonSpec}
                sx={[{mx: 1, mb: 1}, ...(Array.isArray(sx) ? sx : [sx])]}
                onClick={(...args) => {
                  const returnValue = buttonSpec.onClick(...args);
                  if (buttonSpec.autoCloseDialog) { hideModal(); }
                  return returnValue;
                }}
              >
                {buttonSpec.text}
              </Button>
            );
          },
        )}
      </DialogActions>
    </form>
  </Dialog>
);

export default ModalWindow;

const optionsInitializer = <T extends Options>(optinsInstance: T, options: Partial<T>) => {
  for (const key in options) { // tslint:disable-line:forin
    optinsInstance[key] = options[key];
  }
};

export class TextFieldOptions implements Options, BaseTextFieldProps {
  autoFocus = false;
  id: string = undefined;
  label: string = undefined;
  type: string = undefined;
  disabled = false;
  fullWidth = false;
  variant: 'standard' | 'outlined' | 'filled' = undefined;
  error = false;
  helperText: React.ReactNode = '';
  sx: SxProps = [];
  style = {};
  defaultValue: string = undefined;
  value: string = undefined;
  inputRef: React.Ref<any> = undefined;
  inputProps: InputBaseProps['inputProps'] = {};
  InputLabelProps: Partial<InputLabelProps> = {};

  constructor(options: Partial<TextFieldOptions>) {
    optionsInitializer(this, options);
  }

  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = () => {}; // tslint:disable-line:no-empty
}

// noinspection JSUnusedGlobalSymbols
export class ButtonOptions implements Options {
  text = '';
  type: string = undefined;
  autoFocus = false;
  color: PropTypes.Color = 'primary';
  variant: 'text' | 'outlined' | 'contained' = undefined;
  form: string = undefined;
  disabled = false;
  disableElevation = false;
  disableFocusRipple = false;
  fullWidth = false;
  href: string = undefined;
  size: 'small' | 'medium' | 'large' = 'medium';
  startIcon: React.ReactNode = undefined;
  endIcon: React.ReactNode = undefined;
  sx: SxProps = [];
  style: {};
  autoCloseDialog = true;

  constructor(options: Partial<ButtonOptions>, formId: string) {
    optionsInitializer(this, options);

    if (this.form === undefined) { this.form = formId; }

    // Not-owned props of MUI Button won't be enumerable:
    Object.defineProperties(this, {
      text: {
        value: this.text, // the value already initialized in `optionsInitializer()`
        enumerable: false,
        writable: true,
        configurable: true,
      },
      autoCloseDialog: {
        value: this.autoCloseDialog,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  }

  onClick: React.MouseEventHandler<HTMLAnchorElement> = () => {}; // tslint:disable-line:no-empty
}

export interface Options {}
