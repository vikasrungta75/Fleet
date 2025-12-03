import React, { useContext, useState, useEffect } from 'react';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { dashboardMenu, geofencesPages } from '../../../menu';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import ThemeContext from '../../../contexts/themeContext';
import GoBack from '../../../components/GoBack';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import showNotification from '../../../components/extras/showNotification';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGetGeofencesSettingsData } from '../../../services/geofences';
import Spinner from '../../../components/bootstrap/Spinner';
import { RootState } from '../../../store/store';
import GeofenceForm from './components/GeofenceForm';
import GeofenceMapContainer from './components/map/GeofenceMapContainer';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import { getDefaultFleetFilter, getLocation } from '../../../helpers/helpers';
import { ICoordinates } from '../../../type/geofences-type';

interface IGeofenceProps {
	isEditing?: boolean;
}
interface LatLng {
	lat: number;
	lng: number;
}

type PayloadGeofence = {
	alarm: string;
	fleet_name: string;
	vin: string;
	geofence: {
		coordinates?: LatLng[];
		lat?: number;
		lng?: number;
		geofence_name: string;
		value: number;
		type: string;
		gtype: string;
		measure: string;
	}[];
	action: string;
};

const CreateEditGeofence = (props: IGeofenceProps) => {
	const { isEditing } = props;
	const { t } = useTranslation(['geofence']);
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();

	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());

	const [GeofenceShape, setGeofenceShape] = useState({
		polygone: false,
		circle: false,
		polyline: false,
	});
	const [vinFilter, setVinFilter] = useState<string>('All Vins');
	const [geofenceType, setGeofenceType] = useState<string>('In');
	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
	const [geofencePoint, setGeofencePoint] = useState<ICoordinates>({
		// by default, Mumbay coordinates then current location will be define if allowed.
		lat: 19.07609,
		lng: 72.854118,
	});
	const { groupNameFilterStatus } = useSelector((state: RootState) => state.vehicles);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const navigate = useNavigate();
	const params = useParams();
	const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
	const [polygon, setPolygon] = React.useState<LatLng[]>([]);
	const [polyline, setPolyline] = React.useState<LatLng[]>([]);

	const { vin } = params;
	let location = useLocation();
	const selectedGeofence = location.state as any;

	const [fleetName, setFleetName] = useState(selectedGeofence?.fleet_name);

	const { refetch } = useGetGeofencesSettingsData();
	// const isGeofenceDataLoading = useSelector((state: RootState) => state.loading.models.geofences);

	const { geofence } = useSelector((state: RootState) => state.geofences);

	useEffect(() => {
		if (!isEditing) {
			getLocation()
				.then((coords) => {
					setGeofencePoint({ lat: coords.lat, lng: coords.lng });
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [isEditing]);

	useEffect(() => {
		const selectedFleett = groupNameFilterStatus.find(
			// eslint-disable-next-line eqeqeq
			(el) => el.fleet_id == fleetNameFilter,
		)?._id;
		setFleetName(selectedFleett);
	}, [fleetNameFilter, groupNameFilterStatus]);

	useEffect(() => {
		if (isEditing) {
			dispatch.geofences.getGeofencesAsync({ vin, id: selectedGeofence?.geofence_id });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing]);

	const geofenceData: any = isEditing && geofence;

	const formik = useFormik({
		initialValues: {
			geofenceName: '',
			geofenceGroups: '',
			geofenceVin: '',
			radiusGeofence: 50000,
			typeGeofence: '',
			unity: 'KM',
		},

		validate: (values) => {
			const errors: {
				geofenceName?: string;
				geofenceGroups?: string;
				geofenceVin?: string;
				radiusGeofence?: Number;
			} = {};
			if (!values.geofenceName) {
				errors.geofenceName = 'geofenceName ' + t('Is required');
			}
			// if (values.geofenceVin === 'All Vins') {
			// 	errors.geofenceVin = 'Vin ' + t('Is required');
			// }
			// if (values.geofenceGroups === 'All Fleets') {
			// 	errors.geofenceGroups = 'geofenceGroup ' + t('Is required');
			// }

			return errors;
		},
		validateOnChange: false,

		onSubmit: async (values) => {
			if (isEditing && params.vin) {
				let payloadEditing: any = {
					fleet_name: fleetNameFilter,
					vin: vinFilter,
					geofence_id: geofenceData.geofence_id,
					geofence: [
						{
							coordinates: GeofenceShape.circle
								? [
										{
											lat: geofencePoint.lat,
											lng: geofencePoint.lng,
										},
								  ]
								: GeofenceShape.polygone
								? polygon
								: GeofenceShape.polyline
								? polyline
								: [],
							// coordinates: polygonPoints,
							// lat: geofencePoint.lat,
							// lng: geofencePoint.lng,
							geofence_name: formik.values.geofenceName,
							value: Number(formik.values.radiusGeofence),
							type: geofenceType,
							gtype: GeofenceShape.circle
								? 'circle'
								: GeofenceShape.polygone
								? 'polygone'
								: GeofenceShape.polyline
								? 'polyline'
								: '',
							measure: formik.values.unity,
						},
					],
					action: 'Update geofence',
				};

				await dispatch.geofences.addGeofence(payloadEditing).then((res: boolean) => {
					if (res) {
						showNotification('', 'Geofence successfully updated', 'success');
						navigate(`../${dashboardMenu.setup.subMenu.geofences.path}`);
						setTimeout(() => {
							refetch();
						}, 2000);
					}
				});
			} else {
				let payload: PayloadGeofence = {
					alarm: 'Geofence Zone',
					fleet_name: fleetNameFilter,
					vin: vinFilter,
					geofence: [
						{
							coordinates: GeofenceShape.circle
								? [
										{
											lat: geofencePoint.lat,
											lng: geofencePoint.lng,
										},
								  ]
								: GeofenceShape.polygone
								? polygon
								: GeofenceShape.polyline
								? polyline
								: [],
							// coordinates: polygonPoints,
							// lat: geofencePoint.lat,
							// lng: geofencePoint.lng,
							geofence_name: formik.values.geofenceName,
							value: Number(formik.values.radiusGeofence),
							type: geofenceType,
							gtype: GeofenceShape.circle
								? 'circle'
								: GeofenceShape.polygone
								? 'polygone'
								: GeofenceShape.polyline
								? 'polyline'
								: '',
							measure: formik.values.unity,
						},
					],
					action: 'Add geofence',
				};
				// if (GeofenceShape.circle) {
				// 	delete payload.geofence[0].coordinates;
				// }
				// if (GeofenceShape.polygone) {
				// 	delete payload.geofence[0].lat;
				// 	delete payload.geofence[0].lng;
				// }

				await dispatch.geofences.addGeofence(payload).then((res: boolean) => {
					if (res) {
						showNotification('', 'Geofence successfully added', 'success');
						navigate(`../${dashboardMenu.setup.subMenu.geofences.path}`);
						setTimeout(() => {
							refetch();
						}, 2000);
					}
				});
			}
		},
	});

	useEffect(() => {
		if (isEditing && geofenceData && Object.keys(geofenceData).length !== 0) {
			setGeofenceShape({
				circle: geofenceData?.gtype === 'circle',
				polygone: geofenceData?.gtype === 'polygon',
				polyline: geofenceData?.gtype === 'polyline',
			});
			formik.setFieldValue('geofenceGroups', geofenceData?.fleet_name);
			formik.setFieldValue('geofenceVin', geofenceData?.vin);
			formik.setFieldValue('geofenceName', geofenceData?.geofence_name);
			formik.setFieldValue('radiusGeofence', Number(geofenceData?.value));
			formik.setFieldValue('unity', 'KM');
			const selectedFleet = groupNameFilterStatus.find(
				(el) => el._id === geofenceData.fleet_name,
			)?.fleet_id;

			setFleetNameFilter(selectedFleet ?? geofenceData?.fleet_name);
			setVinFilter(geofenceData?.vin);
			setGeofenceType(geofenceData?.type);
			setGeofencePoint({
				lat: Number(geofenceData?.coordinates[0]?.lat),
				lng: Number(geofenceData?.coordinates[0]?.lng),
			});
			// setPolygonPoints(geofenceData?.coordinates);
			if (geofenceData?.gtype === 'polygon') {
				setPolygon(geofenceData?.coordinates);
			}
			if (geofenceData?.gtype === 'polyline') {
				setPolyline(geofenceData?.coordinates);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geofenceData]);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.geofences.text}`),
								to: `../${dashboardMenu.setup.subMenu.geofences.path}`,
							},
							{
								title: t(
									`${
										isEditing
											? geofencesPages.editGeofence.text
											: geofencesPages.createGeofence.text
									}`,
								),
								to: `../${
									isEditing
										? geofencesPages.editGeofence.path
										: geofencesPages.createGeofence.path
								}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4  w-100'>
						<GoBack />
						<h1 className='fs-2 ms-4 fw-semibold' style={{ color: '#F00D69' }}>
							{t(
								`${
									isEditing
										? geofencesPages.editGeofence.text
										: geofencesPages.createGeofence.text
								}`,
							)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<Card>
					<CardBody>
						{geofenceData && Object.keys(geofenceData).length === 0 ? (
							<CardBody>
								<div className='d-flex justify-content-center h-100 align-items-center'>
									<Spinner color='secondary' size='5rem' />
								</div>
							</CardBody>
						) : (
							<>
								<div className='row'>
									<div className={`${isFullScreen ? 'd-none' : 'col-sm-4'}`}>
										<GeofenceForm
											GeofenceShape={GeofenceShape}
											setGeofenceShape={setGeofenceShape}
											fleetNameFilter={fleetNameFilter}
											setFleetNameFilter={setFleetNameFilter}
											setVinFilter={setVinFilter}
											vinFilter={vinFilter}
											setGeofenceType={setGeofenceType}
											geofenceType={geofenceType}
											setGeofencePoint={setGeofencePoint}
											formik={formik}
										/>
										{!mobileDesign && (
											<div className='d-flex flex-row-reverse'>
												{permissions.update_geofence && (
													<Button
														// color='secondary'
														// className='py-3 w-50 ms-3'
														color='dark'
														style={{ backgroundColor: 'black' }}
														className={`py-3 save-text ${
															mobileDesign ? 'w-100' : 'w-25 ms-3'
														}`}
														onClick={() => {
															formik.handleSubmit();
														}}>
														{t('Submit')}
													</Button>
												)}
												<Button
													// color='secondary'
													// isOutline={true}
													// className='py-3 light-btn w-50'
													color='dark'
													isOutline={true}
													className={`py-3 cancel-text ${
														mobileDesign ? 'w-100 my-3' : 'w-25'
													}`}
													onClick={() => {
														navigate(-1);
													}}>
													{t('Cancel')}
												</Button>
											</div>
										)}
									</div>

									<div
										className={`${
											isFullScreen
												? mobileDesign
													? ''
													: 'ps-0'
												: 'col-sm-8 '
										}`}>
										<div style={{ flex: '1', display: 'flex' }}>
											<GeofenceMapContainer
												setPolygonPoints={setPolygonPoints}
												isFullScreen={isFullScreen}
												setIsFullScreen={setIsFullScreen}
												geofencePoint={geofencePoint}
												setGeofencePoint={setGeofencePoint}
												GeofenceShape={GeofenceShape}
												setGeofenceShape={setGeofenceShape}
												radiusCircle={formik.values.radiusGeofence ?? 10000}
												polygon={polygon}
												setPolygon={setPolygon}
												polyline={polyline}
												setPolyline={setPolyline}
												inMyFleet={false}
											/>
										</div>
									</div>

									{mobileDesign && (
										<div className='d-flex flex-column mt-4'>
											{permissions.update_geofence && (
												<Button
													// color='secondary'
													// className='py-3 w-100 mb-3'
													color='dark'
													style={{ backgroundColor: 'black' }}
													className={`py-3 save-text ${
														mobileDesign ? 'w-100' : 'w-25 ms-3'
													}`}
													onClick={() => {
														formik.handleSubmit();
													}}>
													{t('Submit')}
												</Button>
											)}
											<Button
												// color='secondary'
												// isOutline={true}
												// className='py-3 light-btn w-100'
												color='dark'
												isOutline={true}
												className={`py-3 cancel-text ${
													mobileDesign ? 'w-100 my-3' : 'w-25'
												}`}
												onClick={() => {
													navigate(-1);
												}}>
												{t('Cancel')}
											</Button>
										</div>
									)}
								</div>
							</>
						)}
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default CreateEditGeofence;
