const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Keep a single physical instance for runtime-sensitive packages.
const singletonPackages = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-worklets',
];

const singletonPaths = Object.fromEntries(
  singletonPackages.map((pkg) => [pkg, path.resolve(projectRoot, 'node_modules', pkg)])
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules'), path.resolve(monorepoRoot, 'node_modules')],
    extraNodeModules: singletonPaths,
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    resolveRequest: (context, moduleName, platform) => {
      const canonicalDir = singletonPaths[moduleName];
      if (canonicalDir) {
        return context.resolveRequest(
          {
            ...context,
            originModulePath: path.join(canonicalDir, 'package.json'),
          },
          moduleName,
          platform
        );
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
