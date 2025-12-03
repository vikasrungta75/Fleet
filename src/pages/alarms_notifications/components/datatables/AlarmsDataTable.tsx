import React, { useState, FC } from 'react';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import useSortableData from '../../../../hooks/useSortableData';
import { useTranslation } from 'react-i18next';
import { IAlarmsList } from '../../../../type/alert-types';
import { columnsAlarmDataTable, TableStyle, trStyleTable } from '../constants/alarmConstants';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Alert from '../../../../components/bootstrap/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';

const stringSpliter = (str: string) => {
	// Regular expression to match the content inside parentheses
	const regex = /\(([^)]+)\)/;

	// Using the regex to split the string
	const matches = str.match(regex);

	if (matches) {
		return { text: str.replace(regex, '').trim(), count: matches[1].trim() };
	} else {
		return { text: '', count: 0 };
	}
};
interface IAlarmsListDataTableProps {
	alarmsData: IAlarmsList[];
	setalarmFilter: (e: string) => void;
	setVinFilter: (e: string) => void;
	fleetNameFilter: string;
	alarmFilter: string;
	vinFilter: string;
	dateRangeFilter: IDateRangeFilter;
}

const AlarmsDataTables: FC<IAlarmsListDataTableProps> = ({
	alarmsData,
	setalarmFilter,
	setVinFilter,
	fleetNameFilter,
	alarmFilter,
	vinFilter,
	dateRangeFilter,
}): JSX.Element => {
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const { items, requestSort, getClassNamesFor } = useSortableData(alarmsData);
	const { t } = useTranslation(['vehicles']);
	const dispatch = useDispatch();
	const { dir } = useSelector((state: RootState) => state.appStore);
	function handleFilterAlarmSelected(item: string, vin: string) {
		const alarmType = item.substring(0, item.indexOf('(') - 1);
		setalarmFilter(alarmType);
		setVinFilter(vin);

		dispatch.filters.filtersStore({
			fleet: fleetNameFilter,
			vin: vinFilter,
			alarmType: alarmFilter,
			startDate: dateRangeFilter.startDate,
			endDate: dateRangeFilter.endDate,
			startTime: dateRangeFilter.startTime,
			endTime: dateRangeFilter.endTime,
		});
	}

	return alarmsData.length > 0 ? (
		<Card>
			<CardBody>
				<div className='table-responsive pt-0 vehicles-dashboard'>
					{perPage === 50 && (
						<PaginationButtons
							data={items}
							label='items'
							setCurrentPage={setCurrentPage}
							currentPage={currentPage}
							perPage={perPage}
							setPerPage={setPerPage}
						/>
					)}
					<table
						className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
						<thead>
							<tr
								style={{
									...TableStyle,
								}}>
								{columnsAlarmDataTable.map(
									({ name, key, sortable, width }, index) => (
										<th
											key={index}
											style={{
												width: width,
											}}
											onClick={() =>
												sortable === true ? requestSort(key) : null
											}
											className={sortable ? 'cursor-pointer' : ''}>
											{t(name)}
											{sortable && (
												<Icon
													size='lg'
													className={`${getClassNamesFor(key)} ms-2`}
													icon='FilterList'
												/>
											)}
										</th>
									),
								)}
								<th />
							</tr>
						</thead>
						<tbody>
							{dataPagination(items, currentPage, perPage).map(
								(item: IAlarmsList, index) => (
									<tr
										style={trStyleTable}
										key={index}
										onClick={() => {
											handleFilterAlarmSelected(item.alarm, item.vin);
										}}>
										<td>{item.vin}</td>
										<td>
											{t(stringSpliter(item.alarm).text)} (
											{stringSpliter(item.alarm).count})
										</td>
										<td>
											<div className='d-flex align-items-center float-end'>
												<Button
													aria-label='Go Forward'
													className='mobile-header-toggle ms-3'
													size='sm'
													isOutline
													isLight
													icon='ArrowForwardIos'
													onClick={() => {
														handleFilterAlarmSelected(
															item.alarm,
															item.vin,
														);
													}}
												/>
											</div>
										</td>
									</tr>
								),
							)}
						</tbody>
					</table>
					<PaginationButtons
						data={items}
						label='items'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</div>
			</CardBody>
		</Card>
	) : (
		<Card>
			<CardBody>
				<Alert color='info' className='flex-column w-100 align-items-start'>
					<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
						<Icon icon='Info' size='2x' className='me-2' /> {t('No Alarms Found')}
					</p>
				</Alert>
			</CardBody>
		</Card>
	);
};

export default AlarmsDataTables;
