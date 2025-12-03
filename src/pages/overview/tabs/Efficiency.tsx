import React, { useState, FC, useEffect, useRef } from 'react';
import ChartCard from '../components/ChartCard';
import { convertDatesToTimestamp } from '../../../helpers/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IDateRangeFilter } from '../../../type/history-type';
import { columnsFuelEfficiency } from '../OverviewConstant';
import SimpleDataTableSort from '../components/SimpleDataTableSort';
import { useTranslation } from 'react-i18next';

interface IEfficiencyProps {
	dateRangeFilter: any; // Define more specific types here if needed
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean; // Ensure the type matches
}

const Efficiency: FC<IEfficiencyProps> = ({ dateRangeFilter, selectedKPIs, showIcons }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['overview', 'history']);
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);

	const {
		fuelEfficiency,
		totalRefuel,
		drainage,
		totalDrainage,
		totalFilling,
		totalFuel,
		avgFuel,
		fuelAvgEfficiency,
		fuelAvgConsumption,
	} = useSelector((state: RootState) => state.overview);

	const prevEfficiencySortOrder = useRef<number>(-1);

	const {
		getFuelEfficiency: isFuelEfficiencyLoading,
		getTotalRefuel: isTotalRefuelLoading,
		getDrainage: isDrainageLoading,
		getTotalDrainage: isTotalDrainageLoading,
		getTotalFilling: isTotalFillingLoading,
		getTotalFuel: isTotalFuelLoading,
		getAvgFuel: isAvgFuel,
		getFuelAvgEfficiency: isFuelAvgEfficiencyLoading,
		getFuelAvgConsumption: isFuelAvgConsumptionLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

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
			(fuelAvgConsumption.length === 0 &&
				fuelAvgEfficiency.length === 0 &&
				totalDrainage.length === 0 &&
				totalFilling.length === 0 &&
				totalFuel.length === 0 &&
				avgFuel.length === 0 &&
				drainage.length === 0 &&
				totalRefuel.length === 0)
		) {
			dispatch.overview.getEfficiencyMain({ startDate, endDate });
		}

		const prevEfficiencySortOrderSerialized = JSON.stringify(prevEfficiencySortOrder.current);
		const currentEfficiencySortOrderSerialized = JSON.stringify(sortorder.efficiency);
		const areSortOrdersEqual =
			prevEfficiencySortOrderSerialized === currentEfficiencySortOrderSerialized;

		// If the filters or efficiency sort order has changed, or if fuelEfficiency is empty
		if (!areEqual || fuelEfficiency.length === 0) {
			dispatch.overview.getFuelEfficiency({
				sortorder: sortorder.efficiency,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			});
		}

		// Update the previous sort order for efficiency
		prevEfficiencySortOrder.current = sortorder.efficiency;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);

	const kpiOrder = [
  ('Fuel Usage'),
  ('Total Refuel'),
  ('Total Drainage (L)'),
  ('Total Fillings Count'),
  ('Average Fuel Level'),
  ('Total Fuel Consumed'),
  ('Total Drainage Count (L)'),
  ('Fuel Average Efficiency'),
  ('Average Consumption (L)'),
];


	return (
		<div
			className={` ${showIcons ? 'w-85' : 'w-7'}`}
			style={{
				marginTop: '6px', // Adjust as needed
			}}>
			<div className='card rounded-2'>
				<div className='card-header'>
					{/* <h2 className='text-center ms-n1'>Fuel Efficiency</h2>
					 */}
					 <h2 className="text-center ms-n1">{t('Fuel Efficiency')}</h2>

				</div>
				<div className='card-body mt-n5'>
					<div className='row row-cols-1 row-cols-md-2'>
						{kpiOrder
							.filter((kpi) => selectedKPIs[kpi]) // Filter only selected KPIs
							.map((kpi, index) => {
								switch (kpi) {
									case ('Fuel Usage'):
										return (
											<div className='col' key={index}>
												<SimpleDataTableSort
													data={fuelEfficiency || []}
													columns={columnsFuelEfficiency}
													setSortOrder={setSortOrder}
													sortorder={sortorder}
													sortField='efficiency'
													isLoading={isFuelEfficiencyLoading}
													height={300}
													colors={['#EE9867', '#FE6372', '#57D08C']}
													selectedText={t('Fuel Usage')}
													dateRangeFilter={dateRangeFilter}
												/>
											</div>
										);
									case ('Total Refuel'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={convertDatesToTimestamp(totalRefuel)}
													chartType='area'
													chartHeight={283}
													timestamps
													secondary
													isLoading={isTotalRefuelLoading}
													lengthSeries={totalRefuel?.length}
												/>
											</div>
										);
									case ('Total Drainage (L)'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={convertDatesToTimestamp(drainage)}
													chartHeight={283}
													chartType='area'
													timestamps
													secondary
													color={['#FEC487']}
													isLoading={isDrainageLoading}
													lengthSeries={drainage?.length}
													titleOptions={t('Total Drainage (L)')}
												/>
											</div>
										);
									case ('Total Fillings Count'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={totalFilling}
													chartHeight={283}
													chartType='bar'
													secondary
													isLoading={isTotalFillingLoading}
													lengthSeries={totalFilling?.length}
												/>
											</div>
										);
									case ('Average Fuel Level'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={convertDatesToTimestamp(avgFuel)}
													chartHeight={283}
													chartType='line'
													timestamps
													secondary
													color={['#E4C3FD']}
													isLoading={isAvgFuel}
													lengthSeries={avgFuel?.length}
													titleOptions={t('Average Fuel Level')}
												/>
											</div>
										);
									case ('Total Fuel Consumed'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={totalFuel}
													chartHeight={283}
													chartType='bar'
													secondary
													isLoading={isTotalFuelLoading}
													lengthSeries={totalFuel?.length}
												/>
											</div>
										);
									case ('Total Drainage Count (L)'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={totalDrainage}
													chartHeight={283}
													chartType='bar'
													secondary
													isLoading={isTotalDrainageLoading}
													lengthSeries={totalDrainage?.length}
												/>
											</div>
										);
									case ('Fuel Average Efficiency'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={convertDatesToTimestamp(
														fuelAvgEfficiency,
													)}
													chartHeight={283}
													chartType='area'
													timestamps
													secondary
													color={['#FCE07C']}
													isLoading={isFuelAvgEfficiencyLoading}
													lengthSeries={fuelAvgEfficiency?.length}
												/>
											</div>
										);
									case ('Average Consumption (L)'):
										return (
											<div className='col' key={index}>
												<ChartCard
													series={convertDatesToTimestamp(
														fuelAvgConsumption,
													)}
													chartHeight={283}
													chartType='line'
													timestamps
													secondary
													color={['#86C4FF']}
													isLoading={isFuelAvgConsumptionLoading}
													lengthSeries={fuelAvgConsumption?.length}
												/>
											</div>
										);
									default:
										return null;
								}
							})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Efficiency;
