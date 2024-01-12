// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development', // add this line to set the mode to 'development'
  entry: './workers/embeddingModel.js', // replace with the path to your worker file
  output: {
    filename: 'worker.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  target: 'webworker',
};