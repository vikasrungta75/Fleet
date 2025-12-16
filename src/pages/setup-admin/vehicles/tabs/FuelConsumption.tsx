import React, { FC, useContext, useState } from 'react';
import Card, { CardBody, CardTitle } from '../../../../components/bootstrap/Card';
import GoBack from '../../../../components/GoBack';
import ThemeContext from '../../../../contexts/themeContext';
import VinSelect from '../../../common/filters/VinSelect';
import DatePicker from '../../../../components/DatePicker';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
	useFuelConsumptionDataReport,
	useFuelConsumptionRatioReport,
} from '../../../../services/vehiclesService';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import Loader from '../../../../components/Loader';
import DatatableFuelConsumptionData from './tables_components/DatatablesFuelConsumptionData';
import DatatableFuelConsumptionRatio from './tables_components/DatatablesFuelConsumptionRatio';

interface FuelConsumptionProps {
	goBack: () => void;
}

const FuelConsumption: FC<FuelConsumptionProps> = ({ goBack }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const [vinFilter, setVinFilter] = useState<string>('All Vins');
	const { t } = useTranslation(['vehicles', 'reports']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const {
		data: fuelConsumptionData,
		isLoading: fuelConsumptionLoading,
		isFetching: fuelConsumptionFetching,
	} = useFuelConsumptionDataReport({ dateRangeFilter, vinFilter });

	const {
		data: fuelConsumptionRatioData,
		isLoading: fuelConsumptionRatioLoading,
		isFetching: fuelConsumptionRatioFetching,
	} = useFuelConsumptionRatioReport({ dateRangeFilter, vinFilter });

	// Combined data for export (only include existing arrays)
	const combinedExportData = [
		...(fuelConsumptionRatioData || []),
		...(fuelConsumptionData || []),
	];

	const exportVisible =
		!fuelConsumptionLoading &&
		!fuelConsumptionRatioLoading &&
		combinedExportData.length > 0;

	return (
		<>
			<Card className='mw-100 reportCards-header' style={{ marginBottom: '10px' }}>
				<CardBody
					className={
						!mobileDesign
							? 'd-flex justify-content-between align-items-center col-12'
							: ''
					}>
					<div className='d-flex'>
						<GoBack handleClick={goBack} />
						<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
							{t('Fuel Consumption report')}
						</CardTitle>
					</div>

					{/* Filters */}
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
							position={'end'}
						/>
						{exportVisible && (
							<>
								<CSVLink
									style={{
										textDecoration: 'none',
										minWidth: '124px',
										height: '39px',
										padding: '11px 9px',
										gap: '10px',
										borderRadius: '4px',
										border: '1px solid #000000',
										boxShadow: '0px 4px 4px 0px #00000040',
									}}
									className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'}`}
									filename={'Fuel_Consumption_Report'}
									data={combinedExportData}>
									<div className='report_buttons pt-2'>
										<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
										<span className='export-buttons'>{t('Export CSV')}</span>
									</div>
								</CSVLink>

								<XLSXLink
									style={{
										textDecoration: 'none',
										minWidth: '124px',
										height: '39px',
										padding: '11px 9px',
										gap: '10px',
										borderRadius: '4px',
										border: '1px solid #000000',
										boxShadow: '0px 4px 4px 0px #00000040',
										backgroundColor: '#FFFFFF',
									}}
									className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'}`}
									filename={'Fuel_Consumption_Report'}
									data={combinedExportData}>
									<div className='report_buttons pt-2'>
										<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
										<span className='export-buttons'>{t('Export XLSX')}</span>
									</div>
								</XLSXLink>
							</>
						)}
					</div>
				</CardBody>
			</Card>

			{/* Loading */}
			{fuelConsumptionFetching || fuelConsumptionRatioFetching ? (
				<Loader />
			) : (
				<>
					{fuelConsumptionData?.length > 0 && (
						<DatatableFuelConsumptionData data={fuelConsumptionData} />
					)}

					{fuelConsumptionRatioData?.length > 0 && (
						<DatatableFuelConsumptionRatio data={fuelConsumptionRatioData} />
					)}

					{!fuelConsumptionFetching &&
						!fuelConsumptionRatioFetching &&
						(!fuelConsumptionData?.length &&
							!fuelConsumptionRatioData?.length) && (
							<p className='text-center mt-4'>
								{t('No data available')}
							</p>
						)}
				</>
			)}
		</>
	);
};

export default FuelConsumption;
