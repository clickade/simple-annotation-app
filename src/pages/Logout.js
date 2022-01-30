/**
 * This is the logout page component
 */

 import { useEffect, useState } from 'react'
 import {Parse} from 'parse'

const Logout = ({user,setUser}) => {
	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'Logged Out | Simple Image Annotation' // Set page title

		handleUserLogout() // Force user logout
	},[])

	/**
	 * Handles user logout gracefully
	 */
	 const handleUserLogout = () => {
		if(user){
			Parse.User.logOut().then(()=>{
				console.dir('Logged out')
				setUser(null)	// Will be null
			},err=>{
				alert(`Error: ${err.code}\n${err.message}`)
			})
		}
	}

	return <div style={{padding:'2.5em 0 0 0'}}>
		<h1>Logout Successful</h1>
	</div>
}
 
 export default Logout