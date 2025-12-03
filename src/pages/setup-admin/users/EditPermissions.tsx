import React, { useContext, useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import ThemeContext from '../../../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../../store/store';
import { useTranslation } from 'react-i18next';
import { dashboardMenu, users } from '../../../menu';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Page from '../../../layout/Page/Page';
import GoBack from '../../../components/GoBack';
import Checks from '../../../components/bootstrap/forms/Checks';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import Accordion, { AccordionItem } from '../../../components/bootstrap/Accordion';
import Button from '../../../components/bootstrap/Button';
import showNotification from '../../../components/extras/showNotification';
import Spinner from '../../../components/bootstrap/Spinner';

const EditPermissions = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation(['groupsPages']);

	let params = useParams();
	const userId = params.id?.toString();

	const isLoadingPermissions = useSelector(
		(state: RootState) => state.loading.effects.auth.getPermissionsAsync,
	);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const permissionsWithCategories = useSelector(
		(state: RootState) => state.auth?.permissionsWithCategories,
	);
	const [newPermissions, setNewPermissions] = useState(permissionsWithCategories);

	useEffect(() => {
		dispatch.auth.getPermissionsAsync(userId).then((res: any) => {
			setNewPermissions(res);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const updatePermissions = () => {
		const payload = { permissions_category: newPermissions, user_id: Number(userId) };
		dispatch.usersGroupDetail.updatePermissionsAsync(payload).then((success: boolean) => {
			if (success) {
				showNotification('', t('Permissions have been updated successfully'), 'success');
				setTimeout(() => {
					dispatch.auth.getPermissionsAsync(userId);
					navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
				}, 2000);
			}
		});
	};

	const isChecked = (category: string, permission: string) => {
		const foundCategory:
			| { category: string; permissions: { [key: string]: boolean }[] }
			| undefined = newPermissions.find((item) => item.category === category);

		if (foundCategory) {
			const foundPermission = foundCategory.permissions.find(
				(perm: { [key: string]: boolean }) => perm[permission] !== undefined,
			);

			if (foundPermission) {
				return foundPermission[permission];
			}
		}
		return false;
	};

	const handleCheckboxChange = (category: string, permission: string) => {
		const updatedPermissions: any = newPermissions.map((item) => {
			if (item.category === category) {
				const updatedPerm = item.permissions.map((perm: { [key: string]: boolean }) => {
					if (perm[permission] !== undefined) {
						return { ...perm, [permission]: !perm[permission] };
					}
					return perm;
				});

				return { ...item, permissions: updatedPerm };
			}
			return item;
		});

		setNewPermissions(updatedPermissions);
	};

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(dashboardMenu.setup.subMenu.users.text),
								to: `../${dashboardMenu.setup.subMenu.users.path}`,
							},
							{
								title: t(
									permissions?.update_permission
										? users.editPermissions.text
										: users.readPermissions.text,
								),
								to: `../${users.editPermissions.path}/${userId}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}

			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4 border-bottom border-secondary w-100'>
						<GoBack
							handleClick={() =>
								navigate(`../${dashboardMenu.setup.subMenu.users.path}`)
							}
						/>
						<h1 className='fs-2 mb-0 ms-4 fw-semibold' style={{ color: '#F00D69' }}>
							{t(
								permissions?.update_permission
									? users.editPermissions.text
									: users.readPermissions.text,
							)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				{!isLoadingPermissions ? (
					<>
						<Accordion
							className='custom-accordion-permission'
							tag='div'
							id='menu'
							shadow='default'
							activeItemId={
								permissionsWithCategories.length === 0
									? false
									: permissionsWithCategories[0].category
							}
							color='light'>
							{permissionsWithCategories?.map(
								({ category, permissions: perms }, index) => {
									return (
										<AccordionItem
											key={index}
											id={category}
											title={t(category)}
											activeItem={category}
											icon=''
											tag='div'
											headerTag='h5'
											overWriteColor='secondary'>
											{perms?.map((perm: { [key: string]: boolean }) => {
												return Object.keys(perm).map((key) => {
													// Remove underscores et add uppercase to each first letter
													const formattedKey = key
														.replace(/_/g, ' ')
														.replace(/\b\w/g, (match) =>
															match.toUpperCase(),
														);
													return (
														<div
															key={formattedKey}
															className='row-hovered d-flex justify-content-between py-2 px-4'>
															<div className='d-flex align-items-center'>
																{t(formattedKey)}
															</div>
															<div className='form-check form-switch'>
																<Checks
																	className='checkbox-custom'
																	type='checkbox'
																	role='switch'
																	id={`flexSwitchCheck${key}`}
																	value={key}
																	checked={isChecked(
																		category,
																		key,
																	)}
																	onChange={() =>
																		handleCheckboxChange(
																			category,
																			key,
																		)
																	}
																	disabled={
																		!permissions.update_permission
																	}
																/>
															</div>
														</div>
													);
												});
											})}
										</AccordionItem>
									);
								},
							)}
						</Accordion>

						<div
							className={`w-100 mb-3 ${
								mobileDesign
									? 'd-flex flex-column'
									: 'd-flex flex-row-reverse gap-3 '
							}`}>
							{permissions?.update_permission && (
								<Button
									// color='secondary'
									// className={`py-3  ${!mobileDesign ? 'w-25 ms-3' : 'w-100'}`}
									// isDisable={!formik.isValid}
										color='dark'
										style={{ backgroundColor: 'black' }}
										className={`py-3 save-text ${
											mobileDesign ? 'w-100' : 'w-25 ms-3'
										}`}
									onClick={updatePermissions}>
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
									navigate(`../${dashboardMenu.setup.subMenu.groups.path}`);
								}}>
								{t('Cancel')}
							</Button>
						</div>
					</>
				) : (
					<div className='d-flex justify-content-center align-items-center  h-100'>
						<Spinner color='secondary' size='2rem' />
					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default EditPermissions;
