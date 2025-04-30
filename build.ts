import { BunPlugin } from 'bun';
import chalk from 'chalk';
import MagicString from 'magic-string';
import { watch } from 'node:fs/promises';

import { log } from './src/utilities/log';

/**
 * Arguments for the build script.
 */
const args = {
  production:
    process.argv.includes('--production') ||
    process.env.NODE_ENV === 'production',
  watch: process.argv.includes('--watch'),
  verbose: process.argv.includes('--verbose'),
} as const;

/**
 * Logs the error message and exits the process if not in watch mode.
 */
const handleError = (type: string, ...error: unknown[]) => {
  log.error(chalk.bgRed(type), ...error);
  if (!args.watch) {
    process.exit(1);
  }
};

/**
 * This plugin is used to add in React and createRoot to the webview files.
 * This allows us to import a complete bundle of React and ReactDOM in the webview files.
 * This is necessary because the webview files are not bundled with the rest of the extension.
 * The webview files are loaded in the browser context, so we need to make sure that React and ReactDOM are available.
 */
const webview: BunPlugin = {
  name: 'webviews',
  setup(build) {
    build.onLoad({ filter: /\.tsx$/ }, async (args) => {
      const source = await Bun.file(args.path).text();

      const s = new MagicString(source);

      s.append('\n');
      s.append('export { React };\n');
      s.append(`export { createRoot } from 'react-dom/client';\n`);

      return {
        contents: s.toString(),
        loader: 'tsx',
      };
    });
  },
};

// Logger with color-coded categories

/**
 * Build configuration for the extension.
 * This configuration is used to build the extension using Bun.
 * It specifies the entry points, output format, and other options.
 * The configuration is used to build the extension in both production and development modes.
 */
const buildConfig = {
  entrypoints: ['src/extension.ts'],
  format: 'cjs',
  naming: '[name].cjs',
  minify: args.production,
  sourcemap: args.production ? 'none' : 'inline',
  outdir: 'dist',
  external: ['vscode'],
  splitting: false,
  env: 'inline',
  target: 'node',
} satisfies Bun.BuildConfig;

/**
 * Builds the extension using the specified configuration.
 * @param withWebviews Whether to build webviews or not after the initial build completes.
 */
async function build(withWebviews = false) {
  const startTime = performance.now();
  log.info(
    `Building extension in ${chalk.bgBlue(args.production ? 'production' : 'development')} mode…`,
  );

  try {
    const result = await Bun.build(buildConfig);

    if (!result.success) {
      return handleError('Extension Build Failed', ...result.logs);
    }

    const endTime = performance.now();
    const buildTime = (endTime - startTime).toFixed(0);

    log.success(`Build completed in ${chalk.yellow(buildTime)}ms`);

    if (args.verbose) {
      log.info('Output files:');
      for (const output of result.outputs) {
        log.info(`- ${output.path}`);
      }
    }

    if (withWebviews) {
      await buildWebviews();
    }
  } catch (error) {
    handleError('Extension Build Failed', error);
  }
}

/**
 * Builds the webviews for the extension.
 * This function scans the webview files and builds them using Bun.
 * The webview files are located in the `src/webviews` directory.
 */
async function buildWebviews() {
  /** All of the webviews in `src/webviews` as an `AsyncIterableIterator`. */
  const webviews = new Bun.Glob('src/webviews/**/*.tsx');

  log.info('Building webviews…');

  for await (const file of webviews.scan()) {
    await buildWebview(file);
  }
}

/**
 * Build an individual webview.
 * @param file The file to build.
 */
async function buildWebview(file: string) {
  const filePath = file.replace('src/webviews/', '');
  const outputPath = `dist/${filePath.replace('.tsx', '.js')}`;

  log.build(`Building webview: ${chalk.blue(filePath)}…`);

  const result = await Bun.build({
    entrypoints: [file],
    format: 'esm',
    naming: '[name].js',
    minify: args.production,
    sourcemap: args.production ? 'none' : 'inline',
    outdir: 'dist',
    splitting: false,
    plugins: [webview],
    env: 'inline',
    target: 'browser',
  });

  if (!result.success) {
    log.error(`Build failed for ${chalk.magenta(filePath)}`);
    for (const message of result.logs) {
      log.error(message);
    }
    handleError('Webview Build Failed', ...result.logs);
  }

  log.success(`Built ${chalk.cyan(filePath)} to ${chalk.cyan(outputPath)}.`);
}

/**
 * Main function to run the build script.
 * This function is called when the script is run.
 */
build(true);

// If the --watch flag is passed, watch for file changes and rebuild the extension.
if (args.watch) {
  log.info('Watching for file changes…');

  const watcher = watch('src', {
    recursive: true,
  });

  for await (const event of watcher) {
    if (event.eventType === 'change') {
      //bun.sh/docs/runtime/bunfig#loader
      log.build(
        'File changed:',
        chalk.magenta(event.filename),
        chalk.yellow(event.eventType),
      );

      if (event.filename?.endsWith('.tsx')) {
        log.info(
          chalk.yellow('Rebuilding webview…', chalk.magenta(event.filename)),
        );
        await buildWebview(event.filename);
      }

      log.info(chalk.green('Rebuilding…'));
      build();
    }
  }
}
