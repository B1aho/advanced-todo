const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
    }),
  ],
  module: {
    rules: [
      {
        oneOf: [
          // Правило для импорта CSS как строки
          {
            resourceQuery: /raw/, // Если импорт с запросом ?raw
            test: /\.css$/i,
            use: ['raw-loader'], // Обрабатываем через raw-loader
          },
          // Стандартное правило для обработки CSS
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'], // Используем style-loader и css-loader
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
};
