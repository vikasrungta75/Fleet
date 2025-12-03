import React, { FC, useContext, useEffect, useState } from 'react';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import { useTranslation } from 'react-i18next';
import { Label } from 'recharts';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import { useFormik } from 'formik';
import Input from '../../../components/bootstrap/forms/Input';
import Checks from '../../../components/bootstrap/forms/Checks';
import VinSelect from '../../common/filters/VinSelect';
import { RootState } from '../../../store/store';
import { useSelector } from 'react-redux';
import ThemeContext from '../../../contexts/themeContext';
import RegSelect from '../../common/filters/RegSelect';
import Button from '../../../components/bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { dashboardMenu } from '../../../menu';
import AutoComplete from './components/AutoComplete';
import Accordion, { AccordionItem } from '../../../components/bootstrap/Accordion';
import Icon from '../../../components/icon/Icon';
import List from './components/List';
import { useCUDDriver } from '../../../services/driver';
import { IRevision } from '../../../type/vehicles-type';
import showNotification from '../../../components/extras/showNotification';
import Spinner from '../../../components/bootstrap/Spinner';
import moment from 'moment';
import { useCreateMaintenance } from '../../../services/maintenanceService';

interface IRevisionAddEditForm {
	showForm: boolean;
	setShowForm: (val: boolean) => void;
	refetch: () => void;
}

const initialValues: IRevision = {
	vin: '',
	task_name: '',
	parameters: [],
	description: '',
	notify_me: false,
	notify_sms: false,
	notify_email: false,
	notify_web_push: false,
	users: [],
	date: '',
	// organisation_id:[],
};

