// import React, { FC, useState, useEffect } from 'react';
// import Card, { CardBody } from '../../../../components/bootstrap/Card';
// import PaginationButtons, {
// 	PER_COUNT,
// 	dataPagination,
// } from '../../../../components/PaginationButtons';
// import Icon from '../../../../components/icon/Icon';
// import Alert from '../../../../components/bootstrap/Alert';
// import { useTranslation } from 'react-i18next';
// import { thStyle, trStyleTable } from '../../../notifications/constants/NotificationConstants';
// import useSortableData from '../../../../hooks/useSortableData';
// import { TableStyle } from '../../../alarms_notifications/components/constants/alarmConstants';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../../store/store';
// import { convertFromUTCtoTZ, convertToDateWithUTC } from '../../../../helpers/helpers';
// import ProgressCustomColor from '../../../../components/bootstrap/ProgressCustomColor';
// import useSelectTable from '../../../../hooks/useSelectTable';
// import Checks from '../../../../components/bootstrap/forms/Checks';
// import { useNavigate } from 'react-router-dom';
// import { ISuperAdminPanelResponse } from '../../../../type/settings-type';
// import { IScheduledReports } from '../../../../type/reports-types';
// import SvgNoReportsFound from '../../../../components/icon/material-icons/NoReportsFound';
// interface IDataTableProps {
// 	data: { [key: string]: string | number }[] | ISuperAdminPanelResponse[] | IScheduledReports[];
// 	columns: { [key: string]: string | boolean | undefined }[];
// 	displayFullData?: boolean;
// 	config?: any;
// 	withCheckbox?: boolean;
// 	setSelectedList?: any;
// 	rowPath?: string;
// 	uniqueId?: string;
// 	isEditable?: (e: any) => void;
// 	translation?: string;
// }

// const Datatable: FC<IDataTableProps> = ({
// 	data,
// 	columns,
// 	displayFullData = false,
// 	config = null,
// 	withCheckbox,
// 	setSelectedList,
// 	rowPath,
// 	uniqueId = '_id',
// 	isEditable,
// 	translation = 'vehicles',
// }) => {
	
// 	const navigate = useNavigate();
// 	const { t } = useTranslation([translation]);
// 	const { items, requestSort, getClassNamesFor } = useSortableData(data, config);
// 	const [perPage, setPerPage] = useState(PER_COUNT[!displayFullData ? '5' : '50']);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const { dir } = useSelector((state: RootState) => state.appStore);
// 	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
// 	const { selectTable, SelectAllCheck } = useSelectTable(items, uniqueId);

// 	useEffect(() => {
// 		if (setSelectedList) {
// 			setSelectedList(selectTable.values.selectedList);
// 		}
// 	}, [selectTable.values.selectedList, setSelectedList]);
// 	function incrementHour(dateTimeString: any) {
// 		// const date = new Date(dateTimeString);
// 		const localTime = convertToDateWithUTC(dateTimeString, preferedTimeZone);
// 		localTime.setHours(localTime.getHours() + 1);
	
// 		return localTime.toISOString().slice(0, 19).replace('T', ' ');
// 	}

// 	const displayValue = (
// 		value: string,
// 		unit: string,
// 		formatDate: boolean,
// 		formatTime: boolean,
// 		formatDateOnly: boolean,
// 		column_combination: boolean,
// 		firstColumnValue: string,
// 		secondColumnValue: string,
// 		rank: boolean,
// 		index: number,
// 		noTranslation: boolean,
// 		dateFormatterwithHoursValue: boolean,
// 	) => {
// 		if (value) {
// 			if (formatDate) {
// 				return convertFromUTCtoTZ(value, preferedTimeZone);
// 			} else if (Array.isArray(value)) {
// 				return value.map((val) => t(val)).join(', ');
// 			} else if (formatTime) {
// 				return convertFromUTCtoTZ(value, preferedTimeZone, 'hh:mm');
// 			} else if (formatDateOnly) {
// 				return convertFromUTCtoTZ(value, preferedTimeZone, 'YYYY-MM-DD');
// 			} else if (value === '0' || value === '1') {
// 				return unit ? `${value} ${unit}` : value;
// 			} else if (unit && unit === '%') {
// 				return `${value} ${unit}`;
// 			} else if (noTranslation) {
// 				return value;
// 			} else if (dateFormatterwithHoursValue) {
// 				return convertFromUTCtoTZ(value, preferedTimeZone);
// 			} else {
// 				return t(unit ? `${value} ${unit}s` : value);
// 			}
// 		} else if (column_combination) {
// 			if (formatTime) {
// 				return (
// 					convertFromUTCtoTZ(firstColumnValue, preferedTimeZone, 'hh:mm') +
// 					' - ' +
// 					convertFromUTCtoTZ(secondColumnValue, preferedTimeZone, 'hh:mm')
// 				);
// 			} else {
// 				return firstColumnValue + ' - ' + secondColumnValue;
// 			}
// 		} else if (rank) {
// 			return index + 1;
// 		} else return '-';
// 	};

