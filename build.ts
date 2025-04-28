import chalk from 'chalk';

const production = process.argv.includes('--production');

const log = {
  info: (...args: unknown[]) => console.log(chalk.cyan('[watch]'), ...args),
  vite: (...args: unknown[]) => console.log(chalk.green('[vite]'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('[error]'), ...args),
};

try {
  Bun.build({
    entrypoints: ['src/extension.ts'],
    format: 'cjs',
    naming: '[name].cjs',
    minify: production,
    sourcemap: production ? false : 'inline',
    outdir: 'dist',
    external: ['vscode'],
    splitting: false,
    env: 'inline',
    target: 'node',
  });
} catch (e) {
  log.error(e);
  process.exit(1);
}
