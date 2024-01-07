import { FunctionComponent, ReactNode, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  Form,
  FormProps,
  Link as RemixLink,
  useNavigate,
} from '@remix-run/react';

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
  onClose,
  ...props
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      component={Form}
      onClose={(event, reason) => {
        if (!closeable) {
          return;
        }
        if (closeLink) {
          navigate(closeLink);
        }
        onClose?.(event as SyntheticEvent<Element, Event>, reason);
      }}
      {...props}
    >
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
                onClick={event => onClose?.(event, 'closeButtonClick')}
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
          {typeof content === 'string' ? (
            <DialogContentText>{content}</DialogContentText>
          ) : (
            content
          )}
        </DialogContent>
      )}
      {(buttons || closeable) && (
        <DialogActions>
          {closeable && (
            <Button
              onClick={event => onClose?.(event, 'closeButtonClick')}
              {...(closeLink && {
                component: RemixLink,
                to: closeLink,
              })}
            >
              {t('cancel')}
            </Button>
          )}
          {buttons}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ConfirmationDialog;
