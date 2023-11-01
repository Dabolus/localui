import { Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      Brought to you with <strong>❤</strong> by{' '}
      <strong>
        <Link
          underline="hover"
          color="inherit"
          href="https://github.com/Dabolus"
          target="my-github"
        >
          Dabolus
        </Link>
      </strong>
      .
    </Typography>
  );
}
