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
    // Base icon (no extension). Ensure trustdating.icns (mac) and trustdating-icon.ico (win) exist
    icon: path.resolve(__dirname, "assets", "icons", "trustdating"),
    protocols: [
      {
        name: "Smart Dating Assistant",
        schemes: ["smart-dating"],
      },
    ],
    // Include renderer-dist and exclude unnecessary files
    ignore: [
      /^\/renderer(?!-dist)/, // Ignore renderer source but keep renderer-dist
      /^\/src(?!\/ai)/, // Ignore src directory but keep src/ai
      /\.ts$/, // Ignore TypeScript source files
      /\.tsx$/, // Ignore TypeScript React source files
      /^\/manual-package\.sh$/,
      /^\/forge\.config\.js$/,
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/\.env$/,
    ],
    // Unpack native modules that need to be accessible at runtime
    asarUnpack: [
      "**/node_modules/sqlite3/**/*",
      "**/node_modules/@google/generative-ai/**/*",
      "**/node_modules/screenshot-desktop/**/*",
      "**/node_modules/node-notifier/**/*",
    ],
  },
  rebuildConfig: {
    // Rebuild native modules for the target platform
    force: true,
    types: ["prod", "optional"],
    onlyModules: ["sqlite3", "screenshot-desktop", "node-notifier"],
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "smart-dating-assistant",
        authors: "Smart Dating Assistant Team",
        description: "Your privacy-focused dating conversation helper",
        // Windows installer icon
        setupIcon: path.resolve(
          __dirname,
          "assets",
          "icons",
          "trustdating-icon.ico"
        ),
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        name: "Smart Dating Assistant",
        // Keep DMG title <=27 chars to satisfy appdmg
        title: "Smart Dating Assistant",
        // DMG window icon (optional but nice)
        icon: path.resolve(__dirname, "assets", "icons", "trustdating.icns"),
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "abhi-yo",
          name: "trust-dating",
        },
        draft: true,
        prerelease: false,
        tagPrefix: "v",
        // Read token at runtime (CLI and CI). Ensure GH_TOKEN is set.
        authToken: process.env.GH_TOKEN,
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {
        // Ensure native modules are properly unpacked
        packageManager: "pnpm",
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
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
