const path = require('node:path');

module.exports = {
  assets: [
    path.resolve(__dirname, '../../packages/design-system/mobile/assets'), // Include fonts + images
  ],
  commands: [],
  dependencies: {
    'react-native-config': {
      root: path.join(__dirname, '../../'), // Points to monorepo root
    },
  },
  project: {
    android: {},
    ios: {},
  },
};
