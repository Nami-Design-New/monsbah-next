module.exports = {
  apps: [
    {
      name: 'monsbah',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/monsbah', // Update this path to your actual deployment directory
      instances: 1, // or 'max' for cluster mode
      exec_mode: 'fork', // or 'cluster'
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
