import { PropsWithChildren } from 'react';
import { Link as RemixLink } from '@remix-run/react';
import { Box, AppBar, Toolbar, Typography, styled, Link } from '@mui/material';
import Footer from './Footer';
import Search from './Search';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
import AwsUiIcon from './components/AwsUiIcon';

const LogoLink = styled(Link)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  color: theme.palette.common.white,
})) as typeof Link;

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <AppBar position="static" sx={{ flex: 0 }}>
        <Toolbar variant="dense">
          <LogoLink component={RemixLink} to="/" underline="none">
            <AwsUiIcon />
            <Typography variant="h6" component="h1" noWrap>
              AWS UI
            </Typography>
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
