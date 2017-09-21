# AWRAL

[![Greenkeeper badge](https://badges.greenkeeper.io/Metnew/awral.svg)](https://greenkeeper.io/)

### Awesome Wrapper for Redux Action's Lifecycle
> Swiss Army knife for async actions in Redux.

#### Why?
> Assume you're using redux and redux-thunk.

## README IN PROGRESS.
## PLEASE, CHECK SOURCES.

When you work with async stuff you probably have next code in your container:
```js
const mapDispatchToProps = dispatch => ({
	getUser (id) {
		dispatch(GET_USER(id))
	}
})
```
Where `GET_USERS` is a next async action:
```js
export const GET_USER = id => async dispatch => {
	dispatch({type: 'GET_USER_PENDING'})
	const payload = await getUserFromServer(id)
	if (resultOK(payload)) {
		dispatch({type: 'GET_USER_SUCCESS', payload})
	} else {
		dispatch({type: 'GET_USER_FAIL', payload, error:true})
	}
	dispatch({type: 'GET_USER_FINALLY', payload})
}

```

With AWRAL you can just write:
```js
const GET_USER = awral(getUserFromServer)('GET_USER')
```

### How?
There is only one method: `Awral.of()`. `of()` allows you to extend/rewrite your "awrals":
```js
import Awral from 'awral'
const checkResponseFromAPI = (result) => result.ok
const transformResultAfter = (result) => result.data
// const success = ({dispatch, payload}) => {}

const awralCheck = Awral.of({check: checkResponseFromAPI})
const awralCheckTransformBefore = awralCheck.of({})
const awral = Awral.of(check: checkResponseFromAPI)

```
