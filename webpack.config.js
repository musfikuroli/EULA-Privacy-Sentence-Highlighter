const path = require("path");

module.exports = {
  entry: "./contentScript.js", // Adjust the entry point as needed
  mode: "production", // Change to 'production' for minification
  devtool: "source-map", // Generate source maps for better debugging
  output: {
    filename: "contentBundle.js", // Name of the bundled file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
};
