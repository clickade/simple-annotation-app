
import { useEffect, useState } from 'react'
import label from '../globals'

/**
 * Image Annotator Functional Component
 * @param {*} props 
 * @returns fc
 */
 const ImageAnnotator = ({imageData,updateImageArray,maxHeight,maxWidth}) => {
	const [tempImageData,setTempImageData] = useState(imageData)
	const [isLoaded,setLoaded] = useState(false)		// Check if the image has been fully loaded
	const [isMouseDown,setMouseDown] = useState(false)	// Detect if user is interacting with page
	const [isComplete,setComplete] = useState(false)	// Check if annotation has been completed
	const [imgInfo,setImageInfo] = useState({})			// Update image information
	const [dragCoords,setDragCoords] = useState([[0,0],[0,0]])	// Polygon coordinates

	/**
	 * Convert min-max coords into svg-friendly string
	 * @param {*} coords 
	 * @returns 'x1,y1 x1,y2 x2,y2 x2,y1'
	 */
	const stringifyCoords = coords => {
		const [x1,y1] = coords[0]
		const [x2,y2] = coords[1]

		return `${x1},${y1} ${x1},${y2} ${x2},${y2} ${x2},${y1}`
	}

	/**
	 * Convert min-max coords into annotation coords
	 * @param {*} coords 
	 * @returns [Top, Left, Bottom, Right]
	 */
	const buildCoords = coords => {
		const minX = Math.min(coords[0][0],coords[1][0])
		const minY = Math.min(coords[0][1],coords[1][1])
		const maxX = Math.max(coords[0][0],coords[1][0])
		const maxY = Math.max(coords[0][1],coords[1][1])

		return [[minX,minY],[maxX,maxY]]	// Left, Top, Right, Bottom
	}

	/**
	 * Get image parameters after loading
	 * @param {*} evt 
	 */
	const handleOnLoad = evt => {
		// Decompose and store relevant element attributes
		const {
			x,y,			// xy-coords of image relative to viewport
			clientHeight,	// Scaled image height
			clientWidth,	// Scaled image width
			naturalHeight,	// Original image height
			naturalWidth	// Original image width
		} = evt.currentTarget

		setImageInfo({
			x,y,
			clientHeight,clientWidth,
			naturalHeight,naturalWidth
		})

		setLoaded(true)
	}

	/**
	 * Begin drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseDown = evt => {
		evt.stopPropagation()

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		// Calculate image pixel coordinates of cursor
		const {x,y} = imgInfo
		const pixelX = clientX-x
		const pixelY = clientY-y

		setDragCoords([[pixelX,pixelY],[pixelX,pixelY]])	// Reset dragCoords
		setMouseDown(true)
		setComplete(false)
	}

	/**
	 * End drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseUp = evt => {
		evt.stopPropagation()

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		const {x,y} = imgInfo

		setDragCoords([dragCoords[0],[clientX-x,clientY-y]])	// Update dragCoords
		setMouseDown(false)

		// Ensure this is not a mis-click by setting a minimum draw distance
		if(Math.abs(dragCoords[0][0]-dragCoords[1][0])>5) setComplete(true)
		else {
			setDragCoords([[0,0],[0,0]]) // Reset coords
		}
	}

	/**
	 * Similar to handleMouseUp, end drawing annotation polygon
	 * @param {*} evt 
	 */
	const handleMouseLeave = evt =>{
		evt.stopPropagation()
		setMouseDown(false)

		// Ensure this is not a mis-click by setting a minimum draw distance
		if(Math.abs(dragCoords[0][0]-dragCoords[1][0])>5) setComplete(true)
		else {
			setDragCoords([[0,0],[0,0]]) // Reset coords
		}
	}

	/**
	 * Continue drawing annotation polygon
	 * @param {*} evt 
	 * @returns 
	 */
	const handleMouseMove = evt => {
		evt.stopPropagation()
		if(!isMouseDown) return	// Ignore non-interactive mouseovers

		// Decompose relevant element attributes
		const {
			clientX,	// X-coords of mouse relative to viewport
			clientY		// Y-coords of mouse relative to viewport
		} = evt.nativeEvent

		const {x,y} = imgInfo

		setDragCoords([dragCoords[0],[clientX-x,clientY-y]])	// Update dragCoords
	}

	/**
	 * Selecting option from dropdown menu
	 * @param {*} evt 
	 */
	const handleSelection = evt => {
		evt.stopPropagation()

		// Reset visuals
		setComplete(false)
		setDragCoords([[0,0],[0,0]])

		// Add new coordinates
		const oldCoords = tempImageData.get('coords')
		const newCoords = [
			...oldCoords,
			{
				txt: evt.target.value,
				xy: buildCoords(dragCoords)
			}
		]

		// Update coordinates in database
		tempImageData.set('coords',newCoords)
		tempImageData.save()
	}

	return <div>
		<img 
			key={tempImageData.get('_id')}
			src={tempImageData.get('image')._url}
			alt={tempImageData.get('image')._name}
			onLoad={handleOnLoad}
			onClick={evt=>evt.stopPropagation()}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			draggable={false}
			style={{
				maxHeight,maxWidth
			}}
		/>
		{	isLoaded &&
			<svg
				height={imgInfo.clientHeight}
				width={imgInfo.clientWidth}
				style={{
					position: 'absolute',
					zIndex: 1,
					pointerEvents: 'none',
					left: imgInfo.x,
					right: imgInfo.y
				}}
			>
				<polygon points={stringifyCoords(dragCoords)} stroke='#04F404' strokeDasharray='2' fill='none'/>
				{
					tempImageData.get('coords').map((data,index)=><svg
						key={index}
					>
						<polygon 
							points={stringifyCoords(data.xy)}
							stroke='#04F404'
							fill='none'
						/>
						<text
							fill='#04F404'
							x={data.xy[0][0]+5}
							y={data.xy[0][1]+15}
						>{data.txt}</text>
					</svg>)
				}
			</svg>
		}
		{	isComplete &&
			<select
				style={{
					position:'absolute',
					left: Math.min(dragCoords[0][0],dragCoords[1][0])+imgInfo.x,
					top: Math.max(dragCoords[0][1],dragCoords[1][1])+imgInfo.y,
				}}
				onClick={evt=>evt.stopPropagation()}
				onChange={handleSelection}
			>
				<option>Choose One</option>
				{
					label.map((item,index)=><option key={index} value={item}>
						{item}
					</option>)
				}
			</select>
		}
	</div>
}

export default ImageAnnotator