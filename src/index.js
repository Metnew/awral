const actionCreator = status => ({dispatch, name, getState, ...rest}) => {
	dispatch({type: `${name}_${status.toUpperCase()}`, ...rest})
}

const getDefaultBehaviours = () => {
	const actions = ['pending', 'success', 'fail', 'finally', 'beforePending'].map(a => {
		return {[a]: actionCreator(a)}
	})

	const id = a => a
	const ids = ['meta', 'check', 'beforeCheck', 'afterCheck'].map(a => ({
		[a]: id
	}))

	return actions.concat(ids).reduce((a, b) => {
		return Object.assign({}, a, b)
	})
}

function Awral (asyncFunction) {
	return name => (...args) => (dispatch, getState) => {
		const meta = (this.meta.apply(null, args) || null)
		const defaultArgs = {dispatch, getState, name, meta}
		this.beforePending && this.beforePending(defaultArgs)
		this.pending && this.pending(defaultArgs)
		const preResult = this.beforeCheck.apply(null, args)
		return asyncFunction
			.apply(null, preResult)
			.then(res => {
				const isSuccess = this.check(res)
				const payload = this.afterCheck(res)

				if (isSuccess) {
					this.success({...defaultArgs, payload})
				} else {
					this.fail({...defaultArgs, payload, error: true})
				}
				this.finally && this.finally(defaultArgs)
			})
			// .catch(e => {
			// 	this.fail({...defaultArgs, payload: e, error: true})
			// })
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
