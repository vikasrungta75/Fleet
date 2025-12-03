import React, { FC, useState, useContext, useEffect } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { dashboardMenu, groups } from '../../../menu';
import Button from '../../../components/bootstrap/Button';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import CommonAvatarTeam from '../../../common/other/CommonAvatarTeam';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IGroup, IGroupAssignedToRole } from '../../../type/groups-type';
import Spinner from '../../../components/bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import Page from '../../../layout/Page/Page';
import ConfirmDeletion from '../../../components/ConfirmDeletion';
import { useTranslation } from 'react-i18next';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { useEffectOnce } from 'react-use';
import ThemeContext from '../../../contexts/themeContext';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import NoData from '../../../components/NoData';

const GroupsList: FC = () => {
	const { mobileDesign } = useContext(ThemeContext);
	// get  store
	const { groupsListAssignedToRole, userGroupsList } = useSelector(
		(state: RootState) => state.usersGroups,
	);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation(['groupsPages']);

	const { dir } = useSelector((state: RootState) => state.appStore);
	const [showDeleteConfirmationField, setShowDeleteConfirmationField] = useState<{
		[key: string]: boolean;
	}>({});
	const [filteredGroups, setFilteredGroups] = useState<IGroup[]>([]);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const isLoading = useSelector(
		(state: RootState) => state.loading.effects.usersGroups.getGroupsListAssignedToRoleAsync,
	);

	// const roles = ['Viewer', 'Fleet Admin', 'Fleet Manager'];

	useEffect(() => {
		const groupsListAssignedToRoleIds: any = groupsListAssignedToRole.map(
			(group: IGroupAssignedToRole) => group.group_id,
		);
		const newFilteredGroups = userGroupsList.filter((group: IGroup) => {
			return groupsListAssignedToRoleIds.includes(group?.id);
		});
		setFilteredGroups(newFilteredGroups);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userGroupsList, groupsListAssignedToRole]);

	// handle show delete confirmation field
	const toggleOpen = (name: string) => {
		setShowDeleteConfirmationField({
			[name]: !showDeleteConfirmationField[name],
		});
	};

	// get Group list
	useEffectOnce(() => {
		dispatch.usersGroupDetail.cleanGroupDetail();
		dispatch.usersGroups.getGroupsListAsync();
		dispatch.usersGroups.getGroupsListAssignedToRoleAsync();
	});

	return (
		<PageWrapper isProtected={true} title={dashboardMenu.setup.subMenu.groups.text}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.groups.text}`),
								to: `../${dashboardMenu.setup.subMenu.groups.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold w-100' style={{ color: '#F00D69' }}>
						{t(`${dashboardMenu.setup.subMenu.groups.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<div className='w-100 mb-4 d-flex justify-content-end'>
					{permissions?.create_group && (
						// <Button
						// 	icon='Add'
						// 	color='secondary'
						// 	isOutline={true}
						// 	className={`py-3 primary-btn ${mobileDesign ? 'w-100' : 'w-25'}`}
						// 	onClick={() =>
						// 		navigate(`../${groups.groupManagment.subMenu.addGroup.path}`)
						// 	}>
						// 	{t('Add a Group')}
						// </Button>
						<Button
							icon='Add'
							isOutline
							className={`outline-btn py-2 px-4 planified-report ${
								mobileDesign ? 'w-100' : 'w-25'
							}`}
							style={{ whiteSpace: 'nowrap' }} // keeps all text on one line
							onClick={() =>
								navigate(`../${groups.groupManagment.subMenu.addGroup.path}`)
							}>
							 	{t('Add a Group')}
						</Button>
					)}
				</div>
				<Card>
					{isLoading ? (
						<div className='position-relative p-5 m-5'>
							<div className='position-absolute top-50 start-50 translate-middle'>
								<Spinner className='spinner-center' color='secondary' size='5rem' />
							</div>
						</div>
					) : filteredGroups.length > 0 ? (
						filteredGroups?.map((group: IGroup) => {
							return (
								<CardBody key={group.id}>
									<Card>
										<CardBody
											className={`d-flex  ${
												showDeleteConfirmationField[group.name]
													? mobileDesign
														? ''
														: 'pb-0'
													: ' '
											} ${
												mobileDesign
													? 'flex-column'
													: 'justify-content-between align-items-center'
											}`}>
											<div
												className={`${
													mobileDesign
														? 'd-flex align-items-end justify-content-between mb-4'
														: ''
												}`}>
												<div>
													<CommonAvatarTeam>
														<h6 className='mb-1'>
															<strong>{group.name}</strong>
														</h6>
													</CommonAvatarTeam>
												</div>
												{mobileDesign && permissions?.delete_group && (
													<Button
														aria-label='Block Group'
														className='mobile-header-toggle me-3'
														style={{ height: 36, width: 36 }}
														size='sm'
														color='secondary'
														isOutline={true}
														isLight
														icon='Block'
														onClick={() => toggleOpen(group.name)}
													/>
												)}
											</div>
											<div
												className={` d-flex justify-content-end align-items-center ${
													mobileDesign ? 'flex-column' : 'w-50'
												}`}>
												{!mobileDesign && permissions?.delete_group && (
													<Button
														data-toggle='tooltip'
														data-placement='left'
														title={t(`Block this Group`)}
														aria-label='Block Group'
														className='mobile-header-toggle me-3'
														size='sm'
														color='secondary'
														isOutline={true}
														isLight
														icon='Block'
														onClick={() => toggleOpen(group.name)}
													/>
												)}
												{mobileDesign && (
													<div className='d-flex justify-content-end'>
														{showDeleteConfirmationField[
															group.name
														] && (
															<ConfirmDeletion
																showDeleteConfirmation={
																	showDeleteConfirmationField
																}
																setShowDeleteConfirmation={
																	setShowDeleteConfirmationField
																}
																data={{
																	id: group.id,
																	name: group.name,
																}}
																type='group'
															/>
														)}
													</div>
												)}

												{permissions?.update_group && (
													<Button
														aria-label='Open Group'
														className={`fs-6 cancel-text  ${
															mobileDesign
																? 'w-100 mb-3 py-3'
																: 'me-3 w-25 py-2'
														}`}
														size='sm'
														onClick={() =>
															navigate(
																`../${groups.groupManagment.subMenu.editGroup.path}/${group.id}`,
															)
														}>
														{t('Edit group name')}
													</Button>
												)}

												{permissions?.read_group && (
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
																`../${groups.groupManagment.subMenu.addUsersToGroup.path}/${group.id}`,
															)
														}
													/>
												)}
											</div>
										</CardBody>
										{!mobileDesign && (
											<div
												className={`${
													showDeleteConfirmationField[group.name] &&
													'd-flex justify-content-end mx-3 mb-3'
												} `}>
												{showDeleteConfirmationField[group.name] && (
													<ConfirmDeletion
														showDeleteConfirmation={
															showDeleteConfirmationField
														}
														setShowDeleteConfirmation={
															setShowDeleteConfirmationField
														}
														data={{
															id: group.id,
															name: group.name,
														}}
														type='group'
													/>
												)}
											</div>
										)}
									</Card>
								</CardBody>
							);
						})
					) : (
						<NoData text={t('No groups to display')} withCard={false} />
					)}
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default GroupsList;
