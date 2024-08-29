import { context } from 'esbuild';
import { build as vite } from 'vite';
import glob from 'fast-glob';
import path from 'path';
import * as fs from 'fs';
import { viteSingleFile } from 'vite-plugin-singlefile';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {AbortController} */
let abortController;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
};

const getViews = () => {
  const views = fg.globSync('./src/views/**/index.html');

  const input = views.reduce((acc, view) => {
    const name = toCamelCase(view.split('/').slice(-2)[0]);
    acc[name] = resolve(view);
    return acc;
  }, {});

  return input;
};

let watcher;

/**
 * @type {import('esbuild').Plugin}
 */
const buildViews = {
  name: 'build-views',
  async setup(build) {
    abortController = new AbortController();
    const { signal } = abortController;

    build.onStart(async () => {
      console.log('[watch] watching views…');
      watcher = fs.watch(
        './src/views',
        { signal, recursive: true },
        async () => {
          console.log('[watch] views changed');

          const options = {
            plugins: [viteSingleFile()],
            root: path.dirname(page),
            logLevel: 'error',
            build: {
              input: getViews(),
              minify: production ? true : false,
              sourcemap: production ? false : 'inline',
              cssCodeSplit: false,
              assetsInlineLimit: Infinity,
              outDir: path.join(
                __dirname,
                'dist',
                'views',
                path.basename(path.dirname(page)),
              ),
            },
          };

          await vite(options);
        },
      );
    });
  },
};

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`,
        );
      });
      console.log('[watch] build finished');
    });
  },
};

async function main() {
  const ctx = await context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [buildViews, esbuildProblemMatcherPlugin],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  if (abortController) {
    abortController.abort();
  }

  watcher?.close();
  console.error(e);
  process.exit(1);
});
