import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store/store';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../contexts/themeContext';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { dashboardMenu, users as userMenu, users } from '../../../menu';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Avatar from '../../../components/Avatar';
import USERS from '../../../common/data/userDummyData';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import SearchBar from '../../../components/SearchBar';
import NoData from '../../../components/NoData';
import { useGetFleetManagers } from '../../../services/groupsService';
import Spinner from '../../../components/bootstrap/Spinner';

const UsersList = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const navigate = useNavigate();
	const { t } = useTranslation(['usersPage']);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	const [searchInput, setSearchInput] = useState('');
	const { data, isLoading, isSuccess, refetch, remove } = useGetFleetManagers();

	useEffect(() => {
		refetch();
		return () => {
			remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isSuccess) {
			let filtredInput = [];

			filtredInput = data?.filter((user: any) => {
				return user?.users?.fullName.toUpperCase().includes(searchInput?.toUpperCase());
			});

			setFilteredUsers(filtredInput);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput, isLoading]);

	const [filteredUsers, setFilteredUsers] = useState<any>([]);

	return (
		<PageWrapper isProtected={true} title={dashboardMenu.setup.subMenu.users.text}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.users.text}`),
								to: `../${dashboardMenu.setup.subMenu.users.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold w-100' style={{ color: '#F00D69' }}>
						{t(`${dashboardMenu.setup.subMenu.users.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<Card>
					<CardHeader>
						<div
							className={`d-flex me-4  ${
								mobileDesign ? 'w-100' : permissions?.create_user ? 'w-75' : 'w-100'
							}`}
							data-tour='search'>
							<SearchBar
								search={searchInput}
								setSearch={setSearchInput}
								translation='usersPage'
								text='Search User'
							/>
						</div>
						{permissions?.create_user && (
							// <Button
							// 	icon='Add'
							// 	color='secondary'
							// 	isOutline={true}
							// 	className={`primary-btn py-3 mb-0 ${
							// 		mobileDesign ? 'w-100' : 'w-25 '
							// 	}`}
							// 	onClick={() => navigate(`../${userMenu.addUser.path}`)}>
							// 	{t('Add new user')}
							// </Button>
								<Button
							icon="Add"
							isOutline
							className={`outline-btn py-2 px-4 planified-report ${mobileDesign ? 'w-100' : 'w-25'
							}`}
							style={{ whiteSpace: 'nowrap' }} // keeps all text on one line
						onClick={() => navigate(`../${userMenu.addUser.path}`)}>
						
						 	{t('Add new user')}
						</Button>
						)}
					</CardHeader>
					{isLoading ? (
						<div className={`loader-wrapper ${!isLoading && 'hidden'}`}>
							<Spinner className='spinner-center' color='secondary' size='5rem' />
						</div>
					) : (
						<>
							{isSuccess && filteredUsers && filteredUsers.length > 0 ? (
								<CardBody className='pt-0'>
									<Card>
										<CardHeader className='pb-0'>
											<CardTitle className='mt-3 mb-4'>
												{/* {t('Users')} */}
											</CardTitle>
										</CardHeader>
										<CardBody className='p-0'>
											{filteredUsers?.map((item: any, index: number) => {
												return (
													<div
														key={index}
														className='d-flex justify-content-between user-row p-3'>
														<div>
															<Avatar
																size={40}
																src={USERS.JANE.src}
																userName={item?.users?.fullName}
																className='me-3'
															/>

															{item?.users?.fullName}
														</div>

														<div className='d-flex align-items-center'>
															<Button
																style={{ zIndex: 999 }}
																aria-label='Edit permissions'
																className={`fs-6 light-btn ${
																	mobileDesign
																		? 'w-100 py-3'
																		: 'py-2 me-4'
																}`}
																size='sm'
																onClick={() =>
																	navigate(
																		`../${users.editPermissions.path}/${item.users.id}`,
																	)
																}>
																{t(
																	permissions?.update_permission
																		? users.editPermissions.text
																		: users.readPermissions
																				.text,
																)}
															</Button>

															{permissions?.read_user && (
																<Button
																	aria-label='Go Forward'
																	className='mobile-header-toggle'
																	size='sm'
																	isOutline
																	isLight
																	icon={
																		dir === 'rtl'
																			? 'ArrowBackIos'
																			: 'ArrowForwardIos'
																	}
																	onClick={() =>
																		navigate(
																			`../${userMenu.editUser.path}/${item?.users.id}`,
																		)
																	}
																/>
															)}
														</div>
													</div>
												);
											})}
										</CardBody>
									</Card>
								</CardBody>
							) : (
								<NoData text={t('No users to display')} withCard={false} />
							)}
						</>
					)}
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default UsersList;
