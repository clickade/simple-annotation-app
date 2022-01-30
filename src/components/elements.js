import React, {Fragment, Component} from 'react'
import moment from 'moment'
import XLSX from 'xlsx'

import {Button, Divider, Input} from './styles'
import {GRADE,GRADE_BY,GROUP,GROUP_BY, SORT, SORT_BY,ORDER,ORDER_BY,SEARCH} from './global'

/**
 * Constructs a paginated table based on available data
 * @param {*} param0
 */
export class DataTable extends Component {
	constructor(props){
		super(props)

		this.state = {
			page: 0,
			filteredData: [...this.props.data]
		}
	}

	/**
	 * Sets page number
	 * @param {*} page
	 */
	setPage = (page) => this.setState({page})

	/**
	 * Handles downloading of filtered data
	 * @param {*} e
	 */
	handleDownload = (e) => {
		const {filteredData} = this.state

		// Split docs with multiple faults into multiple rows
		const sheetData = filteredData.reduce((temp,doc)=>{
			return [
				...temp,
				...doc['Fault Class'].map(fault=>{
					return {
						'Datetime': 		doc['Datetime'],	// Date and time (yyyy-MM-ddThh:mm:ss)
						'RIMS': 			doc['RIMS'],	// Case no.
						'Train No': 		doc['Train No'],	// Train/Svc/Veh no
						'Identification':	doc['Identification'].join(', '),
						'From': 			doc['From'],	// Location from
						'To': 				doc['To'],	// Location to
						'Description': 		doc['Description'],	// Case description
						'Fault Class': 		fault,	// Fault classification
						'ID':				doc['ID'],	// Initial delay(min.)
						'AD': 				doc['AD'],	// Accumulative delay(min.)
						'SI': 				doc['SI'],	// Service interval(min.)
						'Count': 			doc['Count'],	// Cases, Count
					}
				})
			]
		},[])

		const ws = XLSX.utils.json_to_sheet(sheetData)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb,ws,'data')

