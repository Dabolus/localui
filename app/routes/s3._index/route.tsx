import { redirect } from '@remix-run/node';
import { computeTitle } from '~/src/utils';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction<typeof loader> = () => [computeTitle('S3')];

export async function loader() {
  return redirect(`/s3/buckets`);
}
