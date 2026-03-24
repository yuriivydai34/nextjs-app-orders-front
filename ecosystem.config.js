module.exports = {
  apps: [{
    name: "nextjs-app-orders-front",
    script: "./.next/standalone/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
}
