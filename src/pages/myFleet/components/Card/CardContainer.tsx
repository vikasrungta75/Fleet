import React, { FC, useEffect, useState, useContext } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import FilterCard from './FilterCard';
import FleetDetailsCard from './FleetDetailsCard';
import StatusFilter from './StatusCard';
import SortCard from './SortCard';
import Icon from '../../../../components/icon/Icon';
import { useGetVehicleLocationv1 } from '../../../../services/vehiclesService';
import filterButton from '../../../../assets/img/filterButton.png';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import HistoryDetailsCard from './HistoryDetailsCard';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import ThemeContext from '../../../../contexts/themeContext';
import { DateRangePicker } from 'react-date-range';
import {
	updateDatePickerDefaultStaticRanges,
	updateDatePickerDefineds,
} from '../../../../common/other/DatePickerConstant';
import { IDateRangeFilter } from '../../../../type/history-type';
import {
	convertToDate,
	convertToDateWithUTC,
	dateFormatter,
	getDefaultDateRangeFilter,
} from '../../../../helpers/helpers';
import { useFormik } from 'formik';
import SearchComponentCard from '../Card/SearchCard';

interface ICardProps {
	setIsSettingVisible: () => void;
	setIsModalOpen: (isOpen: boolean) => void; // add this line
}

const TabHeader = ({ tab, setTab }: any) => {
	const isActive = (tabTitle: string) => {
		return tabTitle === tab ? 'active-tab' : '';
	};
	const switchTab = (newTab: string) => {
		setTab(newTab);
	};
	const { t } = useTranslation(['vehicles']);

	return (
		<div className='tabHeaderOne'>
			<div
				className={`w-50 bg-white  ${isActive('FleetDetailsCard')} tab-title`}
				onClick={(e) => {
					e.preventDefault();
					switchTab('FleetDetailsCard');
				}}>
				<title className='text-center'>{t('All Vehicles')}</title>
			</div>
			<div
				className={`w-50 bg-white tab-title ${isActive('HistoryDetailsCard')} `}
				onClick={(e) => {
					e.preventDefault();
					switchTab('HistoryDetailsCard');
				}}>
				<title className='text-center'>{t('History')}</title>
			</div>
		</div>
	);
};

