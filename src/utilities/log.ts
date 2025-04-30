import chalk from 'chalk';

export const log = {
  info: (...args: unknown[]) => console.log(chalk.cyan('[info]'), ...args),
  build: (...args: unknown[]) => console.log(chalk.blue('[build]'), ...args),
  error: (...args: unknown[]) => console.error(chalk.red('[error]'), ...args),
  warn: (...args: unknown[]) => console.warn(chalk.yellow('[warn]'), ...args),
  success: (...args: unknown[]) =>
    console.log(chalk.green('[success]'), ...args),
} as const;
