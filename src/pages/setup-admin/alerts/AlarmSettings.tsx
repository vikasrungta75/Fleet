import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { alertsNotificationsPages, dashboardMenu } from '../../../menu';

import { useGetAlertsSettingsData } from '../../../services/alerts';
import { RootState } from '../../../store/store';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import AlarmSettingsDataTable from './components/AlarmSettingsDataTable';
import Loader from '../../../components/Loader';

const AlarmSettings = () => {
	const { t } = useTranslation(['alertNotification']);
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	const { data, isLoading, refetch, remove } = useGetAlertsSettingsData();

	React.useEffect(() => {
		refetch();
		return () => {
			remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.alerts.text}`),
								to: `../${dashboardMenu.setup.subMenu.alerts.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-0'>
				<div className='d-flex justify-content-between'>
					<div className='fs-2 pb-3 fw-semibold content-heading'>
						{t(`${dashboardMenu.setup.subMenu.alerts.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
					<div className="w-100 mb-4 d-flex justify-content-end">
						{permissions?.create_alert && (
							<Button
								isOutline={true}
								className={`outline-btn py-2 planified-report`}
								style={{ width: '180px' }}  // Custom width in pixels
								onClick={() =>
									navigate(`../${alertsNotificationsPages.createAlert.path}`)
								}
								icon="Add">
								{t('Create New Alerts')}
							</Button>
						)}
					</div>

				</div>

				{isLoading ? (
					<Loader />
				) : (
					<Card className="overall-card1" style={{ height: "550px"}}>
						<CardBody className='row'>
							<AlarmSettingsDataTable alarmSettings={data || []} refetch={refetch} />
						</CardBody>
					</Card>
				)}
			</Page>
		</PageWrapper>
	);
};

export default AlarmSettings;
