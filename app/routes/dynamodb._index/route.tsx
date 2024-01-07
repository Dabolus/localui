import { redirect } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/node';
import { computeTitle } from '~/src/utils';

export const loader = async () => redirect(`/dynamodb/tables`);

export const meta: MetaFunction<typeof loader> = () => [
  computeTitle('DynamoDB'),
];
