import { Project } from 'ts-morph';
import { JsonSchemaObject, jsonSchemaToZod } from 'json-schema-to-zod';
import { z } from 'zod';

import pkg from 'package.json' assert { type: 'json' };
import { formatFile } from '$utilities/format-file';

const targetFilename = 'src/utilities/configuration-schema.ts';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const ConfigurationPropertyJSONSchema: z.ZodType<JsonSchemaObject> = z.lazy(
  () =>
    z.object({
      type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
      default: z.any().optional(),
      description: z.string().optional(),
      markdownDescription: z.string().optional(),
      enum: z.array(z.string()).optional(),
      items: z.any().optional(),
      properties: z.record(z.any()).optional(),
      additionalProperties: ConfigurationPropertyJSONSchema.optional(),
    }),
);

const configurations = pkg.contributes.configuration.properties;
const properties = Object.entries(configurations).map(([key, value]) => {
  return [key.replace('temporal.', ''), value] as const;
});

const configuration: Record<string, string> = {};

for (const [key, value] of properties) {
  const schema = ConfigurationPropertyJSONSchema.parse(value);

  if (schema.markdownDescription && !schema.description) {
    schema.description = schema.markdownDescription;
  }

  configuration[key] = jsonSchemaToZod(schema);
}

project.createSourceFile(
  targetFilename,
  (writer) => {
    writer.writeLine('// This file is generated. Do not edit.');
    writer.writeLine(
      '// Run `bun run generate:configuration` to update this file.',
    );
    writer.newLine();
    writer.writeLine("import { z } from 'zod';");
    writer.newLine();
    writer.writeLine('export const configurationSchema = {');

    writer.indent(() => {
      for (const [key, value] of Object.entries(configuration)) {
        writer.writeLine(`'${key}': ${value},`);
      }
    });

    writer.writeLine('} as const;');

    writer.newLine();

    writer.writeLine(
      'export type ConfigurationSchema = typeof configurationSchema;',
    );

    writer.writeLine(
      'export type ConfigurationKey = keyof ConfigurationSchema;',
    );

    writer.writeLine(
      'export type ConfigurationValue<T extends ConfigurationKey> = z.infer<ConfigurationSchema[T]>;',
    );
  },
  {
    overwrite: true,
  },
);

await project.save();
await formatFile(targetFilename);
