import React, { useState } from 'react';
import FuelEfficiency from '../../components/icon/svg-icons/FuelEfficiency';
import FleetHealth from '../../components/icon/svg-icons/FleetHealth';
import FleetUsage from '../../components/icon/svg-icons/FleetUsage';
import FleetCost from '../../components/icon/svg-icons/FleetCost';
import ChenvronDownIcon from '../../components/icon/svg-icons/ChevronDownIcon';
import ChevronRightIcon from '../../components/icon/svg-icons/ChevronRightIcon';
import '../../styles/components/bootstrap/forms/rightSidebar.scss';
import DashboardUpArrow from '../../components/icon/svg-icons/DashboardUpArrow';
import DashboardRightIcon from '../../components/icon/svg-icons/DashboardRightIcon';
import DashboardDownArrow from '../../components/icon/svg-icons/DashboardDownArrow';
import DashboardDownIcon from '../../components/icon/svg-icons/DashboardDownIcon';
import SensorData from '../../components/icon/svg-icons/SensorData';
import ChooseFirstPage from '../../components/icon/svg-icons/ChooseFirstPage';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
type KPI = 'Fuel Efficiency' | 'Fleet Health' | 'Fleet Usage' | 'Fleet Cost' | 'Sensor Data';
interface NestedKPIs {
	[key: string]: boolean;
}
interface SelectedKPIs {
	[key: string]: boolean | NestedKPIs;
}
export interface OnDataFromChild {
	someProp: string;
	onChange: () => void;
}
interface RightSidebarProps {
	onDataFromChild: OnDataFromChild;
	onKPIChange: (kpi: string, isChecked: boolean) => void;
	onCustomDashboardToggle: () => void;
	onShowIconsChange: (newShowIconsValue: boolean) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
	onDataFromChild,
	onKPIChange,
	onCustomDashboardToggle,
	onShowIconsChange,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(true);
	const [showIconsOnly, setShowIconsOnly] = useState<boolean>(false);
	const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
	const [openSubMenu, setOpenSubMenu] = useState<KPI | null>(null);
	const [dashboardAtTop, setDashboardAtTop] = useState<boolean>(false);
	const [selectedKPIs, setSelectedKPIs] = useState<SelectedKPIs>({
		['Fuel Efficiency']: true,
	});
	const [selectedKPIs1, setSelectedKPIs1] = useState<SelectedKPIs>({
		['Fuel Efficiency']: true,
	});

	const [showCheckboxes, setShowCheckboxes] = useState(true);

	const customDashboardKPI: Record<KPI, string[]> = {
		'Fuel Efficiency': [
			'Fuel Usage',
			'Total Refuel',
			'Total Drainage (L)',
			'Total Fillings Count',
			'Average Fuel Level',
			'Total Fuel Consumed',
			'Total Drainage Count (L)',
			'Fuel Average Efficiency',
			'Average Consumption (L)',
		],
		'Fleet Health': ['Maintenance Status', 'Eco Drive Average Score'],
		'Fleet Usage': [
			'Vehicles Usage',
			'Vehicle Alerts',
			'Mileage Driven (km)',
			'No. of Trips',
			'Total Idling Time (Min)',
			'Average Idling Time (Min)',
		],
		'Fleet Cost': [
			'Vehicle Acquisition Cost',
			'Vehicle Leasing Cost',
			'Fuel Cost',
			'Fuel Consumed',
			'Maintenance Cost',
			'Insurance Cost',
			'Administrative Management Cost',
			'Operational Cost',
		],
		'Sensor Data': ['Temperature (°C)'],
	};
	const customDashboardKPI1: Record<KPI, string[]> = {
		'Fuel Efficiency': [
			'Fuel Usage',
			'Total Refuel',
			'Total Drainage (L)',
			'Total Fillings Count',
			'Average Fuel Level',
			'Total Fuel Consumed',
			'Total Drainage Count (L)',
			'Fuel Average Efficiency',
			'Average Consumption (L)',
		],
		'Fleet Health': ['Maintenance Status', 'Eco Drive Average Score'],
		'Fleet Usage': [
			'Vehicles Usage',
			'Vehicle Alerts',
			'Mileage Driven (km)',
			'No. of Trips',
			'Total Idling Time (Min)',
			'Average Idling Time (Min)',
		],
		'Fleet Cost': [
			'Vehicle Acquisition Cost',
			'Vehicle Leasing Cost',
			'Fuel Cost',
			'Fuel Consumed',
			'Maintenance Cost',
			'Insurance Cost',
			'Administrative Management Cost',
			'Operational Cost',
		],
		'Sensor Data': ['Temperature (°C)'],
	};

