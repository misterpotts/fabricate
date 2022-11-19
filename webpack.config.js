const path = require('path');

module.exports = {
    entry: './src/scripts/module.ts',
    output: {
        filename: 'module.js',
        path: path.resolve(__dirname, 'dist/'),
        publicPath: path.resolve(__dirname, 'dist/'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: [{ loader: require.resolve('ts-loader'), options: { transpileOnly: true } }],
            },
        ]
    },
    plugins: [],
};