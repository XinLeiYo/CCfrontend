module.exports = {
  apps : [{
    name: "cc-frontend",
    // 直接找到專案內的 serve 執行腳本
    script: "./node_modules/serve/build/main.js", 
    args: "-s dist -l 5173",
    // 強制指定用 node 執行，不透過 shell 轉手
    interpreter: "node", 
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
}