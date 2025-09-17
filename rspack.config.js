// Rspack configuration inspired by Artsy Force
// High-performance build system for production-grade applications

const { defineConfig } = require('@rspack/cli')
const { HtmlRspackPlugin } = require('@rspack/core')
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh')

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

module.exports = defineConfig({
  context: __dirname,
  entry: {
    main: './src/entry-client.tsx',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': './src',
      '@/components': './src/components',
      '@/services': './src/services',
      '@/types': './src/types',
      '@/utils': './src/utils',
      '@/lib': './src/lib',
      '@/pages': './src/pages',
      '@/contexts': './src/contexts',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets: [
                  'chrome >= 87',
                  'edge >= 88',
                  'firefox >= 78',
                  'safari >= 14',
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'builtin:lightningcss-loader',
            options: {
              targets: [
                'chrome >= 87',
                'edge >= 88', 
                'firefox >= 78',
                'safari >= 14',
              ],
            },
          },
        ],
        type: 'css',
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: 'asset',
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './index.html',
      favicon: './public/vite.svg',
      inject: 'body',
      scriptLoading: 'defer',
      minify: isProd,
    }),
    ...(isDev ? [new ReactRefreshPlugin()] : []),
  ],
  optimization: {
    minimize: isProd,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  output: {
    filename: isDev 
      ? '[name].js' 
      : 'static/js/[name].[contenthash:8].js',
    chunkFilename: isDev
      ? '[name].chunk.js'
      : 'static/js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'static/media/[name].[contenthash:8][ext]',
    clean: true,
    publicPath: '/',
  },
  devServer: {
    port: 5173,
    hot: true,
    open: false,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      stats: 'errors-warnings',
    },
  },
  devtool: isDev ? 'cheap-module-source-map' : 'source-map',
  stats: {
    preset: 'errors-warnings',
    moduleTrace: true,
    errorDetails: true,
  },
  performance: {
    hints: isProd ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  experiments: {
    css: true,
  },
})
