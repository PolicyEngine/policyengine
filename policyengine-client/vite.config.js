import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import mdPlugin from "vite-plugin-markdown";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          "primary-color": "#2c6496",
          "primary-1": "#fff",
          "link-color": "#002766",
          "success-color": "#0DD078",
          "border-radius-base": "40px",
        },
        additionalData: "@root-entry-name: default;",
      },
    },
  },
  plugins: [
    mdPlugin({
      mode: "html",
      markdown: (body) => body,
    }),
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
});
