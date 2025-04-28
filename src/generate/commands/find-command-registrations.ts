import { Project, SyntaxKind } from 'ts-morph';
import {
  CommandRegistration,
  isCommandRegistration,
} from './command-registration';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles('src/**/*.ts');

/**
 * Generates command registrations from the source files.
 * This function goes through all the source files and finds all the command registrations.
 * It then registers them and adds them to the commands array.
 */
export async function generateCommandRegistrations(): Promise<
  CommandRegistration[]
> {
  // Go through all the source files and find all the command registrations.
  for (const sourceFile of sourceFiles) {
    // Find all of the call expressions in the source file.
    const callExpressions = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    );

    // Filter the call expressions to only those that are command registrations.
    for (const callExpression of callExpressions) {
      try {
        // Check if the call expression is a command registration.
        if (isCommandRegistration(callExpression)) {
          // Register the command registration.
          CommandRegistration.register(callExpression);
        }
      } catch (error) {
        console.error(
          `Error processing command in ${sourceFile.getFilePath()}.`,
        );
        throw error;
      }
    }
  }

  return Array.from(CommandRegistration.commands);
}
