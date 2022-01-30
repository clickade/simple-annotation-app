/**
 * This is the user projects page component
 */

import { useEffect, useRef, useState } from 'react'
import Parse from 'parse'
import XLSX from 'xlsx'

import { Button, Input, LinkButton, Divider } from '../components/ui'

import ImageAnnotator from '../components/ImageAnnotator'

// Database classes
const parseProjects = Parse.Object.extend('Projects')
const parseImages = Parse.Object.extend('Images')

const Projects = ({user}) => {
	// State variables
	const [projects,setProjects] = useState([])	// Load array of user-created projects
	const [curProject,setCurProject] = useState(null)			// Select a project
	const [imageArray,setImageArray] = useState([]) 			// Load downloaded images here
	const [imageSelected,setImageSelected] = useState(null)		// Modal popup for selected image
	const uploadInput = useRef(null)	// Reference the hidden file uploader input

	/**
	 * When component mounts, initialize values
	 */
	useEffect(()=>{
		document.title = 'My Projects | Simple Image Annotation' // Set page title

		// Get list of user projects
		const queryProjects = new Parse.Query(parseProjects)
		queryProjects.equalTo('user',user)
		queryProjects.find().then(objs=>{
			setProjects(objs)
			handleProjectSelect(objs[0])
		},err=>alert(`Error: ${err.code}\n${err.message}`))
	},[])

	/**
	 * Select current project
	 * @param {*} parseObj 
	 */
		const handleProjectSelect = parseObj => {
			setCurProject(parseObj)
			loadImages(parseObj)
		}
	

	/**
	 * Download user images from server
	 * @param {*} url 
	 */
	const loadImages = (parseObj) => {
		const proj = parseObj || curProject	// Parameter will override state

		// Query database for all images related to this project
		const queryImages = new Parse.Query(parseImages)
		queryImages.equalTo('project',proj)
		queryImages.find().then(parseObjs=>{
			setImageArray(parseObjs)
			//console.dir(parseObjs.map(o=>o.get('image')))
		},err=>alert(`Error: ${err.code}\n${err.message}`))
	}
	/**
	 * Brings up the full-sized image on a modal
	 * @param {*} parseObj 
	 */
	const handleImageSelect = parseObj => {
		const selectedImage = imageArray.find(obj=>obj===parseObj)
		setImageSelected(selectedImage)
	}

	/**
	 * Closes the modal
	 * @param {*} evt 
	 */
	const handleImageDeselect = evt => {
		setImageSelected(null)
	}
	/**
	 * Updates the image data
	 * @param {*} doc 
	 */
	const updateImageArray = doc => {
		const tempImageArray = imageArray.filter(imageDoc=>imageDoc.id!==doc.id) // Remove image from array
		const newImageData = {
			...doc,
		}
		const newImageArray = [...tempImageArray,newImageData].sort((x,y)=>{	// Return updated image into the array
			if(x.id>y.id) return 1
			if(x.id<y.id) return -1
			return 0
		})
		setImageArray(newImageArray)
	}

	/**
	 * Clear all annotation-related data from image
	 * @param {*} id 
	 */
	 const handleImageClear = parseObj => {
		const selectedImage = imageArray.find(obj=>obj===parseObj)
		selectedImage.set('coords',[])
		selectedImage.save()
	}

	/**
	 * Handles file selection
	 * @param {*} evt 
	 */
	const handleUploadSelect = evt => {
		const {files} = evt.target
		console.dir(evt.target.files)
		if(files.length > 0){
			[...files].forEach(image=>{
				const {name,type} = image

				const parseFile = new Parse.File(name,image,type)
				parseFile.save().then(()=>{
					// On upload success, add reference to this file into the current projects
					console.dir(`${name} successfully uploaded.`)
					const parseImage = new parseImages()
					parseImage.set('user',user)
					parseImage.set('project',curProject)
					parseImage.set('filename',name)
					parseImage.set('image',parseFile)
					parseImage.set('coords',[])	// Use this to store coordinates
					parseImage.save().then(()=>{
						// Append image to current list of image once uploaded
						loadImages(curProject)
					},err=>alert(`Error: ${err.code}\n${err.message}`))
				},err=>alert(`Error: ${err.code}\n${err.message}`))
			})
		}
	}

	/**
	 * Uploads image(s) to the database
	 * @param {*} evt 
	 */
	const handleUploadConfirm = evt => {
		uploadInput.current.click()
	}

	/**
	 * Client downloads set of annotations for selected image
	 */
	const handleDownloadAnnotations = () => {
		// Get basic data
		const imageName = imageSelected.get('filename')
		const imageCoords = imageSelected.get('coords')

		// Don't bother downloading if there are no coordinates
		if(!imageCoords.length) return alert('No annotations found for this image.')

		// Construct JSON of image annotation data
		const outputData = imageCoords.map(coord=>{
			const {txt,xy} = coord
			return {
				filename: imageName,
				class: txt,
				top: xy[0][1],
				left: xy[0][0],
				bottom: xy[1][1],
				right: xy[1][0]
			}
		})

		// Construct output workbook
		const wb = XLSX.utils.book_new()
		const ws = XLSX.utils.json_to_sheet(outputData)
		XLSX.utils.book_append_sheet(wb,ws,'annotations')

		// Download output as CSV
		const outputName = imageName.split('.')[0] // Remove file extension from image name
		XLSX.writeFile(wb,`${outputName}.csv`)
	}

	/**
	 * Client downloads set of annotations for all existing image
	 */
	 const handleDownloadAnnotationsAll = () => {
		// Get basic data
		const outputDataAll = imageArray.reduce((temp,parseImage)=>{
			const imageName = parseImage.get('filename')
			const imageCoords = parseImage.get('coords')

			console.dir(parseImage.get('coords'))

			// If image does not have coords, skip to next loop
			if(!imageCoords.length) return temp

			// Construct JSON of image annotation data
			const outputData = imageCoords.map(coord=>{
				const {txt,xy} = coord
				return {
					filename: imageName,
					class: txt,
					top: xy[0][1],
					left: xy[0][0],
					bottom: xy[1][1],
					right: xy[1][0]
				}
			})

			// Append current image data to temp array
			return [
				...temp,
				...outputData
			]
		},[])

		// Construct output workbook
		const wb = XLSX.utils.book_new()
		const ws = XLSX.utils.json_to_sheet(outputDataAll)
		XLSX.utils.book_append_sheet(wb,ws,'annotations')

		// Download output as CSV
		const outputName = `${curProject.get('title')}`
		XLSX.writeFile(wb,`${outputName}.csv`)
	}

	/**
	 * Create new project
	 * @returns 
	 */
	const handleCreateProject = () => {
		const newTitle = prompt('New Project Title')

		// Case handling
		if(!newTitle) return // Cancel action
		if(projects.find(obj=>obj.get('title')===newTitle)) return alert('Sorry, that project name already exists. Please choose another title.')

		const filteredTitle = newTitle.replace(/[^A-Z0-9]/gi,'') // Alphanumeric characters only

		// Create new project with input title
		const newParseProject = new parseProjects()
		newParseProject.set('user',user)
		newParseProject.set('title',filteredTitle)
		newParseProject.save().then(()=>{
			// If successful, append new project to current projects list
			setProjects([
				...projects,
				newParseProject
			])
			handleProjectSelect(newParseProject)
		},err=>alert(`Error: ${err.code}\n${err.message}`))
	}

	return <div style={{padding:'2.5em 5em 2.5em 5em'}}>
		<h1>My Projects { curProject && `>> ${curProject.get('title')}`}</h1>
		<div>
			{ projects && 'Select Project:  '}
			{	projects &&
				projects.map(parseObj=><Button
					key={parseObj.get('_id')}
					active={curProject && curProject.get('title')===parseObj.get('title')}
					onClick={()=>handleProjectSelect(parseObj)}
				>{parseObj.get('title')}</Button>)	
			}
			{projects && ' | '}
			<Button 
				onClick={handleCreateProject}
			>+ Create New Project</Button>
		</div>
		{	curProject &&
			<div>
				<Button 
					onClick={handleDownloadAnnotationsAll}
				>Download CSV [ All Images ]</Button>
				<input 
					ref={uploadInput}
					type='file'
					accept='image/*' 
					multiple
					hidden
					onChange={handleUploadSelect}
				/>
				{' | '}
				<Button onClick={handleUploadConfirm}>+ Upload New Images</Button>
			</div>
			
		}
		<div>
			{	imageSelected &&
					<div 
						style={{
							backgroundColor: 'rgba(0,0,0,.8)',
							position: 'fixed',
							top: '0px',
							left: '0px',
							height: '100vh',
							width: '100vw',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',

						}}
					>
						<div>
							<div style={{ float: 'left' }}>
								<Button
									onClick={()=>handleImageClear(imageSelected)}
									warning
								>Clear</Button>
							</div>
							<div style={{ float: 'right' }}>
								<Button
									onClick={handleImageDeselect}
									danger
								>X</Button>
							</div>
							<ImageAnnotator
								imageData={imageSelected}
								maxHeight='90vh'
								maxWidth='90vw'
								{...{
									updateImageArray,
								}}
							/>
							<div>
								<Button width='100%'
									onClick={handleDownloadAnnotations}
								>Download CSV</Button>
							</div>
						</div>
					</div>
			}
			<Divider/>
			{
				imageArray.map(parseObj=>{
					return <img
						key={parseObj.get('_id')}
						src={parseObj.get('image')._url}
						alt='dog'
						style={{
							// Scale down full-sized images into thumbnails
							height: '150px',
							width: '150px',
							margin: '.5em .5em 0 0',
							// Annotated images should look special
							border: `${parseObj.get('coords').length > 0 ? '.1em solid gold' : '.1em dashed white'}`,
							// We don't stretch the image, we crop it to fit dimensions
							objectFit: 'cover',
							objectPosition: 'center',

						}}
						onClick={()=>handleImageSelect(parseObj)}
						draggable={false}
					/>
				})
			}
		</div>
	</div>
}

export default Projects