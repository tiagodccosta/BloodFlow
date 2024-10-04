import { resolve as resolvePath } from 'path';

export const entry = './Frontend/src/index.js';
export const output = {
  path: resolvePath(__dirname, 'Frontend/dist'),
  filename: 'bundle.js',
};

export const module = {
  rules: [
    {
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    },
    {
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      exclude: /node_modules\/@firebase\/firestore/,
    },
  ],
};

export const resolve = {
  fallback: {
    "fs": false,
    "path": false,
    "os": false,
  },
};