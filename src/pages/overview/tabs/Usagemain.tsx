import React, { useState, FC, useEffect, useRef } from 'react';
import ChartCard from '../components/ChartCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IDateRangeFilter } from '../../../type/history-type';
import OverviewVehicleUsage from '../components/OverviewVehicleUsage';
import SimpleDataTableSort from '../components/SimpleDataTableSort';
import { columnsOverviewVehicleAlerts } from '../OverviewConstant';
import { useTranslation } from 'react-i18next';
import AlarmTypeSelect from '../../common/filters/AlarmTypeSelect';

interface IUsageProps {
	dateRangeFilter: IDateRangeFilter;
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean; // Ensure the type matches
}

const UsageMain: FC<IUsageProps> = ({ dateRangeFilter, selectedKPIs, showIcons }) => {
	const dispatch = useDispatch();
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);

	const {
		vehicleUsage,
		overviewVehicleAlerts,
		mileageDriven,
		nbTrips,
		totalIdlingTime,
		avgIdlingTime,
	} = useSelector((state: RootState) => state.overview);

	const {
		getOverviewVehiclesAlerts: isVehicleAlertsLoading,
		getMileageDriven: isMileageDrivenLoading,
		getNbTrips: isNbTripsLoading,
		getTotalIdlingTime: isTotalIdlingTimeLoading,
		getAvgIdlingTime: isAvgIdlingTimeLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

	const prevDateRangeFilter = useRef<IDateRangeFilter>();
	const prevEfficiencySortOrder = useRef<number>(-1);
	const prevCountSortOrder = useRef<number>(-1); // New useRef for count sort order
	const prevMileageSortOrder = useRef<number>(-1); // New useRef for count sort order
	const prevalarmFilter = useRef<any>('All Alerts'); // New useRef for count sort order

	const { t } = useTranslation(['overview', 'history']);
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
		// const prevEfficiencySortOrder = useRef<number>(-1);

		if (
			!areEqual ||
			(overviewVehicleAlerts.length === 0 &&
				overviewVehicleAlerts.length === 0 &&
				nbTrips.length === 0 &&
				totalIdlingTime.length === 0 &&
				avgIdlingTime.length === 0)
		) {
			dispatch.overview.getUsageMain({ startDate, endDate });
		}

		const prevEfficiencySortOrderSerialized = JSON.stringify(prevEfficiencySortOrder.current);
		const currentEfficiencySortOrderSerialized = JSON.stringify(sortorder.efficiency);
		const areSortOrdersEqual =
			prevEfficiencySortOrderSerialized === currentEfficiencySortOrderSerialized;

		// If the filters or efficiency sort order has changed, or if fuelEfficiency is empty
		if (!areEqual || vehicleUsage.length === 0) {
			dispatch.overview.getVehicleUsage({
				sortorder: sortorder.efficiency,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			});
		}
		dispatch.overview.setDateRangeFilterPrev(dateRangeFilter);

		// Update the previous sort order for efficiency
		prevEfficiencySortOrder.current = sortorder.efficiency;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortorder.mileage, dateRangeFilter]);

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

	return (
		<div
			className={` ${showIcons ? 'w-85' : 'w-7'}`}
			style={{
				marginTop: '6px', // Adjust as needed
			}}>
			<div className='card rounded-2'>
				<div className='card-header '>
					<h2 className='text-center ms-n1'>{t('Fleet Usage')}</h2>
				</div>
				<div className='card-body mt-n5'>
					<div className='row row-cols-1 row-cols-md-2'>
						<div className='col'>
							<OverviewVehicleUsage
								data={vehicleUsage}
								setSortOrder={setSortOrder}
								sortorder={sortorder}
							/>
						</div>

						<div className='col'>
							<SimpleDataTableSort
								data={overviewVehicleAlerts || []}
								columns={columnsOverviewVehicleAlerts}
								setSortOrder={setSortOrder}
								sortorder={sortorder}
								sortField='count'
								isLoading={isVehicleAlertsLoading}
								height={280}
								colors={['#ffe5e5', '#ff8080']}
								selectedText={t('Vehicle Alerts')} // Pass the desired text here
								dateRangeFilter={dateRangeFilter}
							/>
						</div>
						<div className='col'>
							<ChartCard
								series={mileageDriven}
								chartHeight={283}
								chartType='bar'
								isLoading={isMileageDrivenLoading}
								lengthSeries={mileageDriven?.length}
							/>
						</div>
						<div className='col'>
							<ChartCard
								series={nbTrips}
								chartHeight={283}
								chartType='bar'
								isLoading={isNbTripsLoading}
								lengthSeries={nbTrips?.length}
							/>
						</div>
						<div className='col'>
							<ChartCard
								series={totalIdlingTime}
								chartHeight={283}
								chartType='bar'
								isLoading={isTotalIdlingTimeLoading}
								lengthSeries={totalIdlingTime?.length}
							/>
						</div>
						<div className='col'>
							<ChartCard
								series={avgIdlingTime}
								chartHeight={283}
								chartType='bar'
								isLoading={isAvgIdlingTimeLoading}
								lengthSeries={avgIdlingTime?.length}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsageMain;
