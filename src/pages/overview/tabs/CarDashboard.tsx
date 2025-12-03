import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ICarDashboardProps {
	dateRangeFilter: any; // Define more specific types here if needed
	selectedKPIs: { [key: string]: boolean };
	showIcons: boolean; // Ensure the type matches
}
const CarDashboard: FC<ICarDashboardProps> = ({ showIcons }) => {
	const { t } = useTranslation(['overview']);

	return (
		<div
			className={showIcons ? 'w-85' : 'w-7'}
			style={{
				marginTop: '6px', 
			}}>
			<div
				className='card rounded-2'
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '20px',
					height: '580px',
				}}>
				<div
					className='car-icon-container'
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<div className='car' style={{ marginBottom: '10px' }}>
						<img
							src='carImage.png'
							alt={t('Car')}
							style={{ height: '150px', objectFit: 'contain' }}
						/>
					</div>
					<div className='map-icon' style={{ marginBottom: '35px' }}>
						<img
							src='mapImage.png'
							alt={t('Map')}
							style={{ height: '50px', objectFit: 'contain' }}
						/>
					</div>
				</div>
				<div className='text-container' style={{ textAlign: 'center', marginTop: '35px' }}>
					  {t('Select your dashboard from the list on the left')}
				</div>
			</div>
		</div>
	);
};

export default CarDashboard;
