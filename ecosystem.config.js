export default {
  apps: [
    {
      name: 'pixelgg-api',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/pixelgg/error.log',
      out_file: '/var/log/pixelgg/out.log',
      log_file: '/var/log/pixelgg/combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'dist'],
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
