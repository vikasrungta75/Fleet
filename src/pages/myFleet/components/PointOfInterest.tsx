import React, { FC, useEffect, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { DeleteOutline, ModeEditOutline } from '../../../components/icon/material-icons';
import CreateNewPointInterestComponent from './map/components/CreateNewPointOfInterest';
import { useFormik } from 'formik';
import HeaderComponentPointOfInterest from './map/components/HeaderPointOfInterest';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useGetPoiList } from '../../../services/geofences';

import { homePin } from '../../myFleet/components/map/constants/mapConstants';
import { useTranslation } from 'react-i18next';
interface PointOfInterestProps {
	setIsPOIVisible: (value: boolean) => void;
	isPOIVisible: boolean;
}

const PointOfInterest: FC<PointOfInterestProps> = ({ setIsPOIVisible, isPOIVisible }) => {
	const { geofencePointOfInterest } = useSelector((state: RootState) => state.appStoreNoPersist);
	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);
	const [selectedPointOfInterest, setselectedPointOfInterest] = useState<any>({});
	const { data: dataPOI, isLoading: isLoadingPOI, refetch } = useGetPoiList();
	const [checked, setchecked] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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

			// validate of VIN

			// if (!values.verification_key) {
			// 	errors.verification_key = t(`You must confirm verification key to delete`) +" " + t(title);
			// } else if (values.verification_key !== verificationKey) {
			// 	errors.verification_key = t("verification Key  don't match!");
			// }

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
			if (checked.length > 0) {
				const payloadPointOfInterestDelete = {
					action: 'Delete poi',
					poi_id: checked,
				};
			
				await dispatch.geofences
					.handleDeleteGeofencePointOfInterest(payloadPointOfInterestDelete)
					.then((res: any) => {
						if (res) {
							setIsPOIVisible(false);
							refetch();
						}
					});
			} else if (Object.keys(selectedPointOfInterest).length > 0) {
				const payloadPointOfInterestUpdate = [
					{
						coordinates: [
							{
								lat: selectedPointOfInterest.coordinates[0].lat,
								lng: selectedPointOfInterest.coordinates[0].lng,
							},
						],
						poi_name: values.interestName,
						address: values.address,
						value: values.radiusGeofence,
						action: 'Update poi',
						poi_id: selectedPointOfInterest.poi_id,
					},
				];
				await dispatch.geofences
					.HandleAddgeofencePointOfInterest(payloadPointOfInterestUpdate)
					.then((res: any) => {
						if (res) {
							setIsPOIVisible(false);
							refetch();
						}
					});
			} else {
				setIsLoading(true);
				const payloadPointOfInterest = [
					{
						coordinates: [
							{
								lat: geofencePointOfInterest.lat,
								lng: geofencePointOfInterest.lng,
							},
						],
						poi_name: values.interestName,
						address: values.address,
						value: values.radiusGeofence || '500',
						action: 'Add poi',
					},
				];
				await dispatch.geofences
					.HandleAddgeofencePointOfInterest(payloadPointOfInterest)
					.then((res: any) => {
						if (res) {
							setIsPOIVisible(false);
							refetch();
						}
					});
				setIsLoading(false);
			}
		},
		onReset: () => {},
	});
	const [TitlePointOfInterest, setTitlePointOfInterest] = useState('Point of interest');
	const [stepPointInterest, setstepPointInterest] = useState('');
	const [mapIsOpen, setmapIsOpen] = useState(false);

	const handleChange = (e: any, item: any) => {
		const isChecked = e.target.checked;
		let updatedList = [...checked];
		if (isChecked) {
			updatedList.push(item.poi_id);
		} else {
			updatedList = updatedList.filter((obj) => String(obj) !== String(item.poi_id));
		}
		setchecked(updatedList);
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
					// selectedPointOfInterest={selectedPointOfInterest}
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
						<span style={{ color: '#F00D69', fontWeight: '400', fontSize: '12px' }}>
							+ Create new
						</span>
					</div>
				</>
			);
			break;

		default:
			componentToRender = (
				<>
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
											formik.handleSubmit();
										}}
									/>
								</div>
							</div>
						</div>
					)}

					<div>
						{dataPOI &&
							dataPOI.map((item: any) => (
								<div className='points-interet' key={item.poi_id}>
									<div
										className='d-flex flex-row align-items-center justify-content-between p-2 '
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
													onChange={(e) => handleChange(e, item)}
												/>
											</div>
											<div className='me-3'>
												<img
													style={{ width: '17px' }}
													src={homePin}
													alt={homePin}
												/>
											</div>
											<div>{item.poi_name}</div>
										</div>
										{hoveredId === item.poi_id && (
											<div className='icon-hover'>
												<ModeEditOutline
													className='icon-cursor-pointer'
													onClick={() => {
														setstepPointInterest('create-point');
														setselectedPointOfInterest({ ...item });
													}}
													style={{ width: '20px', height: '20px' }}
												/>
											</div>
										)}
									</div>
									<hr
										style={{
											margin: '0px 0px',
											border: '1px solid grey',
										}}
									/>
								</div>
							))}
					</div>

					<div
						onClick={() => {
							setstepPointInterest('create-point');
						}}
						className='p-2'
						style={{ cursor: 'pointer', display: 'flex', justifyContent: 'end' }}>
						<span style={{ color: '#F00D69', fontWeight: '400', fontSize: '14px' }}>
							+ {t('Create new')}
						</span>
					</div>
				</>
			);
			break;
	}
	// const [first, setfirst] = useState(second)
	return (
		<Card
			style={{
				maxHeight:
					dataPOI && stepPointInterest === 'create-point'
						? '370px' // Set to 370px when both conditions are true
						: dataPOI
						? '250px' // Set to 250px when only dataPOI is not undefined
						: '250px', // Set to 450px in other cases
				right: stepPointInterest === 'create-point' ? '23em' : '17em',
				width: stepPointInterest === 'create-point' ? 300 : 220,
				border: '1px solid #E4E4E4',
			}}
			className='cardSettingMap'>
			<CardBody className='cardMapBody'>
				<HeaderComponentPointOfInterest
					isPOIVisible={isPOIVisible}
					setIsPOIVisible={setIsPOIVisible}
					title={TitlePointOfInterest}
				/>
				{componentToRender}
			</CardBody>
		</Card>
	);
};

export default PointOfInterest;
