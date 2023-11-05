import { FunctionComponent, lazy, useState } from 'react';
import { Link as RemixLink, useSearchParams } from '@remix-run/react';
import {
  Button,
  Stack,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  unstable_useEnhancedEffect as useEnhancedEffect,
  styled,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import PreviewDialog from './PreviewDialog';
import { base64UrlDecode } from '~/src/utils';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import type { PreviewElementProps } from './PreviewElement';
import type { _Object } from '@aws-sdk/client-s3';
import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import Placeholder from '~/src/components/Placeholder';

const PreviewElement = lazy(() => import('./PreviewElement'));

export interface EnrichedObject extends _Object {
  BucketName?: string;
  DirName?: string;
  BaseName?: string;
}

export interface PreviewSidebarProps {
  object: Jsonify<EnrichedObject>;
  encodedKey: string;
}

const InlinePreviewElement = styled(PreviewElement)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const InlinePreviewContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  maxHeight: 360,
});

const FullScreenPreviewButton = styled(IconButton)(({ theme }) => ({
  zIndex: 1,
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.vars.palette.background.paper,

  '&:hover': {
    backgroundColor: theme.vars.palette.background.default,
  },
})) as typeof IconButton;

const PreviewSidebar: FunctionComponent<PreviewSidebarProps> = ({
  object,
  encodedKey,
}) => {
  const [previewElementProps, setPreviewElementProps] = useState<
    PreviewElementProps | undefined
  >(undefined);
  const [searchParams] = useSearchParams();
  const { withSearchParam } = useLinkUtils();

  useEnhancedEffect(() => {
    setPreviewElementProps(undefined);
    if (!object?.Key) {
      return;
    }
    let cancelled = false;
    let url: string | undefined;
    fetch(
      `/s3/buckets/${object.BucketName}/${encodedKey}/download?preview`,
    ).then(async res => {
      const blob = await res.blob();
      const contentType = res.headers.get('Content-Type')!;
      if (cancelled) {
        return;
      }
      url = URL.createObjectURL(blob);
      const key = base64UrlDecode(encodedKey);
      setPreviewElementProps({ contentType, name: key, src: url });
    });

    return () => {
      cancelled = true;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [object?.Key, object?.BucketName, encodedKey]);

  return (
    <Card
      component={Stack}
      position="absolute"
      top={0}
      right={0}
      width={420}
      maxWidth="100%"
      height="100%"
      p={2}
    >
      <CardHeader
        title={object.BaseName}
        action={
          <IconButton
            LinkComponent={RemixLink}
            {...{ to: `/s3/buckets/${object.BucketName}` }}
          >
            <CloseIcon />
          </IconButton>
        }
      />
      <CardContent sx={{ height: '100%' }}>
        <Stack direction="row" gap={1}>
          <Button
            variant="contained"
            color="secondary"
            component="a"
            href={'download'}
            download={object.BaseName}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
          <Button
            variant="contained"
            color="error"
            component={RemixLink}
            to={'delete'}
          >
            Delete
          </Button>
        </Stack>
        {previewElementProps && (
          <InlinePreviewContainer>
            <FullScreenPreviewButton
              aria-label="Open full screen preview"
              component={RemixLink}
              to={withSearchParam('preview', '')}
            >
              <FullscreenIcon />
            </FullScreenPreviewButton>
            <Placeholder>
              <InlinePreviewElement {...previewElementProps} />
            </Placeholder>
            <PreviewDialog
              open={searchParams.has('preview')}
              closeLink={withSearchParam('preview', null)}
              {...previewElementProps}
            />
          </InlinePreviewContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviewSidebar;
