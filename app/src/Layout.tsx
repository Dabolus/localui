import { PropsWithChildren } from 'react';
import { Link as RemixLink } from '@remix-run/react';
import { Box, AppBar, Toolbar, Typography, styled, Link } from '@mui/material';
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

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <AppBar position="static" sx={{ flex: 0 }}>
        <Toolbar variant="dense">
          <LogoLink component={RemixLink} to="/" underline="none">
            <LocalUIIcon />
            <LogoText />
          </LogoLink>
          <Search />
        </Toolbar>
      </AppBar>
      <GlobalLoadingIndicator />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Box sx={{ flex: 0 }}>
        <Footer />
      </Box>
    </>
  );
}
