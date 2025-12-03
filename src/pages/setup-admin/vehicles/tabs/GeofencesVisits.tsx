import React, { FC, useContext, useEffect, useState } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '../../../../components/bootstrap/Card';
import VinSelect from '../../../common/filters/VinSelect';
import DatePicker from '../../../../components/DatePicker';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import Spinner from '../../../../components/bootstrap/Spinner';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../../helpers/helpers';
import { useGeofencesDetails, useGeofencesSummary } from '../../../../services/vehiclesService';
import Datatable from '../components/Datatable';

import Alert from '../../../../components/bootstrap/Alert';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import Loader from '../../../../components/Loader';
import GoBack from '../../../../components/GoBack';
import {
	columnsGeofencesVisitsDetails,
	columnsGeofencesVisitsSummary,
} from '../constants/VehicleConstants';

interface IGeofencesVisitsPops {
	goBack: () => void;
}

const GeofencesVisits: FC<IGeofencesVisitsPops> = ({ goBack }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['vehicles', 'reports']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [vinFilter, setVinFilter] = useState<string>('All Vins');

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const {
		data: geofencesSummaryData,
		isLoading: isGeofenceSummaryLoading,
		refetch: geofencesSummaryRefetch,
		remove: geofencesSummaryRemove,
	} = useGeofencesSummary({ dateRangeFilter, vinFilter });
	const {
		data: geofencesDetailsData,
		isLoading: isGeofencesDetailsLoading,
		refetch: geofencesDetailsRefetch,
		remove: geofencesDetailsRemove,
	} = useGeofencesDetails({ dateRangeFilter, vinFilter });

	useEffect(() => {
		geofencesSummaryRefetch();
		geofencesDetailsRefetch();

		return () => {
			geofencesSummaryRemove();
			geofencesDetailsRemove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, vinFilter]);

	return (
		<>
			<Card className='mw-100 reportCards-header'>
				<CardBody
					className={
						!mobileDesign
							? 'd-flex justify-content-between align-items-center col-12'
							: ''
					}>
					<div className='d-flex'>
						<GoBack handleClick={goBack} />
						<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
							{t('Geofences Visits')}
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

						{!isGeofenceSummaryLoading &&
							!isGeofencesDetailsLoading &&
							geofencesSummaryData &&
							geofencesDetailsData &&
							geofencesSummaryData?.length !== 0 &&
							geofencesDetailsData?.length !== 0 && (
								<>
									<CSVLink
										style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'}`}
										filename={'Geofences Visits'}
										// data={[...geofencesSummaryData, ...geofencesDetailsData]}>
										data={[...(geofencesSummaryData ?? []), ...(geofencesDetailsData ?? [])]}>
										<div className='report_buttons pt-2'>
											<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
											<span className='export-buttons'>{t('Export CSV')}</span>
										</div>
									</CSVLink>
									<XLSXLink
										style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', backgroundColor: "#FFFFFF" }}
										className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'}`}
										filename={'Geofences Visits'}
										// data={[...geofencesSummaryData, ...geofencesDetailsData]}>
										data={[...(geofencesSummaryData ?? []), ...(geofencesDetailsData ?? [])]}>
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
			{isGeofenceSummaryLoading || isGeofencesDetailsLoading ? (
				<Loader />
				// ) : geofencesSummaryData.length || geofencesDetailsData.length ? (
			) : (geofencesSummaryData?.length ?? 0) > 0 || (geofencesDetailsData?.length ?? 0) > 0 ? (
				<>
					<h1 className='fuel-volume-title mt-3'>{t('Summary')}</h1>
					<Datatable
						// data={geofencesSummaryData || []}
						data={geofencesSummaryData ?? []}
						columns={columnsGeofencesVisitsSummary}
					/>

					<h1 className='fuel-volume-title'>{t('Details')}</h1>
					<Datatable
						// data={geofencesDetailsData || []}
						data={geofencesDetailsData ?? []}
						columns={columnsGeofencesVisitsDetails}
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

export default GeofencesVisits;
