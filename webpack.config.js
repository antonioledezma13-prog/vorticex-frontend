javascript
    // src/frontend/webpack.config.js
    const path = require('path');

    module.exports = {
      entry: './src/index.js',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
            }
          }
        ]
      },
      devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080
      }
    };