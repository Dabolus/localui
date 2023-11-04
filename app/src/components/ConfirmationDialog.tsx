import { FunctionComponent, ReactNode, SyntheticEvent } from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Button,
  DialogContentText,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Form, FormProps, Link as RemixLink } from '@remix-run/react';

type BaseConfirmationDialogProps = Omit<
  DialogProps,
  'title' | 'content' | 'onClose'
> &
  Pick<FormProps, 'method' | 'action' | 'encType'>;

export interface ConfirmationDialogProps extends BaseConfirmationDialogProps {
  title?: ReactNode;
  content?: ReactNode;
  buttons?: ReactNode;
  closeable?: boolean;
  closeLink?: string;
  onClose?: (
    event: SyntheticEvent<Element, Event>,
    reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick',
  ) => void;
}

const ConfirmationDialog: FunctionComponent<ConfirmationDialogProps> = ({
  title,
  content,
  buttons,
  closeable = true,
  closeLink,
  ...props
}) => (
  <Dialog maxWidth="xs" fullWidth component={Form} {...props}>
    {(title || closeable) && (
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          {closeable && (
            <IconButton
              edge="end"
              onClick={event => props.onClose?.(event, 'closeButtonClick')}
              {...(closeLink && {
                component: RemixLink,
                to: closeLink,
              })}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
    )}
    {content && (
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
    )}
    {(buttons || closeable) && (
      <DialogActions>
        {closeable && (
          <Button
            onClick={event => props.onClose?.(event, 'closeButtonClick')}
            {...(closeLink && {
              component: RemixLink,
              to: closeLink,
            })}
          >
            Cancel
          </Button>
        )}
        {buttons}
      </DialogActions>
    )}
  </Dialog>
);

export default ConfirmationDialog;
