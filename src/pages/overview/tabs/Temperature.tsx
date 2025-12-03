import React, { useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import ChartCard from '../components/ChartCard';
import { convertDatesToTimestamp } from '../../../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { IDateRangeFilter } from '../../../type/history-type';

interface ITemperatureDataProps {
	dateRangeFilter: IDateRangeFilter;
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean;
}

const TemperatureData: FC<ITemperatureDataProps> = ({
	dateRangeFilter,
	selectedKPIs,
	showIcons,
}) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['overview', 'history']);
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);
	const { temperature } = useSelector((state: RootState) => state.overview);

	const { getTemperature: isTemperatureLoading } = useSelector(
		(state: RootState) => state.loading.effects.overview,
	);

	useEffect(() => {
		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;
		const prevSerialized = JSON.stringify(dateRangeFilterFromStorePrev);
		const currentSerialized = JSON.stringify(dateRangeFilter);
		const areEqual = prevSerialized === currentSerialized;

		if (!areEqual || temperature.length === 0) {
			dispatch.overview.getTemperature({ startDate, endDate });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);

	return (
		<div
			className={` ${showIcons ? 'w-85' : 'w-7'}`}
			style={{
				marginTop: '6px', // Adjust as needed
			}}>
			<div className='card rounded-2'>
				<div className='card-header '>
					<h2 className='text-center ms-n1'>{t('Sensor Data')}</h2>
				</div>
				<div className='card-body mt-n5 '>
					<div className='row row-cols-1 row-cols-md-2'>
						<div className='col'>
							<ChartCard
								series={convertDatesToTimestamp(temperature)}
								chartHeight={283}
								chartType='line'
								timestamps
								isLoading={isTemperatureLoading}
								lengthSeries={temperature?.length}
								col='col-12'
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TemperatureData;
