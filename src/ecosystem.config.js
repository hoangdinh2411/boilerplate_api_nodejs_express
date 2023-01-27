module.exports = {
  apps: [
    {
      name: 'base-api',
      script: 'npm',
      args: 'start',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
