import React from 'react';
import { useNavigate } from 'react-router-dom';
import GoBack from '../../components/GoBack';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { dashboardMenu, alertsNotificationsPages } from '../../menu';
import MapContainerTripDetail from './components/alertDetails/map/MapContainerTripDetail';
import { useTranslation } from 'react-i18next';

const AlertDetails = () => {
	const { t } = useTranslation(['vehicles']);
	const navigate = useNavigate();
	return (
		<PageWrapper>
			<Page>
				<div className='d-flex pb-3 mb-4 border-bottom border-secondary w-100'>
					{/* <GoBack
						handleClick={() => navigate(`../${dashboardMenu.alerts.path}`) // FIX DES-06: use alerts key}
					/> */}
					<h1 className='fs-2 ms-4 fw-semibold text-secondary'>
						{t(`${alertsNotificationsPages.alertsDetails.text}`)}
					</h1>
				</div>

				<MapContainerTripDetail />
			</Page>
		</PageWrapper>
	);
};

export default AlertDetails;
