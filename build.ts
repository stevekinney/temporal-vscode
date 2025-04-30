import { BunPlugin } from 'bun';
import chalk from 'chalk';
import MagicString from 'magic-string';
import { watch } from 'node:fs/promises';

const args = {
  production:
    process.argv.includes('--production') ||
    process.env.NODE_ENV === 'production',
  watch: process.argv.includes('--watch'),
  verbose: process.argv.includes('--verbose'),
};

const handleError =
  (type: string) =>
  (...error: unknown[]) => {
    log.error(chalk.bgRed(type), ...error);
    if (!args.watch) {
      process.exit(1);
    }
  };

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
const log = {
  info: (...args: unknown[]) => console.log(chalk.cyan('[info]'), ...args),
  build: (...args: unknown[]) => console.log(chalk.blue('[build]'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('[error]'), ...args),
  warn: (...args: unknown[]) => console.warn(chalk.yellow('[warn]'), ...args),
  success: (...args: unknown[]) =>
    console.log(chalk.green('[success]'), ...args),
};

// Config for main extension build
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

async function build(withWebviews = false) {
  const startTime = performance.now();
  log.info(
    `Building extension in ${chalk.bgBlue(args.production ? 'production' : 'development')} mode…`,
  );

  try {
    const result = await Bun.build(buildConfig);

    if (!result.success) {
      return handleError('Extension Build Failed')(...result.logs);
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
    handleError('Extension Build Failed')(error);
  }
}

async function buildWebviews() {
  const webviews = new Bun.Glob('src/webviews/**/*.tsx');

  log.info('Building webviews…');

  for await (const file of webviews.scan()) {
    await buildWebview(file);
  }
}

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
    handleError('Webview Build Failed')(...result.logs);
  }

  log.success(`Built ${chalk.cyan(filePath)} to ${chalk.cyan(outputPath)}.`);
}

build(true);

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
