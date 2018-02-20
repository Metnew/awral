const actionCreator = status => ({dispatch, name, getState, ...rest}) => {
	dispatch({type: `${name}_${status.toUpperCase()}`, ...rest})
}

const getDefaultBehaviours = () => {
	const actions = [
		'pending',
		'success',
		'fail',
		'finally',
		'failBeforePending'
	].map(a => ({[a]: actionCreator(a)}))
	const ids = ['meta', 'check', 'fnPayload', 'afterCheck', 'resolve'].map(
		a => ({
			[a]: x => x
		})
	)

	return actions.concat(ids).reduce((a, b) => Object.assign({}, a, b))
}

function Awral (asyncFunction) {
	return name => (...args) => (dispatch, getState) => {
		const basicArgs = {dispatch, getState, name, _: this._}
		const meta = this.meta.apply(basicArgs, args) || null
		const defaultArgs = {...basicArgs, meta}

		if (this.failBeforePending) {
			const failBeforePendingPayload = this.failBeforePending.apply(
				defaultArgs,
				args
			)
			if (failBeforePendingPayload) {
				return this.fail({
					...defaultArgs,
					payload: failBeforePendingPayload,
					error: true
				})
			}
		}
		this.pending && this.pending(defaultArgs)
		const preResult = this.fnPayload.apply(defaultArgs, args)

		let res

		try {
			const asyncFnWrapped = await asyncFunction(preResult)
			res = await dispatch(asyncFnWrapped)
		} catch (e) {
			throw new Error('Awral caught error in async action:', e)
		}

		const isSuccess = this.check(res)
		const status = isSuccess ? 'success' : 'fail'
		const payload = this.afterCheck(res)

		if (isSuccess) {
			this.success({...defaultArgs, payload, status})
		} else {
			this.fail({...defaultArgs, payload, status})
		}
		this.finally && this.finally(defaultArgs)

		return this.resolve({payload, status})
	}
}

const defaultBehaviours = getDefaultBehaviours()
const ofFn = function(newBehaviours = {}) {
	const behaviours = {
		...this.behaviours,
		...newBehaviours,
		_: defaultBehaviours
	}
	const bindedAwral = Awral.bind(behaviours)
	bindedAwral.behaviours = behaviours
	bindedAwral.of = ofFn.bind(bindedAwral)
	return bindedAwral
}

export default ofFn.call({behaviours: defaultBehaviours})
