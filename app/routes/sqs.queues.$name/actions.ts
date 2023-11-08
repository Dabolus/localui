import { DeleteQueueCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ActionFunctionArgs, redirect } from '@remix-run/server-runtime';
import { getAwsClient } from '~/src/aws/server';

export const postMessageToQueueAction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const sqsClient = getAwsClient('sqs');
  const queueUrl = formData.get('queueUrl')?.toString();
  const message = formData.get('message')?.toString();

  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: message,
    }),
  );

  return null;
};

export const deleteQueueAction = async ({ params }: ActionFunctionArgs) => {
  const sqsClient = getAwsClient('sqs');

  await sqsClient.send(
    new DeleteQueueCommand({
      QueueUrl: params.name,
    }),
  );

  return redirect('/sqs/queues');
};
