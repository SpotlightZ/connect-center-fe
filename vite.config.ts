import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // zt tongji 172.22.192.143
        // target: 'http://172.22.192.143:8080',
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    {
      name: "replace-vue-with-version",
      transform(code, id) {
        // 只处理以 .vue 结尾的文件
        if (id.endsWith(".vue")) {
          code = code.replaceAll("__BUILD_VERSION__", new Date().toLocaleString().replaceAll(/\/|:/g, "").replace(' ', '-'));
          return code;
        }
      },
    },
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a ui5- as custom elements
          isCustomElement: tag => tag.indexOf('ui5-') !== -1
        },
        transformAssetUrls: {
          includeAbsolute: false,
        },
      }
    })
  ]
})
