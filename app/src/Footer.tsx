import { Typography, Link, Box, BoxProps } from '@mui/material';

export type FooterProps = BoxProps;

export default function Footer(props: FooterProps) {
  return (
    <Box {...props} sx={{ p: 2, ...props.sx }}>
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
    </Box>
  );
}
