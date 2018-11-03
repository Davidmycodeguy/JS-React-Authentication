import axios from 'axios';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import history from './history';

const AUTH_STATE = '9ddf8403cd81280214f6457f2d82b859';
const HASHED_KEY_NAME = 'AA1E94E14619C01BA8B347C76BA192CB';

// Settings
const BASEURL = '';
const REDIRECT_AFTER_LOG_IN = '/docs';
const REDIRECT_AFTER_REGISTER = '/login';
const REDIRECT_AFTER_LOG_OUT = '/login';

axios.defaults.baseURL = BASEURL;
axios.defaults.headers.common['Authorization'] = `token ${getAuthToken()}`;

/* throw error if the pram the missing */
function isRequired() {
	throw new Error('param is required');
}

/* sets Auth_token  in  local storage */
function setAuthToken(AUTH_TOKEN) {
	localStorage.setItem(HASHED_KEY_NAME, AUTH_TOKEN);
}

/* checks Auth_token exists in  local storage */
function checkAuthToken() {
	if (localStorage.getItem(HASHED_KEY_NAME) === null) {
		// console.log('No Key');
		return false;
	}
	return true;
}

/* Removes Auth_token from local storage */
function removeAuthToken() {
	localStorage.removeItem(HASHED_KEY_NAME);
}

/* gets Auth_State from local storage */
function getAuthToken() {
	return localStorage.getItem(HASHED_KEY_NAME);
}

/* sets Auth_State in local storage */
function setAuthState() {
	localStorage.setItem(AUTH_STATE, true);
	axios.defaults.headers.common['Authorization'] = `token ${getAuthToken()}`;
}

/* Removes Auth_State from local storage */
function removeAuthState() {
	localStorage.removeItem(AUTH_STATE);
	axios.defaults.headers.common['Authorization'] = '';
}

/* Checks if User is Auth_State is True */
function isAuthStateOn() {
	if (localStorage.getItem(AUTH_STATE) === null) {
		return false;
	}
	return true;
}

/* Checks if User is Authenticated 
  by checking token and staus in session */
export function isUserAuthenticated() {
	if (checkAuthToken() && isAuthStateOn()) {
		return true;
	}
	return false;
}

/* Logs In the user 
by setting token and Auth state TRUE in local Storage */
function loginUser(AUTH_TOKEN) {
	setAuthToken(AUTH_TOKEN);
	setAuthState();
	history.push(REDIRECT_AFTER_LOG_IN);
}

/* Logs out user 
by removing tokens and turning AUTH State to off */
export function logoutUser() {
	removeAuthState();
	removeAuthToken();
	history.push(REDIRECT_AFTER_LOG_OUT);
}

/* CHECK SESSION IS ACTIVE 
By Makeing a API CALL */
function heartbeat() {
	if (checkAuthToken()) {
		// console.log('there is an auth token');
		axios({
			method: 'post',
			url: '/auth/heartbeat/',
			headers: {
				Authorization: `token ${getAuthToken()}`
			}
		})
			.then(console.log('heartbeat successful'))
			.catch(() => {
				removeAuthToken();
				removeAuthState();
				console.log('heartbeat failed');
			});
	} else {
		// console.log('No Auth Token is set in place');
	}
}
/* Run this on app to check the session did not close */
export const starHeartBeat = (time = 140000) => {
	heartbeat();
	setInterval(() => {
		heartbeat();
	}, time);
};

/* Gets token from API THEN Logs user in redturns a promise */
export function Login(payload = isRequired()) {
	return axios({
		method: 'post',
		url: '/auth/login/',
		data: payload
	})
		.then(response => {
			// console.log('Login Successful');
			const token = response.data.data.key;
			loginUser(token);
		})
		.catch(error =>
			// console.log('Login unSuccessful');
			Promise.reject(error)
		);
}

/* Signs up the user then redturns a promise */
export function Register(payload = isRequired()) {
	return axios({
		method: 'post',
		url: '/auth/registration/',
		data: payload
	})
		.then(() => {
			// console.log('Register Successful');
			history.push(REDIRECT_AFTER_REGISTER);
		})
		.catch(error =>
			// console.log('Register unSuccessful');
			Promise.reject(error)
		);
}

export const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={props =>
			isUserAuthenticated() === false ? (
				<Redirect to="/Login" />
			) : (
				<Component {...props} />
			)
		}
	/>
);

export const IfNotAuthenticated = ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={props =>
			isUserAuthenticated() === true ? (
				<Redirect to={REDIRECT_AFTER_LOG_IN} />
			) : (
				<Component {...props} />
			)
		}
	/>
);
