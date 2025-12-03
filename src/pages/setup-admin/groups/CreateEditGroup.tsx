import { useFormik } from 'formik';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import showNotification from '../../../components/extras/showNotification';
import GoBack from '../../../components/GoBack';
import ThemeContext from '../../../contexts/themeContext';
import { addedPermissions, menuPermissions } from '../../../helpers/helpers';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { groups, dashboardMenu } from '../../../menu';
import { RootState } from '../../../store/store';
import { Iusers, UsedPermission } from '../../../type/auth-type';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import GroupNameComponent from './components/GroupNameComponent';

interface ICreateEditGroup {
	isEditing?: boolean;
}
const CreateEditGroup: FC<ICreateEditGroup> = ({ isEditing }): JSX.Element => {
	const { t } = useTranslation(['groupsPages']);
	const { mobileDesign } = useContext(ThemeContext);
	let navigate = useNavigate();
	const params = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [lengthError, setLengthError] = useState<boolean>();
	const [alphaNumericError, setAlphaNumericError] = useState<boolean>();
	const dispatch = useDispatch();
	const {
		auth: {
			user: { user },
		},
		usersGroupDetail: { groupDetail },
		usersGroupDetail,
	} = useSelector((state: RootState) => state);

	const [usersAssignedInGroup, setUsersAssignedInGroup] = useState<{ users: Iusers[] }>({
		users: [],
	});
	const [PermissionAssingedInGroup, setPermissionAssingedInGroup] = useState<{
		permissions: any;
	}>({
		permissions: {},
	});
	useEffect(() => {
		setUsersAssignedInGroup({ users: usersGroupDetail.assignedUsers });

		const UserModulePermission = usersGroupDetail.addPermissionsToGroupUtils.filter(
			(e: UsedPermission) => {
				return e.permissionCategory.includes('USER_MODULE');
			},
		);
		setPermissionAssingedInGroup({ permissions: UserModulePermission[0] });
	}, [usersGroupDetail]);

	const formik = useFormik({
		initialValues: {
			newGroupName: '',
			currentGroupName: groupDetail.name,
			groupName: '',
		},
		validate: (values) => {
			const format = /[^0-9a-zA-Z ]/;
			const errors: {
				groupName?: string;
				newGroupName?: string;
				currentGroupName?: string;
			} = {};
			if (isEditing) {
				if (values.newGroupName.length > 0) {
					values.newGroupName.length <= 25 && values.newGroupName.length >= 8
						? setLengthError(false)
						: setLengthError(true);

					format.test(values.newGroupName)
						? setAlphaNumericError(true)
						: setAlphaNumericError(false);
				}
				if (!values.newGroupName) {
					errors.newGroupName = `${t('Required')}`;
				}
			} else {
				if (values.groupName.length > 0) {
					values.groupName.length <= 25 && values.groupName.length >= 8
						? setLengthError(false)
						: setLengthError(true);
					format.test(values.groupName)
						? setAlphaNumericError(true)
						: setAlphaNumericError(false);
				}
				if (!values.groupName) {
					errors.groupName = `${t('Required')}`;
				}
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			setIsLoading(true);
			if (isEditing && params.idgroup) {
				let userIDs = usersAssignedInGroup.users.map((userAssignedInGroup: Iusers) => {
					return userAssignedInGroup.id;
				});

				let permissionsIDs = PermissionAssingedInGroup.permissions.usedPermissions
					? PermissionAssingedInGroup.permissions.usedPermissions.map(
							(permission: UsedPermission) => {
								return permission.pKey;
							},
					  )
					: PermissionAssingedInGroup.permissions.permissions.map(
							(permission: UsedPermission) => {
								return permission.pKey;
							},
					  );

				const payload = {
					assignedUsers: userIDs,
					assignedPermission: permissionsIDs,
					groupName: values.newGroupName,
					spacekey: user.spaceKey,
					userid: user.id,
					groupID: params.idgroup,
				};

				await dispatch.usersGroups
					.updateGroupAsync(payload)
					.then((res: { success: boolean; message: string }) => {
						if (res.success) {
							showNotification('', res.message, 'success');
							navigate(`../${dashboardMenu.setup.subMenu.groups.path}`);
						} else {
							showNotification('', res.message, 'danger');
						}
					});
			} else {
				const newGroup = {
					groupName: values.groupName,
					description: '',
					addedPermissions: addedPermissions,
					menuPermissions: menuPermissions,
					userIDs: [],
					spacekey: user.spaceKey,
					id: user.id,
				};

				await dispatch.usersGroups.createNewGroup(newGroup).then((res: any) => {
					if (res.success) {
						showNotification('', 'Group has been successfully created', 'success');
						setTimeout(() => {
							navigate(`../${dashboardMenu.setup.subMenu.groups.path}`);
							setIsLoading(false);
						}, 3000);
					} else {
						formik.setFieldError('groupName', res.message);
						setIsLoading(false);
					}
				});
			}
		},
	});

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.groups.text}`),
								to: `../${dashboardMenu.setup.subMenu.groups.path}`,
							},
							{
								title: isEditing
									? t(`${groups.groupManagment.subMenu.editGroup.text}`)
									: t(`${groups.groupManagment.subMenu.addGroup.text}`),
								to: `../${groups.groupManagment.subMenu.addGroup.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}

			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4  w-100' style={{ color: '#F00D69' }}>
						<GoBack
							handleClick={() =>
								navigate(`../${dashboardMenu.setup.subMenu.groups.path}`)
							}
						/>
						<h1 className='fs-2 mb-0 ms-4 fw-semibold' style={{ color: '#F00D69' }}>
							{' '}
							{isEditing
								? t(`${groups.groupManagment.subMenu.editGroup.text}`)
								: t(`${groups.groupManagment.subMenu.addGroup.text}`)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				<form className='row d-flex justify-content-between align-items-center'>
					<Card>
						<CardBody
							className={`d-flex flex-column m-auto  ${
								mobileDesign ? 'w-100' : 'w-50'
							}`}>
							<GroupNameComponent
								isEditing={isEditing}
								lengthError={lengthError}
								alphaNumericError={alphaNumericError}
								formik={formik}
							/>

							<div
								className={`d-flex gap-3 ${
									mobileDesign ? 'flex-column' : 'flex-row-reverse '
								}`}>
								<Button
									type='submit'
									// color='secondary'
									// className={`py-3  ${mobileDesign ? 'w-100 ' : 'w-50 ms-3'}`}
										color='dark'
										style={{ backgroundColor: 'black' }}
										className={`py-3 save-text ${
											mobileDesign ? 'w-100' : 'w-25 ms-3'
										}`}
									onClick={formik.handleSubmit}
									isDisable={lengthError || alphaNumericError}>
									{isLoading && <Spinner isSmall inButton className='ms-2' />}
									{isEditing ? t('Update') : t('Create')}
								</Button>
								<Button
									// color='secondary'
									// isOutline={true}
									// className={`py-3 light-btn ${
									// 	mobileDesign ? 'w-100 my-3' : 'w-50'
									// }`}
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
						</CardBody>
					</Card>
				</form>
			</Page>
		</PageWrapper>
	);
};

export default CreateEditGroup;
