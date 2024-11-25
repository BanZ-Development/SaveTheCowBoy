const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Set to 'production' to enable minification by default
  entry: {
    admin: './public/js/admin.js',          // Entry point for 'app.js'
    bible: './public/js/bibleplans.js',      // Entry point for 'admin.js'
    cowboy: './public/js/cowboy.js',
    devotions: './public/js/devotions.js',
    forgot: './public/js/forgot.js', // Entry point for 'dashboard.js'
    forum: './public/js/forum.js',
    login: './public/js/login.js',
    logout: './public/js/logout.js',
    navbar: './public/js/navbar.js',
    profile: './public/js/profile.js',
    setting: './public/js/setting.js',
    settings: './public/js/settings.js',
    signup: './public/js/signup.js',
    slider: './public/js/slider.js',
    subscriber: './public/js/subscriber.js',
    success: './public/js/success.js',
    verify: './public/js/verify.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',    // Output files: app.min.js, admin.min.js, dashboard.min.js
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()], // Custom minifier (optional as 'production' mode does it by default)
  },
};