	const handleKPIChange1 = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const { value } = event.target;
		const isChecked = event.target.checked;

		setSelectedKPIs((prevSelected) => {
			return {
				...prevSelected,
				[value]: isChecked,
			};
		});

		if (onDataFromChild) {
			onDataFromChild.onChange();
		}

		if (onKPIChange) {
			onKPIChange(value, isChecked);
		}
	};
	const handleKPIChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		isNested: boolean = false,
		kpi: string = '',
	): void => {
		const { value } = event.target;
		const isChecked = event.target.checked;
		setSelectedKPIs1((prevSelected) => {
			if (isNested) {
				return {
					...prevSelected,
					[kpi]: {
						...((prevSelected[kpi] as NestedKPIs) || {}),
						[value]: isChecked,
					},
				};
			} else {
				return {
					...prevSelected,
					[value]: isChecked,
				};
			}
		});

		if (onDataFromChild) {
			onDataFromChild.onChange();
		}

		if (onKPIChange) {
			onKPIChange(value, isChecked);
		}
	};

	const toggleSidebar = (): void => {
		setShowIconsOnly(!showIconsOnly);
		onShowIconsChange(!showIconsOnly);
	};

	const toggleCheckboxes = () => {
		setShowCheckboxes(!showCheckboxes);
	};

	const toggleDropdown = (): void => {
		setIsDropdownOpen((prev) => !prev);
		const newDashboardAtTop = dashboardAtTop;
		setDashboardAtTop(newDashboardAtTop);
		if (newDashboardAtTop) {
			setDashboardAtTop(false);
			setIsDashboardOpen(false);
			if (onCustomDashboardToggle) {
				onCustomDashboardToggle();
			}
		} else {
			setIsDashboardOpen(false);
		}
	};

	const toggleDashboardDropdown = (): void => {
		setIsDashboardOpen(!isDashboardOpen);
		if (!isDashboardOpen) setOpenSubMenu(null);
	};

	const toggleSubMenu = (kpi: KPI): void => {
		setOpenSubMenu(openSubMenu === kpi ? null : kpi);
	};

	const handleDashboardToggle = () => {
		const newDashboardAtTop = !dashboardAtTop;
		setDashboardAtTop(newDashboardAtTop);
		if (newDashboardAtTop) {
			setIsDashboardOpen(true);
			setIsDropdownOpen(false);
		} else {
			setIsDashboardOpen(false);
			setIsDropdownOpen(true);
		}
		if (onCustomDashboardToggle) {
			onCustomDashboardToggle();
		}
	};
	const { t, i18n } = useTranslation(['overview']);

	return (
		<motion.aside>
			<div className={`right-sidebar ${showIconsOnly ? 'icons-only' : ''}`}>
				<div className='choose-kpi'>
					<button
						onClick={() => {
							toggleSidebar();
							toggleCheckboxes();
						}}
						className='toggle-btn'>
						{showIconsOnly ? <ChooseFirstPage /> : <ChooseFirstPage />}
					</button>
					{!showIconsOnly && <span className='kpi-title'>{t('Choose KPIs')}</span>}
					<span className='dropdown-arrow' onClick={toggleDropdown}>
						{isDropdownOpen ? <ChenvronDownIcon /> : <ChevronRightIcon />}
					</span>
				</div>
				{isDropdownOpen && (
					<div className='kpi-lists'>
						{Object.keys(customDashboardKPI1).map((kpi) => (
							<div className='kpi-item' key={kpi}>
								{kpi === 'Fuel Efficiency' && <FuelEfficiency />}
								{kpi === 'Fleet Health' && <FleetHealth />}
								{kpi === 'Fleet Usage' && <FleetUsage />}
								{kpi === 'Fleet Cost' && <FleetCost />}
								{kpi === 'Sensor Data' && <SensorData />}
								{!showIconsOnly && showCheckboxes && <span>{t(kpi)}</span>}
								{showCheckboxes && (
									<input
										type='checkbox'
										name='kpi'
										value={kpi}
										onChange={handleKPIChange1}
										checked={selectedKPIs[kpi] === true}
										className={selectedKPIs[kpi] ? 'checked' : ''}
									/>
								)}
							</div>
						))}
					</div>
				)}

				{!showIconsOnly && (
					<div className={`custom-dashboard ${dashboardAtTop ? 'at-top' : ''}`}>
						<button
							className='dashboard-text toggle-btn'
							onClick={() => {
								handleDashboardToggle();
							}}>
							{dashboardAtTop ? (
								<DashboardDownArrow className='dashboarddown-button' />
							) : (
								<DashboardUpArrow className='dashboard-button' />
							)}
							{!showIconsOnly && (
								<span
									className={`dashboard-texts ${dashboardAtTop ? 'at-top' : ''}`}
									style={{ marginRight: '22px' }}>
									 {t('Custom Dashboard')}
								</span>
							)}
							{dashboardAtTop && (
								<span
									className='dropdown-arrow'
									onClick={(e) => {
										e.stopPropagation();
										toggleDashboardDropdown();
									}}
									style={{ opacity: 1, cursor: 'pointer' }}>
									{isDashboardOpen ? <ChenvronDownIcon /> : <ChevronRightIcon />}
								</span>
							)}
						</button>
						{isDashboardOpen && (
							<div className='dashboard-kpi-lists'>
								{Object.keys(customDashboardKPI).map((kpi) => (
									<div key={kpi} className='dashboard-kpi-item'>
										<div
											onClick={() => toggleSubMenu(kpi as KPI)}
											className={`kpi-header ${
												openSubMenu === kpi ? 'active' : ''
											}`}>
											{kpi === 'Fuel Efficiency' && <FuelEfficiency />}
											{kpi === 'Fleet Health' && <FleetHealth />}
											{kpi === 'Fleet Usage' && <FleetUsage />}
											{kpi === 'Fleet Cost' && <FleetCost />}
											{kpi === 'Sensor Data' && <SensorData />}
											{/* <span>
												t{kpi.charAt(0).toUpperCase() + kpi.slice(1)}
											</span> */}
											 <span>{t(kpi)}</span>
											{openSubMenu === kpi ? (
												<DashboardDownIcon className='nested-arrow' />
											) : (
												<DashboardRightIcon className='nested-arrow' />
											)}
										</div>

										{openSubMenu === kpi &&
											Array.isArray(customDashboardKPI[kpi as KPI]) && (
												<div className='nested-kpi-lists'>
													{customDashboardKPI[kpi as KPI].map(
														(nestedKPI) => (
															<div
																key={nestedKPI}
																className='nested-kpi-item'>
																<input
																	type='checkbox'
																	name='kpi'
																	value={nestedKPI}
																	onChange={(event) =>
																		handleKPIChange(
																			event,
																			true,
																			kpi,
																		)
																	}
																	checked={
																		Boolean(
																			(
																				selectedKPIs1[
																					kpi
																				] as NestedKPIs
																			)?.[nestedKPI],
																		) || false
																	}
																	className={
																		selectedKPIs1[kpi] &&
																		(
																			selectedKPIs1[
																				kpi
																			] as NestedKPIs
																		)[nestedKPI]
																			? 'checked'
																			: ''
																	}
																/>
																{t(nestedKPI)}
															</div>
														),
													)}
												</div>
											)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</motion.aside>
	);
};

export default RightSidebar;