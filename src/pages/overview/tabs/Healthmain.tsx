import React, { FC, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
import { convertDatesToTimestamp } from '../../../helpers/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IDateRangeFilter } from '../../../type/history-type';
import { useTranslation } from 'react-i18next';
interface IHealthProps {
	dateRangeFilter: IDateRangeFilter;
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean; // Ensure the type matches
}

const HealthMain: FC<IHealthProps> = ({ dateRangeFilter, selectedKPIs, showIcons }) => {
	const { t } = useTranslation(['overview', 'history']);
	const dispatch = useDispatch();
	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);

	const { maintenanceStatus, ecoDriverTotalScore } = useSelector(
		(state: RootState) => state.overview,
	);

	const {
		getMaintenanceStatus: isMaintenanceStatusLoading,
		getEcoDriverTotalScore: isEcoDriverTotalScoreLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

	useEffect(() => {
		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;
		const prevSerialized = JSON.stringify(dateRangeFilterFromStorePrev);
		const currentSerialized = JSON.stringify(dateRangeFilter);
		const areEqual = prevSerialized === currentSerialized;

		if (!areEqual || (maintenanceStatus.length === 0 && ecoDriverTotalScore.length === 0)) {
			dispatch.overview.getHealthMain({ startDate, endDate });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);

	return (
		
		<div
			className={` ${showIcons ? 'w-85' : 'w-7'}`}
			style={{
				marginTop: '6px', 
			}}>
			<div className='card rounded-2'>
				<div className='card-header '>
					<h2 className='text-center ms-n1'>{t('Fleet Health')}</h2>
				</div>
				<div className='card-body mt-n5 '>
					<div className='row row-cols-1 row-cols-md-2'>
						<div className='col'>
							<ChartCard
								series={maintenanceStatus}
								chartHeight={283}
								chartType='pie'
								timestamps
								color={['#FCE07C']}
								isLoading={isMaintenanceStatusLoading}
							/>
						</div>
						<div className='col'>
							<ChartCard
								series={convertDatesToTimestamp(ecoDriverTotalScore)}
								chartHeight={283}
								chartType='line'
								timestamps
								isLoading={isEcoDriverTotalScoreLoading}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HealthMain;
