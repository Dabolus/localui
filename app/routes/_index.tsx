import { Link as RemixLink } from '@remix-run/react';
import { Typography, Link } from '@mui/material';
import type { MetaFunction } from '@remix-run/node';

// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: 'AWS UI' },
  { name: 'description', content: 'AWS UI' },
];

// https://remix.run/docs/en/main/file-conventions/routes#basic-routes
export default function Index() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Material UI Remix in TypeScript example
      </Typography>
      <Link to="/about" color="secondary" component={RemixLink}>
        Go to the about page
      </Link>
    </>
  );
}
