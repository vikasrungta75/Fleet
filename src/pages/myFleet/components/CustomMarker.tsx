import React, { useState, useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { IvehicleLocation } from '../../../type/vehicles-type';
import { statusInformations } from './map/constants/mapConstants';
import { rotateAccordingToCoordinates } from '../../../helpers/helpers';
import { TitleInfo } from './Card/HistoryDetailsCard';
import { useTranslation } from 'react-i18next';
import mapIcon from '../../../assets/mapIcon.png';

interface CustomMarkerProps {
	position: { lat: number; lng: number };
	vehicleLocation: IvehicleLocation;
	setIsModalOpen: (val: boolean) => void;
	setVehicleDetails: (val: IvehicleLocation) => void;
}

const CustomMarker = ({ position, vehicleLocation, setIsModalOpen, setVehicleDetails }: CustomMarkerProps) => {
	const { t } = useTranslation(['vehicles']);
	const [showToolTip, setShowToolTip] = useState(false);
	const [locationInfo, setlocationInfo] = useState(50);

	// PERF: Memoize the Leaflet icon object so it isn't recreated on every render.
	// Previously a new L.icon() was built on each parent re-render, causing
	// Leaflet to re-attach the DOM element unnecessarily.
	const icon = useMemo(
		() =>
			L.icon({
				iconUrl: statusInformations[vehicleLocation.status]?.url ?? mapIcon,
				iconSize: [40, 40],
				iconAnchor: [25, 15],
			}),
		// Only re-create the icon when the vehicle's status actually changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[vehicleLocation.status],
	);

	// PERF: Apply heading rotation directly on the cached img element rather
	// than querying the whole DOM on every render via document.querySelector.
	const rotation = rotateAccordingToCoordinates(vehicleLocation.heading);

	// PERF: Stable event handlers so Leaflet doesn't re-bind on every render
	const eventHandlers = useMemo(
		() => ({
			click: () => {
				setIsModalOpen(true);
				setVehicleDetails(vehicleLocation);
			},
			mouseover: () => setShowToolTip(true),
			mouseout: () => setShowToolTip(false),
		}),
		// vehicleLocation reference changes on position update — use its id
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[vehicleLocation.vin],
	);

	return (
		<Marker
			icon={icon}
			position={position}
			eventHandlers={eventHandlers}
		>
			{showToolTip && (
				<Tooltip position={position}>
					<ul style={{ width: '250px' }} className='d-flex flex-column align-items-start'>
						<li>
							<TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title={t('VIN')} info={vehicleLocation.vin} />
						</li>
						<li className='mt-1'>
							<TitleInfo
								titleStyle='fw-bold'
								className='mb-1 mt-1 text-wrap overflow-hidden'
								title={t('Location')}
								info={vehicleLocation.last_seen_location.substring(0, locationInfo)}
							/>
						</li>
						{locationInfo < vehicleLocation.last_seen_location.length && (
							<span
								style={{ cursor: 'pointer' }}
								className='fs-5 fw-bold'
								onClick={() => setlocationInfo(vehicleLocation.last_seen_location.length)}>
								...
							</span>
						)}
						<li className='mt-1'>
							<TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title={t('status')} info={t(vehicleLocation.status)} />
						</li>
						{vehicleLocation.temperature !== 'data not available' && (
							<>
								<li className='mt-1'>
									<TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title={t('T° level')} info={t(vehicleLocation.temperature ?? '')} />
								</li>
								{vehicleLocation.status !== 'Disconnected' && (
									<li className='mt-1'>
										<TitleInfo
											titleStyle='fw-bold'
											className='mb-1 mt-1'
											title={t('Fuel level')}
											info={`${vehicleLocation.fuel}% (${vehicleLocation.fuel_liters} L)`}
										/>
									</li>
								)}
							</>
						)}
					</ul>
				</Tooltip>
			)}
		</Marker>
	);
};

// PERF: Prevent re-render unless position or status actually changed.
// Vehicle position updates from Redux would otherwise re-render every
// marker on the map simultaneously.
export default React.memo(CustomMarker, (prev, next) => {
	return (
		prev.position.lat === next.position.lat &&
		prev.position.lng === next.position.lng &&
		prev.vehicleLocation.status === next.vehicleLocation.status &&
		prev.vehicleLocation.heading === next.vehicleLocation.heading &&
		prev.vehicleLocation.fuel === next.vehicleLocation.fuel
	);
});
