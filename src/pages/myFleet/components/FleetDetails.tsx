import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Badge from '../../../components/bootstrap/Badge';
import Button from '../../../components/bootstrap/Button';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import Icon from '../../../components/icon/Icon';
import { IvehicleLocation } from '../../../type/vehicles-type';
import { statusInformations } from './map/constants/mapConstants';
import { RootState } from '../../../store/store';
import arrowback from '../../../assets/img/ArrowBack.png';
import info from '../../../assets/img/info.png';
import SummaryAlarmStatics from '../../alarms_notifications/components/SummaryAlarmsStatic';

interface IFleetDetailsProps {
	setIsModalOpen: (val: boolean) => void;
	isModalOpen: boolean;
	vehicleDetails: IvehicleLocation;
}

const FleetDetail: FC<IFleetDetailsProps> = ({ setIsModalOpen, isModalOpen, vehicleDetails }) => {
	const { t } = useTranslation(['vehicles']);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
	const {
		fuel,
		group_name: groupName,
		last_seen_location: lastSeenLocation,
		lat,
		lng,
		make,
		model,
		odometer,
		oem,
		registration_no: regNo,
		speed,
		status,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		last_updated,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		driver_name,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		driver_id,
		// trouble,
		vin,
	} = vehicleDetails;
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const detailsFields = {
		informations: [
			{ label: 'Make', value: make },
			{ label: 'Model', value: model },
			{ label: 'Reg no', value: regNo },
			{ label: 'OEM', value: oem },
		],
		location: [
			{ label: 'Current heading', value: lat && `${lat} - ${lng}` },
			{ label: 'Last seen location', value: lastSeenLocation },
		],
		details: [
			{
				icon: 'Sensors',
				label: 'Status : ',
				value: (
					<Badge className='' color={statusInformations[status].color}>
						{t(`${status}`)}
					</Badge>
				),
			},
			{ icon: 'People', label: 'Group : ', value: groupName },
			{ icon: 'Speed', label: 'Speed : ', value: speed, unitOfMeasure: 'Km/h' },
			{ icon: 'Odometer', label: 'Odometer : ', value: odometer, unitOfMeasure: 'mileage' },
			{
				icon: 'LocalGasStation',
				label: 'Fuel Remaining : ',
				value: fuel,
				unitOfMeasure: '%',
			},
			{
				icon: 'LocalGasStation',
				label: 'Driver information : ',
				fullWidth: true,
				value: (
					<div className='d-flex flex-row gap-3 align-items-center'>
						{driver_name === 'data not available' ? (
							<>
								<div className='driver-information'>
									<span style={{ fontWeight: 700 }}>Not assigned</span>
								</div>
							</>
						) : (
							<>
								<div className='driver-information'>
									<span style={{ fontWeight: 700 }}>Name</span> : {driver_name}
								</div>
								<div className='driver-information'>
									<span style={{ fontWeight: 700 }}>ID</span> : {driver_id}
								</div>
							</>
						)}
					</div>
				),
			},
		],
	};

	const [selectedHeader, setSelectedHeader] = useState('Alert');

	// Function to handle header toggle
	const handleHeaderChange = (header: React.SetStateAction<string>) => {
		setSelectedHeader(header);
	};
	return (
		<>
			<OffCanvas
				style={{ width: 350 }}
				id='show-fleet-details'
				titleId='fleet details'
				placement='end'
				isOpen={isModalOpen}
				setOpen={setIsModalOpen}
				isBackdrop={false}
				isBodyScroll>
				<OffCanvasHeader
					className='border-1 border-bottom '
					style={{
						height: '100px',
					}}>
					<div>
						<Button
							style={{
								position: 'relative',
								padding: '0',
								background: 'none',
								border: 'none',
							}}
							onClick={() => setIsModalOpen(!isModalOpen)}>
							<img
								src={arrowback}
								alt='backButton'
								style={{
									width: '30px',
									height: '30px',
									position: 'relative',
									top: '-5px',
								}}
							/>
						</Button>
						<p className='summaryOne' style={{ color: '#1A78CA' }}>
							Summary Info
						</p>
					</div>
				</OffCanvasHeader>

				<OffCanvasBody className='ps-4 pe-0 '>
					{/*INFORMATION SECTION*/}
					<div className='justify-content-between mb-0 mt-0'>
						<div className='fs-3 summary'>{t(`Informations`)}</div>
					</div>

					<div className=' align-items-start col-12'>
						{detailsFields.informations.map(({ label, value }) => {
							return (
								<dl className={`d-flex align-items-center col-12 mb-1`} key={label}>
									<dt className='col-4 text-start'>{t(`${label}`)} : </dt>
									<dd className='col-6'>{value}</dd>
								</dl>
							);
						})}
					</div>

					{/*LOCATION SECTION*/}
					<div className='justify-content-between mb-0 mt-0 '>
						<div className='fs-3 summary'>{t(`Location`)}</div>
					</div>

					{detailsFields.location.map(({ label, value }) => {
						return (
							<dl key={label}>
								<dt style={{ textAlign: 'start' }} className='mb-1'>
									{t(`${label}`)} :
								</dt>
								<dd className='mb-0'>{value}</dd>
							</dl>
						);
					})}
					{/*DETAILS SECTION*/}
					<div className=' justify-content-between mb-0 mt-0 '>
						<div className='fs-3 summary'>{t(`Details`)}</div>
					</div>

					<div className='align-items-start col-12'>
						{detailsFields.details.map(
							({ icon, label, value, unitOfMeasure, fullWidth }) => {
								return (
									<dl
										className={`d-flex align-items-center col-12 mb-1`}
										key={label}>
										<dt className='col-4 text-start'>{t(`${label}`)}</dt>
										<dd className='col-6'>
											{unitOfMeasure ? `${value} ${unitOfMeasure}` : value}
										</dd>
									</dl>
								);
							},
						)}
					</div>
				</OffCanvasBody>
				{/*FOOTER SECTION*/}
				<div
					className='position-relative d-flex flex-column justify-content-evenly align-items-start'
					style={{ height: 150 }}>
					<div>
						<p className='sum'>*Displayed Data shown based on Current Vehicle Status</p>
					</div>
					<div className='bottom-0 border-1 border-top d-flex align-items-center justify-content-between w-100'>
						<Button
							onClick={() => {
								// eslint-disable-next-line @typescript-eslint/no-shadow
								const dateFormatter = (date: Date): string =>
									date.toISOString().split('.')[0];

								const endDate = new Date(); // Today
								const startDate = new Date();
								startDate.setDate(startDate.getDate() - 30); // 7 days ago (adjust as needed)

								// Format dates
								const formattedStartDate = dateFormatter(startDate);
								const formattedEndDate = dateFormatter(endDate);

								// Define additional parameters
								const fleetId = 'All Fleets';
								// eslint-disable-next-line @typescript-eslint/no-shadow
								const vin = vehicleDetails.vin;
								const alarmType = 'All Alarms';

								const payload = {
									fleet_id: fleetId,
									fleet_name: 'All Fleets',
									vin: vin,
									alarm_type: alarmType,
									startdate: formattedStartDate,
									enddate: formattedEndDate,
								};

								const getAlarmsDetail = async () => {
									try {
										const response =
											await dispatch.alertsNotifications.getAlarmTypeDetails(
												payload,
											);
									} catch (error) {
										console.error('Error fetching alarm details:', error);
									}
								};

								const getAlarms = async () => {
									await dispatch.alertsNotifications.getListOfAlarms(payload);
								};
								const getTotalCountOfAlarms = async () => {
									await dispatch.alertsNotifications.getTotalCountOfAlarms(
										payload,
									);
								};
								const getTotalCountOfEachAlarms = async () => {
									try {
										const response =
											await dispatch.alertsNotifications.getTotalCountOfEachAlarm(
												payload,
											);
										// assuming response returns data in the format you shared
										// setAlarmData(response);
									} catch (error) {
										console.error(
											'Error fetching total count of each alarms:',
											error,
										);
									}
								};

								getAlarmsDetail();
								getTotalCountOfAlarms();
								getTotalCountOfEachAlarms();
								setIsSecondModalOpen(true);
							}}
							className='summary'>
							<Icon icon='NotificationsActive' size='2x' className='me-2 ss' />
							<span className='button-textOne'>{t('View Alerts & DTC')}</span>
						</Button>
					</div>
					<div className='d-flex align-items-center justify-content-between w-100'>
						<Button onClick={() => {}} className='' style={{ color: '#E41F3F' }}>
							<Icon icon='PowerSettingsNew' size='2x' className='me-3' />
							<span className='button-textOne'>{t('Engine shutdown')}</span>
						</Button>
					</div>
				</div>
			</OffCanvas>
			{/* two */}
			<OffCanvas
				style={{ width: 350 }}
				id='show-fleet-details'
				titleId='fleet details'
				placement='end'
				isOpen={isSecondModalOpen}
				setOpen={setIsSecondModalOpen}
				isBackdrop={false}
				isBodyScroll>
				<OffCanvasHeader
					className='border-1 border-bottom '
					style={{
						height: '100px',
					}}>
					<div>
						<Button
							style={{
								position: 'relative',
								padding: '0',
								background: 'none',
								border: 'none',
							}}
							onClick={() => setIsSecondModalOpen(!isSecondModalOpen)}>
							<img
								src={arrowback}
								alt='backButton'
								style={{
									width: '30px',
									height: '30px',
									position: 'relative',
									top: '-5px',
								}}
							/>
						</Button>

						<div className='tabHeader'>
							<Button
								onClick={() => handleHeaderChange('Alert')}
								isActive={selectedHeader === 'Alert'}
								// className='w-50 bg-white text-center border-0'
								style={{ color: selectedHeader === 'Alert' ? '#1A78CA' : '' }}>
								{t('Alerts')}
							</Button>
							<Button
								onClick={() => handleHeaderChange('DTC')}
								isActive={selectedHeader === 'DTC'}
								// className='w-50 bg-white text-center border-0  '
								style={{ color: selectedHeader === 'DTC' ? '#1A78CA' : '' }}>
								{t('DTC')}
							</Button>
						</div>
					</div>
				</OffCanvasHeader>

				<OffCanvasBody className='ps-4 pe-0'>
					{/* {selectedHeader === 'Alert' && <SummaryAlarmStatics data={alarmData}/>} */}
					{selectedHeader === 'Alert' && <SummaryAlarmStatics />}
					{selectedHeader === 'DTC' && (
						<div>
							<div className='fs-3 summary'>{t('DTC Information')}</div>
							<div className='align-items-start col-12'>
								<p>No data</p>
							</div>
						</div>
					)}
				</OffCanvasBody>
				{/*FOOTER SECTION*/}
				<div
					className='position-relative d-flex flex-column justify-content-evenly align-items-start'
					style={{ height: 150 }}>
					<div>
						<p className='sum'>*Displayed Data shown based on Current Vehicle Status</p>
					</div>
					<div className='bottom-0 border-1 border-top d-flex align-items-center justify-content-between w-100'>
						<Button
							onClick={() => setIsSecondModalOpen(!isSecondModalOpen)}
							className='summary'>
							<img src={info} alt='backButton' />
							<span className='button-textOne'> {t('View Summary Info')}</span>
						</Button>
					</div>
					<div className='d-flex align-items-center justify-content-between w-100'>
						<Button onClick={() => {}} className='' style={{ color: '#E41F3F' }}>
							<Icon icon='PowerSettingsNew' size='2x' className='me-3' />
							<span className='button-textOne'>{t('Engine shutdown')}</span>
						</Button>
					</div>
				</div>
			</OffCanvas>
		</>
	);
};

export default FleetDetail;
