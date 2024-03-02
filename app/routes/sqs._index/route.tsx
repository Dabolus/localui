import { redirect } from '@remix-run/node';
import { computeTitle, ignoreSearchChanges } from '~/src/utils';
import type { MetaFunction } from '@remix-run/node';

export const loader = async () => redirect(`/sqs/queues`);

export const shouldRevalidate = ignoreSearchChanges;

export const meta: MetaFunction<typeof loader> = () => [computeTitle('SQS')];
