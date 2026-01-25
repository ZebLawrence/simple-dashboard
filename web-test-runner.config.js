import { esbuildPlugin } from '@web/dev-server-esbuild';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  concurrency: 1,
  browsers: [
    puppeteerLauncher({
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    }),
  ],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2021',
      tsconfig: './tsconfig.json',
    }),
  ],
};
