import { FunctionComponent, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RemixLink, useSearchParams } from '@remix-run/react';
import {
  Button,
  Stack,
  unstable_useEnhancedEffect as useEnhancedEffect,
  styled,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { base64UrlDecode, base64UrlEncode } from '~/src/utils';
import useLinkUtils from '~/src/hooks/useLinkUtils';
import type { PreviewElementProps } from './PreviewElement';
import type { _Object } from '@aws-sdk/client-s3';
import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import Placeholder from '~/src/components/Placeholder';
import Sidebar from '~/src/components/Sidebar';

const PreviewElement = lazy(() => import('./PreviewElement'));

export interface EnrichedObject extends _Object {
  BucketName?: string;
  DirName?: string;
  BaseName?: string;
}

export interface PreviewSidebarProps {
  object: Jsonify<EnrichedObject>;
  encodedKey: string;
  prefix?: string;
}

const InlinePreviewElement = styled(PreviewElement)<
  PreviewElementProps & { $isFullscreen?: boolean }
>(({ theme, $isFullscreen }) => ({
  flex: '1 1 auto',
  marginTop: theme.spacing(2),
  transition: theme.transitions.create('max-height'),
  minHeight: 0,
  maxHeight: $isFullscreen ? '100%' : 360,
}));

const PreviewSidebar: FunctionComponent<PreviewSidebarProps> = ({
  object,
  encodedKey,
  prefix = '',
}) => {
  const { t } = useTranslation();
  const [previewElementProps, setPreviewElementProps] = useState<
    PreviewElementProps | undefined
  >(undefined);
  const [searchParams] = useSearchParams();
  const isFullscreen = searchParams.has('fullscreen');
  const { withSearchParam, withPathname } = useLinkUtils();

  useEnhancedEffect(() => {
    setPreviewElementProps(undefined);
    if (!object?.Key) {
      return;
    }
    let cancelled = false;
    let url: string | undefined;
    fetch(
      withSearchParam(
        'preview',
        '',
        withPathname(`/s3/buckets/${object.BucketName}/${encodedKey}/download`),
      ),
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
    <Sidebar
      title={object.BaseName}
      isFullscreen={isFullscreen}
      fullscreenLink={withSearchParam('fullscreen', isFullscreen ? null : '')}
      closeLink={withSearchParam(
        'selection',
        null,
        withPathname(
          `/s3/buckets/${object.BucketName}${
            prefix ? `/${base64UrlEncode(prefix)}` : ''
          }`,
        ),
      )}
    >
      <Stack height="100%">
        <Stack direction="row" gap={1} flex="0 0 auto">
          <Button
            variant="contained"
            color="secondary"
            component="a"
            href={withPathname(
              `/s3/buckets/${object.BucketName}/${encodedKey}/download`,
            )}
            download={object.BaseName}
            startIcon={<DownloadIcon />}
          >
            {t('download')}
          </Button>
          <Button component={RemixLink} to={withSearchParam('delete', '')}>
            {t('delete')}
          </Button>
        </Stack>
        {previewElementProps && (
          <Placeholder>
            <InlinePreviewElement
              $isFullscreen={isFullscreen}
              {...previewElementProps}
            />
          </Placeholder>
        )}
      </Stack>
    </Sidebar>
  );
};

export default PreviewSidebar;
