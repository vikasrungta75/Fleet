import React, { useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import useSortableData from '../../../../hooks/useSortableData';
import { IAlarmDetail, IAlarmsListDataTableProps } from '../../../../type/alert-types';
import {
	columnsAlarmTypeDataTableWithout,
	columnsAlarmTypeDataTableWith,
	TableStyle,
	thStyle,
	trStyleTable,
} from '../constants/alarmConstants';
import { useNavigate } from 'react-router-dom';
import { alertsNotificationsPages } from '../../../../menu';
import Button from '../../../../components/bootstrap/Button';
import { convertFromUTCtoTZ } from '../../../../helpers/helpers';
import { RootState } from '../../../../store/store';
import { useSelector } from 'react-redux';
import Alert from '../../../../components/bootstrap/Alert';

const AlaramTypeDataTable: FC<IAlarmsListDataTableProps> = ({ alarmsDetailData }): JSX.Element => {
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [currentPage, setCurrentPage] = useState(1);

	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const { items, requestSort, getClassNamesFor } = useSortableData(alarmsDetailData);
	const { t } = useTranslation(['vehicles', 'alertNotification']);
	const navigate = useNavigate();
	const navigateToDetails = (vin: string, time: string) => {
		navigate(`../${alertsNotificationsPages.alertsDetails.path}/${vin}/${time}`);
	};
	const alarmTypesWithTimeOnly = ['Geofence Zone', 'DTC Detection', 'Crash Detection'];
	const displayTimeOnly: boolean = alarmTypesWithTimeOnly.includes(
		alarmsDetailData[0]?.alarm_detail,
	);

	return alarmsDetailData.length > 0 ? (
		<Card>
			<CardBody>
				<div className='table-responsive pt-0 vehicles-dashboard'>
					{perPage === 50 && (
						<PaginationButtons
							data={items}
							label='items'
							setCurrentPage={setCurrentPage}
							currentPage={currentPage}
							perPage={perPage}
							setPerPage={setPerPage}
						/>
					)}
					<table
						className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
						<thead>
							<tr style={TableStyle}>
								{(displayTimeOnly
									? columnsAlarmTypeDataTableWith
									: columnsAlarmTypeDataTableWithout
								).map(({ name, key, sortable, width }, index) => (
									<th
										key={index}
										style={{
											width: width,
											...thStyle,
										}}
										onClick={() =>
											sortable === true ? requestSort(key) : null
										}
										className={sortable ? 'cursor-pointer' : ''}>
										{t(name)}
										{sortable && (
											<Icon
												size='lg'
												className={`${getClassNamesFor(key)} ms-2`}
												icon='FilterList'
											/>
										)}
									</th>
								))}
								<th />
							</tr>
						</thead>
						<tbody>
							{dataPagination(items, currentPage, perPage).map(
								(item: IAlarmDetail, index) => {
									return (
										<tr
											style={trStyleTable}
											key={index}
											onClick={() =>
												navigateToDetails(item.vin, item.start_time)
											}>
											<td>{item.location ?? '-'}</td>
											<td>{item.model ?? '-'}</td>
											<td>{item.fuel_type ?? '-'}</td>
											{displayTimeOnly && <td>{item.time ?? '-'}</td>}
											{!displayTimeOnly && (
												<td>
													{convertFromUTCtoTZ(
														item.start_time,
														preferedTimeZone,
													) ?? '-'}
												</td>
											)}
											{!displayTimeOnly && (
												<td>
													{' '}
													{convertFromUTCtoTZ(
														item.end_time,
														preferedTimeZone,
													) ?? '-'}
												</td>
											)}
											<td>{t(`${item.alarm_detail}`)}</td>
											<td>
												<div className='d-flex align-items-center float-end'>
													<Button
														aria-label='Go Forward'
														className='light-btn ms-3'
														size='sm'
														color='dark'
														isLight
														onClick={() => {
															navigateToDetails(
																item.vin,
																item.start_time,
															);
														}}>
														{t('View Map', { ns: 'alertNotification' })}
														<Icon
															icon={
																dir === 'rtl'
																	? 'ArrowBackIos'
																	: 'ArrowForwardIos'
															}
															className='ms-3'
															size='md'
														/>
													</Button>
												</div>
											</td>
										</tr>
									);
								},
							)}
						</tbody>
					</table>
					<PaginationButtons
						data={items}
						label='items'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</div>
			</CardBody>
		</Card>
	) : (
		<Card>
			<CardBody>
				<Alert color='info' className='flex-column w-100 align-items-start'>
					<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
						<Icon icon='Info' size='2x' className='me-2' /> {t('No Alarms Found')}
					</p>
				</Alert>
			</CardBody>
		</Card>
	);
};

export default AlaramTypeDataTable;
