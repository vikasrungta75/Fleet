import React, { FC, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { convertDatesToTimestamp } from '../../../helpers/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IDateRangeFilter } from '../../../type/history-type';
import { useTranslation } from 'react-i18next';

interface ICostProps {
	dateRangeFilter: IDateRangeFilter;
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean;
}

const Cost: FC<ICostProps> = ({ dateRangeFilter, selectedKPIs, showIcons }) => {
	const { t } = useTranslation(['overview', 'history']);
	const dispatch = useDispatch();
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);
	const {
		fpOverviewTcoVehAcquisitionCost,
		fpOverviewTcoVehicleLeasingCost,
		fpOverviewTcoFuelCost,
		fpOverviewTcoFuelConsumed,
		fpOverviewTcoMaintenanceCost,
		fpOverviewTcoInsuranceCost,
		tcoAdmangCost,
		fpOverviewTcoOperationalCost,
	} = useSelector((state: RootState) => state.overview);

	const {
		getFpOverviewTcoVehAcquisitionCost: isFpOverviewTcoVehAcquisitionCostLoading,
		getFpOverviewTcoVehicleLeasingCost: isFpOverviewTcoVehicleLeasingCostLoading,
		getFpOverviewTcoFuelCost: isFpOverviewTcoFuelCostLoading,
		getFpOverviewTcoFuelConsumed: isFpOverviewTcoFuelConsumedLoading,
		getFpOverviewTcoMaintenanceCost: isFpOverviewTcoMaintenanceCostLoading,
		getFpOverviewTcoInsuranceCost: isFpOverviewTcoInsuranceCostLoading,
		getTcoAdmangCost: isTcoAdmangCostLoading,
		getFpOverviewTcoOperationalCos: isFpOverviewTcoOperationalCosLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

	useEffect(() => {
		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;
		const prevSerialized = JSON.stringify(dateRangeFilterFromStorePrev);
		const currentSerialized = JSON.stringify(dateRangeFilter);
		const areEqual = prevSerialized === currentSerialized;
		// const prevEfficiencySortOrder = useRef<number>(-1);

		if (
			!areEqual ||
			(fpOverviewTcoVehAcquisitionCost.length === 0 &&
				fpOverviewTcoVehicleLeasingCost.length === 0 &&
				fpOverviewTcoFuelCost.length === 0 &&
				fpOverviewTcoFuelConsumed.length === 0 &&
				fpOverviewTcoMaintenanceCost.length === 0 &&
				fpOverviewTcoInsuranceCost.length === 0 &&
				tcoAdmangCost.length === 0 &&
				fpOverviewTcoOperationalCost.length === 0)
		) {
			dispatch.overview.getCostMain({ startDate, endDate });
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);

	const kpiOrder = [
		'Vehicle Acquisition Cost',
		'Vehicle Leasing Cost',
		'Fuel Cost',
		'Fuel Consumed',
		'Maintenance Cost',
		'Insurance Cost',
		'Administrative Management Cost',
		'Operational Cost',
	];

	return (
		<div
			className={` ${showIcons ? 'w-85' : 'w-7'}`}
			style={{
				marginTop: '6px', // Adjust as needed
			}}>
			<div className='card rounded-2'>
				<div className='card-header '>
					<h2 className='text-center ms-n1'>{t('Fleet Cost')}</h2>
				</div>
				<div className='card-body mt-n5 '>
					<div className='row row-cols-1 row-cols-md-2'>
						{kpiOrder
							.filter((kpi) => selectedKPIs[kpi]) // Filter only selected KPIs
							.map((kpi, index) => {
								switch (kpi) {
									case 'Vehicle Acquisition Cost':
										return (
											<div className='col'>
												<ChartCard
													series={convertDatesToTimestamp(
														fpOverviewTcoVehAcquisitionCost,
													)}
													chartHeight={300}
													chartType='line'
													lineColors={['#6e5dc6']}
													isLoading={
														isFpOverviewTcoVehAcquisitionCostLoading
													}
												/>
											</div>
										);
									case 'Vehicle Leasing Cost':
										return (
											<div className='col'>
												<ChartCard
													series={convertDatesToTimestamp(
														fpOverviewTcoVehicleLeasingCost,
													)}
													chartHeight={300}
													chartType='area'
													isLoading={
														isFpOverviewTcoVehicleLeasingCostLoading
													}
												/>
											</div>
										);
									case 'Fuel Cost':
										return (
											<div className='col'>
												<ChartCard
													series={fpOverviewTcoFuelCost}
													chartHeight={300}
													chartType='area'
													color={['#0F9FF0']}
													lineColors={['#0F9FF0']}
													showXAxisTicks={false}
													isLoading={isFpOverviewTcoFuelCostLoading}
												/>
											</div>
										);
									case 'Fuel Consumed':
										return (
											<div className='col'>
												<ChartCard
													series={fpOverviewTcoFuelConsumed}
													chartHeight={300}
													chartType='area'
													showXAxisTicks={false}
													color={['#FF0000']}
													lineColors={['red']}
													isLoading={isFpOverviewTcoFuelConsumedLoading}
												/>
											</div>
										);
									case 'Maintenance Cost':
										return (
											<div className='col'>
												<ChartCard
													series={fpOverviewTcoMaintenanceCost}
													chartHeight={300}
													chartType='bar'
													isLoading={
														isFpOverviewTcoMaintenanceCostLoading
													}
												/>
											</div>
										);
									case 'Insurance Cost':
										return (
											<div className='col'>
												<ChartCard
													series={convertDatesToTimestamp(
														fpOverviewTcoInsuranceCost,
													)}
													chartHeight={300}
													chartType='area'
													isLoading={isFpOverviewTcoInsuranceCostLoading}
												/>
											</div>
										);
									case 'Administrative Management Cost':
										return (
											<div className='col'>
												<ChartCard
													series={tcoAdmangCost}
													chartHeight={300}
													chartType='bar'
													isLoading={isTcoAdmangCostLoading}
												/>
											</div>
										);
									case 'Operational Cost':
										return (
											<div className='col'>
												<ChartCard
													series={fpOverviewTcoOperationalCost}
													chartHeight={300}
													chartType='bar'
													isLoading={isFpOverviewTcoOperationalCosLoading}
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

export default Cost;
