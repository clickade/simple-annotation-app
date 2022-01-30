import styled from 'styled-components'

const color = {
	white: 'white',

	drysack: '#BDAD98',
    wetsack: '#89827A',

    powder: '#383D40',
    blue: '#2D3032',
    navy: '#242627',
    stone: '#202325',
    asphalt: '#171C1F',

    danger: '#E04836',
    dangerDown: 'rgb(197,38,21)',
    warning: '#F7CE3E',
    warningDown: 'rgb(247,128,0)',
    info: '#516B98',
    infoDown: '#9CC7F6',
    success: '#A3F086',
    successDown: '#64B63D',
}

/*=================================================
					App Containers
=================================================*/

export const Container = styled.div`
	width: 100%;
	height: 100vh;
	display: grid;
	grid-template-rows: auto;
	grid-template-columns: 15em 35em auto;
	grid-gap: .5em;
`

export const MainMenu = styled.div`
	grid-row-start: 1;
	grid-row-end: 3;
	grid-column-start: 1;
	grid-column-end: 2;

	display: grid;
	grid-template-rows: auto auto minmax(0, 1fr);
	grid-template-columns: auto;
	min-height: 0;

	text-align: center;
	border: .25em solid ${color.info};
`

export const MainMenuTitle = styled.div`
	grid-row-start: 1;
	grid-row-end: 2;
	grid-column-start: 1;
	grid-column-end: 2;
	border: .25em solid ${color.info};
	padding: .25em;
`

export const MainMenuFilters = styled.div`
	grid-row-start: 2;
	grid-row-end: 3;
	grid-column-start: 1;
	grid-column-end: 2;
	border: .25em solid ${color.info};
	overflow: auto;
	padding: .25em;
`

export const MainMenuTags = styled.div`
	overflow: auto;
	grid-row-start: 3;
	grid-row-end: 4;
	grid-column-start: 1;
	grid-column-end: 2;
	border: .25em solid ${color.info};
	padding: .25em;
`

export const TrainMenu = styled.div`
	overflow: auto;
	grid-row-start: 1;
	grid-row-end: 3;
	grid-column-start: 2;
	grid-column-end: 3;
	min-height: 0;
	align-self: stretch;
	text-align: center;
	padding: .25em;
	border: .5em solid ${color.info};
`

export const DataMenu = styled.div`
	overflow: auto;
	grid-row-start: 1;
	grid-row-end: 3;
	grid-column-start: 3;
	grid-column-end: 4;
	min-height: 0;
	padding: .25em;
	text-align: center;
	border: .5em solid ${color.info};
`

export const TrainDataMenu = styled.div`
	overflow: auto;
	grid-row-start: 1;
	grid-row-end: 3;
	grid-column-start: 2;
	grid-column-end: 4;
	min-height: 0;
	align-self: stretch;
	text-align: center;
	padding: .25em;
	border: .5em solid ${color.info};
`

/*=================================================
					UI Elements
=================================================*/

export const Button = styled.button`
	border: .01em solid white;
	color: ${props=>!props.disabled ? color.white : color.powder};
	background: ${props => props.progress || ''};
	background-color: ${props => props.danger ? color.danger : (props.active ? color.infoDown : color.blue)};
	padding: .25em .5em;
	text-align: center;
	text-decoration: none;
	text-shadow: .05em .05em .2em ${color.asphalt};
	outline: 0em;
	cursor: ${props=>props.disabled ? 'not-allowed' : 'pointer'};
	user-select: text;
	margin: .25em;
	${props => props.fluid ? 'width: 95%;' : ''}

	&:hover {
		color: ${props=>!props.disabled && color.white};
		background-color: ${props=>!props.disabled && color.infoDown};
	}
`

export const Input = styled.input`
	padding: .25em;
	margin-top: .25em;
	margin-bottom: .25em;
	text-align: center;
	background-color: ${props=>props.valid ? 'white' : 'rgba(0,0,0,0)'};
	border: .1em solid white;
	/* text-shadow: .05em .05em .4em black, .05em .05em .2em black, 0em 0em .1em black; */
	box-shadow: inset .05em .05em .2em black;
	color: ${props=>props.valid ? 'black' : 'white'};
	width: ${props=>props.width || '50%'};
`

export const Divider = styled.div`
	background-color: white;
	height: .1rem;
	margin: .25rem;
`