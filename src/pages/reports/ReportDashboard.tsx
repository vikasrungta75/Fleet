import React, { FC, useState } from 'react';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader'; // FIX UX-02
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { dashboardMenu } from '../../menu';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Page from '../../layout/Page/Page';
import { useTranslation } from 'react-i18next';
import AssistanceButton from '../common/assitance-button/AssistanceButton';
import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
import ReportWrapper from './layout/report-wrapper/ReportWrapper';
import ReportContent from './layout/content/Content';
import { Header } from './layout/Header/Header';
import GenericTab, { GenericTabProps } from '../setup-admin/vehicles/components/GenericTab';
import { REPORT } from './constant/constant';
import ReportList from './components/resport-list/ReportList';
import NoData from '../../components/NoData';
import GeofencesVisits from '../setup-admin/vehicles/tabs/GeofencesVisits';
import FuelVolume from '../setup-admin/vehicles/tabs/FuelVolume';
import GoBack from '../../components/GoBack';
import Temperature from '../setup-admin/vehicles/tabs/Temperature';
import FuelConsumption from '../setup-admin/vehicles/tabs/FuelConsumption';
import DriverMetricsReport from '../setup-admin/vehicles/tabs/DriverMetricsReport';

const ReportDashboard: FC = () => {
	const { t } = useTranslation(['reports']);

	const [selectedReport, setSelectedReport] = useState<string>('index');

	const [searchCriteria, setSearchCriteria] = useState('');

	const handleChange = (criteria: string) => {
		setSearchCriteria(criteria);
	};
	const goBack = () => {
		setSelectedReport('index');
	};

	return (
		<>
			<PageWrapper isProtected={true} title={dashboardMenu.reports.text}>
				{/* FIX UX-02: Re-enabled breadcrumb navigation */}
				<SubHeader>
					<SubHeaderLeft>
						<Breadcrumb
							list={[
								{
									title: t(`${dashboardMenu.reports.text}`),
									to: `../${dashboardMenu.reports.path}`,
								},
							]}
						/>
					</SubHeaderLeft>
				</SubHeader>
				<Page className='mw-100 px-0'>
					<div className='d-flex align-items-center'>
						<div className='d-flex pb-3 mb-3 border-secondary w-100 justify-content-between align-items-center'>
							{/* <div className='d-flex fs-2 pb-3 mb-4 fw-semibold content-heading'>
                                <p>Overall Reports</p>
                            </div> */}
							<AssistanceButton locationPathname={window.location.pathname} />
						</div>
					</div>
					<ReportWrapper>
						{/* <StickyLeftMenu /> */}
						<ReportContent>
							{selectedReport === 'index' ? (
								<div className='mw-100'>
									<div className='mw-100 d-flex fs-2 pb-3 mb-0 overall-content fw-semibold content-heading justify-content-between'>
										<p className='pt-2'>{t("Overall Insight Reports")}</p>
										<div className='reportSearch-bar'>
											<Header
												className='planified-report'
												handleSearchCriteria={handleChange}
												criteria={searchCriteria}
											/>
										</div>
									</div>
									<ReportList
										searchCriteria={searchCriteria}
										setindexReportSelected={setSelectedReport}
									/>
								</div>
							) : selectedReport === 'geofences_visits' ? (
								<GeofencesVisits goBack={goBack} />
							) : selectedReport === 'driver_metrics' ? (
								<DriverMetricsReport goBack={goBack} />
							) : selectedReport === 'fuel_consumption' ? (
								<FuelConsumption goBack={goBack} />
							) : selectedReport === 'fuel_volume' ? (
								<FuelVolume goBack={goBack} />
							) : REPORT.hasOwnProperty(selectedReport) ? (
								<GenericTab
									goBack={goBack}
									// eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/dot-notation
									{...(REPORT[selectedReport] as unknown as GenericTabProps)}
								/>
							) : selectedReport === 'temperature_level_statistics' ? (
								<Temperature goBack={goBack} />
							) : (
								<Card>
									{/* <CardHeader>
                                        <GoBack handleClick={goBack} />
                                    </CardHeader> */}
									<CardBody>
										<NoData text={t('No report detail to display')} />
									</CardBody>
								</Card>
							)}
						</ReportContent>
					</ReportWrapper>
				</Page>
			</PageWrapper>
		</>
	);
};

export default ReportDashboard;
