import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { RootState } from '../../store/store';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useSetState } from 'react-use';
import DatePicker from '../../components/DatePicker';
import { IDateRangeFilter } from '../../type/history-type';
import { getDefaultDateRangeFilter } from '../../helpers/helpers';
import RightSidebar, { OnDataFromChild } from './RightSidebar';
import Efficiency from './tabs/Efficiency';
import EfficiencyMain from './tabs/Efficiencymain';
import CarDashboard from './tabs/CarDashboard';
import Health from './tabs/Health';
import HealthMain from './tabs/Healthmain';
import Usage from './tabs/Usage';
import UsageMain from './tabs/Usagemain';
import Cost from './tabs/Cost';
import CostMain from './tabs/Costmain';
import Temperature from './tabs/Temperature';
interface State {
	run: boolean;
	steps: Step[];
}

const Overview: React.FC = () => {
	const dispatch = useDispatch();
	const [tab, setTab] = useState('Overall');
	const { t, i18n } = useTranslation(['overview', 'history']);
	const { urlEndPoint } = useSelector((state: RootState) => state.vehicles);
	const { joyrideRun, token } = useSelector((state: RootState) => state.auth);
	const [showIcons, setShowIcons] = useState<boolean>(false);
	const [selectedKPIs, setSelectedKPIs] = useState<{ [key: string]: boolean }>({
		['Fuel Efficiency']: true,
	});


	const handleShowIconsChange = (newShowIconsValue: boolean) => {
		setShowIcons(newShowIconsValue);
	};

	const handleKPIChange = (kpi: string, isChecked: boolean) => {
		setSelectedKPIs((prevSelected) => ({
			...prevSelected,
			[kpi]: isChecked,
		}));
	};

	const [sett, set] = useState<boolean>(true);
	const [sett1, set1] = useState<boolean>(false);

	const handleCustomDashboardToggle = () => {
		set((prev) => !prev);
		set1((prev) => !prev);
	};

	const {
		getFuelEfficiency: isFuelEfficiencyLoading,
		getFleetHealth: isFleetHealthLoading,
		getFleetUsage: isFleetUsageLoading,
		getTemperatureData: isTemperatureDataLoading,
		getOverviewVehiclesAlerts: isVehicleAlertsLoading,
		getDrainage: isDrainageLoading,
		getTotalDrainage: isTotalDrainageLoading,
		getTotalFuel: isTotalFuelLoading,
		getTotalFilling: isTotalFillingLoading,
		getAvgFuel: isAvgFuel,
		getTemperature: isTemperatureLoading,
		getTotalRefuel: isTotalRefuelLoading,
		getEcoDriverTotalScore: isEcoDriverTotalScoreLoading,
		getMileageDriven: isMileageDrivenLoading,
		getNbTrips: isNbTripsLoading,
		getTotalIdlingTime: isTotalIdlingTimeLoading,
		getAvgIdlingTime: isAvgIdlingTimeLoading,
		getFuelAvgEfficiency: isFuelAvgEfficiencyLoading,
		getFuelAvgConsumption: isFuelAvgConsumptionLoading,
	} = useSelector((state: RootState) => state.loading.effects.overview);

	const { dateRangeFilterFromStore } = useSelector((state: RootState) => state.overview);

	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		dateRangeFilterFromStore && dateRangeFilterFromStore?.startDate !== ''
			? dateRangeFilterFromStore
			: getDefaultDateRangeFilter(preferedTimeZone),
	);
	const [displayHelpButton, setDisplayHelpButton] = useState(false);

	useEffect(() => {
		dispatch.overview.setDateRangeFilter(dateRangeFilter);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter]);



	const [{ run, steps }] = useSetState<any>({
		run: false,
		steps: [
			{
				content: (
					<>
						<img
							src='Fichier-1@2x-1 1.png'
							style={{
								width: '96px',
								height: '38px',
								gap: '0px',
								opacity: '0px',
							}}></img>
						<h4>Welcome to our Fleet Maintenance Hub</h4>
						<h5>
							Optimize Maintenance, Minimize Downtime. Effortlessly schedule and track
							repairs, maintenance checks, and diagnostics, ensuring your fleet runs
							smoothly and efficiently.
						</h5>
					</>
				),
				locale: { skip: <strong aria-label='skip'>SKIP</strong> },
				placement: 'center',
				target: 'body',
			},
			displayHelpButton
				? {
						content: <h2>Assistance</h2>,
						floaterProps: {
							disableAnimation: true,
						},
						spotlightPadding: 20,
						target: '#assitance_button',
				  }
				: null,
			{
				content: (
					<>
						<h4>Start Your Tour by Customizing Your Data View</h4>
						<h4>
							We’ve set the default view to display one week data. Begin your journey
							by selecting a specific date range.
						</h4>
					</>
				),
				placement: 'bottom',
				styles: {
					options: {
						width: 451,
					},
				},
				target: '#card_body_statistics',
				title: 'Choose Date',
			},
			{
				content:
					'Customized KPIs and monitor the overall status of your fleet in real-time. Instantly view the overall health and performance of your fleet',
				placement: 'bottom',
				styles: {
					options: {
						width: 460,
					},
				},
				target: '#vehicle_usage',
				title: 'Choose KPI’s',
			},
			{
				content:
					'Quickly access the overall health of your fleet, Track your fleet, Maintenance data, Activity reports, Driver leadership.',
				placement: 'bottom',
				styles: {
					options: {
						width: 462,
					},
				},
				target: '#notification-btn',
				title: 'Explore Key Features ',
			},
			{
				content: 'You can view all your notifications.',
				placement: 'bottom',
				styles: {
					options: {
						width: 360,
					},
				},
				target: '#notification-btn',
				title: 'Notifications',
			},
			{
				content:
					'Seamlessly bring all your fleet data into one powerful platform. Valcode supports your daily operations and adapts to your evolving needs, helping you stay on track toward long-term success.',
				placement: 'bottom',
				styles: {
					options: {
						width: 522,
					},
				},
				target: '#notification-btn',
				title: 'Get Started with Valcode! ',
			},
		],
	});

	const filteredSteps = steps.filter((step: Step) => step !== null);
	const handleJoyrideCallback = (data: CallBackProps) => {
		const { status } = data;
		const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
		if (finishedStatuses.includes(status)) {
			dispatch.auth.updateJoyrideRun(false);
		}
	};

	const handleDataFromChild: OnDataFromChild = {
		someProp: 'example',
		onChange: () => {},
	};

	const isHealthComponentVisible =
		selectedKPIs['Maintenance Status'] || selectedKPIs['Eco Drive Average Score'];
	const efficiencyKPIConditions = [
		('Fuel Usage'),
		('Total Refuel'),
		('Total Drainage (L)'),
		('Total Fillings Count'),
		('Average Fuel Level'),
		('Total Fuel Consumed'),
		('Total Drainage Count (L)'),
		('Fuel Average Efficiency'),
		('Average Consumption (L)'),
	];

	const selectedKPI = efficiencyKPIConditions.find((kpi) => selectedKPIs[kpi]);
	const shouldRenderEfficiency = selectedKPI !== undefined;

	const costKPIConditions = [
		('Vehicle Acquisition Cost'),
		('Vehicle Leasing Cost'),
		('Fuel Cost'),
		('Fuel Consumed'),
		('Maintenance Cost'),
		('Insurance Cost'),
		('Administrative Management Cost'),
		('Operational Cost'),
	];

	const selectedCostKPI = costKPIConditions.find((kpi) => selectedKPIs[kpi]);
	const shouldRenderCost = selectedCostKPI !== undefined;

	const usageKPIConditions = [
		('Vehicles Usage'),
		('Vehicle Alerts'),
		('Mileage Driven (km)'),
		('No. of Trips'),
		('Total Idling Time (Min)'),
		('Average Idling Time (Min)'),
	];

	const selectedUsageKPI = usageKPIConditions.find((kpi) => selectedKPIs[kpi]);
	const shouldRenderUsage = selectedUsageKPI !== undefined;

	return (
		<PageWrapper isProtected={true}>
			<Page className='mw-100 px-0 overview '>
				<div
					className={`d-flex align-items-center justify-content-between ${
						showIcons ? 'w-85' : 'w-7'
					} `}>
					<h2 className='kpis-heading'>{t("Key Performance KPI's")}</h2>

					<div className='ml-auto'>
						<DatePicker
							className='col-3 pb-2'
							dateRangeFilter={dateRangeFilter}
							setDateRangeFilter={setDateRangeFilter}
							withHours={false}
							isLoading={
								tab === 'Overall' &&
								(isFuelEfficiencyLoading ||
									isVehicleAlertsLoading ||
									isDrainageLoading ||
									isTotalDrainageLoading ||
									isTotalFuelLoading ||
									isTotalFillingLoading ||
									isAvgFuel ||
									isTemperatureLoading ||
									isTotalRefuelLoading ||
									isEcoDriverTotalScoreLoading ||
									isMileageDrivenLoading ||
									isNbTripsLoading ||
									isTotalIdlingTimeLoading ||
									isAvgIdlingTimeLoading ||
									isFuelAvgEfficiencyLoading ||
									isFuelAvgConsumptionLoading)
							}
							position={i18n.language === 'ar-AR' ? 'start' : 'end'}
						/>
					</div>
				</div>

				{sett &&
					(selectedKPIs['Fuel Efficiency'] ||
					(sett && selectedKPIs['Fleet Health']) ||
					(sett && selectedKPIs['Fleet Usage']) ||
					(sett && selectedKPIs['Fleet Cost']) ||
					(sett && selectedKPIs['Sensor Data']) ? (
						<></>
					) : (
						<CarDashboard
							showIcons={showIcons}
							dateRangeFilter={undefined}
							selectedKPIs={{}}
						/>
					))}

				{sett1 &&
					(shouldRenderEfficiency ||
					(sett1 && isHealthComponentVisible) ||
					(sett1 && shouldRenderUsage) ||
					(sett1 && shouldRenderCost) ||
					(sett1 && selectedKPIs['Temperature (°C)']) ? (
						<></>
					) : (
						<CarDashboard
							showIcons={showIcons}
							dateRangeFilter={undefined}
							selectedKPIs={{}}
						/>
					))}

				{sett && selectedKPIs['Fuel Efficiency'] && (
					<EfficiencyMain
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett1 && shouldRenderEfficiency && (
					<Efficiency
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett1 && isHealthComponentVisible && (
					<Health
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett && selectedKPIs['Fleet Health'] && (
					<HealthMain
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}
				{sett && selectedKPIs['Fleet Usage'] && (
					<UsageMain
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett1 && shouldRenderUsage && (
					<Usage
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett && selectedKPIs['Fleet Cost'] && (
					<CostMain
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}
				{sett1 && shouldRenderCost && (
					<Cost
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				{sett && selectedKPIs['Sensor Data'] && (
					<Temperature
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}
				{sett1 && selectedKPIs['Temperature (°C)'] && (
					<Temperature
						dateRangeFilter={dateRangeFilterFromStore}
						selectedKPIs={selectedKPIs}
						showIcons={showIcons}
					/>
				)}

				<RightSidebar
					onDataFromChild={handleDataFromChild}
					onKPIChange={handleKPIChange}
					onCustomDashboardToggle={handleCustomDashboardToggle}
					onShowIconsChange={handleShowIconsChange}
				/>
			</Page>
		</PageWrapper>
	);
};
export default Overview;
