import { useFormik } from 'formik';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GoBack from '../../../components/GoBack';
import Button from '../../../components/bootstrap/Button';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { vehiclesPages } from '../../../menu';
import { useGetDriverNameFilterService } from '../../../services/ecoDrivingService';
import { useGetVehicleData } from '../../../services/vehiclesService';
import { RootState, store } from '../../../store/store';
import { IFilterOptions } from '../../../type/vehicles-type';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import FieldsCard from '../../../components/FieldsCard';
import { vehiclesFields } from './constants/fieldsVehicle';

interface IAddVehicleProps {
	isCreating: boolean;
}

const AddVehicule: FC<IAddVehicleProps> = ({ isCreating }) => {
	const { auth } = useSelector((state: RootState) => state);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation(['vehicles', 'groupsPages']);
	const { mobileDesign } = useContext(ThemeContext);

	const { data: driversNameFilter } = useGetDriverNameFilterService();

	const { groupNameFilterStatus } = useSelector((state: RootState) => state.vehicles);
	const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({ model: false });
	const { refetch } = useGetVehicleData();

	const initialOptions = {
		fleetName: [],
		manufacturers: [],
		makes: [],
		models: [],
		imei: [],
		drivers: [],
		types: ['LCV', 'Truck', 'Trailer', 'Machine', 'Special'],
		fuel_type: ['Petrole', 'Diesel', 'CNG', 'Electrique'],
		engine_types: ['Biodiesel', 'Diesel', 'Gasoline', 'LPG', 'Electric', 'Hydrogen', 'Ethanol'],
	};
	const [selectOptions, setSelectOptions] = useState<any>({
		...initialOptions,
	});

	const formik = useFormik({
		initialValues: {
			color: '',
			device_imei: '',
			reg_no: '',
			mobile_no: '',
			vehicle_id: '',
			vin_no: '',
			fleetName: '',
			fuel_type: '',
			make: '',
			manufacturer: '',
			model: '',
			dimensionH: '',
			dimensionW: '',
			dimensionL: '',
			driver_name: '',
		},

		validate: (values) => {
			const errors: {
				color?: string;
				device_imei?: string;
				reg_no?: string;
				mobile_no?: string;
				vehicle_id?: string;
				vin_no?: string;
				fleetName?: string;
				fuel_type?: string;
				make?: string;
				manufacturer?: string;
				model?: string;
			} = {};

			// validate of fleetName
			if (!values.fleetName) {
				errors.fleetName = t('Fleet') + ' ' + t('Is required');
			}

			// validate of vin number
			if (!values.vin_no) {
				errors.vin_no = t('VIN') + ' ' + t('Is required');
			} else if (values.vin_no?.length !== 17) {
				errors.vin_no = t('VIN error');
			}

			// validate of device_imei

			if (!values.device_imei && selectOptions.imei.length > 0) {
				errors.device_imei = t('IMEI') + ' ' + t('Is required');
			}

			// validate of reg_no

			if (!values.reg_no) {
				errors.reg_no = t('Registration number') + ' ' + t('Is required');
			} else if (values.reg_no?.length < 5 || values.reg_no?.length > 12) {
				errors.reg_no = t('Reg No error lenght');
			}
			// validate of manufacturer

			if (!values.manufacturer) {
				errors.manufacturer = t('Manufacturer') + ' ' + t('Is required');
			}
			// validate of model

			if (!values.model) {
				errors.model = t('Model') + ' ' + t('Is required');
			}
			// validate of make

			if (!values.make) {
				errors.make = t('Make') + ' ' + t('Is required');
			}
			// validate of fuel_type

			if (!values.fuel_type) {
				errors.fuel_type = t('Fuel type') + ' ' + t('Is required');
			}
			// validate of color

			if (!values.color) {
				errors.color = t('Color') + ' ' + t('Is required');
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			const { customProperties } = store.getState().auth;
			let payloadvehicule = {
				...values,
				driver: values.driver_name,
				device_imei: parseInt(values.device_imei),
				reg_no: values.reg_no.toUpperCase(),
				vehicle_id: parseInt(values.vehicle_id),
				fleet_id: customProperties.fleetId,
				fleet_name: values.fleetName,
				action: 'add',
				spacekey: auth.user.user.spaceKey,
				id: auth.user.user.id,
			};


			/* 		await dispatch.fleets.addVehiculeAsync(payloadvehicule).then((res: any) => {
				if (res.success === true) {
					showNotification('', t('success add vehicle'), 'success');
					navigate(`../${dashboardMenu.setup.subMenu.vehicles.path}`);

					if (refetch) {
						setTimeout(() => {
							refetch();
						}, 2000);
					}
				} else if (res.errorCheck === 'vinNo') {
					formik.setFieldError('vin_no', res.message);
				} else if (res.errorCheck === 'regNo') {
					formik.setFieldError('reg_no', res.message);
				} else {
					showNotification('', res.message, 'danger');
				}
			}); */
		},
		onReset: () => {
			formik.resetForm();
		},
	});

	React.useEffect(() => {
		if (groupNameFilterStatus.length === 0) {
			dispatch.vehicles.getGroupNameFilterAsync();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groupNameFilterStatus]);

	useEffect(() => {
		if (selectOptions?.drivers?.length === 0 && driversNameFilter?.length > 0) {
			setSelectOptions({
				...selectOptions,
				drivers: driversNameFilter?.map((driver: IFilterOptions) => {
					return { label: driver._id, value: driver._id };
				}),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectOptions, driversNameFilter]);

	// update Fleetnames
	useEffect(() => {
		setIsLoading({ fleetName: true });
		formik.setFieldValue('fleetName', '');
		// function to get fleetnames
		const getfleetName = async () => {
			const dataFleetNames = await dispatch.fleets.getFleetNameAsync();
			setSelectOptions({
				...selectOptions,
				fleetName: dataFleetNames,
				manufacturers: [],
			});
			setIsLoading({ fleetName: false });
		};

		getfleetName();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// update Manufacturer
	useEffect(() => {
		setIsLoading({ manufacturer: true });
		if (formik.values.fleetName.length > 0) {
			formik.setFieldValue('manufacturer', '');
			formik.setFieldValue('make', '');
			formik.setFieldValue('model', '');
			formik.setFieldValue('device_imei', '');
			formik.setFieldValue('mobile_no', '');
			setSelectOptions({ ...selectOptions, ...initialOptions });

			// function to get data manufacturer
			const updateManufacturerAndImei = async () => {
				const dataManufacturer = await dispatch.fleets.getManufacturerAsync(
					formik.values.fleetName === 'All Fleets' ? 'All' : formik.values.fleetName,
				);
				const dataImei = await dispatch.fleets.getImeilAsync(formik.values.fleetName);
				setSelectOptions({
					...selectOptions,
					manufacturers: dataManufacturer.map(({ _id }: IFilterOptions) => _id),
					makes: [],
					models: [],
					imei: dataImei.map(({ _id }: IFilterOptions) => _id),
				});
				setIsLoading({ manufacturer: false });
			};
			updateManufacturerAndImei();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.fleetName]);

	//update Make
	useEffect(() => {
		if (formik.values.manufacturer.length > 0) {
			setIsLoading({ make: true });
			formik.setFieldValue('make', '');

			// function to get data make
			const updateMake = async () => {
				const dataMake = await dispatch.fleets.getMakeAsync(formik.values);
				setSelectOptions({
					...selectOptions,
					makes: dataMake.map(({ make }: IFilterOptions) => make),
					models: [],
				});
				setIsLoading({ make: false });
			};
			updateMake();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.manufacturer]);

	//update Model
	useEffect(() => {
		setIsLoading({ model: true });
		if (formik.values.make.length > 0) {
			formik.setFieldValue('model', '');

			// function to vehicle_id
			const updateModel = async () => {
				const dataModel = await dispatch.fleets.getModelAsync(formik.values);
				const dataId = await dispatch.fleets.getIdAsync(formik.values);
				setSelectOptions({
					...selectOptions,
					models: dataModel.map(({ model }: IFilterOptions) => model),
				});

				formik.setFieldValue('vehicle_id', dataId[0]?.vehicle_id);
				setIsLoading({ model: false });
			};
			updateModel();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.make]);

	// update mobile_no
	useEffect(() => {
		if (formik.values.device_imei.length > 0) {
			// function to get data imei
			const updateMobileNo = async () => {
				const dataMobileNo = await dispatch.fleets.getMobileNoAsync(formik.values);
				formik.setFieldValue('mobile_no', dataMobileNo[0]?.mobile_no);
				formik.setFieldValue('network_type', dataMobileNo[0]?.network_type);
				formik.setFieldValue('carrier', dataMobileNo[0]?.carrier);
				formik.setFieldValue('imsi', dataMobileNo[0]?.imsi);
				formik.setFieldValue('sim_number', dataMobileNo[0]?.sim_no);
			};
			updateMobileNo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.device_imei]);

	return (
		<PageWrapper
			isProtected={true}
			title={vehiclesPages.addVehicles.text}
			className='add-vehicle'>
			<Page className='mw-100 px-0'>
				<div className='d-flex  align-items-center'>
					<div className='d-flex pb-3 mb-0 mt-n3 w-100 justify-content-between align-items-center'>
						<div className='d-flex'>
							{/* <GoBack /> */}
							<h1 className='fs-2 pb-0 fw-semibold content-heading'>
								{t('Add a Vehicle')}
							</h1>
						</div>
						<div
							className={`d-flex w-50 ${mobileDesign ? 'flex-column ' : 'flex-row-reverse '
								}`}>
							<Button
								isDisable={!formik.isValid}
								color='dark' style={{ backgroundColor: "black" }}
								className={`py-3 save-text ${mobileDesign ? 'w-100' : 'w-25 ms-3'}`}
								onClick={formik.handleSubmit}>
								{t('Save')}
							</Button>
							<Button
								color='dark'
								isOutline={true}
								className={`py-3 cancel-text ${mobileDesign ? 'w-100 my-3' : 'w-25'}`}
								onClick={(e) => {
									// formik.handleReset(e);
									navigate(-1);
								}}>
								{t('Cancel')}
							</Button>
						</div>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				<FieldsCard
					data={vehiclesFields}
					formik={formik}
					selectOptions={selectOptions}
					isLoading={isLoading}
					edit={isCreating}
				/>
				{/* <div
					className={`d-flex w-100 mb-3 ${
						mobileDesign ? 'flex-column ' : 'flex-row-reverse '
					}`}>
					<Button
						isDisable={!formik.isValid}
						color='secondary'
						className={`py-3  ${mobileDesign ? 'w-100' : 'w-25 ms-3'}`}
						onClick={formik.handleSubmit}>
						{t('Save')}
					</Button>
					<Button
						color='secondary'
						isOutline={true}
						className={`py-3 light-btn ${mobileDesign ? 'w-100 my-3' : 'w-25'}`}
						onClick={(e) => {
							// formik.handleReset(e);
							navigate(-1);
						}}>
						{t('Cancel')}
					</Button>
				</div> */}
			</Page>
		</PageWrapper>
	);
};

export default AddVehicule;
