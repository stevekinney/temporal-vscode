import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import {
  createSourceFile,
  ScriptTarget,
  isCallExpression,
  isStringLiteral,
  forEachChild,
} from 'typescript';
import fg from 'fast-glob';
import prettier from 'prettier';
import { sentenceCase } from 'change-case';

const extensionId = 'temporal-vscode';

const pkg = await readFile('package.json', 'utf-8').then(JSON.parse);
const commands = await findCommands();

await updatePackageJson(commands);
await writeCommandTypes(commands);
await writeViewTypes();

/**
 * @typedef {Object} Command
 * @property {string} command - The command identifier.
 * @property {string} title - The title of the command.
 * @property {'Temporal'} category - The category of the command.
 */

/**
 * Format content using Prettier.
 * @param {string} content The content you want to format.
 * @param { import('prettier').BuiltInParserName } parser Which of Prettier's parsers to use.
 * @returns {Promise<string>}
 */
async function format(content, parser = 'typescript') {
  const prettierOptions = (await prettier.resolveConfig('.prettierrc')) || {};
  return prettier.format(content, { ...prettierOptions, parser });
}

/**
 * Extracts command and summary information from a TypeScript file.
 * @param {string} fileName - The path to the TypeScript file.
 * @returns {Promise<Command[]>} - An array of objects containing command and title.
 */
async function extractCommandAndSummary(fileName) {
  const content = await readFile(fileName, 'utf-8');

  const sourceFile = createSourceFile(
    fileName,
    content,
    ScriptTarget.Latest,
    true,
  );

  const result = [];

  /**
   * Visits each node in the AST.
   * @param {ts.Node} node - The current AST node.
   */
  function visit(node) {
    if (isCallExpression(node)) {
      const commandName = node.arguments[0];
      const jsDocTags = node.parent.jsDoc;

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
        if (summaryTag) {
          title = summaryTag.comment;
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
  const files = await fg('src/**/*.ts');

  const commands = await Promise.all(
    files.map(async (file) => extractCommandAndSummary(file)),
  );

  return commands.flat().sort((a, b) => a.command.localeCompare(b.command));
}

/**
 * Updates the package.json file with the commands.
 * @param {Command[]} commands - The commands to add to the package.json file.
 */
async function updatePackageJson(commands) {
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
async function writeCommandTypes(commands) {
  const content = `
  // This file is generated. Do not edit.
  // Run \`pnpm generate\` to update this file.

  type CommandName = ${commands
    .map((command) => `'${command.command.replace(`${extensionId}.`, '')}'`)
    .join(' | ')};
  `;

  await writeFile('src/commands/commands.d.ts', await format(content));
}

/**
 * Writes a TypeScript file with the view types.
 */
async function writeViewTypes() {
  const views = await fg('src/views/**/*.html');

  const content = `
  // This file is generated. Do not edit.
  // Run \`pnpm generate\` to update this file.

  type ViewName = ${views
    .map((view) => `'${path.basename(path.dirname(view))}'`)
    .join(' | ')};
  `;

  await writeFile('src/views/views.d.ts', await format(content));
}
