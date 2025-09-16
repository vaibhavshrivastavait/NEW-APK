const path = require('path');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['react-native-web']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native': 'react-native-web',
    }
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 600,
    poll: 1000  // Use polling with 1 second interval
  }
};