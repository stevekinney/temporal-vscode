import { context } from 'esbuild';
import { build as vite } from 'vite';
import glob from 'fast-glob';
import path from 'path';
import * as fs from 'fs';
import { viteSingleFile } from 'vite-plugin-singlefile';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const __dirname = path.dirname(new URL(import.meta.url).pathname);

let watcher;

/**
 * @type {import('esbuild').Plugin}
 */
const buildViews = {
  name: 'build-views',
  async setup(build) {
    const ac = new AbortController();
    const { signal } = ac;

    build.onStart(async () => {
      console.log('[watch] watching views…');
      watcher = fs.watch(
        './src/views',
        { signal, recursive: true },
        async () => {
          console.log('[watch] views changed');
          const pages = await glob('./src/views/**/*.html');

          for (const page of pages) {
            /**
             * @type import('vite').BuildOptions
             */
            const options = {
              plugins: [viteSingleFile()],
              root: path.dirname(page),
              logLevel: 'error',
              build: {
                minify: production,
                sourcemap: !production,
                cssCodeSplit: false,
                assetsInlineLimit: 100000000,
                outDir: path.join(
                  __dirname,
                  'dist',
                  'views',
                  path.basename(path.dirname(page)),
                ),
              },
            };

            await vite(options);
          }
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
  watcher?.close();
  console.error(e);
  process.exit(1);
});
