import { context } from 'esbuild';
import chalk from 'chalk';
import postcss from 'postcss';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const log = (...args) => console.log(chalk.cyan('[watch]'), ...args);
const error = (...args) => console.error(chalk.red('[error]'), ...args);

/**
 * @type {import('esbuild').Plugin}
 */
const postcssPlugin = {
  name: 'postcss',

  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const { css } = await postcss().process(args.contents, {
        from: args.path,
        to: args.path,
      });

      return { contents: css, loader: 'css' };
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
      log('build started');
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        error(
          `${text}\n\t\tat ${location.file}:${location.line}:${location.column}`,
        );
      });

      log('build finished');
    });
  },
};

async function main() {
  const ctx = await context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: production ? false : 'inline',
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
