import React, { useContext, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
// import { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../../contexts/themeContext';
// import '../../../../styles/pages/_vehicles.scss';
import { useDispatch, useSelector } from 'react-redux';
import {
	cercle,
	cercleColored,
	exitFullScreenImg,
	fullScreenImg,
	polygone,
	polygoneColored,
} from '../../../myFleet/components/map/constants/mapConstants';
import { RootState } from '../../../../store/store';
// import 'leaflet/dist/leaflet.css';
import mapboxIcon from '../../../../assets/maps1.png';
import OSMIcon from '../../../../assets/maps.png';
import SearchInput from './SearchInput'; // import the componen
import markerIconImg from '../../../../assets/dot.png'; // your marker icon
// Export MapType so other files can import it
export type MapType = LeafletMap;

type MapProps = React.PropsWithChildren<{
	setMap: (map: MapType) => void | Promise<void>;
	cercleGeofence: any;
	isFullScreen: boolean;
	setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
	setGeofenceShape: (value: any) => void;
	GeofenceShape: {
		polygone: boolean;
		circle: boolean;
	};
	inMyFleet: boolean;
}>;

const GeofenceMap = (props: MapProps) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['vehicles']);
	const dispatch = useDispatch();
	const [mapType1, setmapType1] = useState('mapbox'); // OSM as default
	const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

	const [isMapInteractive, setIsMapInteractive] = useState(true);


	const {
		setMap,
		children,
		cercleGeofence,
		isFullScreen,
		setGeofenceShape,
		GeofenceShape,
		inMyFleet,
	} = props;

	const mapRef = useRef<L.Map>(null);

	const {
		geofencePointCenter,
		startGeofencePointOfInterestIsOpen,
		endGeofencePointOfInterestIsOpen,
	} = useSelector((state: RootState) => state.appStoreNoPersist);

	useEffect(() => {
		const buttonFullScreen = document.getElementById('FullScreenButton');
		if (buttonFullScreen) {
			if (isFullScreen) {
				buttonFullScreen.innerHTML = `<img src=${exitFullScreenImg} /> ${t(
					'Exit_FullScreen',
				)}`;
				buttonFullScreen.title = 'Click to exit fullscreen';
			} else {
				buttonFullScreen.innerHTML = `<img src=${fullScreenImg} /> ${t('Fullscreen')}`;
				buttonFullScreen.title = 'Click to fill the screen';
			}
		}
	}, [isFullScreen, t]);

	// Component to handle map click events
	const MapClickHandler = () => {
		useMapEvents({
			click(e) {
				if (startGeofencePointOfInterestIsOpen) {
					dispatch.appStoreNoPersist.handleStartPointInterest({
						lat: e.latlng.lat,
						lng: e.latlng.lng,
					});
				}
				if (endGeofencePointOfInterestIsOpen) {
					dispatch.appStoreNoPersist.handleEndPointInterest({
						lat: e.latlng.lat,
						lng: e.latlng.lng,
					});
				}
			},
		});
		return null;
	};

	useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isMapInteractive) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
    } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
    }
}, [isMapInteractive]);


	return (
		<div
			className={`${mobileDesign ? 'mapContainer ' : ''} position-relative`}
			style={{ flex: '1', display: 'flex' }}>
			<MapContainer
				center={!inMyFleet ? cercleGeofence : geofencePointCenter}
				zoom={2}
				style={{
					height: !inMyFleet ? '100vh' : '100vh',
					width: '100%',
				}}
				// ref={(mapInstance: LeafletMap | null) => {
				// 	if (mapInstance) setMap(mapInstance);
				// }}
				ref={mapRef}>
				{mapType1 === 'osm' ? (
					<TileLayer
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
						attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
					/>
				) : (
					<TileLayer
						url='https://api.mapbox.com/styles/v1/ravityuser/cm8hb2rkw010r01seazlfg7ji/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmF2aXR5dXNlciIsImEiOiJjbTg3ZGdhYmcwMXpoMmpzNTZhaml2c3dzIn0.lkSf3NVPiIIwFiYHY0EO9A'
						attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
					/>
				)}
				<MapClickHandler />
				{/* <SearchInput mapRef={mapRef} /> */}

				<SearchInput mapRef={mapRef} setMarkerPosition={setMarkerPosition} setIsMapInteractive={setIsMapInteractive}  />

				{markerPosition && (
					<Marker
						position={markerPosition}
						icon={L.icon({
							iconUrl: markerIconImg,
							iconSize: [20, 20],
							iconAnchor: [15, 30],
						})}
					/>
				)}
				{children}
			</MapContainer>
			<div className='' style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
				<div onClick={() => setmapType1(mapType1 === 'osm' ? 'mapbox' : 'osm')}>
					<img
						src={mapType1 === 'osm' ? mapboxIcon : OSMIcon}
						alt={mapType1 === 'osm' ? 'Mapbox' : 'OSM Map'}
						style={{
							width: '120px',
							height: '120px',
							objectFit: 'contain',
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default GeofenceMap;
