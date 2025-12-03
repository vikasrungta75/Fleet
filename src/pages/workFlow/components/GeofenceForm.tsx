import { FormikValues } from 'formik';
import React, { useContext, useEffect, useState, useRef } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import ThemeContext from '../../../contexts/themeContext';
import FleetSelect from '../../common/filters/FleetSelect';
import VinSelect from '../../common/filters/VinSelect';
import { useTranslation } from 'react-i18next';
import { radioButtonChoice } from '../constants/constants';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import Label from '../../../components/bootstrap/forms/Label';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Select from '../../../components/bootstrap/forms/Select';
import MapButton from '../../myFleet/components/map/components/MapButton';
import {
	cercle,
	cercleColored,
	polygone,
	polygoneColored,
	polyline,
} from '../../myFleet/components/map/constants/mapConstants';
import PointOfInterest from './PointOfInterest';
import DatePicker from '../../../components/DatePicker';
import { IDateRangeFilter } from '../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../helpers/helpers';
import DatePickerTask from '../../../components/DatePickerTask';
import TimePicker from '../../../components/TimePicker';
import TimePickerOne from '../../../components/TimePickerOne';
import moment from 'moment';
import RecurrencePicker from '../constants/RecurrencePicker';
import { useDispatch } from 'react-redux';

interface IGeofenceFormProps {
	fleetNameFilter: string;
	setFleetNameFilter: (fleetName: string) => void;
	setVinFilter: (vin: string) => void;
	vinFilter: string;
	setGeofenceType: (value: string) => void;
	geofenceType: string;
	GeofenceShape: {
		circle: boolean;
		polygone: boolean;
		polyline: boolean;
	};
	setGeofencePoint: (value: { lat: 0; lng: 0 }) => void;
	setGeofenceShape: (value: any) => void;
	formik: FormikValues;
}

