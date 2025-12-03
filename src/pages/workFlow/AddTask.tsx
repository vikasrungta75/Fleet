import React, { useContext, useState, useEffect } from 'react';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import { TasksPages, dashboardMenu, geofencesPages } from '../../menu';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import ThemeContext from '../../contexts/themeContext';
import GoBack from '../../components/GoBack';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import showNotification from '../../components/extras/showNotification';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetGeofencesSettingsData } from '../../services/geofences';
import Spinner from '../../components/bootstrap/Spinner';
import { RootState } from '../../store/store';
import GeofenceForm from './components/GeofenceForm';
import GeofenceMapContainer from './components/map/GeofenceMapContainer';
import AssistanceButton from '../common/assitance-button/AssistanceButton';
import {
	convertFromUTCtoTZ,
	convertToDateWithUTC,
	convertToDateWithUTC2,
	convertToDateWithUTC3,
	getDefaultDateFilter,
	getDefaultDateFilter2,
	getDefaultDateRangeFilter,
	getDefaultFleetFilter,
	getLocation,
} from '../../helpers/helpers';
import { ICoordinates } from '../../type/geofences-type';
import moment from 'moment';

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
	const { t } = useTranslation(['geofence','vehicles']);
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();

	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());

	const [GeofenceShape, setGeofenceShape] = useState({
		polygone: false,
		circle: false,
		polyline: false,
	});
	let [vinFilter, setVinFilter] = useState<any>('');
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
	let location = useLocation();
	const selectedGeofence = location.state as any;

	const [fleetName, setFleetName] = useState(selectedGeofence?.fleet_name);

	const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
	const [polygon, setPolygon] = React.useState<LatLng[]>([]);
	const [polyline, setPolyline] = React.useState<LatLng[]>([]);

	const { vin } = params;
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
					console.warn(error);
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
	const TaskEdit: any = useSelector((state: RootState) => state.tasks.TaskEdit);

	const geofenceData: any = isEditing && TaskEdit;
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { filterPayload } = useSelector((state: RootState) => state.filters);
	const dataPOI = useSelector((state: RootState) => state.appStoreNoPersist.dataPOI);
	const dataPOIStart: any = useSelector(
		(state: RootState) => state.appStoreNoPersist.dataPOIStart,
	);
	const dataPOIEnd: any = useSelector((state: RootState) => state.appStoreNoPersist.dataPOIEnd);
	const convertToMinutes = (timeString: any) => {
		const [hours, minutes] = timeString.split(':').map(Number);
		return hours * 60 + minutes;
	};
	const convertToSeconds = (timeString: any) => {
		const [hours, minutes, seconds] = timeString.split(':').map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	};

	const [hover, setHover] = useState(false);
	const convertToTimeString = (totalSeconds: any) => {
		// Ensure the input is a number
		if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
			return '00:00:33';
		}

		// Calculate hours, minutes, and seconds
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		// Format each component to be two digits
		const format = (num: any) => num.toString().padStart(2, '0');

		// Combine into HH:MM:SS format
		return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
	};

	useEffect(() => {}, [dataPOIStart]);

	const formik = useFormik({
		initialValues: {
			dateTimeCondition: convertToDateWithUTC3(new Date(), preferedTimeZone),
			poi: [],
			service: 'vehicle',
			description: '',
			admissibledelay: '00:01:01',
			minimumofvisitduration: '00:01:01',
			name: '',
			geofenceGroups: '',
			geofenceVin: '',
			radiusGeofence: 50000,
			typeGeofence: '',
			id: '',
			poiStart: [],
			recurrence_enabled: false,
			recurrence_type: 'daily',
			control_days: ['monday', 'wednesday', 'friday'],
		},

		validate: (values) => {
			const errors: {
				name?: string;
				geofenceGroups?: string;
				geofenceVin?: string;
				radiusGeofence?: Number;
				poi?: string;
				id?: string;
				description?: string;
				poiStart?: string;
			} = {};
			if (!values.name) {
				errors.name = 'name ' + t('Is required');
			}

			if (!values.id) {
				errors.id = 'id ' + t('Is required');
			}
			if (!values.description) {
				errors.description = 'description ' + t('Is required');
			}
			if (vinFilter == '') {
				errors.geofenceVin = 'vin ' + t('Is required');
			}
			if (dataPOIStart.length === 0) {
				errors.poiStart = 'Start POI ' + t('Is required');
			} else if (!dataPOIStart.some((poi: any) => poi.isChecked)) {
				errors.poiStart = t('At least one Start POI must be checked');
			}

			return errors;
		},
		validateOnChange: false,

		onSubmit: async (values) => {
			const selectedStartPOI = dataPOIStart
				.filter((poi: any) => poi.isChecked)
				.sort((a: any, b: any) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

			if (!selectedStartPOI) {
				showNotification('', 'Please select a Start POI', 'warning');
				return;
			}

			const coordinates = selectedStartPOI.map((poi: any) => ({
				lat: poi.coordinates[0].lat,
				lng: poi.coordinates[0].lng,
				name: poi.poi_name,
				address: poi.address || '',
				distance: poi.value || 500,
				poi_id: poi.poi_id || '',
			}));

			if (isEditing && params.vin) {
			} else {
				const payloadCreate = {
					coordinates,
					vin: vinFilter,
					description: values.description,
					assignable_to: values.service,
					minimum_of_visit_duration: convertToSeconds(values.minimumofvisitduration),
					admissible_delay: convertToSeconds(values.admissibledelay),
					time_allowed: convertToDateWithUTC2(
						new Date(values.dateTimeCondition),
						preferedTimeZone,
					),
					datetime: convertToDateWithUTC2(new Date(), preferedTimeZone),
					name: values.name,
					fleet_name: ['All Fleets'],
					unique_id: values.id,
					// poi_id: selectedStartPOI.poi_id || '',
					action: 'Add poi task',
					recurrence_enabled: values.recurrence_enabled || false,
					recurrence_type: values.recurrence_type || 'daily',
					control_days: values.control_days || ['monday'],
				};

				await dispatch.tasks.addTask(payloadCreate).then(async (res: boolean) => {
					await dispatch.appStoreNoPersist.setDataPOI([]);
					if (res) {
						showNotification('', 'task successfully created', 'success');
						dispatch.tasks.setTaskEdit([]);
						setTimeout(
							() =>
								navigate(
									`../${dashboardMenu.Workflow.subMenu.TaskMonitoring.path}`,
									{ replace: true },
								),
							2000,
						);
					}
				});
			}
		},
	});
	useEffect(() => {
		return () => {
			dispatch.tasks.setTaskEdit([]);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (isEditing) {
			dispatch.tasks.getOneTaskAsync({ poi_id: vin });
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		dispatch.tasks.getTasksAsync({
			Name: 1,
			status: 1,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const tasks: any = useSelector((state: RootState) => state.tasks.tasks);
	useEffect(() => {
		if (isEditing) {
			if (TaskEdit?.length) {
				formik.setFieldValue('id', TaskEdit[0]?.unique_id ?? '');
				formik.setFieldValue('name', TaskEdit[0]?.name ?? '');
				formik.setFieldValue('description', TaskEdit[0]?.description ?? '');
				formik.setFieldValue(
					'minimumofvisitduration',
					convertToTimeString(TaskEdit[0]?.minimum_of_visit_duration ?? 0),
				);
				formik.setFieldValue(
					'admissibledelay',
					convertToTimeString(TaskEdit[0]?.admissible_delay ?? 0),
				);
				formik.setFieldValue('service', TaskEdit[0]?.assignable_to ?? '');
				formik.setFieldValue(
					'dateTimeCondition',
					convertFromUTCtoTZ(TaskEdit[0]?.time_allowed, preferedTimeZone) ?? '',
				);

				// Create Start POI payload
				const startPOIPayload = {
					coordinates: [
						{
							lat: TaskEdit[0]?.coordinates[0]?.lat ?? 0,
							lng: TaskEdit[0]?.coordinates[0]?.lng ?? 0,
						},
					],
					poi_name: TaskEdit[0]?.start_poi_name ?? '',
					address: TaskEdit[0]?.start_address ?? '',
					value: TaskEdit[0]?.start_value ?? '',
					action: 'Add poi',
					isChecked: true, // Set as checked since it's the selected POI
				};

				// Create End POI payload
				const endPOIPayload = {
					coordinates: [
						{
							lat: TaskEdit[0]?.coordinates[1]?.lat ?? 0,
							lng: TaskEdit[0]?.coordinates[1]?.lng ?? 0,
						},
					],
					poi_name: TaskEdit[0]?.end_poi_name ?? '',
					address: TaskEdit[0]?.end_address ?? '',
					value: TaskEdit[0]?.end_value ?? '',
					action: 'Add poi',
					isChecked: true, // Set as checked since it's the selected POI
				};

				// Dispatch start and end POIs
				dispatch.appStoreNoPersist.setDataPOIStart([startPOIPayload]);
				dispatch.appStoreNoPersist.setDataPOIEnd([endPOIPayload]);

				setVinFilter(TaskEdit[0]?.vin);
				setShowForm(true);
			} else {
			}
		} else {
			setShowForm(true);
			dispatch.appStoreNoPersist.setDataPOI([]);
			dispatch.appStoreNoPersist.setDataPOIStart([]);
			dispatch.appStoreNoPersist.setDataPOIEnd([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [TaskEdit]);
	const [showForm, setShowForm] = useState(false);

	// Add new useEffect for handling previous tasks
	const [isTasksCopied, setIsTasksCopied] = useState(false);

	useEffect(() => {
		if (Array.isArray(tasks) && tasks?.length && !isTasksCopied) {
			const previousTasksStartPOI = tasks.map((task: any) => ({
				coordinates: [
					{
						lat: task?.coordinates?.[0]?.lat ?? 0,
						lng: task?.coordinates?.[0]?.lng ?? 0,
					},
				],
				poi_name: task?.start_poi_name ?? '',
				address: task?.start_address ?? '',
				value: task?.start_value ?? '',
				action: 'Add poi',
				isChecked: false,
			}));

			const previousTasksEndPOI = tasks.map((task: any) => ({
				coordinates: [
					{
						lat: task?.coordinates?.[1]?.lat ?? 0,
						lng: task?.coordinates?.[1]?.lng ?? 0,
					},
				],
				poi_name: task?.end_poi_name ?? '',
				address: task?.end_address ?? '',
				value: task?.end_value ?? '',
				action: 'Add poi',
				isChecked: false,
			}));

			// Ensure dataPOIStart and dataPOIEnd are arrays before spreading
			const existingStartPOI = Array.isArray(dataPOIStart) ? dataPOIStart : [];
			const existingEndPOI = Array.isArray(dataPOIEnd) ? dataPOIEnd : [];

			dispatch.appStoreNoPersist.setDataPOIStart([
				...existingStartPOI,
				...previousTasksStartPOI,
				...previousTasksEndPOI,
			]);
			dispatch.appStoreNoPersist.setDataPOIEnd([
				...existingEndPOI,
				...previousTasksEndPOI,
				...previousTasksStartPOI,
			]);

			// Mark as copied to prevent future duplications
			setIsTasksCopied(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tasks, isTasksCopied]);

	return (
		<PageWrapper isProtected={true}>
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-1w-100'>
						<GoBack />
						<h1 className='fs-2 ms-4 fw-semibold' style={{ color: '#000000' }}>
							{t(
								`${
									isEditing ? TasksPages.editTask.text : TasksPages.addTasks.text
								}`,
							)}
						</h1>
					</div>
				</div>

				<Card>
					<div className='mw-100 mb-3' style={{ margin: '25px 25px' }}>
						<div
							className={
								!mobileDesign
									? 'd-flex justify-content-between align-items-center col-12'
									: ''
							}>
							<div id='vehicle_usage'>
								<div className='d-flex align-items-center bd-highlight mb-3'>
									<div
										className='ms-3 flex-fill bd-highlight fs-4 fw-semibold'
										style={{ color: '#000000' }}>
										{t('Task informations')}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div>
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
										{showForm && (
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
										)}
										{!mobileDesign && (
											<div className='d-flex flex-row-reverse'>
												{permissions.update_geofence && (
													<Button
														icon='Add'
														color='dark'
														className='py-3 w-50 ms-3'
														onClick={() => {
															formik.handleSubmit();
														}}>
														{t('Submit')}
													</Button>
												)}
												<Button
													isOutline={true}
													style={{
														border: '0px',
														height: '47px',
														width: '50%',
														padding: '12px',
														backgroundColor: hover
															? '#6c757d'
															: '#FFFFFF',
														color: hover ? '#FFFFFF' : '#000',
													}}
													onMouseEnter={() => setHover(true)}
													onMouseLeave={() => setHover(false)}
													icon='Add'
													color='dark'
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
												setPolyline={setPolyline}
												inMyFleet={false}
											/>
										</div>
									</div>

									{mobileDesign && (
										<div className='d-flex flex-column mt-4'>
											{
												<Button
													icon='Add'
													color='dark'
													className='py-3 w-100 mb-3'
													onClick={() => {
														formik.handleSubmit();
													}}>
													{t('Submit')}
												</Button>
											}
											<Button
												isOutline={true}
												style={{
													border: '0px',
													height: '40px',
													width: '100%',
													padding: '12px',
													backgroundColor: hover ? '#6c757d' : '#FFFFFF',
													color: hover ? '#FFFFFF' : '#000',
												}}
												onMouseEnter={() => setHover(true)}
												onMouseLeave={() => setHover(false)}
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
					</div>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default CreateEditGeofence;
