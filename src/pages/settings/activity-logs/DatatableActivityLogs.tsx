import React, { FC, useState } from 'react';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import { RootState } from '../../../store/store';
import { useSelector } from 'react-redux';
import {
	TableStyle,
	activityLogs,
	trStyleTable,
} from '../../alarms_notifications/components/constants/alarmConstants';
import Icon from '../../../components/icon/Icon';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Alert from '../../../components/bootstrap/Alert';
import { useTranslation } from 'react-i18next';

interface DatatableActivityLogsProps {
	activityData: any[];
}

const DatatableActivityLogs: FC<DatatableActivityLogsProps> = ({ activityData }) => {
	const { t } = useTranslation(['vehicles']);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const { items, requestSort, getClassNamesFor } = useSortableData(activityData);
	const { dir } = useSelector((state: RootState) => state.appStore);
	return (
		<>
			{activityData && activityData.length > 0 ? (
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
								{activityLogs.map(({ name, key, sortable }, index) => (
									<th
										key={index}
										// style={{
										// 	width: width,
										// }}
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
								))}
								<th />
							</tr>
						</thead>
						<tbody>
							{dataPagination(items, currentPage, perPage).map((item: any, index) => (
								<tr style={{ zIndex: '1' }} key={index} onClick={() => {}}>
									<td>{item.commited_by}</td>
									<td>{item.user_name}</td>
									<td>{item.ip_address}</td>
									<td>{item.action_type}</td>
									<td>{item.datetime}</td>
								</tr>
							))}
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
			) : (
				<Card>
					<CardBody>
						<Alert color='info' className='flex-column w-100 align-items-start'>
							<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
								<Icon icon='Info' size='2x' className='me-2' />{' '}
								{'No Activity Logs Found'}
							</p>
						</Alert>
					</CardBody>
				</Card>
			)}
		</>
	);
};

export default DatatableActivityLogs;
