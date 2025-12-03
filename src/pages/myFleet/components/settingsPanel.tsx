import React, { FC, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Icon from '../../../components/icon/Icon';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface SettingsPanelProps {
	isTrafficSelected: boolean;
	mapType: string;
	setIsTrafficSelected: (isTrafficSelected: boolean) => void;
	setIsSettingVisible: (isSettingVisible: boolean) => void;
	setmapType: (setmapType: string) => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
	isTrafficSelected,
	setIsTrafficSelected,
	setIsSettingVisible,
	setmapType,
	mapType,
}) => {
	const { t } = useTranslation(['vehicles']);
	const [mapOptions, setmapOptions] = useState(false);
	const dispatch = useDispatch();
	return (
		<>
			<Card style={{ right: '7em' }} className='cardSettingMap'>
				<CardBody className='cardMapBody'>
					<div className='d-flex flex-column bd-highlight mb-3 gap-1'>
						<div
							className={`${
								isTrafficSelected ? 'fw-bold' : ''
							} ps-3 pt-3 bd-highlight settingOptionPanel`}
							onClick={() => {
								setIsTrafficSelected(!isTrafficSelected);
							}}>
							{t('Traffic')}
						</div>
						<div
							onClick={() => {
								dispatch.appStoreNoPersist.changeFleetDetailMap({});
								dispatch.appStoreNoPersist.changeInputSearchBarMyFleet('');
								dispatch.vehicles.changeShowAllVehicle(true);
								dispatch.appStoreNoPersist.changeSelectedTrajectHistory([]);
								dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);

								setIsSettingVisible(false);
							}}
							className='ps-3 pt-3 bd-highlight settingOptionPanel'>
							{t('Show all vehicles')}
						</div>
						<div
							onClick={() => setmapOptions(!mapOptions)}
							style={{ cursor: 'pointer' }}
							className='d-flex bd-highlight'>
							<div className='d-flex justify-content-between align-items-center pt-3 px-3 w-100 bd-highlight settingOptionPanel'>
								{t('Map')}
								<Icon
									icon={mapOptions ? 'KeyboardArrowUp' : 'KeyboardArrowDown'}
									size='lg'
								/>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>
			{mapOptions && (
				<Card
					style={{ right: '7em', top: '-2em', backgroundColor: '#E4E4E4' }}
					className='cardSettingMap'>
					<CardBody className='cardMapBody'>
						<div className='d-flex flex-column bd-highlight mb-3 gap-1'>
							<div
								onClick={() => {
									setmapType(mapType === 'terrain' ? 'hybrid' : 'terrain');
									setIsSettingVisible(false);
								}}
								className='ps-3 pt-3 bd-highlight settingOptionPanel'>
								{mapType === 'terrain' ? t('Satellite') : t('Terrain')}
							</div>
							{/* <div className='ps-3 pt-3 bd-highlight settingOptionPanel'>OSM</div>
							<div className='ps-3 pt-3 bd-highlight settingOptionPanel'>
								Google Map
							</div> */}
						</div>
					</CardBody>
				</Card>
			)}
		</>
	);
};

export default SettingsPanel;
