// @flow
const actionCreator = (status: string) => ({dispatch, getState, name, ...rest}) => {
	dispatch({type: `${name}_${status.toUpperCase()}`, ...rest})
}

const getDefaultBehaviours = () => {
	const actions = ['pending', 'success', 'fail', 'finally'].map(a => {
		return {[a]: actionCreator(a)}
	})

	const id = a => a
	const ids = ['createMeta', 'check', 'beforeCheck', 'afterCheck'].map(a => ({
		[a]: id
	}))

	return actions.concat(ids).reduce((a, b) => {
		return Object.assign({}, a, b)
	})
}

function Awral (asyncFunction) {
	return name => (...args) => async (dispatch, getState) => {
		const meta = this.createMeta(args)
		const defaultArgs = {dispatch, getState, name, meta}
		this.pending(defaultArgs)
		const preResult = this.beforeCheck.apply(null, args)
		const obtainedResult = await asyncFunction.apply(null, preResult)
		const isSuccess = this.check(obtainedResult)
		const payload = this.afterCheck(obtainedResult)

		if (isSuccess) {
			this.success({...defaultArgs, payload})
		} else {
			this.fail({...defaultArgs, payload, error: true})
		}
		this.finally(defaultArgs)
	}
}

const ofFn = function (newBehaviours = {}) {
	const behaviours = {...this.behaviours, ...newBehaviours}
	const bindedAwral = Awral.bind(behaviours)
	bindedAwral.behaviours = behaviours
	bindedAwral.of = ofFn.bind(bindedAwral)
	return bindedAwral
}

export default ofFn.call({behaviours: getDefaultBehaviours()})
