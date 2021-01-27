const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/scripts/module.ts',
    output: {
        filename: 'scripts/module.js',
        path: path.resolve(__dirname, 'module/scripts/'),
        publicPath: path.resolve(__dirname, 'module/scripts/'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /.ts?$/,
                exclude: /node_modules/,
                use: [{ loader: require.resolve('ts-loader'), options: { transpileOnly: true } }],
            },
        ]
    },
    plugins: [],
    devtool: 'eval-source-map'
};