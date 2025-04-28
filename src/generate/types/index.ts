import { Project } from 'ts-morph';

import { extensionId } from '$utilities/extension-id';
import { formatFile } from '$utilities/format-file';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const typesSourceFile = project.createSourceFile(
  'src/types.d.ts',
  (writer) => {
    writer.writeLine('// This file is generated. Do not edit.');
    writer.writeLine('// Run `bun run generate:types` to update this file.');
    writer.newLine();
    writer.writeLine(`type ExtensionId = '${extensionId}';`);
    writer.newLine();
  },
  { overwrite: true },
);

await project.save();
await formatFile(typesSourceFile.getFilePath());
