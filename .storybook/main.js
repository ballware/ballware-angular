module.exports = {
  addons: ['@storybook/preset-scss', 'storybook-addon-angular-router'],
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //   // Make whatever fine-grained changes you need that should apply to all storybook configs

  //   // Return the altered config
  //   return config;
  // },
  core: {
    builder: 'webpack5',
  },
};
