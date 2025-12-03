import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import CommonAvatarTeam from '../../../common/other/CommonAvatarTeam';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { dashboardMenu, rolesPages } from '../../../menu';
import { RootState } from '../../../store/store';
import { IRole } from '../../../type/role-types';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import NoData from '../../../components/NoData';

const RolesList = () => {
	const { mobileDesign } = useContext(ThemeContext);
	// get  store
	const { roles } = useSelector((state: RootState) => state.roles);
	const isLoading = useSelector((state: RootState) => state.loading.models.roles);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation(['roles']);

	const { dir } = useSelector((state: RootState) => state.appStore);

	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	// get roles list
	useEffectOnce(() => {
		dispatch.roles.getRolesAsync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	});

	return (
		<PageWrapper isProtected={true} title={dashboardMenu.setup.subMenu.roles.text}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.roles.text}`),
								to: `../${dashboardMenu.setup.subMenu.roles.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold w-100' style={{ color: '#F00D69' }}>
						{t(`${dashboardMenu.setup.subMenu.roles.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<div className='w-100 mb-4 d-flex justify-content-between'></div>
				<Card>
					{isLoading ? (
						<div className='position-relative p-5 m-5'>
							<div className='position-absolute top-50 start-50 translate-middle'>
								<Spinner className='spinner-center' color='secondary' size='5rem' />
							</div>
						</div>
					) : roles.length > 0 ? (
						roles.map((role: IRole) => {
							return (
								<CardBody key={role.group_id}>
									<Card>
										<CardBody className='d-flex justify-content-between align-items-center'>
											<div
												className={`${
													mobileDesign
														? 'd-flex align-items-end justify-content-between mb-4'
														: ''
												}`}>
												<div>
													<CommonAvatarTeam>
														<h6 className='mb-1'>
															<strong>{role.group_name}</strong>
														</h6>
													</CommonAvatarTeam>
												</div>
											</div>
											<div
												className={` d-flex justify-content-end align-items-center ${
													mobileDesign ? 'flex-column' : 'w-50'
												}`}>
												{/* Hide Edit Permissions : E2E Testing of V1.0.60 request */}
												{/* {displayButtonAccordingToPermissions(
													role.group_name,
													permissions,
												) && (
													<Button
														aria-label='Edit permissions'
														className={`fs-6 light-btn ${
															mobileDesign
																? 'w-100 py-3'
																: 'w-25 py-2'
														}`}
														size='sm'
														onClick={() =>
															navigate(
																`../${rolesPages.rolesManagment.subMenu.editPermissions.path}/${role.group_id}`,
															)
														}>
														{t('Edit Permissions')}
													</Button>
												)}
												{!permissions?.read_role && (
												)} */}
												{permissions?.read_role && (
													<Button
														aria-label='Go Forward'
														className='mobile-header-toggle ms-3'
														size='sm'
														isLight
														icon={
															dir === 'rtl'
																? 'ArrowBackIos'
																: 'ArrowForwardIos'
														}
														isOutline
														onClick={() =>
															navigate(
																`../${rolesPages.rolesManagment.subMenu.addUsersToRole.path}/${role.group_id}`,
															)
														}
													/>
												)}
											</div>
										</CardBody>
									</Card>
								</CardBody>
							);
						})
					) : (
						<NoData text={t('No role to display')} withCard={false} />
					)}
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default RolesList;
