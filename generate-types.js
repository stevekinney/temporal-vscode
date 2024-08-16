const ts = require('typescript');
const fs = require('fs/promises');
const prettier = require('prettier');

const input = 'src/extension.ts';
const output = './src/register/command-names.d.ts';

/**
 * Extracts the first arguments of all `registerCommand` calls in a TypeScript file.
 *
 * @param {string} filePath - The path to the TypeScript file.
 * @returns {Promise<string[]>} A promise that resolves to an array of the first arguments passed to `registerCommand`.
 */
async function getFirstArgumentsOfRegisterCommand(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );

  const firstArguments = [];

  /**
   * Recursive function to visit each node in the AST.
   *
   * @param {ts.Node} node - The current node being visited.
   */
  function visit(node) {
    // Check if the node is a call expression
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      // Check if the call expression is a call to 'registerCommand'
      if (
        ts.isIdentifier(expression) &&
        expression.text === 'registerCommand'
      ) {
        const args = node.arguments;

        if (args.length > 0) {
          const firstArg = args[0];

          // Extract the text of the first argument
          if (ts.isIdentifier(firstArg)) {
            firstArguments.push(firstArg.text);
          } else if (ts.isPropertyAccessExpression(firstArg)) {
            firstArguments.push(firstArg.getText(sourceFile));
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return firstArguments;
}

/**
 * Format content using Prettier.
 * @param {string} content
 * @returns
 */
const format = async (content) => {
  const prettierOptions = (await prettier.resolveConfig('.prettierrc')) || {
    parser: 'typescript',
  };

  return prettier.format(content, prettierOptions);
};

getFirstArgumentsOfRegisterCommand(input)
  .then(async (result) => {
    const content = format(
      `type CommandName = ${result
        .sort()
        .map((name) => `'${name}'`)
        .join(' | ')};`,
    );

    fs.writeFile(output, await content)
      .then(() => {
        console.log('File written successfully');
      })
      .catch((error) => {
        console.error('Error writing the file:', error);
      });
  })
  .catch((error) => {
    console.error('Error reading the file:', error);
  });
