import React, { FC, useContext, useEffect, useState, memo } from 'react';
import Card, { CardBody, CardTitle } from '../../../../components/bootstrap/Card';
import Spinner from '../../../../components/bootstrap/Spinner';
import ThemeContext from '../../../../contexts/themeContext';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter, getDefaultFleetFilter } from '../../../../helpers/helpers';
import Datatable from './Datatable';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import { RootState } from '../../../../store/store';
import FleetSelect from '../../../common/filters/FleetSelect';
import DatePicker from '../../../../components/DatePicker';
import VinSelect from '../../../common/filters/VinSelect';
import Select from '../../../../components/bootstrap/forms/Select';
import timezones from '../../../../common/data/timezone/timezones.json';
import GoBack from '../../../../components/GoBack';
import { shiftTrip } from '../constants/VehicleConstants';
import SearchBar from '../../../../components/SearchBar';

export interface GenericTabProps {
	fileName: string;
	useCustomUsage: Function;
	columns: Array<any>;
	withDatePicker?: boolean;
	withVinSelect?: boolean;
	withFleetSelect?: boolean;
	withShift?: boolean;
	goBack?: () => void;
	handleSearchCriteria: (e: any) => void;
    criteria: string;
}

const GenericTab: FC<GenericTabProps> = ({
	fileName,
	useCustomUsage,
	columns,
	withDatePicker = false,
	withVinSelect = false,
	withFleetSelect = false,
	withShift = false,
	goBack,
	handleSearchCriteria, 
	criteria,
}) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['vehicles', 'reports']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());
	const [vinFilter, setVinFilter] = useState<string>('All Vins');
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);
	const [shift, setShift] = useState<string>('day');
	let offsetTimeZoneUser = timezones.find((arg: any) => arg.text.includes(preferedTimeZone));

	const { data, isLoading, refetch, remove } = useCustomUsage({
		dateRangeFilter,
		fleetNameFilter,
		vinFilter,
		shift,
		timezone: offsetTimeZoneUser?.offset,
	});

	useEffect(() => {
		refetch();
		return () => {
			remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, fleetNameFilter, vinFilter]);

	return (
		<>
			{isLoading ? (
				<div className='d-flex justify-content-center h-100 align-items-center'>
					<div className={`loader-wrapper`}>
						<Spinner className='spinner-center' color='secondary' size='5rem' />
					</div>
				</div>
			) : (
				<>
					<Card className='mw-100 px-0 reportCards-header'>
						<CardBody
							className={
								!mobileDesign
									? 'd-flex justify-content-between align-items-center col-12'
									: ''
							}>
							<div className='d-flex'>
								<GoBack handleClick={goBack} />
								<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
									{t(fileName)}
								</CardTitle>
							</div>
							
							<div className='d-flex'>
								{withFleetSelect && (
									<FleetSelect
										className={mobileDesign ? 'col-12 mb-3' : 'me-3'}
										fleetNameFilter={fleetNameFilter}
										setFleetNameFilter={setFleetNameFilter}
									/>
								)}
								{withVinSelect && (
									<VinSelect
										fleetNameFilter={fleetNameFilter}
										setVinFilter={setVinFilter}
										vinFilter={vinFilter}
										className={`${mobileDesign ? 'mb-3' : 'me-3'}`}
									/>
								)}

								{withShift && (
									<div className={`${mobileDesign ? 'mb-2' : 'me-3'}`}>
										<Select
											className='form-control'
											ariaLabel='shift-select'
											placeholder={t('Shift')}
											value={shift}
											onChange={(e: { target: { value: string } }) => {
												setShift(e.target.value);
											}}>
											<option disabled value=' '>
												{t('select a shift')}
											</option>
											{shiftTrip?.map((value: string, index: number) => {
												return (
													<option key={index} value={value}>
														{t(value)}
													</option>
												);
											})}
										</Select>
									</div>
								)}
								{withDatePicker && (
									<DatePicker
										className={`position-relative ${mobileDesign ? 'col-12' : 'me-3'
											}`}
										setDateRangeFilter={setDateRangeFilter}
										dateRangeFilter={dateRangeFilter}
										withHours={false}
										position={i18n.language === 'ar-AR' ? 'start' : 'end'}
									/>
								)}

								{!isLoading && data && data?.length !== 0 && (
									<>
										<CSVLink
											style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', }}
											className={`py-0 ${mobileDesign ? 'mb-2 m-auto w-100' : 'me-3'
												}`}
											filename={fileName}
											data={data}>
											<div className='report_buttons pt-2'>
												<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
												<span className='export-buttons'>{t('Export CSV')}</span>
											</div>
										</CSVLink>
										<XLSXLink
											style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', backgroundColor: "#FFFFFF" }}
											className={`py-0 ${mobileDesign ? 'mb-2 m-auto w-100' : 'me-3'
												}`}
											filename={fileName}
											data={data}>
											<div className='report_buttons'>
												<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
												<span className='export-buttons'>{t('Export XLSX')}</span>
											</div>
										</XLSXLink>
									</>
								)}
							</div>
						</CardBody>
					</Card>

					<Datatable data={data} columns={columns} />
				</>
			)}
		</>
	);
};

export default memo(GenericTab);
