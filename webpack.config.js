const path = require('path');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/scripts/module.ts'),
    },
    output: {
        path: path.resolve(__dirname, './dist/scripts'),
        filename: 'module.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            }
        ]
    }
};