import React, { FC, useMemo, useState, useEffect, useContext } from 'react';
import Badge from '../../../../components/bootstrap/Badge';
import { svg } from '../../../../assets';
import {
	useGetVehicleLocation,
	useGetVehicleLocationv1,
} from '../../../../services/vehiclesService';
import { useFormik } from 'formik';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useFilteredVehicles } from '../../../../hooks/useGetFilteredVehicles';
import DatePickerPerso from '../../../../components/DatePickerPerso';
import {
	convertToDate,
	convertToDateWithUTC,
	dateFormatter,
	getDefaultDateRangeFilter,
} from '../../../../helpers/helpers';
import { IDateRangeFilter } from '../../../../type/history-type';
import {
	updateDatePickerDefaultStaticRanges,
	updateDatePickerDefineds,
} from '../../../../common/other/DatePickerConstant';
import { useTranslation } from 'react-i18next';
import Checks from '../../../../components/bootstrap/forms/Checks';
import { CardFooter } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import ThemeContext from '../../../../contexts/themeContext';
import { useNavigate } from 'react-router-dom';
import { dashboardMenu } from '../../../../menu';

interface IFilterCardProps {
	setshowFilterPanel: (showFilterPanel: boolean) => void;
	 setIsModalOpen: (val: boolean) => void; // Add this
	showFilterPanel: boolean;
	checkedFilter: string[];
	setShowSortPanel: (showSortPanel: boolean) => void;
	showSortPanel: boolean;
	setCreteria: (payload: { vins: String[]; date: {} | null }) => void;
	withRangeFilter: boolean;
	setCheckedFilter: Function;
	isDetailSelected: boolean;
	showDatePicker2: (show: boolean) => void; // Change to function type
	setSelectedToShowMap1: (value: any) => void;
	updateVins: (newVins: any[]) => void;
}
const FilterCard: FC<IFilterCardProps> = ({
	setshowFilterPanel,
	 setIsModalOpen,
	showFilterPanel,
	checkedFilter,
	setShowSortPanel,
	showSortPanel,
	setCreteria,
	withRangeFilter,
	setCheckedFilter,
	isDetailSelected,
	showDatePicker2,
	setSelectedToShowMap1,
	updateVins,
}) => {
	const { selectedTrajectHistory, searchInputGeneral } = useSelector(
		(state: RootState) => state.appStoreNoPersist,
	);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [groupNameFilter, setGroupNameFilter] = useState('All Fleets');

	const { t } = useTranslation(['vehicles']);

	const payloadFilter = useMemo(
		() => ({
			fleet_name: groupNameFilter,
			status: checkedFilter,
			trouble: 'All',
		}),
		[groupNameFilter, checkedFilter],
	);

	const payloadFilterForTrouble = {
		fleet_name: groupNameFilter,
		status: 'Total',
		trouble: checkedFilter,
	};

	const { data: vehiclesLocation, isFetching } = useGetVehicleLocationv1();

	const toggleFilter = () => {
		setYPosition('460');
		setshowFilterPanel(!showFilterPanel);
		setShowSortPanel(false);
	};

	const formik = useFormik({
		initialValues: {
			vins: [],
			date: {},
		},
		onSubmit: (values) => {
			const payload = {
				vins: values.vins,
				date: withRangeFilter
					? (values.date = {
							endTime: time.endTime,
							startTime: time.startTime,
							startDate: dateFormatter(date[0].startDate),
							endDate: dateFormatter(date[0].endDate),
					  })
					: null,
			};

			setCreteria(payload);
			setshowFilterPanel(false);
			setShowSortPanel(false);
		},
	});

	const filteredVehicles = useFilteredVehicles(vehiclesLocation, searchInputGeneral);

	const [showDatePicker, setShowDatePicker] = useState(false);

	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const { isFilterLoading } = useSelector((state: RootState) => state.appStoreNoPersist);

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const { filterPayload } = useSelector((state: RootState) => state.filters);

	const [time, setTime] = useState({
		startTime: filterPayload.startTime || '00:00:00',
		endTime: filterPayload.endTime || '23:59:59',
	});

	const localTime = convertToDateWithUTC(new Date(), preferedTimeZone);

	const [date, setDate] = useState<any>([
		{
			startDate: filterPayload.startDate ? convertToDate(filterPayload.startDate) : localTime,
			endDate: filterPayload.endDate ? convertToDate(filterPayload.endDate) : localTime,
			key: 'selection',
		},
	]);
	const [isDateSelected, toggleDateSelected] = useState(false);
	const [vinSelectedToShowMap, setvinSelectedToShowMap] = useState<any>([]);
	setSelectedToShowMap1(vinSelectedToShowMap);

	const [Componentdots, setComponentdots] = useState(false);

	useEffect(() => {
		updateDatePickerDefineds(preferedTimeZone);
	}, [preferedTimeZone]);

	// eslint-disable-next-line @typescript-eslint/no-shadow
	const someFunction = (showDatePicker2: (show: boolean) => void, show: boolean) => {
		showDatePicker2(show);
	};

	const handleSubmit = () => {
	if (withRangeFilter) {
		setShowDatePicker(true);
		toggleDateSelected(true);
		someFunction(showDatePicker2, true);
	
	} else {
		setShowDatePicker(false);
		someFunction(showDatePicker2, false);
		
	}

	if (isDetailSelected) {
		dispatch.appStoreNoPersist.addVehicleSelectedToMap(vinSelectedToShowMap);
		dispatch.vehicles.changeShowAllVehicle(false);
	
	}

	setIsModalOpen(false);
};


	const [vehicleSelectedDots, setvehicleSelectedDots] = useState<{ vin: string; fleet: string }>({
		vin: '',
		fleet: '',
	});

	const handleChangeVin = (e: React.ChangeEvent<HTMLInputElement>, fleet: any) => {
		formik.handleChange(e);
		const { checked } = e.target;

		if (checked) {
			setvinSelectedToShowMap((prevArray: any) => [...prevArray, { ...fleet }]);
			// Update parent 'vins' with selected VINs
			updateVins([...formik.values.vins, fleet.vin]);
		} else {
			setvinSelectedToShowMap((prevArray: any) =>
				prevArray.filter((item: any) => item.vin !== fleet.vin),
			);
			// Update parent 'vins' by removing unselected VIN
			updateVins(formik.values.vins.filter((vin) => vin !== fleet.vin));
		}
	};

	// const handleChangeVin = (e: React.ChangeEvent<HTMLInputElement>, fleet: any) => {
	// 	formik.handleChange(e);
	// 	const { checked } = e.target;

	// 	if (checked) {
	// 		setvinSelectedToShowMap((prevArray: any) => [...prevArray, { ...fleet }]);
	// 	} else {
	// 		setvinSelectedToShowMap((prevArray: any) =>
	// 			prevArray.filter((item: any) => item.vin !== fleet.vin),
	// 		);
	// 	}
	// };
	const [yPosition, setYPosition] = useState<any>(300);

	const handleDotsFunction = (event: any, i: number, vin: string, groupName: string) => {
		const yPos = event.clientY;
		setYPosition(yPos);
		setComponentdots(!Componentdots);
		setvehicleSelectedDots({ vin, fleet: groupName });
		if (showFilterPanel) {
			setYPosition('460');
		}
	};

	const { mobileDesign } = useContext(ThemeContext);

	const handleClickAlertOption = () => {
		// navigate(`../${dashboardMenu.alertsNotifications.path}`);
		dispatch.filters.filtersStore({
			vin: vehicleSelectedDots.vin,
			fleet: vehicleSelectedDots.fleet,
			startDate: dateFormatter(new Date()),
			endDate: dateFormatter(new Date()),
		});
	};
	const handleClickReportOption = () => {
		navigate(`../${dashboardMenu.reports.path}`);
	};

	return (
		<div>
			<div className='setting-container'>
				<div className='selected-setting'></div>
				<div className='setting-options'>
					<button onClick={toggleFilter} className='btn'>
						<img src={svg.tune} alt='tune' /> <span>{t('Filters')}</span>
					</button>
				</div>
			</div>
			<div className='filter-body-fleet'>
				{filteredVehicles && !isFilterLoading
					? filteredVehicles.map((fleet: any, i: any) => {
							return (
								<div key={i} className='filter-option'>
									<label
										htmlFor={`vin_${i}`}
										className='d-flex align-items-center'>
										<Checks
											type='checkbox'
											id={`vin_${i}`}
											name='vins'
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												handleChangeVin(e, fleet);
											}}
											checked={formik.values.vins.some(
												(item) => item === fleet.vin,
											)}
											value={fleet.vin}
											className='checkbox-nrml'
										/>

										<span
											style={{
												fontFamily: 'Open Sans',
												fontSize: '12px',
												lineHeight: '16.1px',
												marginLeft: '5px',
												marginRight: '5px',
											}}>
											{fleet.vin}
										</span>
									</label>
									<div className='d-flex justify-content-between'>
										<img
											src={
												svg[fleet.status.toLowerCase() as keyof typeof svg]
											}
											width={15}
											height={15}
											style={{ marginRight: 5, cursor: 'pointer' }}
											alt='vehicles status'
										/>
									</div>
								</div>
							);
					  })
					: !showDatePicker && (
							<>
								<div className='d-flex justify-content-center h-100 align-items-center'>
									<Spinner
										className='spinner-center'
										color='secondary'
										size='5rem'
									/>
								</div>
							</>
					  )}
			</div>
			{Componentdots && !mobileDesign && (
				<>
					<div
						style={{
							left: '481px',
							top: `${yPosition}px`,
						}}
						className='dots-fleet p-2'>
						<div
							onClick={() => setComponentdots(false)}
							className='d-flex align-items-end flex-column bd-highlight mb-3'>
							X
						</div>
						<div
							onClick={() => handleClickReportOption()}
							className='d-flex flex-row bd-highlight dd'>
							<div className='p-2 bd-highlight'>
								<Icon size={'4x'} icon='description' className='btn-icon' />
							</div>
							<div className='p-2 bd-highlight'>{t('Rapport')}</div>
						</div>
						<div
							onClick={() => handleClickAlertOption()}
							className='d-flex flex-row bd-highlight dd'>
							<div className='p-2 bd-highlight'>
								<Icon size={'4x'} icon='notifications' className='btn-icon' />
							</div>
							<div className='p-2 bd-highlight'>{t('Alerts')}</div>
						</div>
					</div>
				</>
			)}
			{mobileDesign && Componentdots && (
				<>
					<div
						style={{ left: '201px', bottom: '-207px', width: '121px' }}
						className='dots-fleet p-2'>
						<div
							onClick={() => setComponentdots(false)}
							className='d-flex align-items-end flex-column bd-highlight mb-3'>
							X
						</div>
						<div
							onClick={() => handleClickReportOption()}
							className='d-flex flex-row bd-highlight dd'>
							<div className='p-2 bd-highlight'>
								<Icon size={'4x'} icon='description' className='btn-icon' />
							</div>
							<div className='p-2 bd-highlight'>{t('Rapport')}</div>
						</div>
						<div
							onClick={() => handleClickAlertOption()}
							className='d-flex flex-row bd-highlight dd'>
							<div className='p-2 bd-highlight'>
								<Icon size={'4x'} icon='notifications' className='btn-icon' />
							</div>
							<div className='p-2 bd-highlight'>{t('Alerts')}</div>
						</div>
					</div>
				</>
			)}
			<CardFooter className='cardMapFooter'>
				<button
					style={{ background: formik.values.vins.length <= 0 ? '#888888' : '#1F1E1E' }}
					className='btn'
					onClick={handleSubmit}
					disabled={formik.values.vins.length <= 0}>
					{withRangeFilter ? t('Choose Date Range') : t('Apply')}
				</button>
			</CardFooter>
		</div>
	);
};

export default FilterCard;
