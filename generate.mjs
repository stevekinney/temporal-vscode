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

const pkg = JSON.parse(await readFile('package.json', 'utf-8'));

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
const format = async (content, parser = 'typescript') => {
  const prettierOptions = (await prettier.resolveConfig('.prettierrc')) || {};
  return prettier.format(content, { ...prettierOptions, parser });
};

/**
 * Extracts command and summary information from a TypeScript file.
 * @param {string} fileName - The path to the TypeScript file.
 * @returns {Promise<Command[]>} - An array of objects containing command and title.
 */
const extractCommandAndSummary = async (fileName) => {
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
};

const findCommands = async () => {
  const files = await fg('src/**/*.ts');

  const commands = await Promise.all(
    files.map(async (file) => extractCommandAndSummary(file)),
  );

  return commands.flat();
};

const commands = await findCommands();

pkg.contributes.commands = commands;

console.log('Writing package.json…');
writeFile('package.json', await format(JSON.stringify(pkg, null, 2)));
