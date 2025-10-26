// Use explicit require() form to ensure postcss-loader resolves the wrapper plugin
// Some environments prefer array or require() syntax instead of name-keys.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
