import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const manifest = defineManifest({
  manifest_version: 3,
  name: "vite-react-shadowdom-plugin",
  version: "1.0.0",
  permissions: ["storage", "alarms", "tabs"],
  // background: {
  //   service_worker: "src/background-script/background.ts",
  //   type: "module",
  // },
  content_scripts: [
    {
      js: ["src/content.tsx"],
      matches: ["http://*/*", "https://*/*"],
    },
  ],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
