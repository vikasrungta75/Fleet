import React, { FC, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/bootstrap/Button';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../components/bootstrap/Dropdown';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';
import { ilStyle } from './map/constants/mapConstants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Spinner from '../../../components/bootstrap/Spinner';

interface IFleetStatusFiltersProps {
	setOptionFilteGroupFleet: (string: string) => void;
	setWheelStateEvent: (WheelStateEvent: boolean) => void;
	setButtonFilterClicked: (ButtonFilterClicked: boolean) => void;
	setloadingFilterStatus: (loadingFilterStatus: boolean) => void;
	setvehicleSelectedCard: (vehicleSelectedCard: any) => void;
	allVehiclesStatus: { [key: string]: number | string };
	payloadIsChanged: boolean;
	loadingFilterStatus: boolean;
	refetchVehicleLocation: any;
	isFetched: any;
}

const FleetStatusFilters: FC<IFleetStatusFiltersProps> = ({
	setOptionFilteGroupFleet,
	allVehiclesStatus,
	payloadIsChanged,
	setWheelStateEvent,
	setButtonFilterClicked,
	setloadingFilterStatus,
	setvehicleSelectedCard,
	loadingFilterStatus,
	refetchVehicleLocation,
	isFetched,
}) => {
	const dispatch = useDispatch();
	const { showAllVehiclesMap } = useSelector((state: RootState) => state.vehicles);

	const { t } = useTranslation(['vehicles']);
	const [activeFilter, setActiveFilter] = useState('Total');

	const { mobileDesign } = useContext(ThemeContext);
	const [isOpen, setIsOpen] = useState(false);
	const statusFilters = [
		{ label: 'Total', value: 'total_vehicles', filteredGroup: 'Total', color: 'dark' },
		{
			label: 'Active',
			value: 'active_vehicles',
			filteredGroup: 'Running',
			color: 'custom-green',
		},
		{
			label: 'Idle',
			value: 'idle_vehicles',
			filteredGroup: 'Idle',
			color: 'warning',
		},
		{
			label: 'Parked',
			value: 'parked_vehicles',
			filteredGroup: 'Parked',
			color: 'custom-blue',
		},
		{
			label: 'Stopped',
			value: 'stopped_vehicles',
			filteredGroup: 'Stopped',
			color: 'danger',
		},
		{
			label: 'Disconnected',
			value: 'disconnected_vehicles',
			filteredGroup: 'Disconnected',
			color: 'custom-grey',
		},
		{
			label: 'Trouble',
			value: 'trouble_vehicles',
			filteredGroup: 'Trouble',
			color: '',
		},
	];

	useEffect(() => {
		if (isFetched && loadingFilterStatus) {
			setloadingFilterStatus(false);
		}

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFetched]);

	useEffect(() => {
		if (showAllVehiclesMap) {
			setOptionFilteGroupFleet('Total');
			setActiveFilter('Total');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showAllVehiclesMap]);

	return mobileDesign ? (
		<Dropdown className='w-100' isOpen={isOpen} setIsOpen={setIsOpen}>
			<DropdownToggle hasIcon={true}>
				<Button shadow='default' className='w-100 '>
					<Icon icon='InfoOutline' color='secondary' size='lg' className='me-2' />
					{t('Summary fleet information')}
				</Button>
			</DropdownToggle>
			<DropdownMenu size='lg' className='w-100'>
				{allVehiclesStatus
					? statusFilters?.map(({ label, value, filteredGroup, color }, index) => {
							return (
								<div
									key={index}
									style={ilStyle}
									onClick={() => {
										if (allVehiclesStatus[value as string] !== '0') {
											dispatch.vehicles.changeShowAllVehicle(false);
											setWheelStateEvent(false);
											setOptionFilteGroupFleet(filteredGroup);
											setActiveFilter(label);
											setIsOpen(false);
											setButtonFilterClicked(true);
											setvehicleSelectedCard(undefined);
										}
									}}
									className={`nav-item${
										activeFilter === label ? '--active' : ''
									} `}>
									<div>
										{t(`${label} vehicles`)} :{' '}
										<span
											className={`ms-2 text-${
												activeFilter === label ? 'light' : color
											}`}>
											{allVehiclesStatus[value as string] || 0}
										</span>
									</div>
								</div>
							);
					  })
					: null}
			</DropdownMenu>
		</Dropdown>
	) : (
		<nav className='navbar navbar-expand-lg px-2' style={{ height: 60 }}>
			<div className='container-fluid'>
				<ul className='navbar-nav me-auto mb-2 mb-lg-0' style={{ display: 'contents' }}>
					{allVehiclesStatus
						? statusFilters.map(({ label, value, filteredGroup, color }, index) => {
								return (
									<li
										key={index}
										style={{
											cursor:
												allVehiclesStatus[value as string] === '0'
													? 'no-drop'
													: 'pointer',
											borderBottom: 'groove black',
										}}
										onClick={() => {
											if (allVehiclesStatus[value as string] !== '0') {
												dispatch.vehicles.changeShowAllVehicle(false);
												setWheelStateEvent(false);
												setOptionFilteGroupFleet(filteredGroup);
												setActiveFilter(label);
												setButtonFilterClicked(true);
												setvehicleSelectedCard(undefined);
												setloadingFilterStatus(true);
												// refetchVehicleLocation();
											}
										}}
										className={`nav-item${
											activeFilter === label ? '--active' : ''
										} `}>
										<div className='d-flex justify-content-between'>
											{t(`${label} vehicles`)} :{' '}
											{(payloadIsChanged || loadingFilterStatus) &&
											activeFilter === label ? (
												<>
													<span
														className={`text-${
															activeFilter === label ? 'light' : color
														}`}>
														<div className='d-flex justify-content-center h-100 align-items-center ms-2'>
															<Spinner
																color='secondary'
																size='1rem'
															/>
														</div>
													</span>
												</>
											) : (
												<>
													<span
														className={`ms-1 text-${
															activeFilter === label ? 'light' : color
														}`}>
														{allVehiclesStatus[value as string] || 0}
													</span>
												</>
											)}
										</div>
									</li>
								);
						  })
						: null}
				</ul>
			</div>
		</nav>
	);
};

export default FleetStatusFilters;
