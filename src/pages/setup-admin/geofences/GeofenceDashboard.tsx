import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { dashboardMenu, geofencesPages } from '../../../menu';
import { useGetGeofencesSettingsData } from '../../../services/geofences';
import GeofencesDatatable from './components/GeofencesDatatable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import NoData from '../../../components/NoData';
import Loader from '../../../components/Loader';

const GeofenceDashboard = () => {
	const { t } = useTranslation(['geofence']);
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const { data, isLoading } = useGetGeofencesSettingsData();
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch.geofences.clearStore();
	}, [dispatch.geofences]);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.geofences.text}`),
								to: `../${dashboardMenu.setup.subMenu.geofences.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold w-100' style={{ color: '#F00D69' }}>
						{t(`${dashboardMenu.setup.subMenu.geofences.text}`)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				<div className='w-100 mb-4'>
					{permissions?.create_geofence && (
						// <Button
						// 	color='secondary'
						// 	isOutline={true}
						// 	className={`py-3 primary-btn float-end ${
						// 		mobileDesign ? 'w-100' : 'w-25'
						// 	}`}
						// 	onClick={() => navigate(`../${geofencesPages.createGeofence.path}`)}
						// 	icon='Add'>
						// 	{t('New geofence')}
						// </Button>
						<Button
							icon='Add'
							isOutline
							className={`outline-btn py-2 px-1 planified-report float-end ${
								mobileDesign ? 'w-100' : 'w-25'
							}`}
							
							style={{ whiteSpace: 'nowrap' }} // keeps all text on one line
							onClick={() => navigate(`../${geofencesPages.createGeofence.path}`)}>
							{t('New geofence')}
						</Button>
					)}
				</div>
				{isLoading ? (
					<Loader />
				) : data && data.length > 0 ? (
					<GeofencesDatatable geofences={data} />
				) : (
					<NoData text={t('No geofence to display')} />
				)}
			</Page>
		</PageWrapper>
	);
};

export default GeofenceDashboard;
