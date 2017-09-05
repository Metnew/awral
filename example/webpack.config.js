'use strict'

const webpack = require('webpack')

module.exports = {
	context: __dirname,
	entry: './src/index.js',
	plugins: [new webpack.NamedModulesPlugin()]
}
