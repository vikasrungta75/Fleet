import React, { FC, useState, useEffect, useContext } from 'react';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader from '../../layout/SubHeader/SubHeader';
import { dashboardMenu } from '../../menu';
import { useTranslation } from 'react-i18next';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import { IDateRangeFilter } from '../../type/history-type';
import DatePicker from '../../components/DatePicker';
import { useDispatch, useSelector } from 'react-redux';
import FleetSelect from '../common/filters/FleetSelect';
import VinSelect from '../common/filters/VinSelect';
import SummaryAlarmStatics from './components/SummaryAlarmsStatic';
import { RootState } from '../../store/store';
import AlarmsDataTables from './components/datatables/AlarmsDataTable';
import AlarmTypeDataTable from './components/datatables/AlarmTypeDataTable';
import Spinner from '../../components/bootstrap/Spinner';
import AlarmTypeSelect from '../common/filters/AlarmTypeSelect';
import AlarmTypeSelectAlerts from '../common/filters/AlarmTypeSelectAlerts';
import ThemeContext from '../../contexts/themeContext';
import {
	convertFromTZToUTC,
	dateFormatter,
	getDefaultDateRangeFilter,
	getDefaultFleetFilter,
} from '../../helpers/helpers';
import AssistanceButton from '../common/assitance-button/AssistanceButton';
import Nav, { NavItem } from '../../components/bootstrap/Nav';
import { CursorStyleNav, Tabs } from './components/constants/alarmConstants';
import ReportDTC from './components/tab_alarms_notifications/ReportDTC';
import Loader from '../../components/Loader';

const AlertsAndNotifications: FC = (): JSX.Element => {
	const dispatch = useDispatch();

	const timeFormat: string = 'YYYY-MM-DD HH:mm:ss';
	const { mobileDesign } = useContext(ThemeContext);
	const { filterPayload } = useSelector((state: RootState) => state.filters);
	const { listAlarms, alarmDetail } = useSelector(
		(state: RootState) => state.alertsNotifications,
	);
	const isLoading = useSelector((state: RootState) => state.loading.models.alertsNotifications);

	const { t, i18n } = useTranslation(['alertNotification', 'vehicles']);
	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [vinFilter, setVinFilter] = useState<string>(filterPayload.vin || 'All Vins');
	const [alarmFilter, setalarmFilter] = useState(filterPayload.alarmType || 'All Alarms');
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
	);

	const handleSetVin = (vin: string) => {
		setVinFilter(vin);
		setalarmFilter('All Alarms');
	};

	useEffect(() => {
		let startDate = new Date(`${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`);
		let endDate = new Date(`${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`);

		const payload = {
			fleet_id: fleetNameFilter,
			fleet_name: fleetNameFilter ?? 'All Fleets',
			vin: vinFilter,
			alarm_type: alarmFilter,
			startdate: dateFormatter(startDate, timeFormat), // convertFromTZToUTC(startDate, preferedTimeZone),
			enddate: dateFormatter(endDate, timeFormat), //convertFromTZToUTC(endDate, preferedTimeZone),
		};

		const getAlarmsDetail = async () => {
			await dispatch.alertsNotifications.getAlarmTypeDetails(payload);
		};

		const getAlarms = async () => {
			await dispatch.alertsNotifications.getListOfAlarms(payload);
		};
		const getTotalCountOfAlarms = async () => {
			await dispatch.alertsNotifications.getTotalCountOfAlarms(payload);
		};
		const getTotalCountOfEachAlarms = async () => {
			await dispatch.alertsNotifications.getTotalCountOfEachAlarm(payload);
		};

		if (alarmFilter !== 'All Alarms') {
			getAlarmsDetail();
		} else {
			getAlarms();
		}
		getTotalCountOfAlarms();
		getTotalCountOfEachAlarms();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fleetNameFilter, vinFilter, dateRangeFilter, alarmFilter]);

	const [Tab, setTab] = useState('Alerts');

	const handleChangeTab = (value: string) => {
		setTab(value);
		dispatch.filters.filtersStore({
			fleet: fleetNameFilter,
			vin: vinFilter,
			alarmType: alarmFilter,
			startDate: dateRangeFilter.startDate,
			endDate: dateRangeFilter.endDate,
			startTime: dateRangeFilter.startTime,
			endTime: dateRangeFilter.endTime,
		});
	};

	useEffect(() => {
		dispatch.filters.filtersStore({
			fleet: fleetNameFilter,
			vin: vinFilter,
			alarmType: alarmFilter,
			startDate: dateRangeFilter.startDate,
			endDate: dateRangeFilter.endDate,
			startTime: dateRangeFilter.startTime,
			endTime: dateRangeFilter.endTime,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fleetNameFilter, vinFilter, alarmFilter, dateRangeFilter]);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<Breadcrumb
					list={[
						{
							title: t(`${dashboardMenu.alertsNotifications.text}`),
							to: `../${dashboardMenu.alertsNotifications.path}`,
						},
					]}
				/>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
			
				<Nav design='tabs' className='ms-4' style={{ width: '95%' }}>
					{Tabs.map(({ key, value, id }) => {
						return (
							<NavItem
								key={id}
								isActive={Tab === value}
								style={CursorStyleNav}
								onClick={() => {
									handleChangeTab(value);
								}}>
								<h1>{t(key)}</h1>
							</NavItem>
						);
					})}
				</Nav>
				{Tab === 'Alerts' && (
					<>
						<Card>
							<CardBody className={`${mobileDesign ? '' : 'row'}`}>
								<FleetSelect
									className={`${mobileDesign ? 'col-12 mb-3' : 'col-3'}`}
									fleetNameFilter={fleetNameFilter}
									setFleetNameFilter={setFleetNameFilter}
									setVinFilter={setVinFilter}
									setalarmFilter={setalarmFilter}
								/>
								<VinSelect
									fleetNameFilter={fleetNameFilter}
									setVinFilter={handleSetVin}
									vinFilter={vinFilter}
									className={`${mobileDesign ? 'col-12 mb-3' : 'col-3'}`}
								/>
								<AlarmTypeSelectAlerts
									alarmFilter={alarmFilter}
									setalarmFilter={setalarmFilter}
									className={`${mobileDesign ? 'col-12 mb-3' : 'col-3'}`}
								/>

								<DatePicker
									className={`position-relative ${
										mobileDesign ? 'col-3' : 'col-3'
									}`}
									setDateRangeFilter={setDateRangeFilter}
									dateRangeFilter={dateRangeFilter}
									withHours={false}
									position={i18n.language === 'ar-AR' ? 'start' : 'end'}
								/>
							</CardBody>
						</Card>

						{isLoading ? (
							<Loader />
						) : (
							<>
								<SummaryAlarmStatics />
								{alarmFilter !== 'All Alarms' ? (
									<AlarmTypeDataTable alarmsDetailData={alarmDetail} />
								) : (
									<AlarmsDataTables
										setalarmFilter={setalarmFilter}
										alarmsData={listAlarms}
										setVinFilter={setVinFilter}
										fleetNameFilter={fleetNameFilter}
										alarmFilter={alarmFilter}
										vinFilter={vinFilter}
										dateRangeFilter={dateRangeFilter}
									/>
								)}
							</>
						)}
					</>
				)}
				{Tab === 'DTC' && <ReportDTC />}
			</Page>
		</PageWrapper>
	);
};
export default AlertsAndNotifications;
