import chalk from 'chalk';
import { context, type Plugin } from 'esbuild';

import { createServer, build, type ViteDevServer } from 'vite';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const log = {
  info: (...args: unknown[]) => console.log(chalk.cyan('[watch]'), ...args),
  vite: (...args: unknown[]) => console.log(chalk.green('[vite]'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('[error]'), ...args),
};

let server: ViteDevServer | undefined;

const createUiServer = async () => {
  server = await createServer({
    configFile: './vite.config.ts',
    root: './ui',
    server: {
      port: 5555,
    },
  });

  log.vite('Starting Vite server...');

  server.watcher.on('change', (file) => {
    log.vite('UI changed:', chalk.blue(file));
  });

  server.bindCLIShortcuts();

  (await server.listen()).printUrls();

  process.on('exit', () => server?.close());
};

const buildUi = async () => {
  log.info('Building UI...');
  await build({
    configFile: './ui/vite.config.ts',
    root: './ui',
  });
};

if (production) {
  await buildUi();
} else {
  await createUiServer();
}

const esbuildProblemMatcherPlugin: Plugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      log.info('build started');
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        if (location) {
          log.error(
            `${text}\n\t\tat ${location.file}:${location.line}:${location.column}`,
          );
        } else {
          log.error(text);
        }
      });

      log.info('build finished');
    });
  },
};

try {
  const ctx = await context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: production ? false : 'inline',
    sourcesContent: false,
    platform: 'node',
    outdir: 'dist',
    outExtension: { '.js': '.cjs' },
    external: ['vscode'],
    loader: { '.html': 'text' },
    logLevel: 'silent',
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
