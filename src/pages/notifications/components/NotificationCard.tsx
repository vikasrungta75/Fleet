import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Badge from '../../../components/bootstrap/Badge';
import { convertFromUTCtoTZ } from '../../../helpers/helpers';
import { RootState } from '../../../store/store';
import { INotification } from '../../../type/notification-type';

interface INotificationCard {
	data: INotification;
	markAllAsRead: boolean;
	setMarkAllAsRead: (bool: boolean) => void;
}

const NotificationCard: FC<INotificationCard> = ({
	data,
	markAllAsRead,
	setMarkAllAsRead,
}): JSX.Element => {
	const { alarm, group, notification_id: id, read, vin, time } = data;
	const { t } = useTranslation(['alertNotification']);
	const dispatch = useDispatch();
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [markAsRead, setMarkAsRead] = useState(read);

	const handleMarkAsRead = () => {
		dispatch.notifications.updateNotificationsStatus([id]).then((res: boolean) => {
			if (res) {
				setMarkAsRead(true);
				setTimeout(() => {
					dispatch.notifications.getAllNotifications();
				}, 2000);
			} else {
				setMarkAsRead(false);
			}
		});
		setMarkAllAsRead(false);
	};

	useEffect(() => {
		if (markAllAsRead) {
			setMarkAsRead(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [markAllAsRead]);

	return (
		<div className='notification-card' onClick={!markAsRead ? handleMarkAsRead : undefined}>
			<div
				className={`mark-as-read-btn d-flex justify-content-end ${
					!markAsRead ? 'cursor-pointer' : ''
				}`}>
				<span className='text-custom-grey me-3'>
					{convertFromUTCtoTZ(time, preferedTimeZone)}
				</span>
				<div style={{ width: 10 }}>
					{!markAsRead && (
						<Badge
							className='notification-badge'
							rounded='circle'
							color='custom-blue'
							title={t('Mark as read')}>
							<span className='visually-hidden'>Notification badge</span>
						</Badge>
					)}
				</div>
			</div>
			<ul className='mb-0 me-4'>
				<li className='mb-2'>
					<span className='text-secondary fw-bolder me-2'>{alarm}</span>
				</li>
			</ul>
			<span className='fw-bolder me-2'>{vin}</span> {t('Group')} : {group}
		</div>
	);
};

export default NotificationCard;
