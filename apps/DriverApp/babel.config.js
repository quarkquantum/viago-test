module.exports = {
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@repo/server/rpc': '../server/dist/rpc.js',
          '@repo': '../../packages',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '../../.env', // Relative path from RN app to root .env
        safe: false,
        allowUndefined: true,
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin',
  ],
  presets: ['module:@react-native/babel-preset'],
};
