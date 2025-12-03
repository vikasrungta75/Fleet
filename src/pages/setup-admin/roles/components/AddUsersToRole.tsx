import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import USERS from '../../../../common/data/userDummyData';
import Avatar from '../../../../components/Avatar';
import Breadcrumb from '../../../../components/bootstrap/Breadcrumb';
import Button from '../../../../components/bootstrap/Button';
import Card, {
	CardBody,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Spinner from '../../../../components/bootstrap/Spinner';
import showNotification from '../../../../components/extras/showNotification';
import GoBack from '../../../../components/GoBack';
import ThemeContext from '../../../../contexts/themeContext';
import Page from '../../../../layout/Page/Page';
import PageWrapper from '../../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../../layout/SubHeader/SubHeader';
import { dashboardMenu, rolesPages, users } from '../../../../menu';
import { RootState, store } from '../../../../store/store';
import { Iusers, UsedPermission } from '../../../../type/auth-type';
import AssistanceButton from '../../../common/assitance-button/AssistanceButton';
import SelectUsers from '../../groups/components/SelectUsers';
import useGetLanguageSelected from '../../../../hooks/useGetLanguageSelected';
import Loader from '../../../../components/Loader';

const AddUsersToRole: FC = (): JSX.Element => {
	const { mobileDesign } = useContext(ThemeContext);
	const { id } = useParams();
	const { t, i18n } = useTranslation(['roles']);
	const {
		usersGroupDetail,
		auth: { user },
	} = useSelector((state: RootState) => state);
	const permissions = useSelector((state: RootState) => state?.auth?.permissions);
	const dispatch = useDispatch();
	const { getUserGroupDetailsAsync: isLoading } = useSelector(
		(state: RootState) => state.loading.effects.usersGroupDetail,
	);
	//ref to, select element
	const selectRef = useRef<any>();
	//user liste group
	const [usersGroupSelected, setUsersGroupSelected] = useState<Iusers[]>(
		usersGroupDetail.assignedUsers,
	);
	const navigate = useNavigate();

	const languageSelected = useGetLanguageSelected();

	const [PermissionAssingedInGroup, setPermissionAssingedInGroup] = useState<{
		permissions: any;
	}>({
		permissions: {},
	});

	useEffect(() => {
		dispatch.usersGroupDetail
			.getUserGroupDetailsAsync({ groupID: id })
			.then((res: Iusers[]) => setUsersGroupSelected(res));

		if (usersGroupDetail.groupDetail.status === 1) {
			const UserModulePermission = usersGroupDetail.addPermissionsToGroupUtils.filter(
				(e: UsedPermission) => {
					return e.permissionCategory.includes('USER_MODULE');
				},
			);
			setPermissionAssingedInGroup({ permissions: UserModulePermission[0] });
		}
		const UserModulePermission = usersGroupDetail.addPermissionsToGroupUtils.filter(
			(e: UsedPermission) => {
				return e.permissionCategory.includes('USER_MODULE');
			},
		);
		setPermissionAssingedInGroup({ permissions: UserModulePermission[0] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const submitUpdateRole = async () => {
		let userIDs = usersGroupSelected.map((userGroupSelected: Iusers) => {
			return userGroupSelected.id;
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
			groupName: usersGroupDetail.groupDetail.name,
			spacekey: user.spaceKey,
			userid: user.id,
			groupID: id,
		};
		await dispatch.usersGroups.updatePermissionGroupAsync(payload).then(() => {
			const { success } = store.getState().usersGroups;
			if (success === true) {
				showNotification('', t('Role has been successfully updated'), 'success');
				navigate(`../${dashboardMenu.setup.subMenu.roles.path}`);
			}
		});
	};

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(dashboardMenu.setup.subMenu.roles.text),
								to: `../${dashboardMenu.setup.subMenu.roles.path}`,
							},
							{
								title: t(rolesPages.rolesManagment.subMenu.addUsersToRole.text),
								to: `../${rolesPages.rolesManagment.subMenu.addUsersToRole.path}/${id}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4 border-bottom  w-100'>
						<GoBack />
						<h1 className='fs-2 mb-0 ms-4 fw-semibold'  style={{ color: '#F00D69' }}>
							{languageSelected === 'fr' && (
								<>
									Définir les utilisateurs pour{' '}
									<span className='text-dark'>
										{usersGroupDetail.groupDetail.name}{' '}
									</span>
								</>
							)}
							{languageSelected === 'en' && (
								<>
									Define{' '}
									<span className='text-dark'>
										{usersGroupDetail.groupDetail.name}{' '}
									</span>{' '}
									users
								</>
							)}
							{languageSelected === 'hn' && (
								<>
									<span className='text-dark'>
										{usersGroupDetail.groupDetail.name}{' '}
									</span>{' '}
									भूमिका उपयोगकर्ताओं को परिभाषित करें
								</>
							)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold border-bottom align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				{isLoading ? (
					<Loader />
				) : (
					<>
						<Card>
							<CardBody
								className={`${
									mobileDesign
										? 'd-flex flex-column'
										: 'd-flex flex-row justify-content-between align-items-center gap-3 '
								}`}>
								<SelectUsers
									selectRef={selectRef}
									setUsersGroupSelected={setUsersGroupSelected}
									usersGroupSelected={usersGroupSelected}
								/>

								{permissions?.create_user && (
									<Button
										icon='Add'
										// color='secondary'
										// isOutline={true}
										// className={`py-3 mb-0 primary-btn ${
										// 	mobileDesign ? 'w-100' : 'w-25 '
										// }`}
									// 		color='dark'
									// isOutline={true}
									// className={`py-1 mb-100 cancel-text ${
									// 	mobileDesign ? 'w-100 my-3' : 'w-25'
									// }`}
											color='dark'
										style={{ backgroundColor: 'black' }}
										className={`py-3 save-text ${
											mobileDesign ? 'w-100' : 'w-25 ms-3'
										}`}
										onClick={() => navigate(`../${users.addUser.path}`)}>
										{t('Create new user')}
									</Button>
								)}
							</CardBody>
						</Card>
						<Card className='border border-2 rounded'>
							<CardHeader>
								<CardTitle className='mt-3'>{t('Users')}</CardTitle>
							</CardHeader>
							<CardBody>
								{usersGroupSelected
									?.filter(
										(userGroupSelected: Iusers) =>
											userGroupSelected.status !== 2,
									)
									?.map((item: Iusers, key: number) => {
										return (
											<div
												key={key}
												className='w-100 d-flex flex-column justify-content-between usr-group-added'>
												<div
													className={`${
														mobileDesign ? 'w-100' : 'w-50'
													}`}>
													<Avatar
														className='me-4'
														size={40}
														src={USERS.JANE.src}
														userName={item.fullName}
													/>
													{item.fullName}
												</div>
												<div>
													<hr />
												</div>
											</div>
										);
									})}
							</CardBody>
							<CardFooter>
								<div
									className={`w-100 ${
										mobileDesign
											? 'd-flex flex-column'
											: 'd-flex flex-row-reverse gap-3'
									}`}>
									{permissions?.update_group && (
										<Button
											// color='secondary'
											// className={`py-3  ${
											// 	!mobileDesign ? 'w-25 ms-3' : 'w-100'
											// }`}
												color='dark'
										style={{ backgroundColor: 'black' }}
										className={`py-3 save-text ${
											mobileDesign ? 'w-100' : 'w-25 ms-3'
										}`}
											onClick={submitUpdateRole}>
											{t('Save')}
										</Button>
									)}
									<Button
										// color='secondary'
										// isOutline={true}
										// className={`py-3 light-btn ${
										// 	!mobileDesign ? 'w-25' : 'w-100 my-3'
										// }`}
										color='dark'
									isOutline={true}
									className={`py-3 cancel-text ${
										mobileDesign ? 'w-100 my-3' : 'w-25'
									}`}
										onClick={() => {
											navigate(
												`../${dashboardMenu.setup.subMenu.roles.path}`,
											);
										}}>
										{t('Cancel')}
									</Button>
								</div>
							</CardFooter>
						</Card>
					</>
				)}
			</Page>
		</PageWrapper>
	);
};

export default AddUsersToRole;
