import { redirect } from '@remix-run/node';

export async function loader() {
  return redirect(`/s3/buckets`);
}
