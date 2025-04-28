import prettier from 'prettier';

const prettierOptions = (await prettier.resolveConfig('.prettierrc')) || {};

/**
 * Format content using Prettier.
 */
export async function formatContent(
  content: string,
  parser = 'typescript',
): Promise<string> {
  return prettier.format(content, { ...prettierOptions, parser });
}

export async function formatFile(
  filePath: string,
  parser = 'typescript',
): Promise<void> {
  const content = await Bun.file(filePath).text();
  const formattedContent = await formatContent(content, parser);

  await Bun.write(filePath, formattedContent);
}
