import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Footer from './Footer';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Search from './Search';

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AWS UI
          </Typography>
          <Search />
        </Toolbar>
      </AppBar>
      <Box sx={{ my: 4 }}>
        {children}
        <Footer />
      </Box>
    </>
  );
}
