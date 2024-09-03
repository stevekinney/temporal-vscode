import chalk from 'chalk';
import { context, type Plugin } from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const log = (...args: unknown[]) => console.log(chalk.cyan('[watch]'), ...args);
const error = (...args: unknown[]) => console.error(chalk.red('[error]'), ...args);

const esbuildProblemMatcherPlugin: Plugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      log('build started');
    });

    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        if (location) {
          error(
            `${text}\n\t\tat ${location.file}:${location.line}:${location.column}`,
          );
        } else {
          error(text);
        }
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
    outdir: 'dist',
    outExtension: { '.js': '.cjs' },
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
