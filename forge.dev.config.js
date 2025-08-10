const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    name: "Smart Dating Assistant",
    executableName:
      process.platform === "win32"
        ? "Smart Dating Assistant"
        : "Smart Dating Assistant",
    appBundleId: "com.smartdating.assistant",
    appCategoryType: "public.app-category.social-networking",
    icon: path.resolve(__dirname, "assets", "icons", "trustdating"),
    osxSign: false,
    osxNotarize: false,
    protocols: [
      {
        name: "Smart Dating Assistant",
        schemes: ["smart-dating"],
      },
    ],
    ignore: [
      /^\/renderer(?!-dist)/,
      /^\/src(?!\/ai)/,
      /\.ts$/,
      /\.tsx$/,
      /^\/manual-package\.sh$/,
      /^\/forge\.config\.js$/,
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/\.env$/,
    ],
    asarUnpack: [
      "**/node_modules/sqlite3/**/*",
      "**/node_modules/@google/generative-ai/**/*",
      "**/node_modules/screenshot-desktop/**/*",
      "**/node_modules/node-notifier/**/*",
    ],
  },
  rebuildConfig: {
    force: true,
    types: ["prod", "optional"],
    onlyModules: ["sqlite3", "screenshot-desktop", "node-notifier"],
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        name: "Smart Dating Assistant",
        title: "Smart Dating Assistant",
        icon: path.resolve(__dirname, "assets", "icons", "trustdating.icns"),
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {
        packageManager: "npm",
      },
    },
    {
      name: "@electron-forge/plugin-fuses",
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      },
    },
  ],
};