// 	const handleClickRow = (item: any) => {
// 		if (rowPath) {
// 			navigate(`../${rowPath}`, { state: item });
// 		}
// 	};

// 	return Array.isArray(data) && data?.length !== 0 ? (
// 		<Card className='overall-card'>
// 			<CardBody className='table-responsive p-0'>
// 				<div className='table-responsive p-0 vehicles-dashboard'>
// 					{perPage === 50 && !displayFullData && (
// 						<PaginationButtons
// 							data={items}
// 							label='items'
// 							setCurrentPage={setCurrentPage}
// 							currentPage={currentPage}
// 							perPage={perPage}
// 							setPerPage={setPerPage}
// 						/>
// 					)}
// 					<table
// 						className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
// 						<thead>
// 							<tr style={TableStyle}>
// 								{withCheckbox && <th scope='col'>{SelectAllCheck}</th>}
// 								{columns.map(({ name, key, sortable, width }, index) => (
// 									<th
// 										key={`th-${index}`}
// 										style={{ ...thStyle, width: width as string }}
// 										onClick={() => (sortable ? requestSort(key) : null)}
// 										className={sortable ? 'cursor-pointer' : ''}>
// 										{t(name as string)}
// 										{sortable && (
// 											<Icon
// 												size='lg'
// 												className={`${getClassNamesFor(key)}  ms-2`}
// 												icon='FilterList'
// 											/>
// 										)}
										
// 									</th>
// 								))}
// 								{isEditable && <th />}
// 							</tr>
// 						</thead>
// 						<tbody>
// 							{dataPagination(items, currentPage, perPage).map((item, index) => {
// 								const countArray = items.map((el) => Number(el.count));
// 								return (
// 									<tr
// 										className={rowPath ? 'row-hover' : ''}
// 										style={trStyleTable}
// 										key={`tr-${index}`}>
// 										{withCheckbox && (
// 											<th scope='row'>
// 												<Checks
// 													className='custom-check'
// 													id={item?.[uniqueId]?.toString()}
// 													name='selectedList'
// 													value={item?.[uniqueId]}
// 													onChange={selectTable.handleChange}
// 													checked={selectTable.values.selectedList.includes(
// 														// @ts-ignore
// 														item?.[uniqueId]?.toString(),
// 													)}
// 												/>
// 											</th>
// 										)}
// 										{columns.map(
// 											(
// 												{
// 													key,
// 													unit,
// 													format_date,
// 													format_time,
// 													format_date_only,
// 													column_combination,
// 													firstColumn,
// 													secondColumn,
// 													rank,
// 													progressBar,
// 													noTranslation,
// 													dateFormatterwithHoursValue,
// 												},
// 												idx,
// 											) => {
// 												return (
// 													<td
// 													 style={{border: '0.5px solid #D1D5DB',padding:"15px"}}
// 														key={`td-${idx}`}
// 														onClick={() => handleClickRow(item)}>
// 														{progressBar ? (
// 															<div className='row'>
// 																<div className='col-md-8'>
// 																	<ProgressCustomColor
// 																		value={parseInt(
// 																			item[key as string],
// 																		)}
// 																		height={20}
// 																		max={Math.max(
// 																			...countArray,
// 																		)}
// 																	/>
// 																</div>
// 																<div className='col-md-4'>
// 																	<span>
// 																		{item[key as string]}
// 																	</span>
// 																</div>
// 															</div>
// 														) : (
// 															displayValue(
// 																item[key as string],
// 																unit as string,
// 																format_date as boolean,
// 																format_time as boolean,
// 																format_date_only as boolean,
// 																column_combination as boolean,
// 																item[firstColumn as string],
// 																item[secondColumn as string],
// 																rank as boolean,
// 																index,
// 																noTranslation as boolean,
// 																dateFormatterwithHoursValue as boolean,
// 															)
// 														)}
// 													</td>
// 												);
// 											},
// 										)}
// 										{isEditable && (
// 											<th
// 												scope='row'
// 												onClick={() =>
// 													isEditable({ datum: item, open: true })
// 												}
// 												className='cursor-pointer'>
// 												<Icon size='lg' icon='Edit' />
// 											</th>
// 										)}
// 									</tr>
// 								);
// 							})}
// 						</tbody>
// 					</table>
// 				</div>
// 				{!displayFullData && (
// 					<PaginationButtons
// 						data={items}
// 						label='items'
// 						setCurrentPage={setCurrentPage}
// 						currentPage={currentPage}
// 						perPage={perPage}
// 						setPerPage={setPerPage}
// 					/>
// 				)}
// 			</CardBody>
// 		</Card>
// 	) : (
// 		<div className='noReports-found'>
// 			<SvgNoReportsFound/>
// 		</div>
// 	);
// };