		XLSX.writeFile(wb,`RIMS Investigator - ${moment().format('YYYY-MM-DD HHmmss')}.xlsx`)
	}

	/**
	 * Update data filter after set delay
	 * @param {*} e
	 */
	handleFilters = (e) => {
		const {id,value} = e.target

		const realValue = [SEARCH.RIMS].includes(id) ? value.replace(/[^0-9]/g,'') : // Integer-based field validation
			value	// Leave alone
		clearTimeout(this.state[`filter-timeout`])

		this.setState({
			[id]: realValue,	// Surface-level value
			[`filter-timeout`]:setTimeout(()=>{
				this.filterData()
			},500)	// After X secs, execute value
		})
	}

	/**
	 * Filter data
	 */
	filterData = () => {
		const BY_CASE = this.state[SEARCH.RIMS] && this.state[SEARCH.RIMS].length > 0
		const BY_DESCRIPTION = this.state[SEARCH.DESCRIPTION] && this.state[SEARCH.DESCRIPTION].length > 0
		const BY_TRAIN_NO = this.state[SEARCH.TRAIN_NO] && this.state[SEARCH.TRAIN_NO].length > 0
		const BY_IDENTIFICATION = this.state[SEARCH.IDENTIFICATION] && this.state[SEARCH.IDENTIFICATION].length > 0
		const BY_FROM = this.state[SEARCH.FROM] && this.state[SEARCH.FROM].length > 0
		const BY_TO = this.state[SEARCH.TO] && this.state[SEARCH.TO].length > 0
		const BY_FAULT_CLASS = this.state[SEARCH.FAULT_CLASS] && this.state[SEARCH.FAULT_CLASS].length > 0

		this.setState({
			filteredData: this.props.data.filter(doc=>
				(BY_CASE ? doc['RIMS']===this.state[SEARCH.RIMS] : true) &&
				(BY_DESCRIPTION ? doc['Description'].toUpperCase().includes(this.state[SEARCH.DESCRIPTION].toUpperCase()) : true) &&
				(BY_TRAIN_NO ? doc['Train No']===this.state[SEARCH.TRAIN_NO] : true) &&
				(BY_IDENTIFICATION ? doc['Identification'].join(' ').toUpperCase().includes(this.state[SEARCH.IDENTIFICATION].toUpperCase()) : true) &&
				(BY_FROM ? doc['From'].toUpperCase().includes(this.state[SEARCH.FROM].toUpperCase()) : true) &&
				(BY_TO ? doc['To'].toUpperCase().includes(this.state[SEARCH.TO].toUpperCase()) : true) &&
				(BY_FAULT_CLASS ? doc['Fault Class'].join(' ').toUpperCase().includes(this.state[SEARCH.FAULT_CLASS].toUpperCase()) : true)
			)
		})
	}

	componentDidUpdate(prevProps,prevState){
		// Ensure current page never exceeds displayable data by resettting page number
		if(this.state.page && prevState.filteredData.length !== this.state.filteredData.length){
			this.setPage(0)
		}
		// Ensure data is always updated by props
		if(prevProps.data.length !== this.props.data.length){
			this.filterData()
		}
	}

	render(){
		const {pageSize,headers} = this.props
		const {filteredData,page} = this.state
		const dataPage = filteredData.filter((doc,index)=>(index>=page*pageSize) && (index<(page+1)*pageSize))	// Paginate table content

		return <div>
			<div style={{marginBottom:'.25em',padding:'.25em',borderBottom:'dashed white .1em',display:'inline-block'}}>
				{page>0 && <Button onClick={()=>{this.setPage(page-1)}}>←</Button>} Page {page+1} of {Math.ceil(filteredData.length/pageSize)} {filteredData.length > (page+1)*pageSize && <Button onClick={()=>{this.setPage(page+1)}}>→</Button>}
			</div>
			<Button onClick={this.handleDownload} style={{width:'99%',margin:'0em'}}>Download Data ({filteredData.length} unique cases)</Button>
			<table>
				<thead>
					<tr>
						<th style={{border:'black solid 1px',padding:'.25em .25em',whiteSpace:'break-spaces',backgroundColor:'rgba(0,0,0,.5)'}}>#</th>
						{	headers.map((header,index)=><th key={index} style={{border:'black solid 1px',padding:'.25em .25em',verticalAlign:'top',backgroundColor:'rgba(0,0,0,.5)'}}>
								<div>{header}</div>
								{ 'Description' === header && <Input id={SEARCH.DESCRIPTION} value={this.state[SEARCH.DESCRIPTION] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.DESCRIPTION]} width='90%' placeholder='Search description...'/>}
								{ 'RIMS' === header && <Input id={SEARCH.RIMS} value={this.state[SEARCH.RIMS] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.RIMS]} width='5em' placeholder='Search...'/>}
								{ 'Train No' === header && <Input id={SEARCH.TRAIN_NO} value={this.state[SEARCH.TRAIN_NO] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.TRAIN_NO]} width='5em' placeholder='Search...'/>}
								{ 'Identification' === header && <Input id={SEARCH.IDENTIFICATION} value={this.state[SEARCH.IDENTIFICATION] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.IDENTIFICATION]} width='90%' placeholder='Search...'/>}
								{ 'From' === header && <Input id={SEARCH.FROM} value={this.state[SEARCH.FROM] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.FROM]} width='90%' placeholder='Search...'/>}
								{ 'To' === header && <Input id={SEARCH.TO} value={this.state[SEARCH.TO] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.TO]} width='90%' placeholder='Search...'/>}
								{ 'Fault Class' === header && <Input id={SEARCH.FAULT_CLASS} value={this.state[SEARCH.FAULT_CLASS] || ''} onChange={this.handleFilters} valid={this.state[SEARCH.FAULT_CLASS]} width='90%' placeholder='Search...'/>}
							</th>)}
					</tr>
				</thead>
				<tbody>
				{	dataPage.length > 0 &&
					dataPage.map((row,index)=>{
						return <tr key={index}>
							<td style={{border:'black solid 1px',padding:'.25em .25em',whiteSpace:'break-spaces'}}>{index+page*pageSize+1}</td>
							{
								headers.map((header,index)=><td key={index} style={{border:'black solid 1px',padding:'.25em .25em',whiteSpace:'break-spaces',verticalAlign:'top'}}>
									{['Fault Class','EMU','Identification'].includes(header) ?
										row[header].map((item,index,arr)=><div key={index} style={{marginBottom:'.25em'}}>
												{arr.length > 1 && ['Fault Class','Identification'].includes(header) && '● '}{item}
												{'Fault Class'===header && row['Fault From'] && row['Fault From'][item] && <a style={{color:'red'}}>{` [${moment(row['Datetime']).diff(row['Fault From'][item].split(' ')[0],'days')} days ago, RIMS ${row['Fault From'][item].split(' ')[1]}]`}</a>}
												{'Fault Class'===header && row['Fault To'] && row['Fault To'][item] && <a style={{color:'orange'}}>{` [${moment(row['Fault To'][item].split(' ')[0]).diff(row['Datetime'],'days')} days later, RIMS ${row['Fault To'][item].split(' ')[1]}]`}</a>}
											</div>)
										: 'Datetime' === header ? moment(row[header]).format('DD MMM, HHmm [H]')
										: row[header]
									}
								</td>)
							}
						</tr>
					})
				}
				{
					!dataPage.length && <tr>
						<td colSpan={headers.length+1} style={{border:'black solid 1px',padding:'.25em .25em',whiteSpace:'break-spaces'}}>NO DATA MATCH</td>
					</tr>
				}
				</tbody>
			</table>
			<Button onClick={this.handleDownload} style={{width:'99%',margin:'0em'}}>Download Data ({filteredData.length} unique cases)</Button>
			<div style={{marginTop:'.25em',padding:'.5em',borderTop:'dashed white .1em',display:'inline-block'}}>
				{page>0 && <Button onClick={()=>{this.setPage(page-1)}}>←</Button>} Page {page+1} of {Math.ceil(filteredData.length/pageSize)} {filteredData.length > (page+1)*pageSize && <Button onClick={()=>{this.setPage(page+1)}}>→</Button>}
			</div>
		</div>
	}
}

