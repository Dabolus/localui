import { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import {
  Fullscreen as FullScreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSearchParams, Link as RemixLink } from '@remix-run/react';
import useLinkUtils from '../hooks/useLinkUtils';

export interface SidebarProps {
  title: ReactNode;
  subheader?: ReactNode;
  isFullscreen?: boolean;
  fullscreenLink?: string;
  closeLink: string;
}

const SidebarContainer = styled(Card, {
  shouldForwardProp: prop => prop !== '$isFullscreen',
})<{ $isFullscreen?: boolean }>(({ theme, $isFullscreen }) => ({
  position: 'absolute',
  zIndex: 1,
  top: 0,
  right: 0,
  transition: theme.transitions.create('width'),
  width: $isFullscreen ? '100%' : 360,
  maxWidth: '100%',
  height: '100%',
  padding: theme.spacing(2),
  viewTransitionName: 'sidebar',
  display: 'flex',
  flexDirection: 'column',
}));

export const Sidebar: FunctionComponent<PropsWithChildren<SidebarProps>> = ({
  title,
  subheader,
  isFullscreen,
  fullscreenLink,
  closeLink,
  children,
}) => {
  const { withSearchParam } = useLinkUtils();
  const [searchParams] = useSearchParams();
  const isMuiTypographyDisabled =
    typeof title !== 'string' || (!!subheader && typeof subheader !== 'string');

  return (
    <SidebarContainer raised $isFullscreen={isFullscreen}>
      <CardHeader
        title={
          isMuiTypographyDisabled && typeof title === 'string' ? (
            <Typography variant="h5">{title}</Typography>
          ) : (
            title
          )
        }
        subheader={
          isMuiTypographyDisabled && typeof subheader === 'string' ? (
            <Typography variant="body1">{subheader}</Typography>
          ) : (
            subheader
          )
        }
        disableTypography={isMuiTypographyDisabled}
        action={
          <>
            {fullscreenLink && (
              <IconButton
                aria-label={`${isFullscreen ? 'Exit' : 'Enter'} full screen`}
                LinkComponent={RemixLink}
                {...{ to: fullscreenLink }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullScreenIcon />}
              </IconButton>
            )}
            <IconButton
              edge="end"
              LinkComponent={RemixLink}
              {...{ to: closeLink, unstable_viewTransition: true }}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
      <CardContent sx={{ height: '100%' }}>{children}</CardContent>
    </SidebarContainer>
  );
};

export default Sidebar;