const CardMap: FC<ICardProps> = ({ setIsSettingVisible, setIsModalOpen }) => {
	const [showFilterPanel, setshowFilterPanel] = useState(false);
	const { mobileDesign } = useContext(ThemeContext);
	const [showDatePicker1, setShowDatePicker1] = useState(false);
	const [showSearchAutoComplete, setShowSearchAutoComplete] = useState<boolean>(false);
	const [checkedFilter, setcheckedFilter] = useState<string[]>([
		'Stopped',
		'Running',
		'Disconnected',
		'Idle',
		'Parked',
	]);
	const [showSortPanel, setshowSortPanel] = useState(false);
	const [tab, setTab] = useState<string>('FleetDetailsCard');
	const [creteria, setCreteria] = useState<any>({ vins: [], date: {} });

	const [isDetailSelected, setisDetailSelected] = useState(true);

	const { t, i18n } = useTranslation(['vehicles']);

	const updateCreteria = (payload: { vins: String[]; date: {} | null }) => {
		setCreteria(payload);
	};

	const [isModalOpen1, setIsModalOpen1] = useState(false);

	const containerComponent: any = {
		HistoryDetailsCard: (
			<HistoryDetailsCard
				creteria={creteria}
				isModalOpen={isModalOpen1}
				setIsModalOpen={setIsModalOpen1}
				fleetDetailsComponent={<FleetDetailsCard creteria={creteria} />}
			/>
		),
	};

	const [vinSelectedToShowMap1, setvinSelectedToShowMap1] = useState<any>([]);

	const setSelectedToShowMap1 = (value: any) => {
		setvinSelectedToShowMap1(value);
	};

	const payload = {
		vins: [],
		date: {},
	};
	const dispatch = useDispatch();

	useEffect(() => {
		if (tab === 'FleetDetailsCard') {
			setisDetailSelected(true);
			setShowDatePicker1(false);
		} else {
			setisDetailSelected(false);
		}
	}, [tab]);

	const { filterPayload } = useSelector((state: RootState) => state.filters);

	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);
	const localTime = convertToDateWithUTC(new Date(), preferedTimeZone);

	useEffect(() => {
		updateDatePickerDefineds(preferedTimeZone);
	}, [preferedTimeZone]);

	const [time, setTime] = useState({
		startTime: filterPayload.startTime || '00:00:00',
		endTime: filterPayload.endTime || '23:59:59',
	});

	const [date, setDate] = useState<any>([
		{
			startDate: filterPayload.startDate ? convertToDate(filterPayload.startDate) : localTime,
			endDate: filterPayload.endDate ? convertToDate(filterPayload.endDate) : localTime,
			key: 'selection',
		},
	]);

	const nametap = tab === 'HistoryDetailsCard';

	const formik = useFormik({
		initialValues: {
			vins: [],
			date: {},
		},
		onSubmit: (values) => {
			// eslint-disable-next-line @typescript-eslint/no-shadow
			const payload = {
				vins: values.vins,
				date: nametap
					? (values.date = {
							endTime: time.endTime,
							startTime: time.startTime,
							startDate: dateFormatter(date[0].startDate),
							endDate: dateFormatter(date[0].endDate),
					  })
					: null,
			};

			setCreteria(payload);
		},
	});

	const handleSubmit1 = () => {
		formik.handleSubmit();

		setShowDatePicker1(false);
		setIsModalOpen1(true);
		dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);
		dispatch.vehicles.changeShowAllVehicle(true);

		if (isDetailSelected) {
			dispatch.appStoreNoPersist.addVehicleSelectedToMap(vinSelectedToShowMap1);
			dispatch.vehicles.changeShowAllVehicle(false);
		}
	};

	const searchAutoCompleteToggle = () => {
		setShowSearchAutoComplete(!showSearchAutoComplete);
	};

	const styles = `
    @media (min-width: 769px) {
      .cardMapHeader {
        height: 30px !important;
      }
      // .cardMapBody {
      //   height: 300px !important;
      // }
      // .cardMap {
      //   height: 457px !important;
      // }
      .filter-body-fleet {
        max-height: 293px !important;
      }
      .card-footer:last-child {
        position: absolute;
        bottom: -56px;
      }
    }
  `;

	return (
		<div style={{ flexDirection: mobileDesign ? 'inherit' : undefined }} className='d-flex'>
			<style>{styles}</style>
			<Card
				style={{
					left: i18next.language === 'ar-AR' ? '60px' : undefined,
					right: mobileDesign ? '18px' : undefined,
				}}
				className='cardMap me-3'>
				<CardHeader className='cardMapHeader'>
					{mobileDesign ? (
						<div className='d-flex bd-highlight'>
							<div className='p-2 w-25 bd-highlight'>
								<Icon
									color='light'
									icon='ArrowBackIos'
									size='lg'
									className='me-2 cursor-pointer'
									onClick={() => {
										creteria.vins.length === 0
											? setIsSettingVisible()
											: setCreteria(payload);
										dispatch.appStoreNoPersist.changeSelectedTrajectHistory([]);
										dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);

										dispatch.vehicles.changeShowAllVehicle(true);
									}}
								/>
							</div>
							<div className='p-2 flex-shrink-1 bd-highlight'>
								{creteria.vins.length === 0 ? (
									<p>{t('My fleet vehicles')}</p>
								) : (
									<p>{t('Vehicle details')}</p>
								)}
							</div>
						</div>
					) : (
						<>
							<div>
								<img
									src={filterButton}
									alt='icon'
									style={{ width: '1em', height: '1em' }}
								/>
							</div>

							{creteria.vins.length === 0 ? (
								<p>{t('My fleet vehicles')}</p>
							) : (
								<p>{t('Vehicle details')}</p>
							)}

							<Icon
								icon='Close'
								size='lg'
								className='me-1 cursor-pointer'
								style={{
									marginLeft: 'auto',
									color: 'white',
								}}
								onClick={() => {
									creteria.vins.length === 0
										? setIsSettingVisible()
										: setCreteria(payload);
									dispatch.appStoreNoPersist.changeSelectedTrajectHistory([]);
									dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);
									dispatch.vehicles.changeShowAllVehicle(true);
								}}
							/>
						</>
					)}
				</CardHeader>
				<CardBody className='cardMapBody'>
					{creteria.vins.length > 0 ? (
						containerComponent[tab]
					) : (
						<>
							<SearchComponentCard
								searchAutoCompleteToggle={searchAutoCompleteToggle}
								showSearchAutoComplete={showSearchAutoComplete}
							/>

							<TabHeader tab={tab} setTab={setTab} />
							<FilterCard
								showFilterPanel={showFilterPanel}
								setIsModalOpen={setIsModalOpen}
								showSortPanel={showSortPanel}
								setShowSortPanel={setshowSortPanel}
								setshowFilterPanel={setshowFilterPanel}
								checkedFilter={checkedFilter}
								setCreteria={updateCreteria}
								withRangeFilter={tab === 'HistoryDetailsCard'}
								setCheckedFilter={setcheckedFilter}
								isDetailSelected={isDetailSelected}
								showDatePicker2={setShowDatePicker1}
								setSelectedToShowMap1={setSelectedToShowMap1} // Pass the function to the chil
								updateVins={(newVins) => formik.setFieldValue('vins', newVins)} // Funct
							/>
						</>
					)}
				</CardBody>
			</Card>
			{showFilterPanel && <StatusFilter show={setshowFilterPanel} />}
			{showSortPanel && <SortCard show={setshowSortPanel} />}
			{showDatePicker1 && (
				<div
					className='custom-calendar'
					style={{
						position: 'relative',
						top: '125px',
						right: '15px',
					}}>
					<DateRangePicker
						rangeColors={['#f00d69']}
						className='justify-content-center'
						onChange={(item) => setDate([item.selection])}
						moveRangeOnFirstSelection={false}
						months={1}
						ranges={date}
						direction='horizontal'
						maxDate={localTime}
						inputRanges={[]}
						staticRanges={updateDatePickerDefaultStaticRanges()}
					/>
					<div style={{ marginLeft: '10px' }}>
						<button
							style={{
								background: formik.values.vins.length <= 0 ? '#1F1E1E' : '#1F1E1E',
								color: 'white',
								width: '250px',
							}}
							className='btn'
							onClick={handleSubmit1}>
							Apply
						</button>
					</div>
				</div>
			)}

			{isModalOpen1 && (
				<HistoryDetailsCard
					creteria={creteria}
					isModalOpen={isModalOpen1}
					setIsModalOpen={setIsModalOpen1}
					fleetDetailsComponent={<FleetDetailsCard creteria={creteria} />}
				/>
			)}
		</div>
	);
};
export default CardMap;
