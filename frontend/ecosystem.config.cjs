module.exports = {
  apps: [{
    name: "eai-frontend",
    script: "npm",
    args: "run preview",
    env: {
      NODE_ENV: "production"
    }
  }]
} 