import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import { Typography, Link, Stack } from '@mui/material';
import { redirect, type MetaFunction } from '@remix-run/node';
import { getEnabledServices } from '~/src/aws/server';
import { serviceToNameMap } from '~/src/aws/common';
import CurrentPath from '~/src/components/CurrentPath';

// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: 'AWS UI' },
  { name: 'description', content: 'AWS UI' },
];

export async function loader() {
  const services = getEnabledServices();
  return services.length > 1 ? { services } : redirect(`/${services[0]}`);
}

export default function Index() {
  const { services } = useLoaderData<typeof loader>();

  return (
    <>
      <CurrentPath />
      <Stack
        p={2}
        spacing={2}
        alignItems="flex-start"
        width="100%"
        maxWidth={640}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Console Home
        </Typography>
        <ul>
          {services.map(service => (
            <li key={service}>
              <Link component={RemixLink} to={`/${service}`}>
                {serviceToNameMap[service]}
              </Link>
            </li>
          ))}
        </ul>
      </Stack>
    </>
  );
}
