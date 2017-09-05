# AWRAL

[![Greenkeeper badge](https://badges.greenkeeper.io/Metnew/awral.svg)](https://greenkeeper.io/)

### Awesome Wrapper for Redux Action's Lifecycle

#### Why?
> Assume you're using redux and redux-thunk.

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
	const result = await getUserFromServer(id)
	if (resultOK(result)) {
		dispatch({type: 'GET_USER_SUCCESS', result})
	} else {
		dispatch({type: 'GET_USER_FAIL', result})
	}
	dispatch({type: 'GET_USER_FINALLY', result})
}

```

This pattern is
With AWRAL you can just write:
```js
const GET_USER = awral(getUserFromServer)('GET_USER')
```
