import { redirect } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/node';
import { computeTitle } from '~/src/utils';

export const meta: MetaFunction<typeof loader> = () => [
  computeTitle('DynamoDB'),
];

export async function loader() {
  return redirect(`/dynamodb/tables`);
}
