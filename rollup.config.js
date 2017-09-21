import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const isProd = env === 'production'
const productionPlugins = isProd
	? [
		uglify({
			compress: {
				pure_getters: true,
				dead_code: true,
				unsafe: true,
				unsafe_comps: true,
				warnings: false
			}
		})
	]
	: []

const config = {
	format: 'umd',
	moduleName: 'Awral',
	plugins: [
		babel(),
		replace({
			'process.env.NODE_ENV': JSON.stringify(env)
		})
	].concat(productionPlugins)
}

export default config
