import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Spinner from '../../components/bootstrap/Spinner';
import NoData from '../../components/NoData';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import { alertsNotificationsPages } from '../../menu';
import { RootState } from '../../store/store';
import NotificationDatatable from './components/NotificationsDatatable';
import Loader from '../../components/Loader';

const DashboardNotifications = () => {
	const { t } = useTranslation(['alertNotification']);
	const isLoading = useSelector(
		(state: RootState) => state.loading.effects.notifications.getAllNotifications,
	);
	const { notificationsList } = useSelector((state: RootState) => state.notifications);

	return (
		<PageWrapper isProtected={true}>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${alertsNotificationsPages.notificationsDashboard.text}`),
								to: alertsNotificationsPages.notificationsDashboard.path,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader>
			<Page className='mw-100 px-3'>
				<div className=' d-flex pb-3 mb-4 border-bottom border-secondary w-100'>
					<h1 className='fs-2 fw-semibold text-secondary'>
						{t(`${alertsNotificationsPages.notificationsDashboard.text}`)}{' '}
					</h1>
				</div>

				{isLoading ? (
					<Loader />
				) : notificationsList.length > 0 ? (
					<Card>
						<CardBody className='row'>
							<NotificationDatatable />
						</CardBody>
					</Card>
				) : (
					<NoData text={t('No notification to display')} />
				)}
			</Page>
		</PageWrapper>
	);
};

export default DashboardNotifications;
