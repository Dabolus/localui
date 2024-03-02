import { redirect } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/node';
import { computeTitle, ignoreSearchChanges } from '~/src/utils';

export const loader = async () => redirect(`/dynamodb/tables`);

export const shouldRevalidate = ignoreSearchChanges;

export const meta: MetaFunction<typeof loader> = () => [
  computeTitle('DynamoDB'),
];
