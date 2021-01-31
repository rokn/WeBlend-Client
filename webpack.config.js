const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    watch: true,

    devtool: 'eval-source-map',

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },

    resolve: {
        modules: ['src', 'node_modules']
    },

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    }
};