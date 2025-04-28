import { CallExpression, ExpressionStatement, SyntaxKind } from 'ts-morph';
import { z } from 'zod';

import pkg from 'package.json' assert { type: 'json' };
import { extensionId } from '$utilities/extension-id';

type CommandContribution = (typeof pkg.contributes.commands)[number];
interface CommandRegistrationCallExpression extends CallExpression {}

const CommandContributionSchema = z.object({
  command: z.string().refine((value) => value.startsWith(`${extensionId}.`), {
    message: 'The command name must start with the extension ID.',
  }),
  title: z.string().nonempty({
    message: 'A title is required for the command.',
  }),
  category: z.string().nonempty({
    message: 'A category is required for the command.',
  }),
}) satisfies z.ZodType<CommandContribution>;

const TitleSchema = z.string({
  required_error: 'A title is required for the command.',
  invalid_type_error: 'The title must be a string.',
});

/**
 * `CommandRegistration` is a class that represents a command registration in the code.
 * It provides methods to extract information about the command, such as its name, title, and category.
 */
export class CommandRegistration {
  /**
   * The command registrations.
   * This is a static property that holds all the command registrations.
   */
  static commands: Set<CommandRegistration> = new Set();

  /**
   * Iterates over all command registrations.
   * This is a generator function that yields each command registration.
   * @returns {Generator<CommandRegistration>} A generator that yields command registrations.
   * This is useful for iterating over all command registrations in a loop.
   */
  static *[Symbol.iterator](): Generator<CommandRegistration> {
    for (const command of CommandRegistration.commands) {
      yield command;
    }
  }

  /**
   * Registers a command registration.
   */
  static register = (registration: CommandRegistrationCallExpression) => {
    const command = new CommandRegistration(registration);
    CommandRegistration.commands.add(command);
    return command;
  };

  public readonly category: string = 'Temporal';

  #callExpression: CommandRegistrationCallExpression;
  #expressionStatement: ExpressionStatement;

  private constructor(registration: CommandRegistrationCallExpression) {
    this.#callExpression = registration;
    this.#expressionStatement = this.#callExpression.getParentIfKindOrThrow(
      SyntaxKind.ExpressionStatement,
    );
  }

  /**
   * Returns the command name.
   */
  get name(): string {
    const [name] = this.#callExpression.getArguments();
    return name.getFullText().replace(/['"]/g, '').trim();
  }

  /**
   * Returns the command name in the format `extensionId.commandName`.
   */
  get command(): string {
    return `${extensionId}.${this.name}`;
  }

  /**
   * Parses the command's documentation to extract the title.
   * It looks for a `@summary` tag in the documentation comments.
   * If the tag is not found, it throws an error.
   * If the documentation is not found, it throws an error.
   * @returns {string} The title of the command.
   * @throws {Error} If no documentation is found or if no summary tag is found.
   */
  get title(): string {
    const [documentation] = this.#expressionStatement.getJsDocs();

    if (!documentation) {
      throw new Error('No documentation found');
    }

    for (const tag of documentation.getTags()) {
      if (tag.getTagName() === 'summary') {
        return TitleSchema.parse(tag.getCommentText());
      }
    }

    throw new Error('No summary tag found');
  }

  /**
   * Returns the path to the file where the command is registered.
   * This is useful for debugging and understanding where the command is defined.
   */
  get filePath(): string {
    return this.#callExpression.getSourceFile().getFilePath();
  }

  /**
   * Returns the command registration as a JSON object.
   */
  toJSON(): CommandContribution {
    return CommandContributionSchema.parse({
      command: this.command,
      title: this.title,
      category: this.category,
    });
  }
}

/**
 * Checks if the given node is a command registration.
 * @param {CallExpression} node - The node to check.
 * @returns {boolean} - True if the node is a command registration, false otherwise.
 */
export function isCommandRegistration(
  node: CallExpression,
): node is CommandRegistrationCallExpression {
  return (
    node.getExpression().getText() === 'Command.register' &&
    node.getArguments().length > 0
  );
}
