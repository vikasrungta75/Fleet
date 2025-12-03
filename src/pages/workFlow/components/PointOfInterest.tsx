import React, { FC, useEffect, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { Close, DeleteOutline, ModeEditOutline } from '../../../components/icon/material-icons';
import CreateNewPointInterestComponent from './CreateNewPointOfInterest';
import { useFormik } from 'formik';
import HeaderComponentPointOfInterest from './HeaderPointOfInterest';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useGetPoiList, useGetPoiListForTask } from '../../../services/geofences';

import { homePin } from '../../myFleet/components/map/constants/mapConstants';
import { useTranslation } from 'react-i18next';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface PointOfInterestProps {
	setIsPOIVisible: (value: boolean) => void;
	isPOIVisible: boolean;
	checked: string[];
	setchecked: (value: string[]) => void;
	invalidFeedback: any;
	groupType: 'start' | 'end';
	title: string;
}

const PointOfInterest: FC<PointOfInterestProps> = ({
	setIsPOIVisible,
	isPOIVisible,
	checked,
	setchecked,
	invalidFeedback,
	groupType,
	title,
}) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);
	const { startGeofencePointOfInterest, endGeofencePointOfInterest, dataPOIStart, dataPOIEnd } =
		useSelector((state: RootState) => state.appStoreNoPersist);

	const [selectedPointOfInterest, setselectedPointOfInterest] = useState<any>({});
	const [isLoading, setIsLoading] = useState(false);
	const [editIndex, setEditIndex] = useState(0);
	const [mode, setMode] = useState<'create' | 'edit' | 'delete'>('create');

	const dataPOI: any = groupType === 'start' ? dataPOIStart : dataPOIEnd;
	const geofencePointOfInterest =
		groupType === 'start' ? startGeofencePointOfInterest : endGeofencePointOfInterest;

	const formik = useFormik({
		initialValues: {
			radiusGeofence: 500,
			interestName: '',
			address: '',
		},

		validate: (values) => {
			const errors: {
				verification_key?: string;
				interestName?: string;
				address?: string;
			} = {};

			if (!values.interestName && checked.length === 0) {
				errors.interestName = 'Interest Name is required';
			}

			if (!values.address && checked.length === 0) {
				errors.address = 'Address is required';
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			if (mode === 'delete') {
				const updatedPOIs = dataPOI.filter((poi: any) => !poi.isChecked);

				if (groupType === 'start') {
					dispatch.appStoreNoPersist.setDataPOIStart(updatedPOIs);
				} else {
					dispatch.appStoreNoPersist.setDataPOIEnd(updatedPOIs);
				}
				setchecked([]);
			} else if (mode === 'edit') {
				const updatedPOIs: any = [...dataPOI];
				updatedPOIs[editIndex] = {
					coordinates: [
						{
							lat: geofencePointOfInterest.lat,
							lng: geofencePointOfInterest.lng,
						},
					],
					poi_name: values.interestName,
					address: values.address,
					value: values.radiusGeofence || 500,
					action: 'Edit poi',
					isChecked: dataPOI[editIndex].isChecked,
				};

				if (groupType === 'start') {
					dispatch.appStoreNoPersist.setDataPOIStart(updatedPOIs);
				} else {
					dispatch.appStoreNoPersist.setDataPOIEnd(updatedPOIs);
				}
			} else {
				const payloadPointOfInterest = {
					coordinates: [
						{
							lat: geofencePointOfInterest.lat,
							lng: geofencePointOfInterest.lng,
						},
					],
					poi_name: values.interestName,
					address: values.address,
					value: values.radiusGeofence || 500,
					action: 'Add poi',
					isChecked: false,
				};
			
				const updatedPOIs = [...dataPOI, payloadPointOfInterest];

				if (groupType === 'start') {
					dispatch.appStoreNoPersist.setDataPOIStart(updatedPOIs);
					localStorage.setItem('dataPOI_start', JSON.stringify(updatedPOIs));
				} else {
					dispatch.appStoreNoPersist.setDataPOIEnd(updatedPOIs);
				}
			}
			setstepPointInterest('default');
			setMode('create');
			formik.resetForm();
		},
	});

	const [TitlePointOfInterest, setTitlePointOfInterest] = useState('Point of interest');
	const [stepPointInterest, setstepPointInterest] = useState('');
	const [mapIsOpen, setmapIsOpen] = useState(false);

	// When user checks/unchecks a POI
	const handleChange = (e: any, index: number, item: any) => {
		const isChecked = e.target.checked;
		const updatedPOIs = dataPOI.map((poi: any) => ({ ...poi }));

		if (isChecked) {
			updatedPOIs[index].isChecked = true;
			const maxOrder = Math.max(
				0,
				...updatedPOIs
					.filter((p: any) => p.selectionOrder)
					.map((p: any) => p.selectionOrder),
			);
			updatedPOIs[index].selectionOrder = maxOrder + 1;
		} else {
			const removedOrder = updatedPOIs[index].selectionOrder;
			updatedPOIs[index].isChecked = false;
			updatedPOIs[index].selectionOrder = undefined;

			// Reorder remaining
			updatedPOIs.forEach((poi: any) => {
				if (poi.isChecked && poi.selectionOrder > removedOrder) poi.selectionOrder -= 1;
			});
		}

		// Save to Redux
		if (groupType === 'start') {
			dispatch.appStoreNoPersist.setDataPOIStart(updatedPOIs);
			localStorage.setItem('dataPOI_start', JSON.stringify(updatedPOIs));
		} else {
			dispatch.appStoreNoPersist.setDataPOIEnd(updatedPOIs);
			localStorage.setItem('dataPOI_end', JSON.stringify(updatedPOIs));
		}

		const selectedPOIs = updatedPOIs
			.filter((p: any) => p.isChecked)
			.sort(
				(a: { selectionOrder: number }, b: { selectionOrder: number }) =>
					a.selectionOrder - b.selectionOrder,
			);

		const coordinates = selectedPOIs.map((poi: any) => ({
			lat: poi.coordinates[0].lat,
			lng: poi.coordinates[0].lng,
			name: poi.poi_name,
			address: poi.address,
			distance: poi.value ?? 0,
			poi_id: poi.poi_id ?? '',
		}));

		setchecked(coordinates);
	};

	const [hoveredId, setHoveredId] = useState<any>(null);

	useEffect(() => {
		if (selectedPointOfInterest) {
			formik.setFieldValue('radiusGeofence', Number(selectedPointOfInterest.value));
			formik.setFieldValue('interestName', selectedPointOfInterest.poi_name);
			formik.setFieldValue('address', selectedPointOfInterest.address);
		}
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPointOfInterest]);

	let componentToRender;

	const [isOpen, setIsOpen] = useState(false);
	const { geofencePointOfInterestIsOpen, selectedTrajectHistory } = useSelector(
		(state: RootState) => state.appStoreNoPersist,
	);
	const toggleAccordion = () => {
		setIsOpen(!isOpen);
		if (groupType === 'start') {
			dispatch.appStoreNoPersist.handleStartMapPointInterest(!isOpen);
		} else if (groupType === 'end') {
			dispatch.appStoreNoPersist.handleEndMapPointInterest(!isOpen);
		}
	};

	// Add new state
	const [locationError, setLocationError] = useState<string | null>(null);

	// Add useEffect to validate location when geofencePointOfInterest changes
	useEffect(() => {
		if (stepPointInterest === 'create-point') {
			if (!geofencePointOfInterest?.lat || !geofencePointOfInterest?.lng) {
				setLocationError('Location is required. Please select a point on the map.');
			} else {
				setLocationError(null);
			}
		} else {
			setLocationError(null);
		}
	}, [geofencePointOfInterest, stepPointInterest]);

	switch (stepPointInterest) {
		case 'create-point':
			componentToRender = (
				<CreateNewPointInterestComponent
					isPOIVisible={isPOIVisible}
					setIsPOIVisible={setIsPOIVisible}
					formik={formik}
					isLoading={isLoading}
					setmapIsOpen={setmapIsOpen}
					mapIsOpen={mapIsOpen}
					setstepPointInterest={setstepPointInterest}
					groupType={groupType}
					locationError={locationError}
				/>
			);
			break;

		case 'list-point':
			componentToRender = (
				<>
					<div className='d-flex flex-row justify-content-center align-items-center'>
						<div>X</div>
						<div>ICON POI #1</div>
					</div>

					<div
						onClick={() => {
							setstepPointInterest('create-point');
						}}
						className='p-2'
						style={{ cursor: 'pointer' }}>
						<span style={{ color: '#FFB400', fontWeight: '400', fontSize: '12px' }}>
							+ Create new
						</span>
					</div>
				</>
			);
			break;

		default:
			componentToRender = (
				<>
					<div>
						<div className='accordion-header' onClick={toggleAccordion}>
							<div className='d-flex justify-content-between align-items-center'>
								<div>{t('Select a POI from the list')}</div>
								{isOpen ? (
									<ArrowDropDownIcon sx={{ color: '#FFB400', fontSize: 20 }} />
								) : (
									<ArrowDropUpIcon sx={{ color: '#FFB400', fontSize: 20 }} />
								)}
							</div>
						</div>
						{isOpen && (
							<div className='accordion-content'>
								{checked.length > 0 && (
									<div className='d-flex flex-row align-items-center justify-content-between w-100'>
										<div className='d-flex w-100'>
											<div
												style={{
													fontWeight: '400',
													fontSize: '12px',
													color: '#6D6D6D',
												}}
												className='p-2 w-100'>
												Selected ({checked.length})
											</div>
											<div className='p-2 flex-shrink-1'>
												<DeleteOutline
													className='icon-cursor-pointer'
													style={{ width: '20px', height: '20px' }}
													onClick={() => {
														setMode('delete');
														formik.handleSubmit();
													}}
												/>
											</div>
										</div>
									</div>
								)}

								{dataPOI?.map((item: any, index: number) => (
									<div className='points-interet' key={item.poi_id}>
										<div
											className='d-flex flex-row align-items-center justify-content-between p-2'
											onMouseEnter={() => setHoveredId(item.poi_id)}
											onMouseLeave={() => setHoveredId(null)}>
											<div className='d-flex flex-row align-items-center p-2'>
												<div className='d-flex align-items-center me-3'>
													<input
														className='form-check-input checkbox-myfleet'
														type='checkbox'
														id={`coordinates-${item.poi_id}`}
														name={`coordinates-${item.poi_id}`}
														value={item.poi_id}
														onChange={(e) =>
															handleChange(e, index, item)
														}
														checked={item.isChecked}
													/>
												</div>

												{/* Order number badge */}
												{item.isChecked && item.selectionOrder && (
													<div
														style={{
															fontWeight: 'bold',
															marginRight: '8px',
															width: '18px',
															height: '18px',
															borderRadius: '50%',
															backgroundColor: '#FFB400',
															color: '#fff',
															display: 'flex',
															justifyContent: 'center',
															alignItems: 'center',
															fontSize: '12px',
														}}>
														{item.selectionOrder}
													</div>
												)}

												<div className='me-3'>
													<img
														style={{ width: '17px' }}
														src={homePin}
														alt='homePin'
													/>
												</div>
												<div>{item.poi_name}</div>
											</div>

											{hoveredId === item.poi_id && (
												<div className='icon-hover'>
													<ModeEditOutline
														className='icon-cursor-pointer'
														onClick={() => {
															setchecked([]);
															setstepPointInterest('create-point');
															setselectedPointOfInterest({ ...item });
															setEditIndex(index);
															setMode('edit');
															if (groupType === 'start') {
																dispatch.appStoreNoPersist.handleStartMapPointInterest(
																	true,
																);
																dispatch.appStoreNoPersist.setStartGeofencePointOfInterest(
																	{
																		lat: item.coordinates[0]
																			.lat,
																		lng: item.coordinates[0]
																			.lng,
																	},
																);
															} else if (groupType === 'end') {
																dispatch.appStoreNoPersist.handleEndMapPointInterest(
																	true,
																);
																dispatch.appStoreNoPersist.setEndGeofencePointOfInterest(
																	{
																		lat: item.coordinates[0]
																			.lat,
																		lng: item.coordinates[0]
																			.lng,
																	},
																);
															}
														}}
														style={{ width: '20px', height: '20px' }}
													/>
												</div>
											)}
										</div>
										{index !== dataPOI.length - 1 && (
											<hr
												style={{
													margin: '0px 0px',
													border: '1px solid grey',
												}}
											/>
										)}
									</div>
								))}
								<div
									onClick={() => {
										setchecked([]);
										setstepPointInterest('create-point');
										setMode('create');
										if (groupType === 'start') {
											dispatch.appStoreNoPersist.handleStartMapPointInterest(
												true,
											);
										} else if (groupType === 'end') {
											dispatch.appStoreNoPersist.handleEndMapPointInterest(
												true,
											);
										}
									}}
									className='p-2'
									style={{
										cursor: 'pointer',
										display: 'flex',
										justifyContent: 'end',
									}}>
									<span
										style={{
											color: '#FFB400',
											fontWeight: '400',
											fontSize: '14px',
										}}>
										+ {t('Create new')}
									</span>
								</div>
							</div>
						)}
					</div>
				</>
			);
			break;
	}

	return (
		<div>
			<div className={`cardMapBody2 ${invalidFeedback && 'invalid-div'}`}>
				<div>{componentToRender}</div>
			</div>
			<div className='  text-end invalid-feedback-visible'>{invalidFeedback}</div>
		</div>
	);
};

export default PointOfInterest;
