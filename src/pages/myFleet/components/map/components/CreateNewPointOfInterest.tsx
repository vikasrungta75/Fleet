import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import { Close, Map } from '../../../../../components/icon/material-icons';
import FormGroup from '../../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../../components/bootstrap/forms/Input';
import ThemeContext from '../../../../../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { Formik, FormikValues } from 'formik';
import Button from '../../../../../components/bootstrap/Button';
import GeofenceMapContainer from '../../../../setup-admin/geofences/components/map/GeofenceMapContainer';
import { ICoordinates } from '../../../../../type/geofences-type';
import { useTranslation } from 'react-i18next';

interface CreateNewPointInterestComponentProps {
	setIsPOIVisible: (value: boolean) => void;
	setmapIsOpen: (value: boolean) => void;
	isPOIVisible: boolean;
	mapIsOpen: boolean;
	formik: FormikValues;
	isLoading: boolean;
}

const CreateNewPointInterestComponent: FC<CreateNewPointInterestComponentProps> = ({
	setIsPOIVisible,
	isPOIVisible,
	formik,
	setmapIsOpen,
	mapIsOpen,
	isLoading,
}) => {
	const { t } = useTranslation(['vehicles']);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { geofencePointOfInterest } = useSelector((state: RootState) => state.appStoreNoPersist);

	const { mobileDesign } = useContext(ThemeContext);
	const roundedToM = formik?.values?.radiusGeofence.toString() || 0;

	const [step, setStep] = useState(0);
	const ref = useRef<any>(null);

	useEffect(() => {
		const rangeLinePadding = 16;
		const calcStep = (ref.current.offsetWidth - rangeLinePadding) / ref.current.max;
		setStep(calcStep);
	}, []);

	// const [mapIsOpen, setmapIsOpen] = useState(false);

	const [geofencePoint, setGeofencePoint] = useState<ICoordinates>({
		// by default, Mumbay coordinates then current location will be define if allowed.
		lat: 19.07609,
		lng: 72.854118,
	});

	useEffect(() => {
		setGeofencePoint({
			lat: Number(geofencePointOfInterest.lat),
			lng: Number(geofencePointOfInterest.lng),
		});
	}, [geofencePointOfInterest]);

	const dispatch = useDispatch();

	return (
		<>
			<form className='row  p-2'>
				<div className='col-12'>
					<FormGroup className={`mb-2 col-12`} label={t('Name')} labelClassName='label'>
						<Input
							style={{ borderRadius: '8px', height: '30px' }}
							id='interestName'
							name='interestName'
							placeholder={''}
							onChange={formik.handleChange}
							value={formik.values.interestName}
							invalidFeedback={formik.errors.interestName}
							isTouched={formik.touched.interestName}
							isValid={formik.isValid}
							onBlur={formik.handleBlur}
						/>
					</FormGroup>
					<div className='d-flex'>
						<div className='w-100'>{t('Address')}</div>
						<div
							onClick={() => {
								setmapIsOpen(!mapIsOpen);
							}}
							className='flex-shrink-1'>
							<Map
								fontSize={'medium'}
								style={{ color: mapIsOpen ? '#f00d69' : '' }}
							/>
						</div>
					</div>
					<Input
						style={{ borderRadius: '8px', height: '30px' }}
						className='border-0 '
						id='address'
						name='address'
						placeholder={''}
						onChange={formik.handleChange}
						value={formik.values.address}
						invalidFeedback={formik.errors.address}
						isTouched={formik.touched.address}
						isValid={formik.isValid}
						onBlur={formik.handleBlur}
					/>
					<div className='mt-2 mb-1'>
						<span>{t('Geofence')}</span>
					</div>
					{mapIsOpen && (
						<div id='map-zoom-out' className='h-50'>
							<GeofenceMapContainer
								setPolygonPoints={() => {}}
								isFullScreen={false}
								setIsFullScreen={() => {}}
								geofencePoint={geofencePoint}
								setGeofencePoint={setGeofencePoint}
								GeofenceShape={{
									polygone: false,
									circle: true,
									polyline: false,
								}}
								setGeofenceShape={() => {}}
								radiusCircle={formik.values.radiusGeofence ?? 10000}
								polygon={[]}
								setPolygon={() => {}}
								setPolyline={() => {}}
								inMyFleet={true}
							/>
						</div>
					)}
					<div className={` d-flex justify-content-between mb-1 fw-semibold`}>
						<>
							<div>5m</div>
							<div className='ms-3'>500m</div>
							<div>1000m</div>
						</>
					</div>

					<Input
						type='range'
						min={'5'}
						max={'1000'}
						step={5}
						// min='1000'
						// max='100000'
						// step={1000}
						className='form-range'
						id='radiusGeofence'
						onChange={(e: { target: { value: string } }) => {
							formik.setFieldValue('radiusGeofence', e.target.value);
							dispatch.appStoreNoPersist.handleRaduisPointInterest(
								Number(e.target.value),
							);
						}}
						value={formik.values.radiusGeofence}
						invalidFeedback={formik.errors.radiusGeofence}
						isTouched={formik.touched.radiusGeofence}
						isValid={formik.isValid}
						ref={ref}
						// disabled={!permissions.update_geofence || !GeofenceShape.circle}
					/>
					<label
						htmlFor='range'
						style={{
							transform:
								dir === 'rtl'
									? `translateX(${-formik.values.radiusGeofence * step - 8}px)`
									: `translateX(${formik.values.radiusGeofence * step - 8}px)`,
							marginTop: '5px',
							fontSize: 12,
						}}>
						<span className={`fw-semibold text-secondary`}>
							{roundedToM}
							{/* {`${
								formik.values.unity === 'KM' ? `${roundedToKm}` : `${roundedToM}`
							} ${formik.values.unity === 'KM' ? 'km' : 'm'}`} */}
						</span>
						{/* <span className='text-secondary fw-semibold'>{`${roundedToKm}km`}</span> */}
					</label>
					<div
						className={`d-flex w-100 ${mobileDesign ? 'flex-column ' : 'flex-column'}`}>
						<Button
							style={{ height: '40px' }}
							color='secondary'
							className={`py-3 mb-2 w-100`}
							onClick={formik.handleSubmit}
							isDisable={!formik.isValid || isLoading}>
							{t('Save')}
						</Button>

						<Button
							color='secondary'
							isOutline={true}
							style={{ border: '0px', height: '40px' }}
							className={`py-3 light-btn w-100`}
							onClick={(e) => {
								formik.handleReset(e);
								setIsPOIVisible(!isPOIVisible);
								dispatch.appStoreNoPersist.handleStateMapPointInterest(
									!isPOIVisible,
								);
								// navigate(-1);
							}}>
							{t('Cancel')}
						</Button>
					</div>
				</div>
			</form>
		</>
	);
};

export default CreateNewPointInterestComponent;
