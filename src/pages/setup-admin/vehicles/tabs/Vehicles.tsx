import React, { useContext, useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/bootstrap/Button';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Spinner from '../../../../components/bootstrap/Spinner';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import ThemeContext from '../../../../contexts/themeContext';
import useSortableData from '../../../../hooks/useSortableData';
import { vehiclesPages } from '../../../../menu';
import { useGetVehicleData } from '../../../../services/vehiclesService';
import { RootState } from '../../../../store/store';
import { IVehicle } from '../../../../type/vehicles-type';
import placeholderVehicle from '../../../../assets/vehicle-placeholder.png';
import DeleteVehicle from '../DeleteVehicle';
import SearchBar from '../../../../components/SearchBar';
import NoData from '../../../../components/NoData';

const Vehicles = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();
	const [inputSearch, setInputSearch] = useState('');
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const { t } = useTranslation(['vehicles']);

	const columns = [
		{ name: 'Thumbnail', sortable: false, width: 120 },
		{ name: 'Manufacturer', key: 'manufacturer', sortable: true },
		{ name: 'Make', key: 'make', sortable: true },
		{ name: 'Model', key: 'type', sortable: true },
		{ name: 'Registration number', key: 'reg_no', sortable: true },
		{ name: 'VIN', key: 'vin_no', sortable: true },
	];

	const { data, isLoading: isVehicleLoading, refetch } = useGetVehicleData();

	const [vehicleData, setVehicleData] = useState<IVehicle[]>([]);

	useEffect(() => {
		let filteredVehicles = [];
		if (data) {
			filteredVehicles = data.filter((obj: any) => {
				return Object.keys(obj).some((key) => {
					return obj[key]?.toString()?.toUpperCase().includes(inputSearch.toUpperCase());
				});
			});
			setVehicleData(filteredVehicles);
		}
	}, [data, inputSearch]);

	// navigate to Vehicle details
	const navigateToDetails = (idVehicle: string) => {
		if (permissions?.read_vehicle) {
			navigate(`../${vehiclesPages.vehicleDetail.path}/${idVehicle}`);
		}
	};

	const { dir } = useSelector((state: RootState) => state.appStore);
	// show hide delete component
	const [showDelete, setShowDelete] = useState(false);
	const [idVehicle, setIdVehicle] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const { items, requestSort, getClassNamesFor } = useSortableData(vehicleData);

	const deleteVehicle = (idV: string) => {
		setShowDelete(true);
		setIdVehicle(idV);
	};

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between flex-wrap mt-n5 mb-4">
				{/* title */}
				<p className="fs-2 pb-3 fw-semibold content-heading">{t('My Fleet Vehicles')}</p>

				{/* right‑hand side */}
				<div className="d-flex align-items-center gap-5
				ms-auto">
					{/* search bar grows, but can’t push the button out */}
					<div className="flex-grow-1" style={{ minWidth: 260 }}>
						<SearchBar
							search={inputSearch}
							setSearch={setInputSearch}
							text={
								mobileDesign
									? t('Search vehicles by mobile')
									: t('Search vehicles by desktop')
							}
							translation="vehicles"
							setCurrentPage={setCurrentPage}
						/>
					</div>

					{/* button never shrinks or wraps */}
					{permissions?.create_vehicle && (
						<Button
							icon="Add"
							isOutline
							className={`outline-btn py-2 px-4 planified-report ${mobileDesign ? 'w-100' : 'w-50'
							}`}
							style={{ whiteSpace: 'nowrap' }} // keeps all text on one line
							onClick={() => navigate(`../${vehiclesPages.addVehicles.path}`)}
						>
							{t('Add a Vehicle')}
						</Button>
					)}
				</div>
			</div>
			<Card stretch={false} className="overall-card1">
				{isVehicleLoading ? (
					// Display spinner if loading
					<div
						className={`${mobileDesign ? 'd-flex justify-content-center pt-5' : 'cover-spin'
							}`}
					>
						<Spinner className="spinner-center" color="secondary" size={20} />
					</div>
				) : items.length > 0 ? (
					<>
						<CardBody className="table-responsive pt-0 p-0">
							<table
								className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}
							>
								<thead>
									<tr
										style={{
											position: 'sticky',
											top: 0,
											zIndex: 5,
											backgroundColor: '#f5f5f5',
										}}
									>
										{columns.map(({ name, key, sortable, width }, index) => (
											<th
												key={index}
												style={{
													width: width,
													position: 'sticky',
													top: 0,
													zIndex: 5,
												}}
												onClick={() =>
													sortable === true ? requestSort(key) : null
												}
												className={sortable ? 'cursor-pointer' : ''}
											>
												{t(`${name}`)}
												{sortable && (
													<Icon
														size="lg"
														className={`${getClassNamesFor(key)} ms-2`}
														icon="FilterList"
													/>
												)}
											</th>
										))}
										<td />
									</tr>
								</thead>
								<tbody>
									{dataPagination(items, currentPage, perPage).map((item: IVehicle, index) => (
										<tr
											style={{
												zIndex: '1',
												cursor: permissions?.read_vehicle ? 'pointer' : 'auto',
											}}
											key={index}
										>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												<img
													src={placeholderVehicle}
													alt="vehicle"
													style={{ width: '59px', height: '51.625px', marginLeft: '5px' }}
												/>
											</td>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												{item.manufacturer}
											</td>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												{item.make}
											</td>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												{item.type}
											</td>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												{item.reg_no}
											</td>
											<td onClick={() => navigateToDetails(item.vin_no)}>
												{item.vin_no}
											</td>

											<td>
												<div className="d-flex justify-content-end align-items-center">
													{permissions?.delete_vehicle && (
														<Button
															aria-label="Delete Button"
															className="outline-btn me-0"
															style={{ zIndex: '3' }}
															icon="Delete"
															isOutline
															onClick={() => {
																deleteVehicle(item.vin_no);
															}}
														/>
													)}
													{permissions?.read_vehicle && (
														<Button
															aria-label="Go Forward"
															className="mobile-header-toggle ms-3"
															size="sm"
															isOutline
															isLight
															icon={
																dir === 'rtl' ? 'ArrowBackIos' : 'ArrowForwardIos'
															}
															onClick={() => navigateToDetails(item.vin_no)}
														/>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</CardBody>
						<DeleteVehicle
							showDelete={showDelete}
							setShowDelete={setShowDelete}
							idVehicle={idVehicle}
							vehicleData={vehicleData}
							setVehicleData={setVehicleData}
							refetch={refetch}
						/>
					</>
				) : (
					// Show NoData component if no vehicles
					<NoData text={t('No vehicle to display')} withCard={false} />
				)}
			</Card>

			{/* Pagination */}
			<PaginationButtons
				data={items}
				label="items"
				setCurrentPage={setCurrentPage}
				currentPage={currentPage}
				perPage={perPage}
				setPerPage={setPerPage}
			/>
		</div>
	);
};

export default memo(Vehicles);
