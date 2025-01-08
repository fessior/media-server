const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const WebPackIgnorePlugin = {
  checkResource: function (resource) {
    const lazyImports = [
      '@nestjs/microservices',
      '@nestjs/microservices/microservices-module',
      '@nestjs/websockets',
      '@nestjs/websockets/socket-module',
      'cache-manager',
      'class-transformer',
      'class-validator',
      'fastify-static',
    ];

    if (!lazyImports.includes(resource)) {
      return false;
    }

    try {
      require.resolve(resource);
    } catch (error) {
      return true;
    }

    return false;
  },
};

module.exports = {
  target: 'node',
  entry: {
    main: './src/main.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.build.json' })],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.IgnorePlugin(WebPackIgnorePlugin),
  ],
  optimization: {
    usedExports: true,
    nodeEnv: false,
  },
};
