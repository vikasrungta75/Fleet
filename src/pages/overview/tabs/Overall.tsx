import React, { useState, useEffect, FC, useRef } from 'react';
import OverviewStatistics from '../components/OverviewStatistics';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import OverviewVehicleUsage from '../components/OverviewVehicleUsage';
import ChartCard from '../components/ChartCard';
import { convertDatesToTimestamp } from '../../../helpers/helpers';
import SimpleDataTableSort from '../components/SimpleDataTableSort';
import AlarmTypeSelect from '../../common/filters/AlarmTypeSelect';
import { columnsFuelEfficiency, columnsOverviewVehicleAlerts } from '../OverviewConstant';
import { useTranslation } from 'react-i18next';
import { IStatistics } from '../../../type/overview-types';
import { IDateRangeFilter } from '../../../type/history-type';

interface IOverallProps {
	dateRangeFilter: IDateRangeFilter;
}

const Overall: FC<IOverallProps> = ({ dateRangeFilter }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['overview', 'history']);

	const { permissions } = useSelector((state: RootState) => state.auth);

	const { deviceVehicleStatus, totalOpenAlerts } = useSelector(
		(state: RootState) => state.overview,
	);
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);
	const {
		fuelEfficiency,
		overviewVehicleAlerts,
		vehicleUsage,
		drainage,
		totalDrainage,
		totalFuel,
		totalFilling,
		avgFuel,
		temperature,
		totalRefuel,
		ecoDriverTotalScore,
		mileageDriven,
		nbTrips,
		totalIdlingTime,
		avgIdlingTime,
		fuelAvgEfficiency,
		fuelAvgConsumption,
	} = useSelector((state: RootState) => state.overview);
	const prevDateRangeFilter = useRef<IDateRangeFilter>();
	const prevEfficiencySortOrder = useRef<number>(-1);
	const prevCountSortOrder = useRef<number>(-1); // New useRef for count sort order
	const prevMileageSortOrder = useRef<number>(-1); // New useRef for count sort order
	const prevalarmFilter = useRef<any>('All Alerts'); // New useRef for count sort order

	const {
		getTotalAlerts: isOverviewDataLoading,
		getFuelEfficiency: isFuelEfficiencyLoading,
		getOverviewVehiclesAlerts: isVehicleAlertsLoading,
		getDrainage: isDrainageLoading,
		getTotalDrainage: isTotalDrainageLoading,
		getTotalFuel: isTotalFuelLoading,
		getTotalFilling: isTotalFillingLoading,
		getAvgFuel: isAvgFuel,
		getTemperature: isTemperatureLoading,
		getTotalRefuel: isTotalRefuelLoading,
		getEcoDriverTotalScore: isEcoDriverTotalScoreLoading,
		getMileageDriven: isMileageDrivenLoading,
		getNbTrips: isNbTripsLoading,
		getTotalIdlingTime: isTotalIdlingTimeLoading,
		getAvgIdlingTime: isAvgIdlingTimeLoading,
		getFuelAvgEfficiency: isFuelAvgEfficiencyLoading,
		getFuelAvgConsumption: isFuelAvgConsumptionLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

	const [alarmFilter, setAlarmFilter] = useState<string>('All Alerts');
	const [sortorder, setSortOrder] = useState<{ [key: string]: number }>({
		efficiency: -1,
		count: -1,
		mileage: -1,
	});

	useEffect(() => {
		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;
		const prevSerialized = JSON.stringify(dateRangeFilterFromStorePrev);
		const currentSerialized = JSON.stringify(dateRangeFilter);
		const areEqual = prevSerialized === currentSerialized;

		if (
			!areEqual ||
			(avgIdlingTime.length === 0 &&
				totalIdlingTime.length === 0 &&
				fuelAvgConsumption.length === 0 &&
				fuelAvgEfficiency.length === 0 &&
				totalDrainage.length === 0 &&
				totalFilling.length === 0 &&
				totalFuel.length === 0 &&
				avgFuel.length === 0 &&
				drainage.length === 0 &&
				totalRefuel.length === 0 &&
				temperature.length === 0 &&
				mileageDriven.length === 0 &&
				ecoDriverTotalScore.length === 0)
		) {
			dispatch.overview.getOverallMetrics({ startDate, endDate });
			dispatch.overview.getCostMetrics({ startDate, endDate }); // eslint-disable-next-line react-hooks/exhaustive-deps
			dispatch.overview.getEfficiencyMetrics({ startDate, endDate });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);

	useEffect(() => {
		let startDate = `${dateRangeFilter.startDate}T${dateRangeFilter.startTime}`;
		let endDate = `${dateRangeFilter.endDate}T${dateRangeFilter.endTime}`;
		if (
			// Check if the previous efficiency sort order is not the same as the current one
			prevalarmFilter.current !== alarmFilter ||
			prevCountSortOrder.current !== sortorder.count ||
			// Check if fuelEfficiency is empty
			overviewVehicleAlerts.length === 0 ||
			// Check if the previous date range filter is not the same as the current one
			dateRangeFilterFromStorePrev !== dateRangeFilter
		) {
			dispatch.overview.getOverviewVehiclesAlerts({
				alert_type: alarmFilter,
				sortorder: sortorder.count,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			});
		}
		prevalarmFilter.current = alarmFilter;
		prevCountSortOrder.current = sortorder.count;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alarmFilter, sortorder.count, dateRangeFilter, dispatch.overview]);

	useEffect(() => {
		if (
			// Check if the previous efficiency sort order is not the same as the current one
			prevEfficiencySortOrder.current !== sortorder.efficiency ||
			// Check if fuelEfficiency is empty
			fuelEfficiency.length === 0 ||
			// Check if the previous date range filter is not the same as the current one
			dateRangeFilterFromStorePrev !== dateRangeFilter
		) {
			let startDate = `${dateRangeFilter.startDate}T${dateRangeFilter.startTime}`;
			let endDate = `${dateRangeFilter.endDate}T${dateRangeFilter.endTime}`;
			dispatch.overview.getFuelEfficiency({
				sortorder: sortorder.efficiency,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			}); // eslint-disable-next-line react-hooks/exhaustive-deps
		}
		prevEfficiencySortOrder.current = sortorder.efficiency;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortorder.efficiency, dateRangeFilter, dispatch.overview]);

	useEffect(() => {
		if (
			// Check if the previous efficiency sort order is not the same as the current one
			prevMileageSortOrder.current !== sortorder.mileage ||
			// Check if fuelEfficiency is empty
			vehicleUsage.length === 0 ||
			// Check if the previous date range filter is not the same as the current one
			dateRangeFilterFromStorePrev !== dateRangeFilter
		) {
			let startDate = `${dateRangeFilter.startDate}T${dateRangeFilter.startTime}`;
			let endDate = `${dateRangeFilter.endDate}T${dateRangeFilter.endTime}`;
			dispatch.overview.getVehicleUsage({
				sortorder: sortorder.mileage,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			});
		}
		prevMileageSortOrder.current = sortorder.mileage;
		dispatch.overview.setDateRangeFilterPrev(dateRangeFilter);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortorder.mileage, dateRangeFilter, dispatch.overview]);

	const statistics: IStatistics[] = [
		{
			header: 'VEHICLES STATISTICS',
			data: [
				{
					name: 'Total vehicle',
					value: deviceVehicleStatus?.total_vehicle,
				},
				{
					name: 'Out of order vehicle',
					value: deviceVehicleStatus?.out_of_order_vehicle,
				},
			],
		},
		{
			header: 'ALERTS STATISTICS',
			data: [
				{ name: 'Total alerts', value: totalOpenAlerts?.Total_Alerts },
				{ name: 'Open alerts', value: totalOpenAlerts?.open_alert_count },
			],
		},
		{
			header: 'DEVICE STATISTICS',
			data: [
				{ name: 'Total device', value: deviceVehicleStatus?.total_device },
				{
					name: 'Device with issues',
					value: deviceVehicleStatus?.device_with_issue,
				},
			],
		},
	];

	return (
		<>
			<OverviewStatistics isLoading={isOverviewDataLoading} statistics={statistics} />
		</>
	);
};

export default Overall;
// export{}
