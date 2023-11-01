import { Link } from '@remix-run/react';
import { Typography, Button } from '@mui/material';

export default function About() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Material UI Remix in TypeScript example
      </Typography>
      <Button component={Link} to="/">
        Go to the main page
      </Button>
    </>
  );
}
