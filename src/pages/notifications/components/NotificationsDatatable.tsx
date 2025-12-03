import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Badge from '../../../components/bootstrap/Badge';
import Icon from '../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import { convertFromUTCtoTZ } from '../../../helpers/helpers';
import useSortableData from '../../../hooks/useSortableData';
import { RootState } from '../../../store/store';
import { INotification } from '../../../type/notification-type';
import {
	columnNotificationsTable,
	thStyle,
	trStyleTable,
} from '../constants/NotificationConstants';

const NotificationDatatable: React.FC = (): JSX.Element => {
	const { t } = useTranslation(['alertNotification']);
	const { notificationsList } = useSelector((state: RootState) => state.notifications);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch();
	const { dir } = useSelector((state: RootState) => state.appStore);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [perPage, setPerPage] = React.useState(PER_COUNT['5']);
	const { items, requestSort, getClassNamesFor } = useSortableData(notificationsList);

	const handleMarkAsRead = (id: string) => {
		dispatch.notifications.updateNotificationsStatus([id]).then((res: boolean) => {
			if (res) {
				setTimeout(() => {
					dispatch.notifications.getAllNotifications();
				}, 2000);
			}
		});
	};

	return (
		<div className='table-responsive pt-0'>
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
			<table className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
				<thead>
					<tr style={trStyleTable}>
						{columnNotificationsTable.map(({ name, key, sortable, width }, index) => (
							<th
								key={index}
								style={{
									width: width,
									...thStyle,
								}}
								onClick={() => (sortable === true ? requestSort(key) : null)}
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
					</tr>
				</thead>
				<tbody>
					{dataPagination(items, currentPage, perPage).map(
						(item: INotification, index) => (
							<tr key={index}>
								<td
									onClick={() => handleMarkAsRead(item.notification_id)}
									className='cursor-pointer'>
									{!item.read && (
										<Badge
											className='notification-badge'
											rounded='circle'
											color='custom-blue'
											title={t('Mark as read')}>
											<span className='visually-hidden'>
												Notification badge
											</span>
										</Badge>
									)}
								</td>
								<td>{convertFromUTCtoTZ(item.time, preferedTimeZone)}</td>
								<td>{item.vin ?? '-'} </td>
								<td>{item.group ?? '-'}</td>
								<td>{item.alarm_type ?? '-'}</td>
								<td>{item.location ?? '-'}</td>
								{/* when tickets will be reintegrated => <td>
									<div className='d-flex  align-items-center'>
										<Button
											aria-label='Go Forward'
											className='primary-btn'
											isLight
											onClick={() =>
												navigate(
													`../${ticketsPages.ticketManagement.subMenu.createticket.path}`,
													{
														state: { notification: item },
													},
												)
											}>
											{t('Create ticket')}
										</Button>
									</div>
								</td> */}
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
	);
};

export default NotificationDatatable;