const RevisionAddEditForm: FC<IRevisionAddEditForm> = ({ showForm, setShowForm, refetch }) => {
	const { t } = useTranslation(['maintenancePage']);
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();

	const { mutate, isLoading, isSuccess } = useCreateMaintenance();

	const handleSetVin = (vin: string) => {
		formik.setFieldValue('vin', vin);
	};

	const formik = useFormik({
		initialValues: initialValues,

		onSubmit: (values) => {

			values.parameters = [serviceForm.values];
			values.date = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

			mutate({
				revision: values,
				action: 'add maintenance task',
			});
			formik.resetForm();

			serviceForm.resetForm();
		},
	});

	const serviceForm = useFormik({
		initialValues: {
			service: '',
			target: '',
			remind_before: '',
		},
		onSubmit: () => { },
	});
	const back = () => {
		showNotification('', t('maintenance task successfully added'), 'success');
		setTimeout(() => {
			setShowForm(false);
			refetch();
		}, 2000);
	};

	useEffect(() => {
		if (isSuccess) {
			back();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	const handleAddEmail = (email: any) => {
		formik.setFieldValue('users', [
			...formik.values.users,
			{
				user_email: email?.users?.EmailID,
				notify_sms: false,
				notify_email: formik.values.notify_me,
				notify_web_push: formik.values.notify_me,
			},
		]);
	};

	const handleDeleteEmail = (email: any) => {
		formik.setFieldValue(
			'users',
			formik.values.users.filter(
				(item: any, index) => item?.user_email !== email?.user_email,
			),
		);
	};

	return (
		<div>
			<OffCanvas placement='end' isOpen={showForm} setOpen={setShowForm} width='420px'>
				<OffCanvasBody style={{overflowX: 'hidden',maxHeight: '100vh'}}>
					<Card className="createTask-card">
						<CardBody className='p-3'>
							<OffCanvasHeader className='ps-2' setOpen={setShowForm}>
								<OffCanvasTitle
									id='offcanvasExampleLabel'
									tag={'h3'}
									className='task-heading'>
									{t('Create Task')}
								</OffCanvasTitle>
							</OffCanvasHeader>
							<div className='createTask-line'>

							</div>

							<FormGroup className='col-lg-12 d-flex justify-content-between'>
								<FormGroup className='col-lg-12' id='vehicle' label={t('Vehicle')}>
									<div className='input-text-field'>
										<VinSelect
											setVinFilter={handleSetVin}
											vinFilter={formik.values.vin}
											className={`col-12 bg-none`}
										/>
									</div>
								</FormGroup>
							</FormGroup>
							<FormGroup className='col-lg-12 mt-4 d-flex justify-content-between'>
								<FormGroup
									className='col-lg-12'
									id='description'
									label={t('Description')}>
									<Input
										type='text'
										onChange={formik.handleChange}
										value={formik.values.description}
										invalidFeedback={formik.errors.description}
										isTouched={formik.touched.description}
										isValid={formik.isValid}
										placeholder="Description"
										className="custom-placeholder input-text-field"
									/>
								</FormGroup>
							</FormGroup>
							<FormGroup className='col-lg-12 mt-4 d-flex justify-content-between'>
								<FormGroup className='col-lg-12' id='task_name' label={t('Name')}>
									<Input
										type='text'
										onChange={formik.handleChange}
										value={formik.values.task_name}
										invalidFeedback={formik.errors.task_name}
										isTouched={formik.touched.task_name}
										isValid={formik.isValid}
										placeholder="Name"
										className="custom-placeholder input-text-field"
									/>
								</FormGroup>
							</FormGroup>
							<h4 className='mt-4 create-heading text-dark'>{t('Maintenance intervals')}</h4>
							<p className='mb-4 create-para'>{t('planRevision')}</p>

							<FormGroup className='col-lg-12 d-flex'>
								<FormGroup
									className='col-3 d-flex align-items-center '
									labelClassName='col-6 mb-0 text-dark order-1'
									label={t('By date')}>
									<input
										value={'Date'}
										type='radio'
										name='service'
										className='form-check-input'
										onChange={serviceForm.handleChange}
									/>
								</FormGroup>
								<FormGroup
									className='col-5 d-flex align-items-center kilometers-text'
									labelClassName='col-6 mb-0 text-dark order-1'
									label={t('By kilometres')}>
									<input
										value={'Mileage'}
										type='radio'
										name='service'
										className='form-check-input'
										onChange={serviceForm.handleChange}
									/>
								</FormGroup>
								<FormGroup
									className='col-6 d-flex align-items-center engine-text'
									labelClassName='col-6 mb-0 text-dark order-1'
									label={t('By engine hour')}>
									<input
										value={'Engine Hours'}
										type='radio'
										name='service'
										className='form-check-input'
										onChange={serviceForm.handleChange}
									/>
								</FormGroup>
							</FormGroup>

							{serviceForm.values.service !== '' && (
								<FormGroup>
									<h6 className='my-4 text-dark intervals-headings'>
										{t(serviceForm.values.service)}
									</h6>

									<FormGroup
										className='col-lg-12 d-flex  align-items-center my-4 '
										id='excute'
										label={t('Target')}
										labelClassName='col-lg-4'>
										<Input
											type={
												serviceForm.values.service === 'Date'
													? 'date'
													: 'number'
											}
											onChange={serviceForm.handleChange}
											name='target'
											value={serviceForm.values.target}
											className='target-input'
										/>
									</FormGroup>
									<FormGroup
										className='col-lg-12 d-flex  align-items-center '
										id='remind_before'
										label={t('Reminder Before')}
										labelClassName='col-lg-4'>
										<Input
											type='number'
											onChange={serviceForm.handleChange}
											name='remind_before'
											value={serviceForm.values.remind_before}
											className='target-input'
										/>
									</FormGroup>
								</FormGroup>
							)}
							<h4 className='my-3 create-heading text-dark'>{t('Notifications')}</h4>
							<p className=' mb-3 create-para'>{t('indicateReminderContacts')}</p>

							<FormGroup className='col-lg-8 d-flex mb-3'>
								<FormGroup
									className='col-12 d-flex align-items-center justify-content-between '
									labelClassName='col-10 mb-0 text-dark order-1 notifications-margin'
									label={t(`Push Notifications`)}>
									<Checks
										type='checkbox'
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue('notify_email', e.target.checked);
											formik.setFieldValue(
												'notify_web_push',
												e.target.checked,
											);
											formik.setFieldValue('notify_me', e.target.checked);
										}}
										checked={formik.values.notify_me}
										name='notify_me'
										className='checkbox-nrml'
									/>
								</FormGroup>
							</FormGroup>

							<FormGroup className='col-lg-12 d-flex justify-content-between'>
								{/* <FormGroup
									className='col-12'
									labelClassName='col-8 mb-3 form-font'
									label={t(`@ Email notifications`)}>
									<AutoComplete handleClick={handleAddEmail} />
								</FormGroup> */}
								{/* <FormGroup
									className="col-12 "
									labelClassName="col-8 form-font"
								// label={t(`@ Email notifications`)}
								>
									<span style={{ color: '#888EA8', marginTop: "40px", fontFamily: 'Nunito', fontSize: '12px', fontWeight: 600, lineHeight: '16.37px', textAlign: 'left', textUnderlinePosition: 'from-font', textDecorationSkipInk: 'none' }}>
										{t(`@ Email notifications`)}
									</span>
									<div className="input-text-field">
										<AutoComplete handleClick={handleAddEmail}>
											<input type="text" placeholder="@valcode.com"/>
										</AutoComplete>

									</div>
								</FormGroup> */}
								<FormGroup className="col-12" labelClassName="col-8 form-font">
									<span style={{ color: '#888EA8', marginTop: '40px', fontFamily: 'Open Sans', fontSize: '12px', fontWeight: 600, lineHeight: '16.37px', textAlign: 'left', textUnderlinePosition: 'from-font', textDecorationSkipInk: 'none' }}>
										{t('@ email notifications')}
									</span>
									<div className="input-text-field emailTextBox">
										<AutoComplete handleClick={handleAddEmail} placeholder="@valcode.com" />
									</div>
								</FormGroup>


								<List
									className='col-6'
									title={t('List')}
									list={formik.values.users}
									handleClick={handleDeleteEmail}
								/>
							</FormGroup>
						</CardBody>

						<CardFooter borderSize={1} className='px-0 justify-content-end mr-2'>
							<div className={`d-flex gap-3 ${!mobileDesign ? 'flex-row-reverse w-50' : 'flex-column w-100'} mr-2`}>
								<Button
									color='dark'
									className={`py-3 save-text ${!mobileDesign ? 'w-50 ms-3 me-0' : 'w-100 mb-3'}`}
									onClick={formik.handleSubmit}>
									{t('Save')}
									{isLoading && <Spinner isSmall inButton className='ms-2' />}
								</Button>
								<Button
									className={`light-btn py-3 cancel-text ${!mobileDesign ? 'w-50' : 'w-100'}`}
									onClick={() => setShowForm(false)}>
									{t('Cancel')}
								</Button>
							</div>
						</CardFooter>
					</Card>
				</OffCanvasBody>
			</OffCanvas>
		</div>
	);
};

export default RevisionAddEditForm;