export const GroupMenu = (props) => {
	return <div>
		<div>
			Group By: <Button id={GROUP.TIMELINE} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.TIMELINE}>{props[GROUP_BY]===GROUP.TIMELINE && '✔️'} Timeline</Button>
			<Button id={GROUP.TRAIN_NO} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.TRAIN_NO}>{props[GROUP_BY]===GROUP.TRAIN_NO && '✔️'} Train No</Button>
			<Button id={GROUP.EMU_NO} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.EMU_NO}>{props[GROUP_BY]===GROUP.EMU_NO && '✔️'} EMU No</Button>
			<Button id={GROUP.IDENTIFICATION} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.IDENTIFICATION}>{props[GROUP_BY]===GROUP.IDENTIFICATION && '✔️'} Identification</Button>
			<Button id={GROUP.LOCATION} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.LOCATION}>{props[GROUP_BY]===GROUP.LOCATION && '✔️'} Location</Button>
			<Button id={GROUP.FROM} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.FROM}>{props[GROUP_BY]===GROUP.FROM && '✔️'} From</Button>
			<Button id={GROUP.TO} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.TO}>{props[GROUP_BY]===GROUP.TO && '✔️'} To</Button>
			<Button id={GROUP.FAULT_CLASS} onClick={props.handleGroupBy} active={props[GROUP_BY]===GROUP.FAULT_CLASS}>{props[GROUP_BY]===GROUP.FAULT_CLASS && '✔️'} Fault Class</Button>
		</div>
		{	props[GROUP_BY]!==GROUP.TIMELINE &&
			<div>
				Grade By: <Button id={GRADE.CASES} onClick={props.handleGradeBy} active={props[GRADE_BY]===GRADE.CASES}>{props[GRADE_BY]===GRADE.CASES && '✔️'} # of Cases</Button>
				<Button id={GRADE.MAX_ID} onClick={props.handleGradeBy} active={props[GRADE_BY]===GRADE.MAX_ID}>{props[GRADE_BY]===GRADE.MAX_ID && '✔️'} Max ID</Button>
				<Button id={GRADE.TOTAL_ID} onClick={props.handleGradeBy} active={props[GRADE_BY]===GRADE.TOTAL_ID}>{props[GRADE_BY]===GRADE.TOTAL_ID && '✔️'} Total ID</Button>
			</div>
		}
		{	props[GROUP_BY]!==GROUP.TIMELINE &&
			<div>
				Sort Groups By: <Button id={SORT.GROUP} onClick={props.handleSortBy} active={props[SORT_BY]===SORT.GROUP}>{props[SORT_BY]===SORT.GROUP && '✔️'} A-Z</Button>
				<Button id={SORT.GRADE} onClick={props.handleSortBy} active={props[SORT_BY]===SORT.GRADE}>{props[SORT_BY]===SORT.GRADE && '✔️'} Grade</Button>
				+
				<Button id={ORDER.ASC} onClick={props.handleOrderBy} active={props[ORDER_BY]===ORDER.ASC}>{props[ORDER_BY]===ORDER.ASC && '✔️'} Ascending</Button>
				<Button id={ORDER.DESC} onClick={props.handleOrderBy} active={props[ORDER_BY]===ORDER.DESC}>{props[ORDER_BY]===ORDER.DESC && '✔️'} Descending</Button>
			</div>
		}
		<Divider/>
	</div>
}

/**
 * Custom file input element
 * @param {*} props
 */
export const RIMSLoader = props => {
	// Create a reference to the hidden file input element
	const hiddenFileInput = React.useRef(null);

	// Programatically click the hidden file input element
	// when the Button component is clicked
	const handleClick = event => {
		hiddenFileInput.current.click()
	}

	return <Fragment>
		<Button onClick={handleClick} {...props}>{props.isLoading ? 'Loading data...' : (props.filename || 'Click To Load RIMS')}</Button>
		<input
			type='file'
			ref={hiddenFileInput}
			onChange={props.onChange}
			style={{display: 'none'}}
		/>
	</Fragment>
}