// export default Datatable;



//previous

import React, { FC, useState, useEffect } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../../components/PaginationButtons';
import Icon from '../../../../components/icon/Icon';
import Alert from '../../../../components/bootstrap/Alert';
import { useTranslation } from 'react-i18next';
import { thStyle, trStyleTable } from '../../../notifications/constants/NotificationConstants';
import useSortableData from '../../../../hooks/useSortableData';
import { TableStyle } from '../../../alarms_notifications/components/constants/alarmConstants';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { convertFromUTCtoTZ, convertToDateWithUTC } from '../../../../helpers/helpers';
import ProgressCustomColor from '../../../../components/bootstrap/ProgressCustomColor';
import useSelectTable from '../../../../hooks/useSelectTable';
import Checks from '../../../../components/bootstrap/forms/Checks';
import { useNavigate } from 'react-router-dom';
import { ISuperAdminPanelResponse } from '../../../../type/settings-type';
import { IScheduledReports } from '../../../../type/reports-types';
import SvgNoReportsFound from '../../../../components/icon/material-icons/NoReportsFound';

interface IDataTableProps {
	data: { [key: string]: string | number }[] | ISuperAdminPanelResponse[] | IScheduledReports[];
	columns: { [key: string]: string | boolean | undefined }[];
	displayFullData?: boolean;
	config?: any;
	withCheckbox?: boolean;
	setSelectedList?: any;
	rowPath?: string;
	uniqueId?: string;
	isEditable?: (e: any) => void;
	translation?: string;
}

