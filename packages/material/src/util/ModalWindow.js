import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField, useTheme,
} from '@material-ui/core'
import React from 'react'

function ModalWindow(
  {
    isModalOpen,
    hideModal,
    title = '',
    content = '',
    buttons = [],
    textFields = [],
    onClickOutside = () => {},
    autoHideOnLostFocus = true,
    onSubmit = () => {},
    formId = 'global-modal-form',
    dontRefreshOnSubmit = true,
  },
) {
  const theme = useTheme()
  
  return (
    <Dialog
      onClose={(...args) => {
        onClickOutside(...args)
        if (autoHideOnLostFocus) { hideModal() }
      }}
      open={isModalOpen}
    >
      <form
        onSubmit={
          dontRefreshOnSubmit
            ? (event, ...rest) => {
              event.preventDefault()
              return onSubmit(event, ...rest)
            }
            : onSubmit
        }
        id={formId}
      >
        <DialogTitle>{title}</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {content}
          </DialogContentText>
          
          {textFields.map((textField, i) => {
              const textFieldSpec = new TextFieldSpec(textField)
              return (
                <TextField
                  key={i}
                  {...textFieldSpec}
                  style={{margin: theme.spacing(1), ...textFieldSpec.style}}
                />
              )
            },
          )}
        </DialogContent>
        
        <DialogActions>
          {buttons.map((button, i) => {
              const buttonSpec = new ButtonSpec(button, formId)
              return (
                <Button
                  key={i}
                  {...buttonSpec}
                  onClick={(...args) => {
                    buttonSpec.onClick(...args)
                    if (buttonSpec.autoCloseDialog) { hideModal() }
                  }}
                >
                  {buttonSpec.text}
                </Button>
              )
            },
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ModalWindow

export class TextFieldSpec {
  constructor({
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
                onChange = () => {},
              }) {
    this.autoFocus = autoFocus
    this.margin = margin
    this.id = id
    this.label = label
    this.type = type
    this.fullWidth = fullWidth
    this.variant = variant
    this.defaultValue = defaultValue
    this.value = value
    this.style = style
    this.onChange = onChange
  }
}

export class ButtonSpec {
  constructor ({
           text,
           type,
           color = 'primary',
           variant,
           autoFocus,
           onClick = () => {},
           autoCloseDialog = true,
        },
        formId) {
    this.type = type
    this.color = color
    this.variant = variant
    this.autoFocus = autoFocus
    this.onClick = onClick
    this.autoCloseDialog = autoCloseDialog
    this.form = formId
    
    Object.defineProperty(this, 'text', {
      value: text,
      enumerable: false,
      writable: true,
      configurable: true,
    })
  }
}
