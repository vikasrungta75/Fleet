import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { groups, dashboardMenu, users } from '../../../menu';
import Page from '../../../layout/Page/Page';
import GoBack from '../../../components/GoBack';
import Card, {
	CardBody,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../../components/bootstrap/Card';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/bootstrap/Button';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import { Iusers, UsedPermission } from '../../../type/auth-type';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import USERS from '../../../common/data/userDummyData';
import ThemeContext from '../../../contexts/themeContext';
import showNotification from '../../../components/extras/showNotification';
import SelectUsers from './components/SelectUsers';
import Spinner from '../../../components/bootstrap/Spinner';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import useGetLanguageSelected from '../../../hooks/useGetLanguageSelected';
import { useGetFleetManagers } from '../../../services/groupsService';
import Loader from '../../../components/Loader';

const AddUsersToGroup: FC = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const { idgroup } = useParams();
	const { t, i18n } = useTranslation(['groupsPages']);
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
		if (usersGroupDetail.groupDetail.id === 0) {
			dispatch.usersGroupDetail
				.getUserGroupDetailsAsync({ groupID: idgroup })
				.then((res: Iusers[]) => setUsersGroupSelected(res));
		} else if (usersGroupDetail.groupDetail.id.toString() !== idgroup) {
			navigate(`../${dashboardMenu.setup.subMenu.groups.path}`);
		}
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
	}, [usersGroupDetail]);

	const submitUpdateGroup = async () => {
		let userIDs = usersGroupSelected.map((userGroupSelected: any) => {
			return userGroupSelected.users.id;
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
			groupID: idgroup,
		};
		await dispatch.usersGroups
			.updatePermissionGroupAsync(payload)
			.then((res: { success: boolean; message: string }) => {
				if (res.success === true) {
					showNotification('', res.message, 'success');
					dispatch.auth.getProfileUserDetailsAsync();
					navigate(`../${dashboardMenu.setup.subMenu.groups.path}`);
				} else {
					showNotification('', res.message, 'danger');
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
								title: t(`${dashboardMenu.setup.subMenu.groups.text}`),
								to: `../${dashboardMenu.setup.subMenu.groups.path}`,
							},

							{
								title: t(`${groups.groupManagment.subMenu.addUsersToGroup.text}`),
								to: `../${groups.groupManagment.subMenu.addUsersToGroup.path}/${idgroup}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4 border-bottom  w-100'>
						<GoBack />
						<h1 className='fs-2 mb-0 ms-4 fw-semibold' style={{ color: '#F00D69' }}>
							{languageSelected === 'fr' && (
								<>
									Définir les utilisateurs du groupe{' '}
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
									group users
								</>
							)}
							{languageSelected === 'hn' && (
								<>
									<span className='text-dark'>
										{usersGroupDetail.groupDetail.name}{' '}
									</span>{' '}
									समूह के उपयोगकर्ताओं को परिभाषित करें
								</>
							)}{' '}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
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
								<CardTitle className='mt-3'>{t('Users Group')}</CardTitle>
							</CardHeader>
							<CardBody>
								{usersGroupSelected
									.filter(
										(userGroupSelected: Iusers) =>
											userGroupSelected.status !== 2,
									)
									.map((item: any, key: number) => {
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
														userName={
															item?.fullName || item?.users?.fullName
														}
													/>
													{item?.fullName || item?.users?.fullName}
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
											onClick={submitUpdateGroup}>
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
												`../${dashboardMenu.setup.subMenu.groups.path}`,
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

export default AddUsersToGroup;
