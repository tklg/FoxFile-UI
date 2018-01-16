const webpack = require('webpack');
var node_env = (process.env.NODE_ENV || 'development').trim();
var is_dev = node_env == 'development';

var dest = '/build/js';
dest = '/../foxfile/src/public/js'

module.exports = {
    resolve: {
        //root: __dirname,
        modules: ["./src/js/", "./node_modules/"]
    },
    entry: {
        foxfile: './src/js/foxfile.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: __dirname + dest
    },
    module: {
	 	loaders: [
            /*{
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: [
                        'env',
                        'es2015'
                    ]
                }
            }*/
           { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
	//	   { test: /\.vue?$/, loader: 'vue-loader', exclude: /node_modules/ },
		   //{ test: /\.css$/, loader: 'style-loader!css-loader' },
		   //{ test: /\.less$/, loader: 'style-loader!css-loader!less-loader'}
	   ]
	},
    plugins: is_dev ? [] : [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(node_env),
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            mangle: true,
            compress: {
                warnings: false,
            }
        }),
    ]
}