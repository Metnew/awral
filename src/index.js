class Wrapper {
	pending () {}
	transformBeforeCheck () {}
	check () {}
	transformAfterCheck () {}
	success () {}
	fail () {}
	finally () {}
}

let Awral = function Awral (asyncFunction) {
	var self = this
	return name => (...args) => async (dispatch, getState) => {
		console.log(self, this)
		const defaultArgs = {dispatch, getState, name}
		self._pending({...defaultArgs, payload: {args}})
		const preResult = self._transformBeforeCheck.apply(args)
		const obtainedResult = await asyncFunction.apply(preResult)
		const isSuccess = self._check(obtainedResult)
		const result = self._transformAfterCheck(obtainedResult)

		if (isSuccess) {
			self._success({...defaultArgs, payload: {args, result}})
		} else {
			self._fail({...defaultArgs, payload: {args, result}})
		}
		self._finally({...defaultArgs, payload: {args, result}})
	}
}

const actionCreator = status => ({dispatch, name, payload}) => {
	dispatch({type: `${name}_${status.toUpperCase()}`}, payload)
}

const actionsCreators = ['pending', 'success', 'fail', 'finally']
	.map(a => {
		return {[a]: actionCreator(a)}
	})
	.reduce((a, b) => {
		return Object.assign({}, a, b)
	})

const check = ({ok}) => ok
const transformBeforeCheck = a => a
const transformAfterCheck = a => a

const behaviours = {
	...actionsCreators,
	check,
	transformBeforeCheck,
	transformAfterCheck
}

Object.keys(behaviours).map(key => {
	const initialBehaviour = behaviours[key]
	const privateName = `_${key}`
	Awral[key] = (fn = initialBehaviour) => {
		return Awral.clone(privateName)(fn)
	}
})
// let pen = Awral.pending(a => a)
// let keys = Object.getOwnPropertyNames(pen)
export default Awral
