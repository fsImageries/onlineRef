const path = require('path');


module.exports = {
  entry: './src/index.js',
  // entry: ['regenerator-runtime/runtime.js', './src/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'docs'),
    publicPath: './',
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ['file-loader'],
      }
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
  devtool: "source-map",
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['', '.js', '.jsx'],
  },
  mode: 'development',
  devServer: {
    historyApiFallback: true,
    // disableDotRule: true
  },
};
