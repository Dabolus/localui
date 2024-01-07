import { redirect } from '@remix-run/node';
import { computeTitle } from '~/src/utils';
import type { MetaFunction } from '@remix-run/node';

export const loader = async () => redirect(`/s3/buckets`);

export const meta: MetaFunction<typeof loader> = () => [computeTitle('S3')];
