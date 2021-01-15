// const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const rootDir = process.cwd();
const distDir = `${rootDir}/dist/wpk`;

console.log({ rootDir, distDir });

module.exports = {
  mode: 'development',
  entry: `./src/index.tsx`,
  output: {
    path: distDir,
    filename: 'bundle.js',
    publicPath: '',
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({}),
      // new HtmlWebpackPlugin(),
    ],
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  devServer: {
    contentBase: __dirname,
    port: 3000,
  },
};
