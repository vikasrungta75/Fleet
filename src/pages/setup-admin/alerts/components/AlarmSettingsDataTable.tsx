import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/icon/Icon';
import { alertsNotificationsPages } from '../../../../menu';
import { IAlarmSettings } from '../../../../type/alert-types';
import useSortableData from '../../../../hooks/useSortableData';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
	columnsAlarmSettingTable,
	trStyleTable,
} from '../../../alarms_notifications/components/constants/alarmConstants';
import Button from '../../../../components/bootstrap/Button';
import Checks from '../../../../components/bootstrap/forms/Checks';
import showNotification from '../../../../components/extras/showNotification';
import NoData from '../../../../components/NoData';
import DeleteDialog from '../../../../components/bootstrap/dialog/delete/DeleteDialog';
import SvgNoAlertsToDisplay from '../../../../components/icon/material-icons/NoAlertsToDisplay';

interface IAlarmSettingsDataTableProps {
	alarmSettings: IAlarmSettings[];
	refetch: () => void;
}
const AlarmSettingsDataTable: FC<IAlarmSettingsDataTableProps> = ({
	alarmSettings,
	refetch,
}): JSX.Element => {
	const { t } = useTranslation(['alertNotification']);
	const navigate = useNavigate();
	const { dir } = useSelector((state: RootState) => state.appStore);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const dispatch = useDispatch();

	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const listNoLimitValue = ['Geofence Zone', 'DTC Detection', 'Crash Detection'];
	const { items, requestSort, getClassNamesFor } = useSortableData(alarmSettings);
	const [showDelete, setShowDelete] = useState(false);
	const [deletePayload, setDeletePayload] = useState<any>({ alarmId: '', alertName: '' });

	const [checkedStates, setCheckedStates] = useState(items.map((item) => item.enabled));
	const [checkedStatesNotififyMe, setCheckedStatesNotififyMe] = useState(
		items.map((item) => item.notify_me),
	);

	const handleCheckboxChange = (index: number, item: string) => {
		const newCheckedStates = [...checkedStates];
		newCheckedStates[index] = !newCheckedStates[index];
		setCheckedStates(newCheckedStates);
		const payload = {
			alarm_id: item,
			enabled: !checkedStates[index],
			action: 'update alert',
		};
		dispatch.alertsNotifications.addAlarm(payload).then((res: boolean) => {
			if (res) {
				showNotification('', t('Alert has been successfully updated'), 'success');
			}
		});
	};
	const handleCheckboxNotifyMe = (index: number, item: string) => {
		const newCheckedStates = [...checkedStatesNotififyMe];
		newCheckedStates[index] = !newCheckedStates[index];
		setCheckedStatesNotififyMe(newCheckedStates);
		const payload = {
			alarm_id: item,
			notify_me: !checkedStatesNotififyMe[index],
			action: 'update alert',
		};
		dispatch.alertsNotifications.addAlarm(payload).then((res: boolean) => {
			if (res) {
				showNotification('', t('Alert has been successfully updated'), 'success');
			}
		});
	};

	const confirmeDeleteAlert = (alarm: { alarmId: string; alarmName: string }) => {
		setDeletePayload(alarm);
		setShowDelete(true);
	};

	const DeleteAlert = (alarmId: string) => {
		const payload = {
			alarm_id: alarmId,
			action: 'delete alert',
		};
		dispatch.alertsNotifications.deleteAlarm(payload).then((res: any) => {
			if (res) {
				showNotification('', t('alert has been successfully deleted'), 'success');
				setTimeout(() => {
					refetch();
				}, 2000);
			}
		});
	};

	return items.length > 0 ? (
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
			<table className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
				<thead>
					<tr
						style={{
							position: 'sticky',
							top: 0,
							zIndex: 5,
							backgroundColor: '#f5f5f5',
						}}>
						{columnsAlarmSettingTable.map(({ name, key, sortable, width }, index) => (
							<th
								key={index}
								style={{
									width: width,
									position: 'sticky',
									top: 0,
									zIndex: 5,
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
						(item: IAlarmSettings, index) => {
							return (
								<tr style={{ ...trStyleTable, cursor: 'initial' }} key={index}>
									<td>
										<Checks
											value={item.notify_me ? 'true' : 'false'}
											type='switch'
											name='notify_me'
											checked={checkedStatesNotififyMe[index]}
											className='checkbox-custom'
											onChange={() => {
												handleCheckboxNotifyMe(index, item.alarm_id);
											}}
										// disabled
										/>
									</td>
									<td>{t(item.group_name ?? '-')}</td>
									<td>{t(`${item.alarm}`)}</td>

									<td>
										{listNoLimitValue.includes(item.alarm)
											? '-'
											: item.sign === '><'
												? `${item.value[0]} ${item.sign} ${item.value[1]}`
												: `${item.sign} ${item.value}`}
									</td>
									<td>
										<Checks
											value={item.enabled ? 'true' : 'false'}
											type='switch'
											name='enabled'
											checked={checkedStates[index]}
											className='checkbox-custom'
											onChange={() =>
												handleCheckboxChange(index, item.alarm_id)
											}
										/>
									</td>

									{permissions?.update_alert && (
										<td>
											<div className='d-flex align-items-center'>
												<Button
													aria-label='Go Forward'
													className='mobile-header-toggle'
													size='sm'
													color='dark'
													isLight
													icon='Edit'
													onClick={() =>
														navigate(
															`../${alertsNotificationsPages.editAlert.path}`,
															{
																state: {
																	...item,
																},
															},
														)
													}
												/>
											</div>
										</td>
									)}
									{permissions?.delete_alert && (
										<td>
											<Button
												aria-label='Delete Button'
												className='outline-btn me-0'
												style={{ zIndex: '3' }}
												icon='Delete'
												// color='secondary'
												isOutline
												onClick={() => {
													confirmeDeleteAlert({
														alarmId: item.alarm_id,
														alarmName: item.alarm,
													});
												}}>
												{/* {t('Delete')} */}
											</Button>
										</td>
									)}
								</tr>
							);
						},
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
			{showDelete && (
				<DeleteDialog
					refetch={refetch}
					showDelete={showDelete}
					setShowDelete={setShowDelete}
					verificationKey={deletePayload.alarmName}
					handleDelete={() => DeleteAlert(deletePayload.alarmId)}
					title={t('Alert')}
				/>
			)}
		</div>
	) : (
		// <NoData text={t('No alarms to display')} withCard={false} />
		<NoData withCard={false} text="">
			<div className="noReports-found d-flex justify-content-between">
				<SvgNoAlertsToDisplay />
			</div>
		</NoData>


	);
};

export default AlarmSettingsDataTable;
