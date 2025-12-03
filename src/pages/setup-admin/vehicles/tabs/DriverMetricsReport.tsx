import React, { FC, useContext, useState } from 'react';
import Card, { CardBody, CardTitle } from '../../../../components/bootstrap/Card';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../../helpers/helpers';
import GoBack from '../../../../components/GoBack';
import VinSelect from '../../../common/filters/VinSelect';
import DatePicker from '../../../../components/DatePicker';
import { useDriverActivityReport } from '../../../../services/vehiclesService';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import Loader from '../../../../components/Loader';
import DatatableDriverMetricsReport from './tables_components/DatatableDriverMetricsReport';

interface DriverMetricsReportProps {
	goBack: () => void;
}

const DriverMetricsReport: FC<DriverMetricsReportProps> = ({ goBack }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const [vinFilter, setVinFilter] = useState<string>('All Vins');
	const { t, i18n } = useTranslation(['vehicles', 'reports']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const { data: dataDriverActivityReport, isLoading: isLoadingDriverActivityReport } =
		useDriverActivityReport({ dateRangeFilter, vinFilter });

	return (
		<>
			<Card className='mw-100 reportCards-header' style={{ marginTop: "-45px",marginBottom:"20px" }}>
				<CardBody
					className={
						!mobileDesign
							? 'd-flex justify-content-between align-items-center col-12'
							: ''
					}>
					<div className='d-flex'>
						<GoBack handleClick={goBack} />
						<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
							{t('Driver metrics report')}
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
							position={'end'}
						/>

						{!isLoadingDriverActivityReport &&
							dataDriverActivityReport &&
							dataDriverActivityReport?.length !== 0 && (
								<>
									<CSVLink
										style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'
											}`}
										filename={'Geofences Visits'}
										data={[...dataDriverActivityReport]}>
										<div className='report_buttons pt-2'>
											<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
											<span className='export-buttons'>{t('Export CSV')}</span>
										</div>
									</CSVLink>
									<XLSXLink style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', backgroundColor: "#FFFFFF" }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'
											}`}
										filename={'Geofences Visits'}
										data={[...dataDriverActivityReport]}>
										<div className='report_buttons pt-1'>
											<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
											<span className='export-buttons'>{t('Export XLSX')}</span>
										</div>
									</XLSXLink>
								</>
							)}
					</div>
				</CardBody>
			</Card >
			{
				isLoadingDriverActivityReport ? (
					<Loader />
				) : (
					<DatatableDriverMetricsReport data={dataDriverActivityReport} />
				)}
		</>
	);
};

export default DriverMetricsReport;