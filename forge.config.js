const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

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
    protocols: [
      {
        name: "Smart Dating Assistant",
        schemes: ["smart-dating"],
      },
    ],
    // Include renderer-dist and exclude unnecessary files
    ignore: [
      /^\/renderer(?!-dist)/, // Ignore renderer source but keep renderer-dist
      /^\/src$/, // Ignore src directory
      /\.ts$/, // Ignore TypeScript source files
      /\.tsx$/, // Ignore TypeScript React source files
      /node_modules\/(?!(@google\/generative-ai|auto-launch|axios|chokidar|clipboardy|electron-next|electron-squirrel-startup|electron-store|natural|next|node-notifier|react|react-dom|screenshot-desktop|sentiment|sqlite3|zustand))/,
    ],
    // Remove Sharp and other native modules we no longer use
    asarUnpack: [
      "**/node_modules/sqlite3/**/*",
      "**/node_modules/better-sqlite3/**/*",
    ],
  },
  rebuildConfig: {
    // Rebuild native modules for the target platform
    force: true,
    types: ["prod", "optional"],
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "smart-dating-assistant",
        authors: "Smart Dating Assistant Team",
        description: "Your privacy-focused dating conversation helper",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
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