const GeofenceForm = (props: IGeofenceFormProps) => {
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { t, i18n } = useTranslation(['geofence']);

	const {
		fleetNameFilter,
		setFleetNameFilter,
		setVinFilter,
		vinFilter,
		setGeofenceType,
		geofenceType,
		setGeofenceShape,
		GeofenceShape,
		formik,
	} = props;
	const { mobileDesign } = useContext(ThemeContext);

	const dispatch = useDispatch();

	const { dir } = useSelector((state: RootState) => state.appStore);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	const handleRadioChange = (e: any) => {
		const { value } = e.target;
		if (value) {
			setGeofenceType(value);
		}
	};

	const roundedToKm = formik?.values?.radiusGeofence.toString().slice(0, -3) || 0;
	const roundedToM = formik?.values?.radiusGeofence.toString() || 0;
	const { filterPayload } = useSelector((state: RootState) => state.filters);

	const [step, setStep] = useState(0);
	const ref = useRef<any>(null);

	const [checked, setChecked] = useState<string[]>([]);
	const [isPOIVisible, setIsPOIVisible] = useState(true);
	const groupType = 'start';

	const handlePOIStartChange = (poi: any) => {
		const currentPOIs = formik.values.poiStart || [];

		// check if already exists (avoid duplicates)
		const exists = currentPOIs.find((p: any) => p.poi_id === poi.poi_id);

		let updatedPOIs;
		if (exists) {
			// remove it if unchecking
			updatedPOIs = currentPOIs.filter((p: any) => p.poi_id !== poi.poi_id);
		} else {
			// add new POI
			updatedPOIs = [...currentPOIs, poi];
		}

		formik.setFieldValue('poiStart', updatedPOIs);

		// Persist to localStorage
		localStorage.setItem('poiStart', JSON.stringify(updatedPOIs));
	};

	useEffect(() => {
		// Only run on client
		if (typeof window !== 'undefined') {
			const savedPOIs = localStorage.getItem('dataPOI_start');
			if (savedPOIs) {
				const parsedPOIs = JSON.parse(savedPOIs);

				// Update Redux state
				dispatch.appStoreNoPersist.setDataPOIStart(parsedPOIs);

				// Update Formik without triggering re-render loop
				formik.setFieldValue('poiStart', parsedPOIs.filter((p: any) => p.isChecked) || []);
			}
		}
		// Run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDateTimeCondition = (value: any) => {
		formik.setFieldValue('dateTimeCondition', value);
	};

	const handleAdmissibledelay = (value: any) => {
		formik.setFieldValue('admissibledelay', value);
	};
	const handleMinimumofvisitduration = (value: any) => {
		formik.setFieldValue('minimumofvisitduration', value);
	};

	const dataPOI = useSelector((state: RootState) => state.appStoreNoPersist.dataPOI);
	const { geofencePointOfInterest } = useSelector((state: RootState) => state.appStoreNoPersist);
	if (formik?.values?.dateTimeCondition) {
		/* empty */
	}

	const [showRecurrence, setShowRecurrence] = useState(false);

	return (
		<div>
			<CardBody>
				<form className='row g-4 m-auto'>
					<div className='col-12'>
						<FormGroup
							id='recurrence_enabled'
							name='recurrence_enabled'
							label={t('Enable Recurrence')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<div className='form-check form-switch'>
								<input
									className='form-check-input'
									type='checkbox'
									id='recurrence_enabled'
									name='recurrence_enabled'
									checked={formik.values.recurrence_enabled}
									onChange={(e) =>
										formik.setFieldValue('recurrence_enabled', e.target.checked)
									}
								/>
								<label className='form-check-label' htmlFor='recurrence_enabled'>
									{formik.values.recurrence_enabled ? t('On') : t('Off')}
								</label>
							</div>
						</FormGroup>
					</div>
					<div className='col-12'>
						<FormGroup
							id='recurrence'
							name='recurrence'
							label={t('Reoccurrence of Task')}
							labelClassName='fw-bold'>
							<Input
								placeholder='Repeat the task'
								type='text'
								value={
									formik.values.recurrence_type === 'daily'
										? formik.values.control_days.join(', ')
										: formik.values.control_days.join(', ')
								}
								readOnly
								onClick={() => setShowRecurrence(true)}
							/>
						</FormGroup>
						<RecurrencePicker
							isOpen={showRecurrence}
							onClose={() => setShowRecurrence(false)}
							onSave={(data: { recurrence_type: any; control_days: any }) => {
								formik.setFieldValue('recurrence_enabled', true);
								formik.setFieldValue('recurrence_type', data.recurrence_type);
								formik.setFieldValue('control_days', data.control_days);
							}}
						/>
					</div>
					<div className='col-12'>
						<FormGroup
							id='name'
							name='name'
							label={t('Name')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<Input
								placeholder={t('Type a task name')}
								type='text'
								onChange={formik.handleChange}
								value={formik.values.name}
								invalidFeedback={formik.errors.name}
								isTouched={formik.touched.name}
								isValid={formik.isValid}
							/>
						</FormGroup>
					</div>
					<div className='col-12'>
						<FormGroup
							label={t('Point of interest')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<PointOfInterest
								invalidFeedback={formik.errors.poiStart}
								checked={formik.values.poiStart}
								setchecked={handlePOIStartChange}
								isPOIVisible={isPOIVisible}
								setIsPOIVisible={() => setIsPOIVisible(!isPOIVisible)}
								groupType='start'
								title={t('Start Point')}
							/>
						</FormGroup>
					</div>

					{/* <div className='col-12'>
						<label
							className={'fw-bold'}
							style={{ color: '#000000' }}
							title={t('Add date & time condition')}>
							{t('Add date & time condition')}
						</label>
						{
							<DatePickerTask
								className={''}
								setDateRangeFilter={handleDateTimeCondition}
								dateRangeFilter={formik.values.dateTimeCondition}
								withHours={true}
								position={i18n.language === 'ar-AR' ? 'end' : 'start'}
							/>
						}
					</div> */}
					<div className='col-12'>
						<FormGroup
							label={t('Admissible delay + / -')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<TimePickerOne
								time={formik.values.admissibledelay}
								setTime={handleAdmissibledelay}
								name={'admissibledelay'}
							/>
						</FormGroup>
					</div>

					<div className='col-12'>
						<FormGroup
							label={t('Minimum of visit duration')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<TimePickerOne
								time={formik.values.minimumofvisitduration}
								setTime={handleMinimumofvisitduration}
								name={'minimumofvisitduration'}
							/>
						</FormGroup>
					</div>

					<div className='col-12'>
						<FormGroup
							id='description'
							name='description'
							label={t('Add description')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<Input
								placeholder={t('Enter a description')}
								type='text'
								onChange={formik.handleChange}
								value={formik.values.description}
								invalidFeedback={formik.errors.description}
								isTouched={formik.touched.description}
								isValid={formik.isValid}
							/>
						</FormGroup>
					</div>
					<div className='col-12'>
						<FormGroup
							id='id'
							name='id'
							label={t('Add unique ID')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<Input
								placeholder={t('Add unique ID')}
								type='text'
								onChange={formik.handleChange}
								value={formik.values.id}
								invalidFeedback={formik.errors.id}
								isTouched={formik.touched.id}
								isValid={formik.isValid}
							/>
						</FormGroup>
					</div>

					<p className='mb-2 fw-bold' style={{ color: '#000000' }}>
						{t('Assign task to')}
					</p>

					<FormGroup className='col-lg-12 d-flex'>
						<FormGroup
							className='col-4 d-flex align-items-center '
							labelClassName='col-6 mb-0 text-dark order-1'
							label={t('Vehicle')}>
							<input
								id='vehicle'
								value={'vehicle'}
								type='radio'
								name='service'
								className='form-check-input'
								onChange={formik.handleChange}
								checked={formik.values.service === 'vehicle'}
							/>
						</FormGroup>
						<FormGroup
							className='col-4 d-flex align-items-center '
							labelClassName='col-6 mb-0 text-dark order-1'
							label={t('Driver')}>
							<input
								id='driver'
								value={'driver'}
								type='radio'
								name='service'
								className='form-check-input'
								onChange={formik.handleChange}
								checked={formik.values.service === 'driver'}
							/>
						</FormGroup>
					</FormGroup>

					<div className='col-12'>
						<FormGroup
							label={t('Vehicle')}
							labelClassName='fw-bold'
							style={{ color: '#000000' }}>
							<VinSelect
								fleetNameFilter={fleetNameFilter}
								setVinFilter={setVinFilter}
								vinFilter={vinFilter}
								className={`${mobileDesign ? 'col-12 mb-3' : 'col-12'}`}
								invalidFeedback={formik.errors.geofenceVin}
								isTouched={formik.touched.geofenceVin}
								isValid={formik.isValid}
								isDisabled={!permissions.update_geofence}
								placeholder={t('Select a vehicle from the list')}
							/>
						</FormGroup>
					</div>
				</form>
			</CardBody>
		</div>
	);
};

export default GeofenceForm;
