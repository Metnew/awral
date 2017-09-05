
export const re = (api: Function) => (name: string) => (...args) => async (dispatch) => {
	// Before something happens
	before(dispatch) // dispatch({type: `${name}_PENDING`}, payload)

	// 1. Payload must have all args
	// 2. Transformation function for payload here ?
	//
	const result = when(await api(...args))

	if (check(result)) {
		success(dispatch)(result) // dispatch({type: `${name}_SUCCESS`, payload: result.data})
	} else {
		fail(dispatch)(result)
		// dispatch({
		//	type: `${name}_FAIL`,
		//	payload: result.data
		// })
	}
	final(dispatch)
}

// 1. сделать что-то до
// 2. сделать асинхронщину
// 3. сделать выбор основываясь на результате пункта 2
// 4. сделать что-то после

const awralWrapper = (Either) => (res) => Either(res)
const checkResponseOK = (response) => {
	return response.ok ? response : {}
}

const awral = Awral.of(AwralForLolActions)

function Awral () {}

Awral.of = (fn) => {
	return new Awral(fn)
}

Awral.pending = (fn) => {
	return fn ? fn(dispatch) : dispatch()
}

Awral.resolve = () => {

}

Awral.check = (fn) => {

}

Awral.ok = () => {

}

Awral.fail = () => {

}

Awral.finally = () => {

}
