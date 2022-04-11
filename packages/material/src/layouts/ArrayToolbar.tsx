import {
  FormHelperText,
  Grid,
  Hidden,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import ValidationIcon from '../complex/ValidationIcon';
export interface ArrayLayoutToolbarProps {
  label: string;
  description?: string;
  errors: string;
  addItem(): void;
}
export const ArrayLayoutToolbar = React.memo(
  ({
    label,
    description,
    errors,
    addItem,
  }: ArrayLayoutToolbarProps) => {
    return (
      <Toolbar disableGutters={true}>
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid item>
            <Typography variant='h6'>{label}</Typography>
            {description !== undefined && <FormHelperText sx={{mt: 0, mb: 0.5}}>{description}</FormHelperText>}
          </Grid>
          <Hidden smUp={errors.length === 0}>
            <Grid item>
              <ValidationIcon id='tooltip-validation' errorMessages={errors} />
            </Grid>
          </Hidden>
          <Grid item>
            <Grid container>
              <Grid item>
                <Tooltip
                  id='tooltip-add'
                  title={`Add to ${label}`}
                  placement='bottom'
                >
                  <IconButton
                    aria-label={`Add to ${label}`}
                    onClick={addItem}
                    size='large'
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    );
  }
);
