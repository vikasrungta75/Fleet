import React, { useContext, useEffect, useRef, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import ProgressCustomColor from '../../../components/bootstrap/ProgressCustomColor';
import { useTranslation } from 'react-i18next';
import Alert from '../../../components/bootstrap/Alert';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';
import Spinner from '../../../components/bootstrap/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import AlarmTypeSelect from '../../common/filters/AlarmTypeSelect';
import { IDateRangeFilter } from '../../../type/history-type';

type SimpleDataTableSortProps = React.PropsWithChildren<{
	data: any[];
	columns: { name: string; width: string; sortable: boolean }[];
	setSortOrder: React.Dispatch<
		React.SetStateAction<{
			[key: string]: number;
		}>
	>;
	sortorder: { [key: string]: number };
	sortField: string;
	isLoading: boolean;
	height?: number;
	width?: number;
	colors: string[];
	selectedText?: string; // Add this prop
	dateRangeFilter: IDateRangeFilter; // DateRangeFilter prop
}>;
const SimpleDataTableSort = (props: SimpleDataTableSortProps) => {
	const dispatch = useDispatch();
	const {
		data,
		columns,
		setSortOrder,
		sortorder,
		sortField,
		isLoading,
		height,
		colors,
		selectedText: propSelectedText,
		dateRangeFilter,
	} = props;
	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['overview', 'history']);

	const [selectedText, setSelectedText] = useState(propSelectedText || ('Fuel Usage')); // Default text

	// Update state when the prop changes
	useEffect(() => {
		if (propSelectedText) {
			setSelectedText(propSelectedText);
		}
	}, [propSelectedText]);



	const countArray = data.map((el) => Number(el[sortField]));
	const { dir } = useSelector((state: RootState) => state.appStore);

	const { dateRangeFilterFromStorePrev } = useSelector((state: RootState) => state.overview);

	const prevCountSortOrder = useRef<number>(-1); // New useRef for count sort order

	const prevalarmFilter = useRef<any>('All Alerts'); // New useRef for count sort order
	const [alarmFilter, setAlarmFilter] = useState<string>('All Alerts');
	const { overviewVehicleAlerts } = useSelector((state: RootState) => state.overview);

	useEffect(() => {
		let startDate = `${dateRangeFilter.startDate}T${dateRangeFilter.startTime}`;
		let endDate = `${dateRangeFilter.endDate}T${dateRangeFilter.endTime}`;
		if (
			// Check if the previous efficiency sort order is not the same as the current one
			prevalarmFilter.current !== alarmFilter ||
			prevCountSortOrder.current !== sortorder.count ||
			// Check if fuelEfficiency is empty
			overviewVehicleAlerts.length === 0 ||
			// Check if the previous date range filter is not the same as the current one
			dateRangeFilterFromStorePrev !== dateRangeFilter
		) {
			dispatch.overview.getOverviewVehiclesAlerts({
				alert_type: alarmFilter,
				sortorder: sortorder.count,
				date: {
					startDate: startDate,
					endDate: endDate,
				},
			});
		}
		prevalarmFilter.current = alarmFilter;
		prevCountSortOrder.current = sortorder.count;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alarmFilter, sortorder.count, dateRangeFilter, dispatch.overview]);

	
	return (
		<Card className='rounded-2'>
			<p className='table-titles'>{selectedText}</p>

			{selectedText ===  ('Vehicle Alerts') && (
				<div>
					<div className='d-flex bd-highlight mb-1 align-items-center'>
						<div className='position-absolute end-0 me-4' style={{ top: '-7px', width: 'auto', height: 'auto' }}>
							{/* <AlarmTypeSelect
								defaultoptionValue={'All Alerts'}
								alarmFilter={alarmFilter}
								setalarmFilter={setAlarmFilter}
								defaultFilter='All Alerts'
							/> */}
						</div>
					</div>
				</div>
			)}

			<CardBody className='table-responsive'>
				{data.length ? (
					<div
						style={{ height, overflowY: 'auto' }}
						className={`col ${mobileDesign ? 'mb-3' : ''}`}>
						<table
							className={`table   ${
								dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'
							}`}
							style={{ width: mobileDesign ? '300px' : '98%' }}>
							<thead>
								<tr>
									{columns.map(({ name, width, sortable }, index) => (
										<th
											key={index}
											style={{ width: width }}
											onClick={() =>
												sortable && !isLoading
													? setSortOrder({
															...sortorder,
															[sortField]:
																sortorder[sortField] === 1 ? -1 : 1,
													  })
													: null
											}
											scope='col'
											className={
												sortable && !isLoading ? 'cursor-pointer' : ''
											}>
											{(`${name}`)}
											{sortable &&
												(!isLoading ? (
													<Icon
														size='lg'
														className='ms-3'
														style={{
															transform:
																sortorder[sortField] !== -1
																	? 'rotate(180deg)'
																	: '',
														}}
														icon='FilterList'
													/>
												) : (
													<Spinner
														size='15px'
														className='ms-1'
														color='secondary'
													/>
												))}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.map((item, index) => (
									<tr key={item._id}>
										<td>{index + 1}</td>
										<td>{item._id}</td>
										<td className='col-md-6'>
											<div className='row'>
												<div className='col-md-8'>
													<ProgressCustomColor
														typeOfProgress={sortField}
														value={parseInt(item[sortField])}
														height={10}
														max={Math.max(...countArray)}
														startValue={Math.min(...countArray)}
														colors={colors}
													/>
												</div>
												<div className='col-md-4'>
													<span>{item[sortField]}</span>
												</div>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div
					style={{ height, overflowY: 'auto' }}
					className={`col ${mobileDesign ? 'mb-3' : ''}`}>
					<Alert color='info' className='flex-column w-100 align-items-start'>
						<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
							<Icon icon='Info' size='2x' className='me-2' />{' '}
							{t('Information : No data available')}
						</p>
					</Alert>
					</div>
				)}
			</CardBody>
		</Card>
	);
};
export default SimpleDataTableSort;
