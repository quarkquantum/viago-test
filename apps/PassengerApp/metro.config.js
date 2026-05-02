const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Packages that must exist as a single instance across the entire bundled output.
// Having two copies causes runtime errors like "property is not writable" with
// Reanimated/Gesture Handler/Worklets due to multiple C++ runtime registrations.
const singletonPackages = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-worklets',
];

// Canonical paths for singleton packages — always resolved from this app's node_modules.
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
    // extraNodeModules acts as a fallback — resolveRequest below overrides it
    // and is the authoritative first-pass singleton enforcer.
    extraNodeModules: singletonPaths,
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    /**
     * resolveRequest is called for EVERY module resolution.
     * Using it ensures singleton packages always resolve to the same physical
     * file regardless of which package (app, design-system, pnpm virtual store)
     * is asking — even when pnpm creates separate store instances.
     *
     * Strategy: when a singleton is requested, we pretend the import originates
     * from WITHIN the canonical package directory. Node resolution then traverses
     * upward and finds the canonical symlink in apps/PassengerApp/node_modules.
     */
    resolveRequest: (context, moduleName, platform) => {
      const singletonBase = singletonPackages.find(
        (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`)
      );
      const canonicalDir = singletonBase ? singletonPaths[singletonBase] : null;
      if (canonicalDir) {
        return context.resolveRequest(
          {
            ...context,
            // Anchor resolution inside the canonical package directory so
            // traversal upward will hit apps/PassengerApp/node_modules first.
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
