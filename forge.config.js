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
    // macOS specific options to reduce security issues
    osxSign: false,
    osxNotarize: false,
    protocols: [
      {
        name: "Smart Dating Assistant",
        schemes: ["smart-dating"],
      },
    ],
    // Include renderer-dist and exclude unnecessary files
    ignore: [
      /^\/renderer(?!-dist)/, // Ignore renderer source but keep renderer-dist
      /^\/src/, // Ignore src directory entirely (we include built version in build/)

      /\.ts$/, // Ignore TypeScript source files
      /\.tsx$/, // Ignore TypeScript React source files
      /^\/manual-package\.sh$/,
      /^\/forge\.config\.js$/,
      /^\/forge\.dev\.config\.js$/,
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/\.env$/,
      /^\/assets\/fonts\/DM_Sans\/static/, // Ignore all static font files
      /^\/assets\/fonts\/DM_Sans\/.*\.ttf$/, // Ignore individual ttf files
      "!assets/fonts/DM_Sans/DMSans-VariableFont_opsz,wght.ttf", // Keep only variable fonts
      "!assets/fonts/DM_Sans/DMSans-Italic-VariableFont_opsz,wght.ttf",
    ],
    // Unpack native modules that need to be accessible at runtime
    asarUnpack: [
      "**/node_modules/sqlite3/**/*",
      "**/node_modules/@google/generative-ai/**/*",
      "**/node_modules/screenshot-desktop/**/*",
      "**/node_modules/node-notifier/**/*",
    ],
    // Only include essential production dependencies
    prune: true,
    extraResource: [
      "assets/fonts/DM_Sans/DMSans-VariableFont_opsz,wght.ttf",
      "assets/fonts/DM_Sans/DMSans-Italic-VariableFont_opsz,wght.ttf",
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
        title: "Smart Dating Assistant",
        icon: path.resolve(__dirname, "assets", "icons", "trustdating.icns"),
        contents: [
          { x: 448, y: 344, type: "link", path: "/Applications" },
          {
            x: 192,
            y: 344,
            type: "file",
            path: path.resolve(
              __dirname,
              "out",
              "Smart Dating Assistant-darwin-arm64",
              "Smart Dating Assistant.app"
            ),
          },
        ],
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
        draft: false,
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
        packageManager: "npm",
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
