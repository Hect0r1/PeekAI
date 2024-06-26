import { type ManifestV3Export } from "@crxjs/vite-plugin";

export const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "peekAI",
  description: "A simple extension to peeks into your current tab",
  version: "1.0.0",
  action: { default_popup: "index.html" },
  permissions: ["storage", "tabs", "activeTab"],
  // background: {
  //   service_worker: "src/utils/background.ts",
  //   type: "module",
  // },
  icons: {
    16: "icons/16.png",
    32: "icons/32.png",
    48: "icons/48.png",
    128: "icons/128.png",
  },
  // host_permissions: [""],
};
