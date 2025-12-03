import React, { FC, useContext, useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Page from '../../../layout/Page/Page';
import Card, {
	CardBody,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Input from '../../../components/bootstrap/forms/Input';
import ThemeContext from '../../../contexts/themeContext';
import { RootState } from '../../../store/store';
import Select from '../../../components/bootstrap/forms/Select';
import Button from '../../../components/bootstrap/Button';
import RegSelect from '../../common/filters/RegSelect';
import { useSelector } from 'react-redux';
import { useCUDDriver, useGetDriversList } from '../../../services/driver';
import { IDriver } from '../../../type/auth-type';
import showNotification from '../../../components/extras/showNotification';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardMenu, driver as driver_menu } from '../../../menu';
import Spinner from '../../../components/bootstrap/Spinner';
import { FORM_FIELDS } from './constants/constant';
import GoBack from '../../../components/GoBack';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';

interface IDriverAddEditForm {
	isEditing?: boolean;
}

type DriverItem =
	| 'driver_name'
	| 'dob'
	| 'gender'
	| 'mobile_no'
	| 'residential_address'
	| 'pob'
	| 'experience'
	| 'health_issues'
	| 'emergency_name'
	| 'emergency_number'
	| 'reg_no'
	| 'license_no'
	| 'license_issue_date'
	| 'license_expire_date'
	| 'license_type'
	| 'license_issuing_authority';

const DriverAddEditForm: FC<IDriverAddEditForm> = ({ isEditing }) => {
	const params = useParams();

	const { id } = params;

	const initialValues: IDriver = {
		did: '',
		driver_name: '',
		dob: '',
		gender: 'male',
		mobile_no: '',
		residential_address: '',
		pob: '',
		experience: 0,
		health_issues: 'no',
		emergency_name: '',
		emergency_number: '',
		reg_no: '',
		license_no: '',
		license_issue_date: '',
		license_expire_date: '',
		license_type: '',
		license_issuing_authority: '',
	};

	const driver = useGetDriversList(id as string);
	const { refetch } = useGetDriversList('All');
	useEffect(() => {
		if (isEditing) {
			driver.refetch();
			if (driver.isSuccess && driver.data) {
				FORM_FIELDS.map((el: string) => formik.setFieldValue(el, driver.data[0][el]));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing, driver.data]);

	const { t } = useTranslation('driversPage');

	const { mobileDesign } = useContext(ThemeContext);

	const navigate = useNavigate();
	const { mutate, isSuccess } = useCUDDriver();

	const formik = useFormik({
		initialValues: initialValues,

		onSubmit: (values) => {
			mutate({
				driver: values,
				action: isEditing ? 'update driver' : 'add driver',
			});
		},
		validate: (values) => {
			const errors: IDriver = {};

			Object.keys(values).forEach((item: string) => {
				if (item !== 'did' && !values[item as DriverItem]) {
					errors[item as DriverItem] = t('Please Fill the ' + item.replace('_', ' '));
				}
			});

			const phoneRegex = /^\d{10}$/;

			if (!values.emergency_number || values.emergency_number.length < 10) {
				errors.emergency_number = t('Please Fill 10 digit Mobile number');
			} else if (!phoneRegex.test(values.emergency_number)) {
				errors.emergency_number = t('Invalid phone number format');
			}

			if (!values.mobile_no || values.mobile_no.length < 10) {
				errors.mobile_no = t('Please Fill 10 digit Mobile number');
			} else if (!phoneRegex.test(values.mobile_no)) {
				errors.mobile_no = t('Invalid phone number format');
			}

			if (
				values.license_issue_date &&
				values.license_expire_date &&
				new Date(values.license_issue_date) > new Date(values.license_expire_date)
			) {
				errors.license_expire_date = t('The expiration date is invalid');
			}

			return errors;
		},
		validateOnChange: true,
	});

	const back = () => {
		showNotification('', 'driver successfully saved', 'success');
		setTimeout(() => {
			refetch();
			navigate(`../${dashboardMenu.setup.subMenu.drivers.path}`);
		}, 2000);
	};

	const setReg = (value: string) => {
		formik.setFieldValue('reg_no', value);
	};

	useEffect(() => {
		if (isSuccess) {
			back();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	return (
		<PageWrapper>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.drivers.text}`),
								to: `../${dashboardMenu.setup.subMenu.drivers.path}`,
							},
							{
								title: t(
									isEditing
										? driver_menu.editDriver.text
										: driver_menu.addDriver.text,
								),
								to: isEditing
									? `../${driver_menu.editDriver.path}/${id}`
									: `../${driver_menu.addDriver.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-0'>
				<div className='d-flex'>
					<div className='d-flex align-items-center pb-3 mb-4 w-100'>
						<div className='d-flex flex-row align-items-center'>
							{/* <GoBack /> */}
							<h1 className='fs-2 fw-semibold content-heading'>
								{isEditing
									? t(`${driver_menu.editDriver.text}`)
									: t(`${driver_menu.addDriver.text}`)}
							</h1>
						</div>
						{/* <div
							className={`m-auto d-flex gap-3 ${!mobileDesign ? ' flex-row-reverse w-75' : 'flex-column w-100'
								}`}>
							<Button
								color='secondary'
								className={` ${!mobileDesign ? 'w-25 ms-3 me-0' : 'w-100 mb-3'}`}
								onClick={formik.handleSubmit}>
								{t('Save')}
								{driver.isLoading && <Spinner isSmall inButton className='ms-2' />}
							</Button>
							<Button
								className={`light-btn  ${!mobileDesign ? 'w-25' : 'w-100'}`}
								onClick={() =>
									navigate(`../${dashboardMenu.setup.subMenu.drivers.path}`)
								}>
								{t('Cancel')}
							</Button>
						</div> */}
					</div>

					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				<div className='row d-flex' style={{ marginTop: "-19px" }}>
					<div className='col-lg-12'>
						<Card stretch className='overall-card1'>
							<CardHeader className='pb-0'>
								<CardTitle className=' mt-2 emergency-heading'>
									{t('Personal Details')}
								</CardTitle>
							</CardHeader>
							<CardBody>
								<div className='row g-4 mb-3 align-items-center'>
									<div className='col-lg-3 text-center'>
										<img
											className='rounded-circle'
											src='/driverProfile.png'
											alt='Driver'
											width={145}
											height={145}
										/>
									</div>
									<FormGroup
										className='col-lg-3'
										id='driver_name'
										label={t('Driver full name')}>
										<Input
											type='text'
											onChange={formik.handleChange}
											value={formik.values.driver_name}
											invalidFeedback={formik.errors.driver_name}
											isTouched={formik.touched.driver_name}
											isValid={formik.isValid}
											className='bg-transparent'
										/>
									</FormGroup>
									<FormGroup className='col-lg-3 bg-transparent' id='gender' label={t('gender')}>
										<Select
											className={`${mobileDesign ? 'col-12 mb-3' : 'col-6'
												} form-control`}
											onChange={formik.handleChange}
											value={formik.values.gender}
											invalidFeedback={formik.errors.gender}
											isTouched={formik.touched.gender}
											isValid={formik.isValid}>
											<option
												value={'male'}
												selected={formik.values.gender === 'male'}>
												{t('Male')}
											</option>
											<option
												value={'female'}
												selected={formik.values.gender === 'female'}>
												{t('Female')}
											</option>
										</Select>
									</FormGroup>
									<FormGroup
										className='col-lg-3 mb-3'
										id='dob'
										label={t('Date Of Brith')}>
										<Input
											type='date'
											onChange={formik.handleChange}
											value={formik.values.dob}
											invalidFeedback={formik.errors.dob}
											isTouched={formik.touched.dob}
											isValid={formik.isValid}
											className='bg-transparent'
										/>
									</FormGroup>
								</div>

								<div className='row g-4 mb-3 align-items-center'>
									<FormGroup
										className='mb-3 col-lg-6'
										id='residential_address'
										label={t('Address')}>
										<Input className='bg-transparent'
											type='text'
											onChange={formik.handleChange}
											value={formik.values.residential_address}
											invalidFeedback={formik.errors.residential_address}
											isTouched={formik.touched.residential_address}
											isValid={formik.isValid}
										/>
									</FormGroup>
									<FormGroup
										className='mb-3 col-lg-3'
										id='mobile_no'
										label={t('Mobile Number')}>
										<Input className='bg-transparent'
											type='tel'
											onChange={formik.handleChange}
											value={formik.values.mobile_no}
											invalidFeedback={formik.errors.mobile_no}
											isTouched={formik.touched.mobile_no}
											isValid={formik.isValid}
										/>
									</FormGroup>
								</div>

								<div className='row g-4 mb-3'>
									<FormGroup
										className='col-lg-3'
										id='experience'
										label={t('Experience')}>
										<Input className='bg-transparent'
											type='text'
											onChange={formik.handleChange}
											value={formik.values.experience}
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-3'
										id='pob'
										label={t('Place of brith')}>
										<Input
											type='text'
											onChange={formik.handleChange}
											value={formik.values.pob}
											invalidFeedback={formik.errors.pob}
											isTouched={formik.touched.pob}
											isValid={formik.isValid}
											className='bg-transparent'
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-6 d-flex flex-column bg-transparent'
										label={t('Health issues')}>
										<div className='container-health-issues d-flex flex-row align-items-center gap-4'>
											<div>
												<label htmlFor='yes' style={{ marginRight: 15 }}>
													{t('Yes')}
												</label>
												<input className='bg-transparent'
													id='yes'
													type='radio'
													name='health_issues'
													value={'yes'}
													checked={formik.values.health_issues === 'yes'}
													onChange={formik.handleChange}
												/>
											</div>
											<div>
												<label htmlFor='no' style={{ marginRight: 15 }}>
													{t('No')}
												</label>
												<input className='bg-transparent'
													id='no'
													type='radio'
													name='health_issues'
													value={'no'}
													checked={formik.values.health_issues === 'no'}
													onChange={formik.handleChange}
												/>
											</div>
										</div>
									</FormGroup>
								</div>

								{/* <h5 className='mt-2 text-dark'>{t('Emergency Contact info')}</h5> */}
								<h5 className='mt-5 mb-3 text-dark emergency-heading'> {t('Emergency Contact info')}</h5>

								<div className='d-flex flex-row gap-3'>
									<FormGroup
										className='col-lg-3 mb-3'
										id='emergency_name'
										label={t('Fulll Name')}>
										<Input className='bg-transparent'
											type='text'
											onChange={formik.handleChange}
											value={formik.values.emergency_name}
											invalidFeedback={formik.errors.emergency_name}
											isTouched={formik.touched.emergency_name}
											isValid={formik.isValid}
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-3'
										id='emergency_number'
										label={t('Contact Number')}>
										<Input className='bg-transparent'
											type='tel'
											onChange={formik.handleChange}
											value={formik.values.emergency_number}
											invalidFeedback={formik.errors.emergency_number}
											isTouched={formik.touched.emergency_number}
											isValid={formik.isValid}
										/>
									</FormGroup>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-lg-12'>
						<Card stretch className='overall-card1'>
							<CardHeader className='pb-0'>
								<CardTitle className=' mt-2 emergency-heading'>
									{t('Vehical Details')}
								</CardTitle>
							</CardHeader>

							<CardBody>
								<div className='row g-4'>
									<FormGroup
										className='col-lg-3 mb-3'
										id='reg_no'
										label={t('Reg number')}>
										<RegSelect
											handleChange={setReg}
											value={formik.values.reg_no}
											className={`${mobileDesign ? 'col-12 mb-6' : 'col-12'}`}
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-3 mb-3'
										id='license_type'
										label={t('license Type')}>
										<Input className='bg-transparent'
											type='text'
											onChange={formik.handleChange}
											value={formik.values.license_type}
											invalidFeedback={formik.errors.license_type}
											isTouched={formik.touched.license_type}
											isValid={formik.isValid}
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-3 mb-3'
										id='license_no'
										label={t('license number')}>
										<Input className='bg-transparent'
											type='text'
											onChange={formik.handleChange}
											value={formik.values.license_no}
											invalidFeedback={formik.errors.license_no}
											isTouched={formik.touched.license_no}
											isValid={formik.isValid}
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-3 mb-3 bg-transparent'
										id='license_issue_date'
										label={t('Licence Issue Date')}>
										<Input className='bg-transparent'
											type='date'
											onChange={formik.handleChange}
											value={formik.values.license_issue_date}
											invalidFeedback={formik.errors.license_issue_date}
											isTouched={formik.touched.license_issue_date}
											isValid={formik.isValid}
										/>
									</FormGroup>
								</div>
								<div className='row g-4'>	
									<FormGroup
										className='col-lg-3 mb-3'
										id='license_expire_date'
										label={t('License Expire Date')}>
										<Input className='bg-transparent'
											type='date'
											onChange={formik.handleChange}
											value={formik.values.license_expire_date}
											invalidFeedback={formik.errors.license_expire_date}
											isTouched={formik.touched.license_expire_date}
											isValid={formik.isValid}
										/>
									</FormGroup>
									<FormGroup
									className=' col-lg-3 mb-3'
									id='license_issuing_authority'
									label={t('License Issuing Authority')}>
									<Input className='bg-transparent'
										name='license_issuing_authority'
										type='text'
										onChange={formik.handleChange}
										value={formik.values.license_issuing_authority}
										invalidFeedback={formik.errors.license_issuing_authority}
										isTouched={formik.touched.license_issuing_authority}
										isValid={formik.isValid}
									/>
								</FormGroup>
								</div>
							</CardBody>
							<CardFooter borderSize={1} className='px-0 justify-content-end'>
								<div
									className={` d-flex gap-3 ${!mobileDesign
										? 'flex-row-reverse w-50 ms-auto me-3'
										: 'flex-column w-100'
										}`}>
									<Button
										color='dark'
										className={`py-3 save-text ${!mobileDesign ? 'w-50 ms-3 me-0' : 'w-100 mb-3'
											}`}
										onClick={formik.handleSubmit}>
										{t('Save')}
										{driver.isLoading && (
											<Spinner isSmall inButton className='ms-2' />
										)}
									</Button>
									<Button
										className={`light-btn cancel-text py-3 ${!mobileDesign ? 'w-50' : 'w-100'
											}`}
										onClick={() =>
											navigate(
												`../${dashboardMenu.setup.subMenu.drivers.path}`,
											)
										}>
										{t('Cancel')}
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default DriverAddEditForm;
