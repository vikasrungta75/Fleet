import React, { FC, useEffect, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../components/PaginationButtons';
import Icon from '../../../components/icon/Icon';
import Alert from '../../../components/bootstrap/Alert';
import { useTranslation } from 'react-i18next';
import { thStyle, trStyleTable } from '../../notifications/constants/NotificationConstants';
import useSortableData from '../../../hooks/useSortableData';
import { TableStyle } from '../../alarms_notifications/components/constants/alarmConstants';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { convertFromUTCtoTZ } from '../../../helpers/helpers';
import ProgressCustomColor from '../../../components/bootstrap/ProgressCustomColor';
import Spinner from '../../../components/bootstrap/Spinner';
import Button from '../../../components/bootstrap/Button';
import { TasksPages } from '../../../menu';
import { useNavigate } from 'react-router-dom';
import DeleteTask from '../DeleteTask';

interface IDataTableProps {
	data: { [key: string]: any }[];
	columns: { [key: string]: string | boolean | undefined }[];
	displayFullData?: boolean;
	config?: any;
	setSortOrder: any;
	sortorder: any;
	isLoading: any;
	sortField: string;
	height?: number;
}

const SimpleDataTableSort: FC<IDataTableProps> = ({
	data,
	columns,
	displayFullData = false,
	config = null,
	setSortOrder,
	sortorder,
	isLoading = false,
	sortField,
	height,
}) => {
	useEffect(() => {}, [data]);
	const { t } = useTranslation(['vehicles']);
	const { items, requestSort, getClassNamesFor } = useSortableData(data, config);
	const [perPage, setPerPage] = useState(PER_COUNT[!displayFullData ? '5' : '50']);
	const [currentPage, setCurrentPage] = useState(1);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [showDelete, setShowDelete] = useState(false);
	const [deletePayload, setDeletePayload] = useState<any>({});
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
		statusdisplay?: any,
	) => {
		const statusStyles: any = {
			scheduled: {
				backgroundColor: '#BEE5FB',
				padding: '5px',
				borderRadius: '5px',
				color: '#0B72AD',
			},
			delayed: {
				backgroundColor: '#E4E4E4',
				padding: '5px',
				borderRadius: '5px',
				color: '#646464',
			},
			delivered: {
				backgroundColor: '#D9FBBE',
				padding: '5px',
				borderRadius: '5px',
				color: '#3C7D08',
			},
			undelivered: {
				backgroundColor: '#FEDCDC',
				padding: '5px',
				borderRadius: '5px',
				color: '#FB6A6A',
			},
		};

		if (statusdisplay && statusStyles[value]) {
			return <span style={statusStyles[value]}>{t(value)}</span>;
		}

		if (value) {
			if (formatDate) {
				return convertFromUTCtoTZ(value, preferedTimeZone);
			} else if (formatTime) {
				return convertFromUTCtoTZ(value, preferedTimeZone, 'hh:mm');
			} else if (formatDateOnly) {
				return convertFromUTCtoTZ(value, preferedTimeZone, 'YYYY-MM-DD');
			} else if (value === '0' || value === '1') {
				return unit ? `${value} ${unit}` : value;
			} else if (unit && unit === '%') {
				return `${value} ${unit}`;
			} else {
				return unit ? `${value} ${unit}` : value;
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

	// Map POI status to end icon image
	const getEndIconImage = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'delivered':
				return require('../../../assets/truck1.png');
			case 'delayed':
				return require('../../../assets/end3icon.png');
			case 'undelivered':
				return require('../../../assets/end1icon.png');
			default:
				return require('../../../assets/end2icon.png');
		}
	};

	let navigate = useNavigate();
	const handleDeleteDriver = (payload: any) => {
	
		setDeletePayload(payload);
		setShowDelete(true);
	};
	const handleCloseModal = (value: any) => {
		setShowDelete(false);
	};

	const [hoveredPOI, setHoveredPOI] = useState<number | null>(null); // track hovered POI index

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'delivered':
				return '#D9FBBE'; // dark green ✅
			case 'delayed':
				return '#FFEBA7'; // yellow/golden ✅
			case 'undelivered':
				return '#CECECE'; // gray ✅
			default:
				return '#D3EAFF'; // light blue ✅
		}
	};
	const getStatusColor1 = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'delivered':
				return '#3C7D08'; // dark green ✅
			case 'delayed':
				return '#DCA902'; // yellow/golden ✅
			case 'undelivered':
				return '#7F7F7F'; // gray ✅
			default:
				return '#1A78CA'; // light blue ✅
		}
	};

	return isLoading ? (
		<Card>
			<div
				className='d-flex justify-content-center  align-items-center'
				style={{ height: '200px' }}>
				<Spinner color='secondary' size='5rem' />
			</div>
		</Card>
	) : Array.isArray(data) && data?.length !== 0 ? (
		<Card>
			<CardBody>
				{data.map((item, index) => (
					<div key={index} className='mb-4 p-3 border rounded shadow-sm bg-white'>
						{/* Header */}
						<div className='d-flex justify-content-between align-items-center mb-3'>
							<div>
								<h5 className='fw-bold mb-1'>{item.task_name || index + 1}</h5>
								<small>
									{t('Started')}: {item.started || '-'} • {t('ETA')}:{' '}
									{item.eta && item.eta !== 'Data Not Available'
										? convertFromUTCtoTZ(item.eta, preferedTimeZone)
										: item.eta || '-'}
								</small>
							</div>

							<span
								className='badge px-3 py-2'
								style={{
									backgroundColor: getStatusColor(item.poi_status),
									color: getStatusColor1(item.poi_status),
								}}>
								{item.poi_status}
							</span>
						</div>

						{/* Full-width POI timeline */}
						<div
							className='d-flex align-items-center'
							style={{ width: '100%', padding: '20px 40px' }}>
							{/* Start point */}
							<div className='text-center' style={{ flex: '0 0 auto' }}>
								<img
									src={
										item.poi_status?.toLowerCase() === 'delivered'
											? require('../../../assets/greendot.png')
											: require('../../../assets/truck1.png')
									}
									alt='Start'
									style={{ width: '36px', height: '36px' }}
								/>
								<div className='mt-2 fw-semibold'>{t('Start')}</div>
								<div>
									<small>{item.vin || '-'}</small>
								</div>
								<div>
									<small>
										{t('Start Time')}:{' '}
										{item.task_datetime &&
										item.task_datetime !== 'Data Not Available'
											? convertFromUTCtoTZ(
													item.task_datetime,
													preferedTimeZone,
											  )
											: item.task_datetime || '-'}
									</small>
								</div>
							</div>

							{/* POIs */}
							{Array.isArray(item.pois) && item.pois.length > 0 ? (
								item.pois.map((poi: any, i: number) => {
									const isLast = i === item.pois.length - 1;

									return (
										<div
											key={i}
											className='d-flex align-items-center'
											style={{ flex: 1 }}>
											{/* Line connecting POIs */}
											<div
												style={{
													flex: 1,
													height: '1px',
													backgroundColor: 'black',
													borderRadius: '1px',
												}}
											/>

											{/* POI Icon */}
											<div
												className='text-center position-relative'
												onMouseEnter={() => setHoveredPOI(i)}
												onMouseLeave={() => setHoveredPOI(null)}
												style={{ flex: '0 0 auto', margin: '0 8px' }}>
												{poi?.comptime?.$date ? (
													// If comptime exists
													isLast ? (
														<img
															src={require('../../../assets/truck1.png')}
															alt='Completed End'
															style={{
																width: '43px',
																height: '42px',
															}}
														/>
													) : (
														<img
															src={require('../../../assets/greendot.png')}
															alt='Completed'
															style={{
																width: '34px',
																height: '34px',
															}}
														/>
													)
												) : isLast ? (
													<img
														src={getEndIconImage(item.poi_status)}
														alt='End'
														style={{ width: '34px', height: '34px' }}
													/>
												) : (
													<img
														src={require('../../../assets/dot1.png')}
														alt='Pending'
														style={{ width: '34px', height: '34px' }}
													/>
												)}

												<div className='fw-semibold'>{poi.name}</div>
												<div className='small text-muted'>
													{poi?.comptime?.$date || 'Data Not Available'}
												</div>

												{hoveredPOI === i && (
													<div
														className='position-absolute bg-white border rounded shadow p-2'
														style={{
															top: '50px',
															left: '50%',
															transform: 'translateX(-50%)',
															whiteSpace: 'nowrap',
															zIndex: 10,
														}}>
														<small className='text-muted'>
															{poi.address}
														</small>
													</div>
												)}
											</div>
										</div>
									);
								})
							) : (
								<p>{t('No POIs')}</p>
							)}

							{/* End point */}
							{/* <div className='text-center' style={{ flex: '0 0 auto' }}>
								<Icon icon='Flag' forceFamily='material' size='2x' color='dark' />
								<div className='mt-2 fw-semibold'>{t('End')}</div>
							</div> */}
						</div>

						<div className='d-flex justify-content-end'>
							<Button
								aria-label='Delete Button'
								className=' me-0'
								style={{
									zIndex: '3',
									marginLeft: 15,
								}}
								icon='Delete'
								// color='secondary'
								isLight
								isOutline
								onClick={() => handleDeleteDriver(item)}>
								{t('Delete')}
							</Button>
						</div>
					</div>
				))}

				{showDelete && (
					<DeleteTask
						showDelete={showDelete}
						setShowDelete={handleCloseModal}
						deletePayload={deletePayload}
					/>
				)}
			</CardBody>
		</Card>
	) : (
		<Card>
			<CardBody>
				<Alert color='info' className='flex-column w-100 align-items-start'>
					<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
						<Icon icon='Info' size='2x' className='me-2' />{' '}
						{t('No Data available for the selected filters.')}
					</p>
				</Alert>
			</CardBody>
		</Card>
	);
};

export default SimpleDataTableSort;
