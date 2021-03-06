/**
 * This is the registration page component
 */

import { useEffect, useState } from 'react'
import Parse from 'parse'

import { Button, Input, LinkButton } from '../components/ui'

const IDs = {
	USERNAME: 'usr',
	PASSWORD: 'pas',
	PASSWORD_CONFIRM: 'pas-cfm',
	PROJECT_NAME: 'prj'
}

const Registration = ({setUser}) => {
	// State variables
	const [username,setUsername] = useState('')
	const [password,setPassword] = useState('')
	const [passwordConfirm,setPasswordConfirm] = useState('')
	const [projectName,setProjectName] = useState('')

	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'Registration | Simple Image Annotation' // Set page title
	},[])

	/**
	 * Handles logic for text input
	 * @param {*} evt 
	 */
	const handleTextChange = evt => {
		const {id,value} = evt.target

		switch(id){
			case IDs.USERNAME:
				setUsername(value.replace(/[^A-Z0-9]/gi,''))	// Alphanumeric characters only
				break
			case IDs.PASSWORD: 
				setPassword(value.replace(/\s/g,''))			// No whitespace
				break
			case IDs.PASSWORD_CONFIRM: 
				setPasswordConfirm(value.replace(/\s/g,''))			// No whitespace
				break
			case IDs.PROJECT_NAME:
				setProjectName(value.replace(/[^A-Z0-9]/gi,''))	// Alphanumeric characters only
				break
			default:
				break
		}
	}

	/**
	 * Register user
	 * @param {*} evt 
	 */
	const handleRegistration = evt => {
		// Ensure passwords match before proceeding with registration
		if(!username||!password) return alert('Please fill out empty fields')
		if(password!==passwordConfirm) return alert('Passwords do not match')

		const userObj = new Parse.User()
		userObj.set('username',username)
		userObj.set('password',password)
		userObj.signUp().then(()=>{
			console.dir('Signup successful.')
			/* const parseProjects = new Parse.Object('Projects')
			parseProjects.set('title',projectName)
			parseProjects.set('user',userObj)
			parseProjects.save()
			setUser(userObj) */
			setUser(userObj) 
		},err=>{
			alert(`Error: ${err.code}\n${err.message}`)
		})
	}

	return <div style={{padding:'2.5em 0 0 0'}}>
		<h1>Registration</h1>
		<form style={{width:'20em'}}>
			<div>
				<label>Username: <Input 
					id={IDs.USERNAME} 
					type='text' 
					value={username}
					onChange={handleTextChange}
					valid
				/></label>
			</div>
			<div>
				<label>Password: <Input
					id={IDs.PASSWORD}
					type='password'
					value={password}
					onChange={handleTextChange}
					valid
				/></label>
			</div>
			<div>
				<label>Confirm Password: <Input
					id={IDs.PASSWORD_CONFIRM}
					type='password'
					value={passwordConfirm}
					onChange={handleTextChange}
					valid
				/></label>
			</div>
		</form>
		<div>
			<Button onClick={handleRegistration}>Register Me</Button>
			<LinkButton to='/login' label='Login'/>
		</div>
	</div>
}

export default Registration