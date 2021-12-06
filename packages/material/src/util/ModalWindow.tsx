import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, PropTypes,
  TextField,
  useTheme,
} from '@mui/material';
import React from 'react';

const ModalWindow = (
  {
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
    isModalOpen: boolean,
    hideModal: Function,
    title?: string,
    content?: string,
    buttons?: ButtonOptions[],
    textFields?: TextFieldOptions[],
    onClickOutside?: Function,
    autoHideOnLostFocus?: boolean,
    onSubmit?: React.FormEventHandler<HTMLFormElement>,
    formId?: string,
    dontRefreshOnSubmit?: boolean,
  },
) => {
  const theme = useTheme();

  return (
    <Dialog
      onClose={(...args) => {
        onClickOutside(...args);
        if (autoHideOnLostFocus) { hideModal(); }
      }}
      open={isModalOpen}
    >
      <form
        onSubmit={
          dontRefreshOnSubmit
            ? (event, ...rest) => {
              event.preventDefault();
              return onSubmit(event, ...rest);
            }
            : onSubmit
        }
        id={formId}
      >
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <DialogContentText>{content}</DialogContentText>

          {textFields.map((textField, i) => {
              const textFieldSpec = new TextFieldOptions(textField);
              return ( // @ts-ignore
                <TextField
                  key={i}
                  {...textFieldSpec}
                  style={{margin: theme.spacing(1), ...textFieldSpec.style}}
                />
              );
            },
          )}
        </DialogContent>

        <DialogActions>
          {buttons.map((button, i) => {
              const buttonSpec = new ButtonOptions(button, formId);
              return ( // @ts-ignore
                <Button
                  key={i}
                  {...buttonSpec}
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
};

export default ModalWindow;

export class TextFieldOptions {
  autoFocus?: boolean;
  margin?: string;
  id?: string;
  label?: string;
  type?: string;
  fullWidth?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  style?: object;
  defaultValue?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  constructor(
    {
      autoFocus,
      margin,
      id,
      label,
      type,
      fullWidth,
      variant,
      style,
      defaultValue,
      value,
      onChange = () => {}, // tslint:disable-line:no-empty
    }: TextFieldOptions) {
    this.autoFocus = autoFocus;
    this.margin = margin;
    this.id = id;
    this.label = label;
    this.type = type;
    this.fullWidth = fullWidth;
    this.variant = variant;
    this.defaultValue = defaultValue;
    this.value = value;
    this.style = style;
    this.onChange = onChange;
  }
}

export class ButtonOptions {
  text: string;
  type?: string;
  autoFocus?: boolean;
  color?: PropTypes.Color;
  variant?: 'text' | 'outlined' | 'contained';
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  form?: string;
  disabled?: boolean;
  disableElevation?: boolean;
  disableFocusRipple?: boolean;
  fullWidth?: boolean;
  href?: string;
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  autoCloseDialog?: boolean;

  constructor(
    {
      text,
      type,
      autoFocus,
      color = 'primary',
      variant,
      onClick = () => {}, // tslint:disable-line:no-empty
      form,
      disabled,
      disableElevation,
      disableFocusRipple,
      fullWidth,
      href,
      size,
      startIcon,
      endIcon,
      autoCloseDialog = true,
    }: ButtonOptions, formId: string) {
    this.type = type;
    this.color = color;
    this.variant = variant;
    this.autoFocus = autoFocus;
    this.onClick = onClick;
    this.form = form ?? formId;
    this.disabled = disabled;
    this.disableElevation = disableElevation;
    this.disableFocusRipple = disableFocusRipple;
    this.fullWidth = fullWidth;
    this.href = href;
    this.size = size;
    this.startIcon = startIcon;
    this.endIcon = endIcon;

    Object.defineProperties(this, {
      text: {
        value: text,
        enumerable: false,
        writable: true,
        configurable: true,
      },
      autoCloseDialog: {
        value: autoCloseDialog,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  }
}
