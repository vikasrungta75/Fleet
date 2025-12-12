import React, { FC, useContext, useEffect, useState } from 'react';
import Card, { CardBody, CardTitle } from '../../../../components/bootstrap/Card';
import VinSelect from '../../../common/filters/VinSelect';
import DatePicker from '../../../../components/DatePicker';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../../helpers/helpers';
import {
	useTemperatureChartReports,
	useTemperatureMnReports,
	useTemperatureReports,
} from '../../../../services/vehiclesService';
import Datatable from '../components/Datatable';

import Alert from '../../../../components/bootstrap/Alert';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import Loader from '../../../../components/Loader';
import GoBack from '../../../../components/GoBack';

import ChartCard from '../../../overview/components/ChartCard';
import {
	columnsTemperatureMnReports,
	columnsTemperatureReports,
} from '../constants/VehicleConstants';

interface ITemperaturePops {
	goBack: () => void;
}

const Temperature: FC<ITemperaturePops> = ({ goBack }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['vehicles', 'reports']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [vinFilter, setVinFilter] = useState<string>('All Vins');

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const {
		data: temperatureMnReportsData,
		isLoading: isTemperatureMnReportsLoading,
		refetch: temperatureMnReportsRefetch,
		remove: temperatureMnReportsRemove,
	} = useTemperatureMnReports({ dateRangeFilter, vinFilter });

	const {
		data: temperatureReportsData,
		isLoading: isTemperatureReportsLoading,
		refetch: temperatureReportsRefetch,
		remove: temperatureReportsRemove,
	} = useTemperatureReports({ dateRangeFilter, vinFilter });

	const {
		data: temperatureChartReportsData,
		isLoading: isTemperatureChartReportsLoading,
		refetch: temperatureChartReportsRefetch,
		remove: temperatureChartReportsRemove,
	} = useTemperatureChartReports({ dateRangeFilter, vinFilter });
	

	useEffect(() => {
		temperatureMnReportsRefetch();
		temperatureReportsRefetch();
		temperatureChartReportsRefetch();

		return () => {
			temperatureMnReportsRemove();
			temperatureReportsRemove();
			temperatureChartReportsRemove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, vinFilter]);

	return (
		<>
			<Card className='mw-100 reportCards-header' style={{ marginTop: "-45px" }}>
				<CardBody
					className={
						!mobileDesign
							? 'd-flex justify-content-between align-items-center col-12'
							: ''
					}>
					<div className='d-flex'>
						<GoBack handleClick={goBack} />
						<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
							{t('Temperature level')}
						</CardTitle>
					</div>
					<div className='d-flex'>
						<VinSelect
							setVinFilter={setVinFilter}
							vinFilter={vinFilter}
							className={mobileDesign ? 'col-12 mb-3' : 'me-3'}
						/>
						<DatePicker
							className={`position-relative ${mobileDesign ? 'col-12' : 'me-3'}`}
							setDateRangeFilter={setDateRangeFilter}
							dateRangeFilter={dateRangeFilter}
							withHours={false}
							position={i18n.language === 'ar-AR' ? 'start' : 'end'}
						/>

						{!isTemperatureReportsLoading &&
							!isTemperatureMnReportsLoading &&
							temperatureReportsData &&
							temperatureMnReportsData &&
							temperatureReportsData?.length !== 0 &&
							temperatureMnReportsData?.length !== 0 && (
								<>
									<CSVLink
										style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'
											}`}
										filename={'Temperature Reports'}
										data={[
											...temperatureReportsData,
											...temperatureMnReportsData,
										]}>
										<div className='report_buttons pt-2'>
											<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
											<span className='export-buttons'>{t('Export CSV')}</span>
										</div>
									</CSVLink>
									<XLSXLink
										style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', backgroundColor: "#FFFFFF" }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'
											}`}
										filename={'Temperature Reports'}
										data={[
											...temperatureReportsData,
											...temperatureMnReportsData,
										]}>
										<div className='report_buttons pt-0'>
											<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
											<span className='export-buttons'>{t('Export XLSX')}</span>
										</div>
									</XLSXLink>
								</>
							)}
					</div>
				</CardBody>
			</Card>
			{isTemperatureMnReportsLoading || isTemperatureReportsLoading ? (
				<Loader />
			// ) : temperatureMnReportsData.length || temperatureReportsData.length ? (
			) : (temperatureMnReportsData?.length || 0) > 0 || (temperatureReportsData?.length || 0) > 0 ? (
				<>
					<div className='d-flex justify-content-between mt-3 mb-3'>
						<h1 className='fuel-volume-title'>{t('Temperature Graphic Level')}</h1>
						<div className='d-flex align-items-center rounded-1 border-1 bg-custom-grey-opacity p-3'>
							<span className='fw-bold me-2'>VIN : </span> {t(vinFilter)}
						</div>
					</div>
					<ChartCard
						col='col-12'
						chartHeight={400}
						chartType='line'
						isLoading={isTemperatureChartReportsLoading}
						timestamps
						series={[{ name: '', data: temperatureChartReportsData?.[0]?.data || [] }]}
						color={['#3F88F6']}
					/>

					<div className='d-flex justify-content-between mb-3'>
						<h1 className='fuel-volume-title'>{t('Statics Data')}</h1>
						<div className='d-flex align-items-center rounded-1 border-1 bg-custom-grey-opacity p-3'>
							<span className='fw-bold me-2'>VIN : </span> {t(vinFilter)}
						</div>
					</div>
					<Datatable
						data={temperatureMnReportsData || []}
						columns={columnsTemperatureMnReports}
					/>

					<div className='d-flex justify-content-between mb-3'>
						<h1 className='fuel-volume-title'>{t('Detailed Temperature Report')}</h1>
						<div className='d-flex align-items-center rounded-1 border-1 bg-custom-grey-opacity p-3'>
							<span className='fw-bold me-2'>VIN : </span> {t(vinFilter)}
						</div>
					</div>
					<Datatable
						data={temperatureReportsData || []}
						columns={columnsTemperatureReports}
					/>
				</>
			) : (
				<Card>
					<CardBody>
						<Alert color='info' className='flex-column w-100 align-items-start'>
							<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
								<Icon icon='Info' size='2x' className='me-2' />{' '}
								{t('No Data available for the selected filters.')}
							</p>
						</Alert>
					</CardBody>
				</Card>
			)}
		</>
	);
};

export default Temperature;
