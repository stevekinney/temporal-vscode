const esbuild = require('esbuild');

const fs = require('fs');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

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

/**
 * Custom plugin to copy assets from 'assets' to 'dist'
 * @type {import('esbuild').Plugin}
 */
const copyAssetsPlugin = {
  name: 'copy-assets',

  setup(build) {
    build.onEnd(() => {
      const assetsDir = path.join(__dirname, 'assets');
      const distDir = path.join(__dirname, 'dist');

      // Ensure the dist directory exists
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
      }

      // Copy all files from assets to dist
      fs.readdir(assetsDir, (err, files) => {
        if (err) {
          console.error('Error reading assets directory:', err);
          return;
        }

        files.forEach((file) => {
          const srcPath = path.join(assetsDir, file);
          const destPath = path.join(distDir, file);

          fs.copyFile(srcPath, destPath, (err) => {
            if (err) {
              console.error(`Error copying ${file}:`, err);
            }
          });
        });
      });
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
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
    plugins: [copyAssetsPlugin, esbuildProblemMatcherPlugin],
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
