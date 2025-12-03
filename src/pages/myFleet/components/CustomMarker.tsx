import React, { useState } from 'react';
// import { Marker, MarkerProps, InfoWindow, GoogleMap } from '@react-google-maps/api';
import { Marker, Tooltip, } from 'react-leaflet';
import L from 'leaflet';
import { IvehicleLocation } from '../../../type/vehicles-type';
import { statusInformations1 } from './map/constants/mapConstants1';
import { rotateAccordingToCoordinates } from '../../../helpers/helpers';
import active from '../../../assets/svg/custom-active.svg';
import { TitleInfo } from './Card/HistoryDetailsCard';
import { useTranslation } from 'react-i18next';
import mapIcon from '../../../assets/mapIcon.png';
interface CustomMarkerProps {
    position: {
        lat: number;
        lng: number;
    };
    // clusterer: MarkerProps['clusterer'];
    vehicleLocation: IvehicleLocation;
    setIsModalOpen: (val: boolean) => void;
    setVehicleDetails: (val: IvehicleLocation) => void;
}
 
const CustomMarker = (props: CustomMarkerProps) => {
    const { position, vehicleLocation, setIsModalOpen, setVehicleDetails } = props;
    const { t } = useTranslation(['vehicles']);
 
    const icon = L.icon({
        iconUrl: statusInformations1[vehicleLocation.status]?.url ?? "default-icon.png",
        iconSize: [40, 40],  // Width and height of the icon
        iconAnchor: [25, 15], // Anchor point
    });
    const customIcon = L.icon({
        iconUrl: mapIcon, // Replace with your icon URL
        iconSize: [28, 35], // Size of the icon
        iconAnchor: [22, 94], // Point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76], // Point from which the popup should open relative to the iconAnchor
    });
 
    const activeMarker: HTMLImageElement | null = document.querySelector(
        `[src="${active}?${vehicleLocation.registration_no}"]`,
    );
    if (activeMarker) {
        const rotation = rotateAccordingToCoordinates(vehicleLocation.heading);
 
        // when it hasn't loaded, it's null
        activeMarker.style.transform = `rotate(${rotation}deg)`;
    }
 
    const [showToolTip, setShowToolTip] = useState(false);
 
    const [locationInfo, setlocationInfo] = useState(50);
    return (
        <Marker
            // icon={customIcon}
            icon={icon}
            position={position}
            // clusterer={clusterer}
            eventHandlers={{
                click: () => {
                    setIsModalOpen(true);
                    setVehicleDetails(vehicleLocation);
                },
                mouseover: () => setShowToolTip(true),
            }}
        >
            {showToolTip && (
                <Tooltip position={position}>
                    <ul
                        style={{ width: '250px' }}
                        className='d-flex  flex-column align-items-start '>
                        <li>
                            <TitleInfo
                                titleStyle='fw-bold'
                                className='mb-1 mt-1'
                                title={t('VIN')}
                                info={vehicleLocation.vin}
                            />
                        </li>
                        <li className="mt-1">
                            <TitleInfo
                                titleStyle="fw-bold"
                                className="mb-1 mt-1 text-wrap overflow-hidden"
                                title={t("Location")}
                                info={vehicleLocation.last_seen_location.substring(0, locationInfo)}
                            />
                        </li>
 
                        {locationInfo !== vehicleLocation.last_seen_location.length && (
                            <span
                                style={{ cursor: 'pointer' }}
                                className='fs-5 fw-bold'
                                onClick={() =>
                                    setlocationInfo(vehicleLocation.last_seen_location.length)
                                }>
                                ...
                            </span>
                        )}
 
                        <li className='mt-1'>
                            <TitleInfo
                                titleStyle='fw-bold'
                                className='mb-1 mt-1'
                                title={t('status')}
                                info={t(vehicleLocation.status)}
                            />
                        </li>
                        {vehicleLocation.temperature != 'data not available' && (
                            <>
                                <li className='mt-1'>
                                    <TitleInfo
                                        titleStyle='fw-bold'
                                        className='mb-1 mt-1'
                                        title={t('T° level')}
                                        info={t(vehicleLocation.temperature ?? '')}
                                    />
                                </li>
                                {vehicleLocation.status != 'Disconnected' && (
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
 
export default CustomMarker;