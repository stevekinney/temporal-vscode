import { readFile, writeFile } from 'fs/promises';

import glob from 'fast-glob';
import prettier from 'prettier';
import { sentenceCase } from 'change-case';

import {
  createSourceFile,
  ScriptTarget,
  isCallExpression,
  isStringLiteral,
  forEachChild,
  type Node,
  type JSDoc,
} from 'typescript';


const extensionId = 'temporal-vscode';

const pkg = await readFile('package.json', 'utf-8').then(JSON.parse);
const commands = await findCommands();

await updatePackageJson(commands);
await writeCommandTypes(commands);

type Command = {
  command: string;
  title: string;
  category: 'Temporal';
};

/**
 * Format content using Prettier.
 */
async function format(content: string, parser = 'typescript'): Promise<string> {
  const prettierOptions = (await prettier.resolveConfig('.prettierrc')) || {};
  return prettier.format(content, { ...prettierOptions, parser });
}

/**
 * Extracts command and summary information from a TypeScript file.
 */
async function extractCommandAndSummary(fileName: string): Promise<Command[]> {
  const content = await readFile(fileName, 'utf-8');

  const sourceFile = createSourceFile(
    fileName,
    content,
    ScriptTarget.Latest,
    true,
  );

  const result: Command[] = [];

  /**
   * Visits each node in the AST.
   */
  function visit(node: Node) {
    if (isCallExpression(node)) {
      const commandName = node.arguments[0];
      const jsDocTags = (node.parent as Node & {jsDoc: JSDoc[]}).jsDoc;

      if (
        commandName &&
        isStringLiteral(commandName) &&
        jsDocTags &&
        jsDocTags.length > 0
      ) {
        // Default title to the command name.
        let title = sentenceCase(commandName.text);

        // Find the summary tag.
        const summaryTag = jsDocTags[0].tags?.find(
          (tag) => tag.tagName.text === 'summary',
        );

        // Use the summary tag if available.
        if (summaryTag && summaryTag.comment) {
          title = String(summaryTag.comment);
        }

        // Add the command to the result.
        result.push({
          command: `${extensionId}.${commandName.text}`,
          title,
          category: 'Temporal',
        });
      }
    }
    forEachChild(node, visit);
  }

  visit(sourceFile);

  return result;
}

async function findCommands() {
  const files = await glob('src/**/*.ts');

  const commands = await Promise.all(
    files.map(async (file) => extractCommandAndSummary(file)),
  );

  return commands.flat().sort((a, b) => a.command.localeCompare(b.command));
}

/**
 * Updates the package.json file with the commands.
 * @param {Command[]} commands - The commands to add to the package.json file.
 */
async function updatePackageJson(commands: Command[]) {
  pkg.contributes.commands = commands;

  await writeFile(
    'package.json',
    await format(JSON.stringify(pkg, null, 2), 'json'),
  );
}

/**
 * Writes a TypeScript file with the command types.
 * @param {Command[]} commands
 */
async function writeCommandTypes(commands: Command[]) {
  const content = `
  // This file is generated. Do not edit.
  // Run \`pnpm generate\` to update this file.

  type CommandName = ${commands
    .map((command) => `'${command.command.replace(`${extensionId}.`, '')}'`)
    .join(' | ')};
  `;

  await writeFile('src/commands/commands.d.ts', await format(content));
}

