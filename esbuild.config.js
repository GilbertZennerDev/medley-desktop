import esbuild from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

const commonOptions = {
  bundle: true,
  minify: isProduction,
  sourcemap: !isProduction,
  external: ['electron'],
};

async function build() {
  try {
    // Build Renderer (React bundle)
    console.log('Building renderer...');
    await esbuild.build({
      entryPoints: ['src/renderer/index.tsx'],
      outfile: 'dist/renderer/bundle.js',
      ...commonOptions,
      jsx: 'automatic',
      jsxImportSource: 'react',
    });

    console.log('✓ Renderer built successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
