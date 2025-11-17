import type { StorybookConfig } from '@storybook/angular';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config: StorybookConfig = {
  stories: ['../stories/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  env: (cfg) => ({
    ...cfg,
    GOOGLE_API_KEY: (process.env['BALLWARE_GOOGLEKEY'] as string),
    DEVEXTREME_LICENSE_KEY: (process.env['BALLWARE_DEVEXTREMEKEY'] as string),
  })
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
