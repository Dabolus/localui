import {
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  ListDeadLetterSourceQueuesCommand,
  QueueAttributeName,
  ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { FunctionComponent } from 'react';
import { getAwsClient } from '~/src/aws/server';
import { computeTitle, ignoreSearchChanges } from '~/src/utils';
import QueueSidebar from './QueueSidebar';
import { deleteQueueAction, postMessageToQueueAction } from './actions';
import type { MetaFunction } from '@remix-run/node';
import { useServerTranslation } from '~/i18next.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const sqsClient = getAwsClient('sqs');
  const { searchParams } = new URL(request.url);
  const extraIncludes = searchParams.getAll('include');
  const QueueName = params.name;
  const serverTranslationPromise = useServerTranslation(request);
  const { QueueUrl } = await sqsClient.send(
    new GetQueueUrlCommand({ QueueName }),
  );
  const { Attributes } = await sqsClient.send(
    new GetQueueAttributesCommand({
      QueueUrl,
      AttributeNames: [QueueAttributeName.All],
    }),
  );
  const { queueUrls: deadLetterSourceQueues } = await sqsClient.send(
    new ListDeadLetterSourceQueuesCommand({ QueueUrl }),
  );
  const { Messages } = extraIncludes.includes('messages')
    ? await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: QueueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 3,
        }),
      )
    : { Messages: undefined };
  const { t } = await serverTranslationPromise;

  return json({
    meta: { titleParts: [t('queues'), QueueName] },
    QueueName,
    QueueUrl,
    Attributes,
    DeadLetterSourceQueues: deadLetterSourceQueues?.map(QueueUrl => ({
      QueueName: QueueUrl.slice(QueueUrl.lastIndexOf('/') + 1),
      QueueUrl,
    })),
    Messages,
  });
};

export const shouldRevalidate = ignoreSearchChanges;

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  computeTitle('SQS', ...(data?.meta.titleParts || [])),
];

export const action = (args: ActionFunctionArgs) => {
  switch (args.request.method) {
    case 'POST':
      return postMessageToQueueAction(args);
    case 'DELETE':
      return deleteQueueAction(args);
  }
  throw redirect('/sqs/queues');
};

const QueueDetails: FunctionComponent = () => {
  const queue = useLoaderData<typeof loader>();

  return <QueueSidebar queue={queue} />;
};

export default QueueDetails;
