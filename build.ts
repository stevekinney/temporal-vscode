import chalk from 'chalk';

const args = {
  production:
    process.argv.includes('--production') ||
    process.env.NODE_ENV === 'production',
  watch: process.argv.includes('--watch'),
  verbose: process.argv.includes('--verbose'),
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

async function build() {
  const startTime = performance.now();
  log.info(
    `Building extension in ${args.production ? 'production' : 'development'} mode...`,
  );

  try {
    const result = await Bun.build(buildConfig);

    if (!result.success) {
      log.error('Build failed');
      for (const message of result.logs) {
        log.error(message);
      }
      process.exit(1);
    }

    const endTime = performance.now();
    const buildTime = (endTime - startTime).toFixed(0);

    log.success(`Build completed in ${buildTime}ms`);

    if (args.verbose) {
      log.info('Output files:');
      for (const output of result.outputs) {
        log.info(`- ${output.path}`);
      }
    }
  } catch (error) {
    log.error('Build failed with an unexpected error:');
    log.error(error);
    process.exit(1);
  }
}

// Run the build
build().catch((error) => {
  log.error('Unhandled error during build:');
  log.error(error);
  process.exit(1);
});
