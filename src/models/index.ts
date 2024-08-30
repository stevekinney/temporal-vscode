import * as vscode from 'vscode';

import { toCommandName } from '$components/command';
import searchAttributes from './search-attributes.json';

const executionStatuses = [
  'Running',
  'Completed',
  'Failed',
  'Canceled',
  'Terminated',
  'ContinuedAsNew',
  'TimedOut',
];

const participantID = 'temporal-vscode.chat';

interface ChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}

function getDateWithOffset(offsetMinutes: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString();
}

// Use gpt-4o since it is fast and high quality. gpt-3.5-turbo and gpt-4 are also available.
const MODEL_SELECTOR: vscode.LanguageModelChatSelector = {
  vendor: 'copilot',
  family: 'gpt-4o',
};

export const createChat = (context: vscode.ExtensionContext) => {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    _context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<ChatResult> => {
    if (request.command === 'query') {
      try {
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);

        if (model) {
          const messages = [
            vscode.LanguageModelChatMessage.User(
              "You are an expert in constructing SQL-like queries for Temporal's Visibility API. Your task is to generate queries that filter and retrieve Workflow Executions from the Visibility Store. Each query must be constructed using the correct Search Attributes—both default and custom—and should incorporate the appropriate operators (e.g., =, !=, >, AND, OR) to meet specific filtering criteria.",
            ),
            vscode.LanguageModelChatMessage.User(
              "Ensure that the queries respect the case sensitivity of Search Attribute names and adhere strictly to Temporal's required datetime formats, such as RFC3339Nano. Avoid using shorthand time calculations like 'now - 6d'. Instead, use explicit datetime strings. For example, use ISO 8601 format like '2024-08-30T14:51:33.932Z' for time-based filters.",
            ),
            vscode.LanguageModelChatMessage.User(
              'If I asked you to give me query for all terminated workflows of that closed in the last hour with a workflow ID that starts with "Term". You should return a query like this: `ExecutionStatus`="Terminated" AND `WorkflowId` STARTS_WITH "Term" AND `CloseTime`>="' +
                getDateWithOffset(-60) +
                '"`.',
            ),
            vscode.LanguageModelChatMessage.User(
              `The available Search Attributes you can use include: ${JSON.stringify(searchAttributes)}. ExecutionStatus can be any of the following: ${executionStatuses.join(', ')}.`,
            ),
            vscode.LanguageModelChatMessage.User(
              'Your response should only contain the SQL-like query syntax along with a brief explanation of the query logic. Exclude any additional code or formatting outside the query. Remember to include the correct operators and Search Attributes to match the filtering criteria precisely.',
            ),
            vscode.LanguageModelChatMessage.User(
              'Consider best practices for efficient API usage, such as handling large result sets with pagination and utilizing the CountWorkflow API for counting executions. In case of any ambiguity or missing data, default to standard practices or provide a note on assumptions made.',
            ),
            vscode.LanguageModelChatMessage.User(request.prompt),
          ];

          const chatResponse = await model.sendRequest(messages, {}, token);

          for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
          }
        }
      } catch (err) {
        handleError(logger, err, stream);
      }

      stream.button({
        command: toCommandName('viewWorkflowsWithQuery'),
        title: 'Query Workflows',
      });

      stream.anchor(
        vscode.Uri.parse('https://docs.temporal.io/docs/visibility'),
        "Temporal's Visibility API documentation",
      );

      logger.logUsage('request', { kind: 'query' });
      return { metadata: { command: 'query' } };
    }

    try {
      const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);

      if (model) {
        const messages = [
          vscode.LanguageModelChatMessage.User(
            `You are an expert in Temporal, a powerful open-source workflow orchestration engine. Your role involves providing detailed, accurate, and context-specific guidance on all aspects of Temporal's architecture, APIs, and usage patterns. You are adept at explaining Temporal's core concepts, such as Workflows, Activities, and the Temporal Server, as well as more advanced features like Continue-As-New, Cron Workflows, and custom Search Attributes. You are familiar with the nuances of Temporal's SQL-like Visibility API, including the construction of List Filters, handling of Search Attributes, and best practices for efficient data retrieval. You understand Temporal's support for various databases (e.g., Elasticsearch, MySQL, PostgreSQL) and how this impacts workflow visibility and custom Search Attributes. You can guide users in configuring, deploying, and optimizing Temporal in production environments, ensuring high performance and reliability. Your expertise extends to security practices, data consistency, and troubleshooting common issues within Temporal's ecosystem. You are prepared to answer a wide range of queries, from basic 'how-tos' to complex use cases involving multi-service business processes, and you can provide examples of best practices, real-world applications, and advanced configuration scenarios. Additionally, you stay up-to-date with the latest developments in Temporal, including new features, updates, and community practices.When generating responses, you will focus on clarity, accuracy, and actionable advice, tailoring your answers to the specific needs and contexts provided by users. Whether guiding through the construction of advanced List Filters or advising on the architecture of a Temporal-based solution, your responses will be informed, precise, and aligned with Temporal’s best practices and current capabilities.`,
          ),
          vscode.LanguageModelChatMessage.User(request.prompt),
        ];

        const chatResponse = await model.sendRequest(messages, {}, token);

        for await (const fragment of chatResponse.text) {
          stream.markdown(fragment);
        }
      }
    } catch (err) {
      handleError(logger, err, stream);
    }

    logger.logUsage('request', { kind: '' });
    return { metadata: { command: '' } };
  };

  const trudi = vscode.chat.createChatParticipant(participantID, handler);

  trudi.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    'assets/trudi.jpg',
  );

  const logger = vscode.env.createTelemetryLogger({
    sendEventData(eventName, data) {
      // Capture event telemetry
      console.log(`Event: ${eventName}`);
      console.log(`Data: ${JSON.stringify(data)}`);
    },
    sendErrorData(error, data) {
      // Capture error telemetry
      console.error(`Error: ${error}`);
      console.error(`Data: ${JSON.stringify(data)}`);
    },
  });

  context.subscriptions.push(
    trudi.onDidReceiveFeedback((feedback: vscode.ChatResultFeedback) => {
      // Log chat result feedback to be able to compute the success matric of the participant
      // unhelpful / totalRequests is a good success metric
      logger.logUsage('chatResultFeedback', {
        kind: feedback.kind,
      });
    }),
  );

  context.subscriptions.push(trudi);
};

function handleError(
  logger: vscode.TelemetryLogger,
  err: any,
  stream: vscode.ChatResponseStream,
): void {
  // making the chat request might fail because
  // - model does not exist
  // - user consent not given
  // - quote limits exceeded
  logger.logError(err);

  if (err instanceof vscode.LanguageModelError) {
    console.log(err.message, err.code, err.cause);
    if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
      stream.markdown(
        vscode.l10n.t(
          "I'm sorry, I can only explain computer science concepts.",
        ),
      );
    }
  } else {
    // re-throw other errors so they show up in the UI
    throw err;
  }
}
