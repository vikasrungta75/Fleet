import React, { useContext, useState, useEffect } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import DatePicker from '../../../../components/DatePicker';
import ThemeContext from '../../../../contexts/themeContext';
import {
	convertFromTZToUTC,
	getDefaultDateRangeFilter,
	getDefaultFleetFilter,
} from '../../../../helpers/helpers';
import { RootState } from '../../../../store/store';
import { useSelector, useDispatch } from 'react-redux';
import { IDateRangeFilter } from '../../../../type/history-type';
import { IReportDTC } from '../../../../type/alert-types';
import Spinner from '../../../../components/bootstrap/Spinner';
import ReportDTCDatatable from '../datatables/ReportDTCDatable';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import { useTranslation } from 'react-i18next';
import FleetSelect from '../../../common/filters/FleetSelect';
import Loader from '../../../../components/Loader';

const ReportDTC = () => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['vehicles']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const isLoading = useSelector((state: RootState) => state.loading.models.alertsNotifications);
	const { filterPayload } = useSelector((state: RootState) => state.filters);

	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());

	const [DTCReports, setDTCReports] = useState<IReportDTC[]>([]);

	const dispatch = useDispatch();
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
	);
	// const { reportDTC } = useSelector((state: RootState) => state.alertsNotifications);

	useEffect(() => {
		let startDate = new Date(`${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`);
		let endDate = new Date(`${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`);

		const payloadReport = {
			// startdate: '2022-02-17 00:00:00',
			// enddate: '2023-02-17 00:00:00',
			startdate: convertFromTZToUTC(startDate, preferedTimeZone),
			enddate: convertFromTZToUTC(endDate, preferedTimeZone),
			fleetName: fleetNameFilter,
		};
		const getAlarmsDetail = async () => {
			await dispatch.alertsNotifications
				.reportDTC(payloadReport)
				.then((res: IReportDTC[]) => {
					setDTCReports(res);
				});
		};
		getAlarmsDetail();
		return () => {
			setDTCReports([]);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, fleetNameFilter]);

	return (
		<>
			<Card>
				<CardBody className={`${mobileDesign ? '' : 'row'}`}>
					<div className={`d-flex justify-content-end ${mobileDesign && 'flex-column'}`}>
						<FleetSelect
							className={`${mobileDesign ? 'col-12 mb-3' : 'col-3 me-3'}`}
							fleetNameFilter={fleetNameFilter}
							setFleetNameFilter={setFleetNameFilter}
						/>
						<DatePicker
							className={`position-relative ${
								mobileDesign ? 'col-12' : 'col-3 me-3'
							}`}
							setDateRangeFilter={setDateRangeFilter}
							dateRangeFilter={dateRangeFilter}
							withHours={false}
							position={i18n.language === 'ar-AR' ? 'start' : 'end'}
						/>
						{DTCReports.length !== 0 && (
							<CSVLink
								style={{ textDecoration: 'none', minWidth: 130 }}
								className={`py-3 primary-btn rounded ${
									mobileDesign ? 'w-20' : 'w-25'
								}`}
								filename={'Report DTC'}
								data={DTCReports}>
								<Icon icon='ImportExport' className='me-2' size={'lg'} />
								<span className='fw-bolder'>{t('Export')}</span>
							</CSVLink>
						)}
					</div>
				</CardBody>
			</Card>
			{isLoading ? <Loader /> : <ReportDTCDatatable reportsData={DTCReports} />}
		</>
	);
};

export default ReportDTC;
