import React, { FC, useState, useContext, useRef, useEffect } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, {
	CardBody,
	CardHeader,
	CardTitle,
	CardFooter,
} from '../../../components/bootstrap/Card';
import { dashboardMenu, users } from '../../../menu';
import Input from '../../../components/bootstrap/forms/Input';
import { useFormik } from 'formik';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Button from '../../../components/bootstrap/Button';
import GroupsForUserList from './GroupsForUserList';
import { IGroup } from '../../../type/groups-type';
import showNotification from '../../../components/extras/showNotification';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useNavigate, useParams } from 'react-router-dom';
import GoBack from '../../../components/GoBack';
import Page from '../../../layout/Page/Page';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../contexts/themeContext';
import DeleteUser from './DeleteUser';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import RolesForUsersList from './RolesForUserList';
import { IApiResult } from '../../../type/users-type';
import { useGetUsersRole } from '../../../services/role';

interface ICreateEditUserProps {
	isEditing?: boolean;
}

const CreateUser: FC<ICreateEditUserProps> = ({ isEditing }) => {
	const { mobileDesign } = useContext(ThemeContext);
	//select groupe & users from store
	const { auth, appStore } = useSelector((state: RootState) => state);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const { user } = useSelector((state: RootState) => state.usersGroupDetail.userDetails);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { data, isLoading } = useGetUsersRole();

	const { id } = useParams();
	//ref to, select element
	const selectRefGroups = useRef<any>();

	const { t } = useTranslation('usersPage');

	// list groups selected
	const [groupsSelected, setGroupsSelected] = useState<IGroup[]>([]);

	useEffect(() => {
		if (isEditing && id) {
			const payload = { userID: id, spacekey: auth.user.user?.spaceKey };
			dispatch.usersGroupDetail.getUserDetailsAsync(payload).then((res: any) => {
				formik.setValues(res);
				formik.setFieldValue(
					'role',
					JSON.parse(res?.customproperties)?.find(
						(customProperty: { [key: string]: string }) => {
							return customProperty?.key?.toUpperCase() === 'ROLE';
						},
					)?.value,
				);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing, id]);

	// handle form
	const formik = useFormik({
		initialValues: {
			userName: '',
			fullName: '',
			emailID: '',
			password: '',
			confirmPassword: '',
			description: '',
			mobileNumber: '',
			landNumber: '',
			address: '',
			pincode: '',
			state: '',
			country: '',
			city: '',
			role: '',
		},

		validate: (values) => {
			const errors: {
				userName?: string;
				fullName?: string;
				emailID?: string;
				password?: string;
				confirmPassword?: string;
				description?: string;
				mobileNumber?: string;
				landNumber?: string;
				address?: string;
				pincode?: string;
				state?: string;
				city?: string;
				role?: string;
			} = {};

			if (!values.userName) {
				errors.userName = t('Required');
			}

			if (!values.fullName) {
				errors.fullName = t('Required');
			}

			if (!values.description) {
				errors.description = t('Required');
			}
			if (!values.role) {
				errors.role = t('Required');
			}

			if (!values.emailID && !isEditing) {
				errors.emailID = 'Required';
			} else if (
				!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.emailID) &&
				!isEditing
			) {
				errors.emailID = t('Invalid email address');
			}

			if (!values.password && !isEditing) {
				errors.password = t('Required');
			} else if (
				!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/i.test(
					values.password,
				) &&
				!isEditing
			) {
				errors.password = t('Password must contain...');
			} else if (values.password !== values.confirmPassword && !isEditing) {
				errors.confirmPassword = t("Passwords don't match");
			} else if (!values.confirmPassword && !isEditing) {
				errors.confirmPassword = t('Required');
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			const roleMatch = data?.find(
				(item: { role: string; group_id: string | number }) => item.role === values.role,
			);

			const idBasedOnRole = roleMatch ? Number(roleMatch.group_id) : null;

			// remove 3 roles names to avoid duplicate addition in db
			const rolesName = ['Fleet Admin', 'Viewer Role', 'Fleet Manager'];
			// let selectedUserGroups = ['123456'];
			let selectedUserGroups = groupsSelected
				?.filter((group: IGroup) => {
					return !rolesName.includes(group?.name);
				})
				?.map((group: IGroup) => {
					return Number(group.id);
				});

			if (!isEditing) {
				// affect role value from dropdown to customproperties Role's value
				const updatedProperties = JSON.parse(auth.user.user?.customproperties).map(
					(property: { [key: string]: string }) => {
						if (property.key.toUpperCase() === 'ROLE') {
							return { key: property.key, value: values.role };
						}
						return property;
					},
				);
				// Payload to create a new user
				const payload = {
					...values,
					uniqueId: values.emailID,
					thirdPartyUser: '',
					customproperties: JSON.stringify(updatedProperties),
					projectPath: 'https://platform.ravity.io/home/',
					// selectedUserGroups: [idBasedOnRole, ...selectedUserGroups],
					selectedUserGroups: [
						...(idBasedOnRole ? [idBasedOnRole] : []),
						...selectedUserGroups,
					],

					spacekey: Number(auth.user.user.spaceKey),
					userID: Number(auth.user.user?.id),
				};

				await dispatch.usersGroups
					.createUserAsync(payload)
					.then((res: { message: string; messageCode: string; success: boolean }) => {
						if (res.success === true) {
							showNotification('', 'User successfully created', 'success');
							setTimeout(() => {
								navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
							}, 2000);
						} else if (res.messageCode) {
							switch (res.messageCode) {
								case 'MSG_USER_0076':
									formik.setFieldError('password', ' ');
									formik.setFieldError('password', res.message);

									break;
								case 'MSG_USER_0073':
									formik.setFieldError('emailID', ' ');
									formik.setFieldError('emailID', res.message);

									break;
								case 'MSG_USER_0071':
									formik.setFieldError('userName', ' ');
									formik.setFieldError('userName', res.message);

									break;
							}
						} else {
							formik.setFieldError('description', res.message);
						}
					});
			} else {
				const updatedProperties = JSON.parse(user?.customproperties).map(
					(property: { [key: string]: string }) => {
						if (property.key.toUpperCase() === 'ROLE') {
							return { key: property.key, value: values.role };
						}
						return property;
					},
				);
				// Payload to update an existing user
				const payload = {
					...values,
					uniqueId: user.emailID,
					thirdPartyUser: '',
					customproperties: JSON.stringify(updatedProperties),
					projectPath: process.env.REACT_APP_URL_RAVITY,
					selectedUserGroups: [selectedUserGroups],
					spacekey: auth.user.user.spaceKey,
					userID: user.id,
				};

				await dispatch.auth.updateProfileAsync(payload).then((res: IApiResult) => {
					if (res.users.success) {
						showNotification('', 'Great ! Profile updated', 'success');
						navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
					}
				});
			}
		},

		onReset: () => {
			setGroupsSelected([]);
			selectRefGroups.current.clearValue();
			navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
		},
	});

	const handleGoBack = () => {
		if (id) {
			navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
		} else {
			navigate(-1);
		}

		dispatch.usersGroupDetail.cleanUserDetails();
	};

	const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);

	return (
		<PageWrapper>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.users.text}`),
								to: `../${dashboardMenu.setup.subMenu.users.path}`,
							},
							{
								title: t(
									`${
										!permissions?.update_user
											? users.userDetails.text
											: isEditing
											? users.editUser.text
											: users.addUser.text
									}`,
								),
								to: permissions?.update_user
									? `../${users.editUser.path}/${id}`
									: isEditing
									? `../${users.editUser.path}/${id}`
									: `../${users.addUser.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4 w-100'>
						<GoBack handleClick={handleGoBack} />{' '}
						<h1 className='fs-2 mb-0 ms-4 fw-semibold' style={{ color: '#F00D69' }}>
							{!permissions?.update_user
								? t(users.userDetails.text)
								: isEditing
								? t(users.editUser.text)
								: t(users.addUser.text)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<Card>
					<CardBody>
						<div className='row d-flex'>
							{/* form user */}
							<div className='col-lg-6'>
								<Card stretch>
									<CardHeader className='pb-0'>
										<CardTitle className=' mt-2' style={{ color: '#F00D69' }}>
											{t('User Informations')}
										</CardTitle>
									</CardHeader>

									<CardBody>
										<div className='row g-4 mb-3'>
											<FormGroup
												className='col-lg-6'
												id='userName'
												label={t('Username')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.userName}
													invalidFeedback={formik.errors.userName}
													isTouched={formik.touched.userName}
													isValid={formik.isValid}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
											<FormGroup
												className='col-lg-6'
												id='fullName'
												label={t('Full name')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.fullName}
													invalidFeedback={formik.errors.fullName}
													isTouched={formik.touched.fullName}
													isValid={formik.isValid}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
										</div>

										<FormGroup
											className='mb-3'
											id='emailID'
											label={t('email ID')}>
											<Input
												disabled={isEditing}
												name='emailID'
												type='text'
												onChange={formik.handleChange}
												value={formik.values.emailID}
												invalidFeedback={formik.errors.emailID}
												isTouched={formik.touched.emailID}
												isValid={formik.isValid}
											/>
										</FormGroup>

										<FormGroup
											className='mb-3'
											id='description'
											label={t('Description')}>
											<Input
												type='text'
												onChange={formik.handleChange}
												value={formik.values.description}
												invalidFeedback={formik.errors.description}
												isTouched={formik.touched.description}
												isValid={formik.isValid}
												disabled={!permissions?.update_user}
											/>
										</FormGroup>
										{!isEditing && (
											<div className='row g-4 mb-3'>
												<FormGroup
													id='password'
													isFloating
													className='col-lg-6 showpassValid'
													labelClassName='ps-4'
													label={t('Create password')}>
													<Input
														type='password'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.password}
														invalidFeedback={formik.errors.password}
														isTouched={formik.touched.password}
														isValid={formik.isValid}
														showPasswordOption
														dir={appStore.dir}
													/>
												</FormGroup>

												<FormGroup
													id='confirmPassword'
													isFloating
													className='col-lg-6 showpassValid'
													labelClassName='ps-4'
													label={t('Confirm password')}>
													<Input
														type='password'
														onChange={formik.handleChange}
														value={formik.values.confirmPassword}
														invalidFeedback={
															formik.errors.confirmPassword
														}
														isTouched={formik.touched.confirmPassword}
														isValid={formik.isValid}
														showPasswordOption
														onBlur={formik.handleBlur}
														dir={appStore.dir}
													/>
												</FormGroup>
											</div>
										)}
										<div className='row g-4 mb-3'>
											<FormGroup
												className='col-lg-6'
												id='mobileNumber'
												label={t('Phone Number')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.mobileNumber}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
											<FormGroup
												className='col-lg-6'
												id='landNumber'
												label={t('Work Phone Number')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.landNumber}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
										</div>
										<FormGroup
											id='address'
											label={t('Address')}
											className='mb-3'>
											<Input
												type='text'
												onChange={formik.handleChange}
												value={formik.values.address}
												disabled={!permissions?.update_user}
											/>
										</FormGroup>
										<div className='row g-4 mb-3'>
											<FormGroup
												className='col-lg-6'
												id='city'
												label={t('City')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.city}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
											<FormGroup
												className='col-lg-6'
												id='pincode'
												label={t('Zip Code')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.pincode}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
										</div>
										<div className='row g-4 mb-3'>
											<FormGroup
												className={`${mobileDesign ? 'col-12' : 'col-6'}`}
												id='state'
												label={t('State')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.state}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
											<FormGroup
												className={`${mobileDesign ? 'col-12' : 'col-6'}`}
												id='country'
												label={t('Country')}>
												<Input
													type='text'
													onChange={formik.handleChange}
													value={formik.values.country}
													disabled={!permissions?.update_user}
												/>
											</FormGroup>
										</div>
									</CardBody>
								</Card>
							</div>

							{/* group user */}
							<div className='col-lg-6'>
								<GroupsForUserList
									selectRef={selectRefGroups}
									setGroupsSelected={setGroupsSelected}
									groupsSelected={groupsSelected}
								/>
								<RolesForUsersList formik={formik} data={data} />
								{/* delete user */}
								{isEditing && permissions?.delete_user && (
									<Card>
										<CardBody>
											<Button
												// className={`float-end primary-btn py-3 w-50 ${
												// 	!mobileDesign ? 'w-25' : 'w-100'
												// }`}
												color='dark'
												isOutline={true}
												className={`float-end cancel-text py-1 w-50 ${
													mobileDesign ? 'w-100 my-3' : 'w-25'
												}`}
												onClick={() =>
													setShowDeleteDrawer(!showDeleteDrawer)
												}>
												{t('Delete')}
											</Button>

											{showDeleteDrawer && (
												<DeleteUser
													showDelete={showDeleteDrawer}
													setShowDelete={setShowDeleteDrawer}
													userInformation={user}
													type='user'
												/>
											)}
										</CardBody>
									</Card>
								)}
							</div>
						</div>

						<CardFooter borderSize={1} className='px-0 justify-content-end'>
							<div
								className={` d-flex gap-3 ${
									!mobileDesign ? ' flex-row-reverse w-50' : 'flex-column w-100'
								}`}>
								{permissions?.update_user && (
									// <Button
									// 	color='secondary'
									// 	className={`py-3 ${
									// 		!mobileDesign ? 'w-50 ms-3 me-0' : 'w-100 mb-3'
									// 	}`}
									// 	onClick={formik.handleSubmit}>
									// 	{t('Save')}
									// </Button>
									<Button
										isDisable={!formik.isValid}
										color='dark'
										style={{ backgroundColor: 'black' }}
										className={`py-3 save-text ${
											mobileDesign ? 'w-100' : 'w-25 ms-3'
										}`}
										onClick={formik.handleSubmit}>
										{t('Save')}
									</Button>
								)}
								{/* <Button
									className={`light-btn py-3 ${!mobileDesign ? 'w-50' : 'w-100'}`}
									onClick={formik.handleReset}>
									{t('Cancel')}
								</Button> */}
								<Button
									color='dark'
									isOutline={true}
									className={`py-3 cancel-text ${
										mobileDesign ? 'w-100 my-3' : 'w-25'
									}`}
									// onClick={(e) => {
									// 	// formik.handleReset(e);
									// 	navigate(-1);
									// }}>
									// onClick={formik.handleReset}
									onClick={handleGoBack}
									>
									{t('Cancel')}
								</Button>
							</div>
						</CardFooter>
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default CreateUser;
