import React, { FC, useContext, useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { useTranslation } from 'react-i18next';
import { dashboardMenu, driver, driver as driverMenu } from '../../../menu';
import Page from '../../../layout/Page/Page';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import ThemeContext from '../../../contexts/themeContext';
import SearchBar from '../../../components/SearchBar';
import Button from '../../../components/bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import NoData from '../../../components/NoData';
import { IDriver } from '../../../type/auth-type';
import { useCUDDriver, useGetDriversList } from '../../../services/driver';
import Avatar from '../../../components/Avatar';
import Spinner from '../../../components/bootstrap/Spinner';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Icon from '../../../components/icon/Icon';
import useSortableData from '../../../hooks/useSortableData';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../components/PaginationButtons';
import showNotification from '../../../components/extras/showNotification';
import DeleteDriver from './DeleteDriver';
import SvgNoRecords from '../../../components/icon/material-icons/NoRecords';

interface IDriverList { }

const DriverList: FC<IDriverList> = () => {
	const columns = [
		
		{ name: 'Registration number', key: 'reg_no', sortable: true },
		{ name: 'Driver Name', key: 'driver_name', sortable: true, width: 220 },
		{ name: 'Gender', key: 'gender', sortable: true },
		{ name: 'Mobile Number', key: 'mobile_no', sortable: true },
	];

	const { data, refetch, isLoading } = useGetDriversList('All');

	const { t } = useTranslation(['driversPage', 'common']);
	const { mobileDesign } = useContext(ThemeContext);
	const [searchInput, setSearchInput] = useState('');
	const navigate = useNavigate();
	const { dir } = useSelector((state: RootState) => state.appStore);

	const drivers: Array<IDriver> = [];
	const [driverData, setDriverData] = useState<IDriver[]>([]);

	useEffect(() => {
		let filtredDrivers = [];

		if (data) {
			filtredDrivers = data?.filter((item: IDriver) => {
				return item?.driver_name?.toUpperCase().includes(searchInput?.toUpperCase());
			});
		}
		setDriverData(filtredDrivers);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading, searchInput]);

	const { items, requestSort, getClassNamesFor } = useSortableData(driverData);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const [deletePayload, setDeletePayload] = useState<{ did?: string; driver_name?: string }>({
		did: '',
		driver_name: '',
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [showDelete, setShowDelete] = useState(false);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	const { mutate, isSuccess } = useCUDDriver();

	const handleDeleteDriver = (payload: { did?: string; driver_name?: string }) => {
		setDeletePayload(payload);
		setShowDelete(true);
	};

	useEffect(() => {
		if (isSuccess) {
			showNotification('', t('Driver has been successfully deleted'), 'success');
			setTimeout(() => {
				setShowDelete(false);
				refetch();
			}, 2000);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	return (
		<PageWrapper isProtected={true} title={dashboardMenu.setup.subMenu.drivers.text}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.drivers.text}`),
								to: `../${dashboardMenu.setup.subMenu.drivers.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-0'>
				<div className='d-flex align-items-center justify-content-between flex-wrap mb-3 mt-n3
				'>
					<div className='fs-2 pb-3 fw-semibold content-heading'>
						{t(`${dashboardMenu.setup.subMenu.drivers.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>

					<div className="d-flex align-items-center gap-3">
						<div
							className={`d-flex  ${mobileDesign || !permissions?.add_driver ? 'w-100' : 'w-100'
								}`}
							data-tour='search'>
							<SearchBar
								search={searchInput}
								setSearch={setSearchInput}
								translation='driverPage'
								text={t('searchDriver')}
								setCurrentPage={setCurrentPage}
							/>
						</div>
						{permissions?.add_driver && (
							<Button
								icon='Add'
								isOutline={true}
								className={`outline-btn py-2 px-4 planified-report ${mobileDesign ? 'w-100' : 'w-50'
									}`}
								style={{ whiteSpace: 'nowrap' }}
								onClick={() => navigate(`../${driverMenu.addDriver.path}`)}>
								{t('Add new driver')}
							</Button>
						)}
					</div>
				</div>

				<Card className="overall-card1">
					{permissions?.see_all_driver ? (
						<>
							{driverData && driverData.length > 0 && !isLoading ? (
								<>
									<CardBody className='pt-0'>
										{/* <Card> */}
											{/* <CardHeader className='pb-0'>
												<CardTitle className='mt-3'>
													{t('Driver')}
												</CardTitle>
											</CardHeader> */}
											<CardBody className='table-responsive p-0'>
												{isLoading ? (
													<div
														className={`${mobileDesign
															? 'd-flex justify-content-center pt-3'
															: 'cover-spin'
															}`}>
														<Spinner
															className='spinner-center'
															color='secondary'
															size='5rem'
														/>
													</div>
												) : (
													<table
														className={
															dir === 'rtl'
																? 'table table-modern-rtl'
																: 'table table-modern'
														}>
														<thead>
															<tr
																style={{
																	position: 'sticky',
																	top: 0,
																	zIndex: 5,
																	// backgroundColor: '#f5f5f5',
																}}>
																{columns.map(
																	(
																		{
																			name,
																			key,
																			sortable,
																			width,
																		},
																		index,
																	) => (
																		<th
																			key={index}
																			style={{
																				width: width,
																				position: 'sticky',
																				top: 0,
																				zIndex: 5,
																			}}
																			onClick={() =>
																				sortable === true
																					? requestSort(
																						key,
																					)
																					: null
																			}
																			className={
																				sortable
																					? 'cursor-pointer'
																					: ''
																			}>
																			{t(`${name}`)}
																			{sortable && (
																				<Icon
																					size='lg'
																					className={`${getClassNamesFor(
																						key,
																					)}  ms-2`}
																					icon='FilterList'
																				/>
																			)}
																		</th>
																	),
																)}
																<td />
															</tr>
														</thead>
														<tbody>
															{dataPagination(
																items,
																currentPage,
																perPage,
															).map((item: IDriver, index) => (
																<tr
																	style={{
																		zIndex: '1',
																		cursor: 'auto',
																	}}
																	key={index}>
																	<td>{item.reg_no}</td>
																	<td>{item.driver_name}</td>
																	<td>
																		{t(item.gender as string)}
																	</td>
																	<td>{item.mobile_no}</td>

																	<td>
																		<div className='d-flex justify-content-end align-items-center'>
																			{permissions?.update_driver && (
																				<Button
																					aria-label='Edit Button'
																					className='secondary-btn me-0'
																					color='dark'
																					isLight
																					isOutline
																					icon='Edit'
																					onClick={() => {
																						navigate(
																							`../${driverMenu.editDriver.path}/${item.did}`,
																						);
																					}}>
																					{/* {t('Edit')} */}
																				</Button>
																			)}
																			{permissions?.delete_driver && (
																				<Button
																					aria-label='Delete Button'
																					className='outline-btn me-0'
																					style={{
																						zIndex: '3',
																						marginLeft: 15,
																					}}
																					icon='Delete'
																					color='dark'
																					isLight
																					isOutline
																					onClick={() => {
																						handleDeleteDriver(
																							{
																								did: item?.did,
																								driver_name:
																									item?.driver_name,
																							},
																						);
																					}}>
																					{t('Delete')}
																				</Button>
																			)}
																		</div>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												)}
											</CardBody>
											{/* {perPage === 5 && (
												<PaginationButtons
													data={items}
													label='items'
													setCurrentPage={setCurrentPage}
													currentPage={currentPage}
													perPage={perPage}
													setPerPage={setPerPage}
												/>
											)} */}
										{/* </Card> */}
									</CardBody>
								</>
							) : (
								<NoData text={t('No driver to display')} withCard={false} />
								// <NoData text="" withCard={false}>
								// 	<div className="noReports-found d-flex justify-content-between">
								// 		<SvgNoRecords />
								// 	</div>
								// </NoData>

							)}
						</>
					) : (
						<NoData text={t('permission_error')} withCard={false} />
					)}

					{showDelete && (
						<DeleteDriver
							refetch={refetch}
							showDelete={showDelete}
							setShowDelete={setShowDelete}
							driverName={deletePayload.driver_name}
							handleDelete={() =>
								mutate({ driver: deletePayload, action: 'delete driver' })
							}
						/>
					)}
				</Card>
				{perPage === 5 && (
					<PaginationButtons
						data={items}
						label='items'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				)}
			</Page>
		</PageWrapper>
	);
};
export default DriverList;
