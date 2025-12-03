import { FormikValues } from 'formik';
import React, { useContext, useEffect, useState, useRef } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import ThemeContext from '../../../../contexts/themeContext';
import FleetSelect from '../../../common/filters/FleetSelect';
import VinSelect from '../../../common/filters/VinSelect';
import { useTranslation } from 'react-i18next';
import { radioButtonChoice } from '../constants/constants';
import Checks, { ChecksGroup } from '../../../../components/bootstrap/forms/Checks';
import Label from '../../../../components/bootstrap/forms/Label';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import Select from '../../../../components/bootstrap/forms/Select';
import MapButton from '../../../myFleet/components/map/components/MapButton';
import {
	cercle,
	cercleColored,
	polygone,
	polygoneColored,
	polyline,
} from '../../../myFleet/components/map/constants/mapConstants';

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

	const { dir } = useSelector((state: RootState) => state.appStore);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	const { t } = useTranslation(['geofence']);

	const handleRadioChange = (e: any) => {
		const { value } = e.target;
		if (value) {
			setGeofenceType(value);
		}
	};

	const roundedToKm = formik?.values?.radiusGeofence.toString().slice(0, -3) || 0;
	const roundedToM = formik?.values?.radiusGeofence.toString() || 0;

	const [step, setStep] = useState(0);
	const ref = useRef<any>(null);

	useEffect(() => {
		const rangeLinePadding = 16;
		const calcStep = (ref.current.offsetWidth - rangeLinePadding) / ref.current.max;
		setStep(calcStep);
	}, [formik.values.unity]);

	

	return (
		<Card>
			<CardBody>
				<form className='row g-4 m-auto'>
					<div className='col-12'>
						<FormGroup
							id='geofenceName'
							name='geofenceName'
							label={t('Geofence name')}
							labelClassName='fw-bold'
							>
							<Input
								placeholder={t('Enter a location name')}
								type='text'
								autoComplete='Location_Name'
								onChange={formik.handleChange}
								value={formik.values.geofenceName}
								invalidFeedback={formik.errors.geofenceName}
								isTouched={formik.touched.geofenceName}
								isValid={formik.isValid}
								disabled={!permissions.update_geofence}
							/>
						</FormGroup>
					</div>
					<div className='col-12'>
						<FormGroup label={t('Group')} 
						labelClassName='fw-bold'
						>
							<FleetSelect
								className={`${mobileDesign ? 'col-12 mb-3' : 'col-12'}`}
								fleetNameFilter={fleetNameFilter}
								setFleetNameFilter={setFleetNameFilter}
								setVinFilter={setVinFilter}
								invalidFeedback={formik.errors.geofenceGroups}
								isTouched={formik.touched.geofenceGroups}
								isValid={formik.isValid}
								isDisabled={!permissions.update_geofence}
							/>
						</FormGroup>
					</div>
					<div className='col-12'>
						<FormGroup label={t('Vehicle')} labelClassName='fw-bold'>
							<VinSelect
								fleetNameFilter={fleetNameFilter}
								setVinFilter={setVinFilter}
								vinFilter={vinFilter}
								className={`${mobileDesign ? 'col-12 mb-3' : 'col-12'}`}
								invalidFeedback={formik.errors.geofenceVin}
								isTouched={formik.touched.geofenceVin}
								isValid={formik.isValid}
								isDisabled={!permissions.update_geofence}
							/>
						</FormGroup>
					</div>
					<div className='col-12 mb-3'>
						<Label className='fw-bold mb-3'>{t('Geofence type')}</Label>
						<div>
							<MapButton
								className={`${
									GeofenceShape.polygone
										? 'colored-button border-button-geofence-colored'
										: 'border-button-geofence'
								} `}
								key={1}
								id='PolygoneButton'
								icon={GeofenceShape.polygone ? polygoneColored : polygone}
								text=''
								title=''
								onClick={() =>
									setGeofenceShape({
										polygone: !GeofenceShape.polygone,
										circle: false,
										polyline: false,
									})
								}
								// tooltip={t('search')}
							/>
							<MapButton
								className={`${
									GeofenceShape.circle
										? 'colored-button border-button-geofence-colored'
										: 'border-button-geofence'
								} `}
								key={2}
								id='CirlceButton'
								icon={GeofenceShape.circle ? cercleColored : cercle}
								text=''
								title=''
								onClick={() =>
									setGeofenceShape({
										circle: !GeofenceShape.circle,
										polygone: false,
										polyline: false,
									})
								}
								// tooltip={t('search')}
							/>
							{
								<MapButton
									className={`${
										GeofenceShape.polyline
											? 'colored-button border-button-geofence-colored '
											: 'border-button-geofence color-svg-unselected-primary'
									} `}
									key={3}
									id='CirlceButton'
									icon={polyline}
									text=''
									title=''
									onClick={() =>
										setGeofenceShape({
											polyline: !GeofenceShape.polyline,
											circle: false,
											polygone: false,
										})
									}
									// tooltip={t('search')}
								/>
							}
						</div>
					</div>
					<div className='col-12 mb-3'>
						<Label className='fw-bold mb-3'>
							{t('Notification trigger')}
						</Label>
						<ChecksGroup isInline className='d-flex justify-content-between'>
							{radioButtonChoice.map(({ id, value }, index) => {
								return (
									<Checks
										key={index}
										className='form-check-input border-secondary'
										labelClassName='fw-bold'
										style={{ fontWeight: 600 }}
										type='radio'
										name='type'
										id={id}
										value={value}
										checked={geofenceType === value}
										onChange={(e) => {
											handleRadioChange(e);
										}}
										label={t(`${value}`)}
										disabled={!permissions.update_geofence}
									/>
								);
							})}
						</ChecksGroup>
					</div>
					<div className='d-flex justify-content-between align-items-center'>
						<div className='mr-auto p-2'>
							<Label className='fw-bold'>{t('define a zone')}</Label>
						</div>
						<div className='w-25'>
							<Select
								className='w-100'
								ariaLabel='select-map'
								name='unity'
								value={formik.values.unity}
								onChange={formik.handleChange}>
								{/* <option selected disabled>
									KM
								</option> */}
								<option selected={formik.values.unity === 'KM'} value='KM'>
									KM
								</option>
								<option selected={formik.values.unity === 'M'} value='M'>
									M
								</option>
							</Select>
						</div>
					</div>

					<Card className='mt-0'>
						<CardBody>
							<div
								className={`${
									!GeofenceShape.circle && !GeofenceShape.polyline
										? 'text-custom-grey'
										: ''
								} d-flex justify-content-between mt-2 mb-1 fw-semibold`}>
								{formik.values.unity === 'KM' ? (
									<>
										<div>1km</div>
										<div className='ms-3'>50km</div>
										<div>100km</div>
									</>
								) : (
									<>
										<div>50m</div>
										<div className='ms-3'>500m</div>
										<div>999m</div>
									</>
								)}
							</div>
							<Input
								type='range'
								min={formik.values.unity === 'KM' ? '1000' : '50'}
								max={formik.values.unity === 'KM' ? '100000' : '999'}
								step={formik.values.unity === 'KM' ? 1000 : 10}
								// min='1000'
								// max='100000'
								// step={1000}
								className='form-range'
								id='radiusGeofence'
								onChange={(e: { target: { value: string } }) => {
									formik.setFieldValue('radiusGeofence', e.target.value);
								}}
								value={formik.values.radiusGeofence}
								invalidFeedback={formik.errors.radiusGeofence}
								isTouched={formik.touched.radiusGeofence}
								isValid={formik.isValid}
								ref={ref}
								disabled={
									!permissions.update_geofence ||
									(!GeofenceShape.circle && !GeofenceShape.polyline)
								}
							/>
							<label
								htmlFor='range'
								style={{
									transform:
										dir === 'rtl'
											? `translateX(${
													-formik.values.radiusGeofence * step - 8
											  }px)`
											: `translateX(${
													formik.values.radiusGeofence * step - 8
											  }px)`,
									marginTop: '5px',
									fontSize: 12,
								}}>
								<span
									className={`${
										GeofenceShape.circle || GeofenceShape.polyline
											? 'fw-semibold'
											: 'fw-semibold text-custom-grey'
									}`}>
									{`${
										formik.values.unity === 'KM'
											? `${roundedToKm}`
											: `${roundedToM}`
									} ${formik.values.unity === 'KM' ? 'km' : 'm'}`}
								</span>
								{/* <span className='text-secondary fw-semibold'>{`${roundedToKm}km`}</span> */}
							</label>
						</CardBody>
					</Card>
				</form>
			</CardBody>
		</Card>
	);
};

export default GeofenceForm;
