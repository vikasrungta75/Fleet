import React, { useState } from 'react';
import Nav, { NavItem } from '../../../../components/bootstrap/Nav';
import { CursorStyleNav } from '../constants/alarmConstants';
import AlarmsTabs from './tabs/AlarmsTabs';
import OverviewTabs from './tabs/OverviewTabs';
import SpeedGraphTabs from './tabs/SpeedGraphTabs';
import { useTranslation } from 'react-i18next';

const DetailTripCard = () => {
	const Tabs = [
		{ key: 'Overview', value: 'overview', id: '1' },
		// { key: 'Speed Graph', value: 'speed_graph', id: '2' },
		// { key: 'Alarms', value: 'alarms', id: '3' },
	];
	const { t } = useTranslation(['alertNotification']);
	const [Tab, setTab] = useState('overview');
	return (
		<>
			<div className='col-xl-8'>
				<Nav design='tabs'>
					{Tabs.map(({ key, value, id }) => {
						return (
							<NavItem
								key={id}
								isActive={Tab === value}
								style={CursorStyleNav}
								onClick={() => {
									setTab(value);
								}}>
								<h1>{t(`${key}`)}</h1>
							</NavItem>
						);
					})}
				</Nav>
			</div>
			{Tab === 'overview' && <OverviewTabs />}
			{/* {Tab === 'speed_graph' && <SpeedGraphTabs />}
			{Tab === 'alarms' && <AlarmsTabs />} */}
		</>
	);
};

export default DetailTripCard;
