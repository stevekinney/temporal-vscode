// This file is generated. Do not edit.
// Run `bun run generate:configuration` to update this file.

import { z } from 'zod';

export const configurationSchema = {
  'developmentServer.host': z
    .string()
    .describe(' IP address or hostname to bind the development server to.')
    .default('localhost'),
  'developmentServer.port': z
    .number()
    .describe('Port for the frontend gRPC service.')
    .default(7233),
  'developmentServer.webInterface': z
    .string()
    .describe('The address of the Temporal Web UI.')
    .default('http://localhost:8233'),
  'developmentServer.namespaces': z
    .array(z.string())
    .describe(
      'Specify namespaces that should be pre-created—`default` is always created.',
    )
    .default([]),
  'developmentServer.searchAttributes': z
    .record(z.string())
    .describe('Search attributes to register with the development server.')
    .default({}),
  'developmentServer.dynamicConfiguration': z.record(z.string()).default({}),
  codecEndpoint: z
    .string()
    .describe(
      '**Optional**: The address where a data encoder codec server is running.',
    )
    .default(''),
  namespace: z
    .string()
    .describe('The namespace to use for workflow queries.')
    .default('default'),
  'connection.apiKey': z
    .string()
    .describe('The API key to use when making requests to Temporal.')
    .default(''),
  'client.identity': z
    .string()
    .describe('The identity to use when making requests to Temporal.')
    .default(''),
  'commandLine.logLevel': z
    .enum(['debug', 'info', 'warn', 'error'])
    .describe('The log level to use for the Temporal CLI.')
    .default('error'),
} as const;

export type ConfigurationSchema = typeof configurationSchema;
export type ConfigurationKey = keyof ConfigurationSchema;
export type ConfigurationValue<T extends ConfigurationKey> = z.infer<
  ConfigurationSchema[T]
>;
