import React, { useEffect, useState } from 'react';
import Button from '../../../components/bootstrap/Button';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import Icon from '../../../components/icon/Icon';
import { alertsNotificationsPages } from '../../../menu';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Alert from '../../../components/bootstrap/Alert';
import NotificationCard from './NotificationCard';
import { INotification } from '../../../type/notification-type';
 
interface IFleetDetailsProps {
    setIsModalOpen: (val: boolean) => void;
    isModalOpen: boolean;
}
 
const DrawerNotifications: React.FC<IFleetDetailsProps> = ({ setIsModalOpen, isModalOpen }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation(['alertNotification']);
    const { notificationsList } = useSelector((state: RootState) => state.notifications);
    const [markAllAsRead, setMarkAllAsRead] = useState(false);
 
    const [unreadNotifications, setUnreadNotifications] = useState<INotification[]>([]);
 
    useEffect(() => {
        if (notificationsList.length > 0) {
            setUnreadNotifications(
                notificationsList.filter(
                    (notification: INotification) => notification.read === false,
                ),
            );
        }
    }, [notificationsList]);
 
    const handleMarkAllAsRead = () => {
        const notificationsIds = notificationsList
            .filter((notification) => notification.read === false)
            .map((notification: INotification) => notification.notification_id);
 
        dispatch.notifications.updateNotificationsStatus(notificationsIds).then((res: boolean) => {
            if (res) {
                setMarkAllAsRead(true);
                setTimeout(() => {
                    dispatch.notifications.getAllNotifications();
                }, 2000);
            } else {
                setMarkAllAsRead(false);
            }
        });
    };
 
    return (
   
        <OffCanvas
            style={{ width: 400 }}
            id='show-fleet-details'
            titleId='fleet details'
            placement='end'
            isOpen={isModalOpen}
            setOpen={setIsModalOpen}
            isBackdrop>
            <OffCanvasHeader className='border-1 border-bottom border-secondary'>
                <Button
                    style={{borderRadius:"50%"}}
                    aria-label='Toggle Close'
                    className='mobile-header-toggle'
                    size='lg'
                    color='dark'
                    isLight
                    icon='Close'
                    onClick={() => setIsModalOpen(!isModalOpen)}
                />
            </OffCanvasHeader>
            <OffCanvasBody className='px-4'>
                <div className='d-flex justify-content-between align-items-center pb-5 mt-4 border-bottom border-1 border-light'>
                    <div className='fs-3 fw-semibold w-50' style={{color:'#F00D69'}}>{t('Notifications')}</div>
                    {unreadNotifications?.length > 0 && (
                        <span
                            className='text-custom-blue cursor-pointer'
                            onClick={() => {
                                handleMarkAllAsRead();
                            }}>
                            {t('Mark all as read')}
                        </span>
                    )}
                </div>
 
                {notificationsList?.length > 0 ? (
                    <>
                        {notificationsList?.map((datum: INotification, index: number) => {
                            return (
                                <React.Fragment key={index}>
                                    <NotificationCard
                                        data={datum}
                                        markAllAsRead={markAllAsRead}
                                        setMarkAllAsRead={setMarkAllAsRead}
                                    />
                                    <hr />
                                </React.Fragment>
                            );
                        })}
                        <div className='d-flex flex-column align-items-center my-3'>
                            <Icon icon='Flag' size='4x' color='primary' className='mb-3' />
                            <span className='w-50 text-center'>{t('notifications 30 days')}</span>
                        </div>
                    </>
                ) : (
                    <Alert color='info' className='flex-column w-100 align-items-start'>
                        <p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
                            <Icon icon='Info' size='2x' className='me-2' />
                            {t('No notification to display')}
                        </p>
                    </Alert>
                )}
            </OffCanvasBody>
 
            <div
                className='position-relative bottom-0 border-1 border-top border-light d-flex flex-column justify-content-center align-item-center'
                style={{ minHeight: 75 }}>
                <div
                    className='fw-bold cursor-pointer m-auto' style={{color:"#F00D69"}}
                    onClick={() => {
                        setIsModalOpen(!isModalOpen);
                        navigate(`../${alertsNotificationsPages.notificationsDashboard.path}`);
                    }}>
                    <Icon icon='Notifications' size='2x' className='me-3' />
                    {t('View all notifications')}
                </div>
            </div>
        </OffCanvas>
    );
};
 
export default DrawerNotifications;