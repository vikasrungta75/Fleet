import React, { FC, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader from '../../../layout/SubHeader/SubHeader';
import { alertsNotificationsPages, dashboardMenu } from '../../../menu';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Button from '../../../components/bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { RootState } from '../../../store/store';
import showNotification from '../../../components/extras/showNotification';
import GoBack from '../../../components/GoBack';
import { useLocation, useNavigate } from 'react-router-dom';
import { IAlarmSettings } from '../../../type/alert-types';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import Checks from '../../../components/bootstrap/forms/Checks';
import DefineMetrics from './components/DefineMetrics';
import UserForm from './components/UserForm';

const ADD_USER_FIELDS = {
	groupname: '',
	user_email: '',
	notify_sms: false,
	notify_email: false,
	web_push_user: false,
};

interface ICreateUpdateAlertProps {
	isEditing?: boolean;
}

interface LocationState {
	state: IAlarmSettings;
}

const CreateUpdateAlert: FC<ICreateUpdateAlertProps> = ({ isEditing }): JSX.Element => {
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();
	const { t } = useTranslation(['alertNotification']);
	const dispatch = useDispatch();
	const location = useLocation();
	const { user } = useSelector((state: RootState) => state.auth.user);

	const hasSign = ['Fuel Level', 'Speed', 'Idle Engine', 'Temperature'];

	const { usersGroups } = useSelector((state: RootState) => state);
	const { groupsListAssignedToRole } = useSelector((state: RootState) => state.usersGroups);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const { state } = location as LocationState;

	useEffect(() => {
		dispatch.usersGroups.getGroupsListAssignedToRoleAsync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// get users List if not stored in rematch
	useEffect(() => {
		if (usersGroups.users.length === 0) {
			dispatch.usersGroups.getUserListAsync();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usersGroups]);
	const formik = useFormik({
		initialValues: {
			alarm: state?.alarm ?? '',
			sign: state?.sign ?? '',
			value: state?.value?.[0] ?? '',
			notify_me: state?.notify_me ?? false,
			notify_sms: state?.notify_sms ?? false,
			notify_email: state?.notify_email ?? false,
			notify_web_push: state?.notify_web_push ?? false,
			users: state?.users ?? [],
			duration_type: state?.duration_type ?? 'is',
			duration_value: state?.duration_value ?? '5',
			duration_unit: state?.duration_unit ?? 'min.',
			end_value: state?.value?.[1] ?? '',
		},

		validate: (values) => {
			const errors: {
				alarm?: string;
				sign?: string;
				value?: string;
				notify_me?: boolean;
				// notify_sms?: string;
				notify_email?: boolean;
				notify_web_push?: boolean;
				end_value?: string;
				duration_type?: string;
				duration_value?: string;
				duration_unit?: string;
			} = {};

			if (values.alarm.length === 0) {
				errors.alarm = t('Required');
			}

			if (hasSign.includes(formik.values.alarm)) {
				if (values.value.length === 0) {
					errors.value = t('Required');
				}
			}

			if (formik.values.sign === '><') {
				if (values.end_value.length === 0) {
					errors.end_value = t('Required');
				}
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const { sign, value, alarm, end_value } = values;

			let payload: any = {
				...values,
				sign,
				value:
					end_value.length === 0
						? parseFloat(value)
						: [parseFloat(value), parseFloat(end_value)],
				notify_me: formik.values.notify_me,
				notify_sms: formik.values.notify_sms,
				notify_email: formik.values.notify_email,
				notify_web_push: formik.values.notify_web_push,
				enabled: state?.enabled ?? true,
				users: values.users,
			};
			if (isEditing) {
				payload.action = 'update alert';
				payload.alarm_id = state?.alarm_id;
				dispatch.alertsNotifications.addAlarm(payload).then((res: boolean) => {
					if (res) {
						showNotification('', t('Success update alert'), 'success');
						// setTimeout(
						// 	() => navigate(`../${dashboardMenu.setup.subMenu.alerts.path}`),
						// 	2000,
						// );
					} else {
						showNotification('', 'An error occured during updating an alert', 'danger');
					}
				});

			} else {
				payload.alarm = alarm;
				payload.action = 'add alert';

				dispatch.alertsNotifications.addAlarm(payload).then((res: any) => {
					if (res) {
						showNotification('', t('Success add alert'), 'success');
						// setTimeout(
						// 	() => navigate(`../${dashboardMenu.setup.subMenu.alerts.path}`),
						// 	2000,
						// );
					} else {
						showNotification('', 'An error occured during adding an alert', 'danger');
					}
				});
			}
		},
	});

	return (
		<FormikProvider value={formik}>
			<PageWrapper isProtected={true}>
				{/* <SubHeader>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.alerts.text}`),
								to: `../${dashboardMenu.setup.subMenu.alerts.path}`,
							},
							{
								title: !permissions?.update_alert
									? t(`${alertsNotificationsPages.alertsDetails.text}`)
									: !isEditing
									? t(`${alertsNotificationsPages.createAlert.text}`)
									: t(`${alertsNotificationsPages.editAlert.text}`),
								to: !permissions?.update_alert
									? t(`${alertsNotificationsPages.editAlert.path}`)
									: !isEditing
									? `../${alertsNotificationsPages.createAlert.path}`
									: `../${alertsNotificationsPages.editAlert.path}`,
							},
						]}
					/>
				</SubHeader> */}
				<Page className='mw-100 px-0'>
					<div className='d-flex'>
						<div className=' d-flex pb-3 mb-4 w-100'>
							{/* <GoBack /> */}
							<h1 className='fs-2 pb-3 fw-semibold content-heading'>
								{!permissions?.update_alert
									? t(`${alertsNotificationsPages.alertsDetails.text}`)
									: !isEditing
										? t(`${alertsNotificationsPages.createAlert.text}`)
										: t(`${alertsNotificationsPages.editAlert.text}`)}
							</h1>
						</div>
						<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
							<AssistanceButton locationPathname={window.location.pathname} />
						</div>
					</div>
					<Card className='px-0 mt-n3' style={{ borderRadius: "8px" }}>
						<CardBody>
							<span className='emergency-heading fw-bold'>
								{!permissions?.update_alert
									? t('See metrics')
									: !isEditing
										? t('Define metrics')
										: t('Update Metric')}
							</span>
							<DefineMetrics
								isEditing={isEditing}
								formik={formik}
								hasSign={hasSign}
							/>

							<FieldArray
								name={`users`}
								render={(arrayHelpers) => (
									<>
										<div className='d-flex justify-content-between align-items-end'>
											<span className='emergency-heading fw-bold'>
												{t('Person to notify')}
											</span>
											<div>
												{permissions?.update_alert && (
													<Button
														type='button'
														className='border-0'
														onClick={() =>
															arrayHelpers.push(ADD_USER_FIELDS)
														}
														icon='AddBlueColor'
														style={{ color: '#4C80FF' }}
														>
														{t('Add New Person to Notify')}
													</Button>
												)}
											</div>
										</div>

										<Card className='mt-4' style={{ borderRadius: "8px" }}>
											<CardBody>
												<FormGroup
													className={` ${mobileDesign ? 'col-12' : 'row col-12'
														}`}>
													<FormGroup
														className={` ${mobileDesign
															? 'col-12'
															: 'col-1 d-flex align-items-center'
															}`}
														labelClassName='col-6 mb-0 text-dark'
														label={t('Me')}>
														<Checks
															type='switch'
															onChange={formik.handleChange}
															name='notify_me'
															checked={
																formik.values.notify_me as boolean
															}
															className='checkbox-custom'
															disabled={!permissions?.update_alert}
														/>
													</FormGroup>
													<FormGroup
														className={` ${mobileDesign
															? 'col-12'
															: 'ms-4 col-6 d-flex justify-content-start align-items-center'
															}`}
														label={`${t('Notification Type')}:`}
														labelClassName='mb-3 mt-3 text-dark'>
														<FormGroup
															className={` ${mobileDesign
																? 'col-12'
																: 'col-3 d-flex flex-row-reverse align-items-center justify-content-center'
																}`}
															labelClassName={` mb-0 text-dark fw-semibold ${mobileDesign ? '' : 'ms-3'
																}`}
															label={t('Email')}>
															<Checks
																type='checkbox'
																onChange={formik.handleChange}
																name='notify_email'
																className='checkbox-nrml'
																checked={
																	formik.values
																		.notify_email as boolean
																}
																disabled={!formik.values.notify_me}
															/>
														</FormGroup>
														<FormGroup
															className={` ${mobileDesign
																? 'col-12'
																: 'col-3 d-flex flex-row-reverse align-items-center justify-content-center'
																}`}
															labelClassName={` mb-0 text-dark fw-semibold ${mobileDesign ? '' : 'ms-3'
																}`}
															label={t('Web Push')}>
															<Checks
																type='checkbox'
																onChange={formik.handleChange}
																name='notify_web_push'
																className='checkbox-nrml'
																disabled={!formik.values.notify_me}
																checked={
																	formik.values
																		.notify_web_push as boolean
																}
															/>
														</FormGroup>
													</FormGroup>
												</FormGroup>

												{formik.values.users &&
													formik.values.users.length > 0 &&
													formik.values.users.map((item, index) => {
														return (
															<>
																<UserForm
																	element={item}
																	groupsListAssignedToRole={
																		groupsListAssignedToRole
																	}
																	index={index}
																	permissions={permissions}
																	removeFormFields={() =>
																		arrayHelpers.remove(index)
																	}
																	handleChange={
																		formik.handleChange
																	}
																	t={t}
																	groupname={
																		(
																			formik.values.users[
																			index
																			] as any
																		).groupname
																	}
																	user={user}
																/>
															</>
														);
													})}
											</CardBody>
										</Card>
									</>
								)}
							/>
						</CardBody>

						<CardFooter>
							<div
								className={`d-flex w-100 ${mobileDesign ? 'flex-column ' : 'flex-row-reverse '
									}`}>
								{permissions?.update_alert && (
									<Button
										color='dark' style={{ backgroundColor: "black" }}
										className={`py-3 save-text ${mobileDesign ? 'w-100' : 'w-25 ms-3'}`}
										onClick={formik.handleSubmit}
										isDisable={!formik.isValid}>
										{t('Save')}
									</Button>
								)}
								<Button
									color='dark'
									isOutline={true}
									className={`py-3 cancel-text light-btn ${mobileDesign ? 'w-100 my-3' : 'w-25'
										}`}
									onClick={(e) => {
										formik.handleReset(e);
										navigate(-1);
									}}>
									{t('Cancel')}
								</Button>
							</div>
						</CardFooter>
					</Card>
				</Page>
			</PageWrapper>
		</FormikProvider>
	);
};

export default CreateUpdateAlert;
