# AWRAL

[![Greenkeeper badge](https://badges.greenkeeper.io/Metnew/awral.svg)](https://greenkeeper.io/)

### Awesome Wrapper for Redux Action's Lifecycle

> Swiss Army knife for async actions in Redux.

Like `promise-middleware`, but:

* without any middlewares/store changes
* smaller (**80 lines**, **1KB gzipped**)
* simpler (?)
* targeting zero-code duplications, high reusability
* follows [flux-standard-action](https://github.com/acdlite/flux-standard-action)

_Checking sources maybe faster than reading docs_

### Why?

> Assume you're using redux and redux-thunk.

When you work with async stuff you probably have next code in your container:

```js
const mapStateToProps = state => ({userId: state.userId})
const mapDispatchToProps = dispatch => ({
	getUser(id) {
		dispatch(GET_USER(id))
	}
})
```

Where `GET_USER` is the next async action:

```js
export const GET_USER = id => async (dispatch, getState) => {
	const state = getState()
	// 1. Validate input before dispatching `pending`
	if (id === 111 && state.user === 'Alex') {
		// 1.1 Do something if input is invalid
		const payload = {
			error: `You can't do it, because you're Alex and your id is 111`
		}
		dispatch({type: 'GET_USER_FAIL', meta: id, payload, error: true})
		return {payload, status: {error: true}}
	}
	// 2. Dispatch `PENDING` action
	dispatch({type: 'GET_USER_PENDING'}, (meta: id))
	// 3. Create payload for async function
	const apiPayload = {id, token: state.token}
	// 4. Obtain result from async function
	const result = await fetch('/my-url', {body: apiPayload, method:'POST'}).then(res => res.json()).then(res => )

	// 5. Check is request successful or failed (contains errors).
	const status = result.ok && result !== 400 ? {success: true} : {error: true}
  // 6. Get data from request object (typically accessible as `result.data`)
	const payload = resultFromServer.data
	if (resultFromServer.ok) {
    // 7.if result successful -> dispatch `SUCCESS` action
		dispatch({type: 'GET_USER_SUCCESS', meta: id, payload})
	} else {
		// 8.if result failed -> dispatch `FAIL` action
		dispatch({type: 'GET_USER_FAIL', meta: id, payload, error: true})
	}

	// 9. Finally do/dispatch something
	dispatch({type: 'GET_USER_FINALLY', meta: id, payload})
  // 10. Resolve values (typical case for Redux-form, but about it later)
	return {payload, status}
}
```

As you see, there are few steps here:

1. Validate input before dispatching `pending` and Do something if input is invalid
2. Dispatch `PENDING` action
3. Create payload for async function
4. Obtain result from async function
5. Check is request successful or failed (contains errors).
6. Get data from request object (typically accessible as `result.data`)
7. if result successful -> dispatch `SUCCESS` action
8. if result failed -> dispatch `FAIL` action
9. Finally do/dispatch something
10. Return values

In a big projects duplicating this *lifecycle* in each action isn't DRY (honestly, it'd be a crime.).
Imagine that you have 300 similar actions in your app. Much logic will be duplicated.

### Awral

#### Create Awral

`Awral`s are extendable, new `awral` nest parent.

Just call `.of` on parent awral and pass config differencies.
```js
// More about config below
const baseAwral = Awral.of(config)
// This awral extends `baseAwral` + use specificConfig (overwrites methods, see next section)
const awralForSpecificLifecycle = baseAwral.of(specificConfig)
```

#### Configure Awral


```js
// commonly used in Functional programming "ID" function
const id = (a) => a
const actionCreator = status => ({dispatch, ACTION_NAME, getState, ...rest}) => {
  // Where `rest` are:
  // - `payload` - result from asyncFunction preprocess throught `afterCheck`
  // - `error` - if action `fail`ed
  // - `meta` - some value obtained from `meta` function
	dispatch({type: `${ACTION_NAME}_${status.toUpperCase()}`, ...rest})
}

// Default values sorted in the order of execution:
const commonAwral = Awral.of({
	meta: id, // 0
	failBeforePending: null, // 1
	pending: actionCreator('pending'), // 2
	fnPayload: id, // 3
	check: id, // 5
	transformResult: id, // 6
	success: actionCreator('success'), // 7
	fail: actionCreator('fail'), // 8
	finally: actionCreator('finally'), // 9
	resolve: id // 10
})
```

Above we discussed typical async action lifecycle, and Awral encapsulates it, but also provides manipulation with `meta`:
0. Create `meta` action property - `meta`
1. Validate input before dispatching `pending` and `fail` if input is invalid - `failBeforePending`
2. Dispatch `{ACTION_NAME}_PENDING` action - `pending`
3. Create payload for async function - `fnPayload`
4. Obtain result from async function - automatically
5. Check is request successful or failed (contains errors) - `check`
6. Get data from request object (typically accessible as `result.data`) - `transformResult`
7. if result successful -> dispatch `{ACTION_NAME}_SUCCESS` action - `success`
8. if result failed -> dispatch `{ACTION_NAME}_FAIL` action - `fail`
9. Finally do/dispatch something - `finally`
10. Return payload and status - `resolve`


Let's discuss each property detailed:

```js
import Awral from 'awral'
// Your async request to API
// mentioned below as 'async function'
const getUserFromServer = async ({id, token}) => {
	// something async using 'fetch' or your XHR agent (any Promise)
	return fetch('/my/url').then(res => res.json())
}
// "args" - arguments passed to your action
// Create `meta` for actions
const meta = args => {
	// `getState()`, `dispatch()`, action prefix as `ACTION_NAME` are available in `this`
	const {_meta} = this.getState()
	return {data, _meta}
}

// Dispatch `fail` before `pending` and stops execution
// Returned value used as payload for `fail` action
const failBeforePending = args => {
	// `getState()`, `dispatch()`, action prefix as `ACTION_NAME` are available in `this`
	const state = this.getState()
	const shouldFail = args === 111 && state.user === 'Alex'
	if (shouldFail) {
		const payload = {
			error: 'Sorry, you can do it :('
		}
		// run `fail` action with this payload
		// more about `fail` below
		this._.fail({payload})
		// abort continuing
		return true
	}
}

// Modify request data before passing it to async function
const fnPayload = args => {
	// `getState()`, `dispatch()`, action prefix as `ACTION_NAME` are available in `this`
	const state = this.getState()
	// get something from state
	const {token} = state
	// returned value will be passed to your async function
	return {
		token,
		id
	}
}

// check is request successful or not
const check = result => result.ok && result.code !== 400
// `fetch()` wraps request into `data` property
// Obtain only data from API result
// And use it in `fail/success/finally`
const transformResult = result => result.data

const baseAwralUsedAcrossApp = Awral.of({fnPayload, check, transformResult})

const getUserAwral = baseAwralUsedAcrossApp.of({
	failBeforePending
})
// Custom awral with specific handling
const GET_USER = getUserAwral(getUserFromServer)('GET_USER')
// Actions with typical lifecycle
const GET_ADMIN = baseAwralUsedAcrossApp(getAdmins)('GET_ADMIN')
const GET_LINKS = baseAwralUsedAcrossApp(getLinks)('GET_LINKS')
const GET_STUFF = baseAwralUsedAcrossApp(getStuff)('GET_STUFF')
```

By default there are 3 types of actions:

1. `pending` - dispatched before `asyncFunction`execution
2. `fail` - dispatched if `check` function returned `false`
3. `success` - dispatched if `check` function returned `true`

Global Awral lifecycle:

1. get actions `meta`
2.

```js
const actionCreator = status => ({dispatch, ACTION_NAME, getState, ...rest}) => {
	dispatch({type: `${ACTION_NAME}_${status.toUpperCase()}`, ...rest})
}
```
