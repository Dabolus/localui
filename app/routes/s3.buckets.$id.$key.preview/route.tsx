import { useState } from 'react';
import { useParams, Link as RemixLink } from '@remix-run/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  styled,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { base64UrlDecode } from '~/src/utils';
import PreviewElement, { PreviewElementProps } from './PreviewElement';

const PreviewContent = styled(DialogContent)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > *': {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

export default function BucketObjectPreview() {
  const { id, key: rawKey } = useParams();
  const [previewElementProps, setPreviewElementProps] = useState<
    PreviewElementProps | undefined
  >(undefined);

  useEnhancedEffect(() => {
    let cancelled = false;
    fetch(`/s3/buckets/${id}/${rawKey}/download?preview`).then(async res => {
      const blob = await res.blob();
      const contentType = res.headers.get('Content-Type')!;
      if (cancelled) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const key = base64UrlDecode(rawKey!);
      setPreviewElementProps({ contentType, name: key, src: url });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Dialog fullScreen open>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" component="h2">
            {base64UrlDecode(rawKey!)}
          </Typography>
          <IconButton
            LinkComponent={RemixLink}
            {...{ to: `/s3/buckets/${id}/${rawKey}` }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <PreviewContent>
        {previewElementProps && <PreviewElement {...previewElementProps} />}
      </PreviewContent>
    </Dialog>
  );
}
