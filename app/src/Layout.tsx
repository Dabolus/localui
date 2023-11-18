import { PropsWithChildren, useRef } from 'react';
import { Link as RemixLink } from '@remix-run/react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Link,
  useTheme,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from '@mui/material';
import Footer from './Footer';
import Search from './Search';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
import LocalUIIcon from './components/LocalUIIcon';
import LocalUIText from './components/LocalUIText';

const LogoLink = styled(Link)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  color: theme.palette.common.white,
})) as typeof Link;

const LogoText = styled(LocalUIText)({
  height: '1rem',
});

const TitleBar = styled(AppBar)(({ theme }) => ({
  flex: 0,
  transition: theme.transitions.create('padding'),
  paddingLeft: 'env(titlebar-area-x, 0)',
  paddingRight:
    'calc(100% - env(titlebar-area-x, 0) - env(titlebar-area-width, 0))',
}));

export default function Layout({ children }: PropsWithChildren<{}>) {
  const theme = useTheme();
  const appBarRef = useRef<HTMLElement | null>(null);

  useEnhancedEffect(() => {
    if (!appBarRef.current) {
      return;
    }
    const newColor =
      getComputedStyle(appBarRef.current).getPropertyValue(
        '--AppBar-background',
      ) || theme.palette.primary.main;
    const metaThemeColorElement = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (metaThemeColorElement) {
      metaThemeColorElement.content = newColor;
      return;
    }
    const newMetaThemeColorElement = document.createElement('meta');
    newMetaThemeColorElement.name = 'theme-color';
    newMetaThemeColorElement.content = newColor;
    document.head.appendChild(newMetaThemeColorElement);
  }, [theme]);

  return (
    <>
      <TitleBar ref={appBarRef} position="static">
        <Toolbar variant="dense">
          <LogoLink
            component={RemixLink}
            to="/"
            underline="none"
            sx={{ flex: 0 }}
          >
            <LocalUIIcon />
            <LogoText />
          </LogoLink>
          <Box sx={{ flex: 1, height: '100%', WebkitAppRegion: 'drag' }} />
          <Search />
        </Toolbar>
      </TitleBar>
      <GlobalLoadingIndicator />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Box sx={{ flex: 0 }}>
        <Footer />
      </Box>
    </>
  );
}