const Datatable: FC<IDataTableProps> = ({
	data,
	columns,
	displayFullData = false,
	config = null,
	withCheckbox,
	setSelectedList,
	rowPath,
	uniqueId = '_id',
	isEditable,
	translation = 'vehicles',
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation([translation]);
	const { items, requestSort, getClassNamesFor } = useSortableData(data, config);
	const [perPage, setPerPage] = useState(PER_COUNT[!displayFullData ? '5' : '50']);
	const [currentPage, setCurrentPage] = useState(1);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { selectTable, SelectAllCheck } = useSelectTable(items, uniqueId);

	useEffect(() => {
		if (setSelectedList) {
			setSelectedList(selectTable.values.selectedList);
		}
	}, [selectTable.values.selectedList, setSelectedList]);

	function incrementHour(dateTimeString: any) {
		const localTime = convertToDateWithUTC(dateTimeString, preferedTimeZone);
		localTime.setHours(localTime.getHours() + 1);
		return localTime.toISOString().slice(0, 19).replace('T', ' ');
	}

	const displayValue = (
		value: string,
		unit: string,
		formatDate: boolean,
		formatTime: boolean,
		formatDateOnly: boolean,
		column_combination: boolean,
		firstColumnValue: string,
		secondColumnValue: string,
		rank: boolean,
		index: number,
		noTranslation: boolean,
		dateFormatterwithHoursValue: boolean,
	) => {
		if (value) {
			if (formatDate) {
				return convertFromUTCtoTZ(value, preferedTimeZone);
			} else if (Array.isArray(value)) {
				return value.map((val) => t(val)).join(', ');
			} else if (formatTime) {
				return convertFromUTCtoTZ(value, preferedTimeZone, 'hh:mm');
			} else if (formatDateOnly) {
				return convertFromUTCtoTZ(value, preferedTimeZone, 'YYYY-MM-DD');
			} else if (value === '0' || value === '1') {
				return unit ? `${value} ${unit}` : value;
			} else if (unit && unit === '%') {
				return `${value} ${unit}`;
			} else if (noTranslation) {
				return value;
			} else if (dateFormatterwithHoursValue) {
				return convertFromUTCtoTZ(value, preferedTimeZone);
			} else {
				return t(unit ? `${value} ${unit}s` : value);
			}
		} else if (column_combination) {
			if (formatTime) {
				return (
					convertFromUTCtoTZ(firstColumnValue, preferedTimeZone, 'hh:mm') +
					' - ' +
					convertFromUTCtoTZ(secondColumnValue, preferedTimeZone, 'hh:mm')
				);
			} else {
				return firstColumnValue + ' - ' + secondColumnValue;
			}
		} else if (rank) {
			return index + 1;
		} else return '-';
	};

	const handleClickRow = (item: any) => {
		if (rowPath) {
			navigate(`../${rowPath}`, { state: item });
		}
	};

	return Array.isArray(data) && data?.length !== 0 ? (
		<>
			<Card className="overall-card1">
				<CardBody className="table-responsive p-0">
					<div className="table-responsive p-0 vehicles-dashboard">
						<table
							className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
							<thead>
								<tr style={TableStyle}>
									{withCheckbox && <th scope="col">{SelectAllCheck}</th>}
									{columns.map(({ name, key, sortable, width }, index) => (
										<th
											key={`th-${index}`}
											style={{ ...thStyle, width: width as string }}
											onClick={() => (sortable ? requestSort(key) : null)}
											className={sortable ? 'cursor-pointer' : ''}>
											{t(name as string)}
											{sortable && (
												<Icon
													size="lg"
													className={`${getClassNamesFor(key)} ms-2`}
													icon="FilterList"
												/>
											)}
										</th>
									))}
									{isEditable && <th />}
								</tr>
							</thead>
							<tbody>
								{dataPagination(items, currentPage, perPage).map((item, index) => {
									const countArray = items.map((el) => Number(el.count));
									return (
										<tr
											className={rowPath ? 'row-hover' : ''}
											style={trStyleTable}
											key={`tr-${index}`}>
											{withCheckbox && (
												<th scope="row">
													<Checks
														className="custom-check"
														id={item?.[uniqueId]?.toString()}
														name="selectedList"
														value={item?.[uniqueId]}
														onChange={selectTable.handleChange}
														checked={selectTable.values.selectedList.includes(
															// @ts-ignore
															item?.[uniqueId]?.toString()
														)}
													/>
												</th>
											)}
											{columns.map(
												(
													{
														key,
														unit,
														format_date,
														format_time,
														format_date_only,
														column_combination,
														firstColumn,
														secondColumn,
														rank,
														progressBar,
														noTranslation,
														dateFormatterwithHoursValue,
													},
													idx,
												) => {
													return (
														<td
															style={{ border: '0.5px solid #D1D5DB', padding: '15px' }}
															key={`td-${idx}`}
															onClick={() => handleClickRow(item)}>
															{progressBar ? (
																<div className="row">
																	<div className="col-md-8">
																		<ProgressCustomColor
																			value={parseInt(item[key as string])}
																			height={20}
																			max={Math.max(...countArray)}
																		/>
																	</div>
																	<div className="col-md-4">
																		<span>{item[key as string]}</span>
																	</div>
																</div>
															) : (
																displayValue(
																	item[key as string],
																	unit as string,
																	format_date as boolean,
																	format_time as boolean,
																	format_date_only as boolean,
																	column_combination as boolean,
																	item[firstColumn as string],
																	item[secondColumn as string],
																	rank as boolean,
																	index,
																	noTranslation as boolean,
																	dateFormatterwithHoursValue as boolean
																)
															)}
														</td>
													);
												}
											)}
											{isEditable && (
												<th
													scope="row"
													onClick={() =>
														isEditable({ datum: item, open: true })
													}
													className="cursor-pointer">
													<Icon size="lg" icon="Edit" />
												</th>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardBody>
			</Card>

			{/* Move Pagination Buttons Outside the Card */}
			{!displayFullData && (
				<PaginationButtons
					data={items}
					label="items"
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					perPage={perPage}
					setPerPage={setPerPage}
				/>
			)}
		</>
	) : (
		<div className="noReports-found">
			<SvgNoReportsFound />
		</div>
	);
};

export default Datatable;

