import { FunctionComponent } from 'react';
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
import PreviewElement, { PreviewElementProps } from './PreviewElement';

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
  onClose: () => unknown;
};

const PreviewDialog: FunctionComponent<PreviewDialogProps> = ({
  open,
  onClose,
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
          <IconButton aria-label="Close preview" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <PreviewDialogContent>
        <PreviewElement {...props} />
      </PreviewDialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
