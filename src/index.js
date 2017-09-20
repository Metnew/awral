const actionCreator = status => ({dispatch, getState, name, ...rest}) => {
	dispatch({type: `${name}_${status.toUpperCase()}`, ...rest})
}

const actions = ['pending', 'success', 'fail', 'finally']
	.map(a => {
		return {[a]: actionCreator(a)}
	})
	.reduce((a, b) => {
		return Object.assign({}, a, b)
	})

const id = a => a
const ids = ['createMeta', 'check', 'beforeCheck', 'afterCheck']
	.map(a => ({[a]: id}))
	.reduce((a, b) => {
		return Object.assign({}, a, b)
	})

const behaviours = {
	...actions,
	...ids
}

function Awral (asyncFunction) {
	return name => (...args) => async (dispatch, getState) => {
		const defaultArgs = {dispatch, getState, name}
		const meta = this.createMeta(args)
		this.pending({...defaultArgs, meta})
		const preResult = this.beforeCheck.apply(args)
		const obtainedResult = await asyncFunction.apply(preResult)
		const isSuccess = this.check(obtainedResult)
		const payload = this.afterCheck(obtainedResult)

		if (isSuccess) {
			this.success({...defaultArgs, payload, meta})
		} else {
			this.fail({...defaultArgs, payload, error: true, meta})
		}
		this.finally({...defaultArgs, meta})
	}
}

const ofFn = function (newMethods = {}) {
	const methods = {...this.methods, ...newMethods}
	const bindedAwral = Awral.bind(methods)
	bindedAwral.methods = methods
	bindedAwral.of = ofFn.bind(bindedAwral)
	return bindedAwral
}

export default ofFn.call({methods: behaviours})
