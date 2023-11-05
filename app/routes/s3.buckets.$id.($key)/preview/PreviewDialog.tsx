import { FunctionComponent, lazy } from 'react';
import { Link as RemixLink } from '@remix-run/react';
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PreviewElementProps } from './PreviewElement';
import Placeholder from '~/src/components/Placeholder';

const PreviewElement = lazy(() => import('./PreviewElement'));

const PreviewDialogContent = styled(DialogContent)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > *': {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

export type PreviewDialogProps = PreviewElementProps & {
  open: DialogProps['open'];
  closeLink: string;
};

const PreviewDialog: FunctionComponent<PreviewDialogProps> = ({
  open,
  closeLink,
  ...props
}) => {
  return (
    <Dialog fullScreen open={open}>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" component="h2">
            {props.name}
          </Typography>
          <IconButton
            aria-label="Close preview"
            component={RemixLink}
            to={closeLink}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <PreviewDialogContent>
        <Placeholder>
          <PreviewElement {...props} />
        </Placeholder>
      </PreviewDialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
