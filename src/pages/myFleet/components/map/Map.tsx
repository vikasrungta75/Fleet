import React, { useEffect, useState, useContext, Dispatch, useCallback, useMemo } from 'react';
import { defaultCenter, listImg, settingImg } from './constants/mapConstants';
import { useDispatch, useSelector } from 'react-redux';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import CardMap from '../Card/CardContainer';
import { MapType } from './type/type/mapType';
import MapButton from './components/MapButton';
import SettingsPanel from '../settingsPanel';
import SvgEditLocationAlt from '../../../../components/icon/material-icons/EditLocationAlt';
import EditLocationMapButton from './components/EditLocationMapButton';
import PointOfInterest from '../PointOfInterest';
import { RootState } from '../../../../store/store';
import OSMIcon from '../../../../assets/maps.png';
import mapboxIcon from '../../../../assets/maps1.png';
import { MapContainer, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { shallowEqual } from 'react-redux';
import 'leaflet/dist/leaflet.css';

type MapProps = React.PropsWithChildren<{
	setMap: (map: MapType) => void | Promise<void>;
	setWheelStateEvent: (WheelStateEvent: boolean) => void | Promise<void>;
	setvehicleSelectedCard: (vehicleSelectedCard: any) => void | Promise<void>;
	isFullScreen: boolean;
	setIsFullScreen: any;
	map: any;
	latitude: number;
	longitude: number;
	zoom: number;
	bearing: number;
	pitch: number;
	setIsModalOpen: (isOpen: boolean) => void;
}>;

// PERF: Isolated selector — only subscribes to the two fields this component needs.
// Previously the whole appStoreNoPersist slice was selected, so every vehicle
// position update caused the entire Map shell to re-render.
const selectMapState = (state: RootState) => ({
	geofencePointOfInterestIsOpen: state.appStoreNoPersist.geofencePointOfInterestIsOpen,
	selectedTrajectHistory:        state.appStoreNoPersist.selectedTrajectHistory,
});

interface MapEventsHandlerProps {
	dispatch: Dispatch<any>;
	geofencePointOfInterestIsOpen: boolean;
}

// PERF: Kept as a separate component so it only re-renders when its own
// props change, not when siblings or parents update.
const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
	dispatch,
	geofencePointOfInterestIsOpen,
}) => {
	useMapEvents({
		dragend: (e) => {
			const newCenter = e.target.getCenter();
			dispatch({
				type: 'HANDLE_CENTER_POINT_INTEREST',
				payload: { lat: newCenter.lat, lng: newCenter.lng },
			});
		},
		click: (e) => {
			if (geofencePointOfInterestIsOpen) {
				dispatch({
					type: 'HANDLE_CHANGE_POINT_INTEREST',
					payload: { lat: e.latlng.lat, lng: e.latlng.lng },
				});
			}
		},
	});
	return null;
};

// PERF: Hoisted outside GlobalMap so it isn't re-defined on every render.
const MapLoader = ({ setMap }: { setMap: (map: any) => void }) => {
	const map = useMap();
	useEffect(() => { setMap(map); }, [map, setMap]);
	return null;
};

const GlobalMap = (props: MapProps) => {
	const { mobileDesign } = useContext(ThemeContext);
	const {
		setMap, children, isFullScreen, setIsFullScreen,
		setvehicleSelectedCard, setWheelStateEvent, map, setIsModalOpen,
	} = props;

	const [isExpanded, setIsExpanded]         = useState(false);
	const [isVisible, setCardShowing]         = useState(false);
	const [isSettingVisible, setIsSettingVisible] = useState(false);
	const [isPOIVisible, setIsPOIVisible]     = useState(false);
	const [isTrafficSelected, setIsTrafficSelected] = useState<boolean>(false);
	const [mapCenter]                         = useState<typeof defaultCenter>(defaultCenter);
	const [showSearchAutoComplete, setShowSearchAutoComplete] = useState<boolean>(false);
	const [mapType, setmapType]               = useState('terrain');
	const [mapType1, setmapType1]             = useState('mapbox');
	const [mapZoom]                           = useState(2);

	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);

	// PERF: Narrow selector with shallowEqual
	const { geofencePointOfInterestIsOpen, selectedTrajectHistory } = useSelector(
		selectMapState,
		shallowEqual,
	);

	// PERF: Stable callbacks — previously inline arrow functions caused
	// child components to re-render even when nothing changed.
	const handleCardVisibility    = useCallback(() => setCardShowing((p) => !p), []);
	const handleFunctionSetting   = useCallback(() => setIsSettingVisible((p) => !p), []);
	const handleFunctionPOI       = useCallback(() => {
		setIsPOIVisible((p) => {
			dispatch.appStoreNoPersist.handleStateMapPointInterest(!p);
			return !p;
		});
	}, [dispatch.appStoreNoPersist]);

	const handleWheelEvent = useCallback(() => {
		setWheelStateEvent(true);
		dispatch.vehicles.changeShowAllVehicle(false);
	}, [setWheelStateEvent, dispatch.vehicles]);

	const handleToggleMapType = useCallback(
		() => setmapType1((t) => (t === 'osm' ? 'mapbox' : 'osm')),
		[],
	);

	useEffect(() => {
		if (!showSearchAutoComplete) {
			dispatch.appStoreNoPersist.changeFleetDetailMap({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showSearchAutoComplete]);

	// Sync traffic button class via DOM (kept from original)
	useEffect(() => {
		const btn = document.getElementById('TrafficButton');
		if (btn) btn.className = isTrafficSelected ? 'mapBtn active-btn' : 'mapBtn';
		const search = document.getElementById('SearchAutoComplete');
		if (search) search.style.display = showSearchAutoComplete ? 'flex' : 'none';
	}, [isTrafficSelected, showSearchAutoComplete]);

	// PERF: Memoize the tile layer URL so TileLayer doesn't re-mount on unrelated renders
	const tileUrl = useMemo(
		() =>
			mapType1 === 'osm'
				? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				: 'https://api.mapbox.com/styles/v1/ravityuser/cm8hb2rkw010r01seazlfg7ji/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmF2aXR5dXNlciIsImEiOiJjbTg3ZGdhYmcwMXpoMmpzNTZhaml2c3dzIn0.lkSf3NVPiIIwFiYHY0EO9A',
		[mapType1],
	);

	const tileAttribution = mapType1 === 'osm'
		? "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
		: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors';

	return (
		<div onWheel={handleWheelEvent} className={`${isFullScreen ? 'col-sm-12' : 'col-sm-7 ps-0'}`}>
			<div
				className={`${mobileDesign ? 'mapContainer ' : ''} "position-relative"`}
				style={{ flex: '1', display: 'flex' }}>

				{/* Fleet list toggle */}
				<div
					className='position-absolute d-flex flex-column align-items-start'
					style={{ top: 2, left: 20, zIndex: 401, gap: 0 }}>
					{isVisible ? (
						<CardMap key={3} setIsSettingVisible={handleCardVisibility} setIsModalOpen={setIsModalOpen} />
					) : (
						<MapButton key={2} id='myFleet' icon={listImg} text={t('My Fleet')} title='' onClick={handleCardVisibility} tooltip={t('My Fleet')} />
					)}
				</div>

				{/* Settings button */}
				<div className='position-absolute' style={{ height: 50, width: 53, right: 45, zIndex: 401 }}>
					<MapButton key={2} id='SettingButton' icon={settingImg} text='' title='' onClick={handleFunctionSetting} />
					{isSettingVisible && (
						<SettingsPanel
							setIsTrafficSelected={setIsTrafficSelected}
							isTrafficSelected={isTrafficSelected}
							setIsSettingVisible={setIsSettingVisible}
							setmapType={setmapType}
							mapType={mapType}
							key={3}
						/>
					)}
				</div>

				{/* POI button */}
				<div className='position-absolute' style={{ height: 50, width: 53, right: 100, zIndex: 401 }}>
					<EditLocationMapButton
						className={isPOIVisible ? 'colored-button border-button-geofence-colored' : ''}
						key={5}
						id='SettingButton'
						icon={<SvgEditLocationAlt fontSize='large' color={isPOIVisible ? '#f1156e' : ''} />}
						text='' title=''
						onClick={handleFunctionPOI}
					/>
				</div>

				{/* POI panel */}
				<div className='position-absolute' style={{ height: 50, width: 40, right: 68, zIndex: 401, top: 10 }}>
					{isPOIVisible && <PointOfInterest isPOIVisible={isPOIVisible} setIsPOIVisible={setIsPOIVisible} key={3} />}
				</div>

				<MapContainer
					center={mapCenter}
					zoom={mapZoom}
					style={{ height: '100vh', width: '100%' }}
					zoomControl={false}>

					{/* PERF: key prop on TileLayer ensures a clean swap when provider changes,
					    rather than patching attributes on the existing layer */}
					<TileLayer key={mapType1} url={tileUrl} attribution={tileAttribution} />

					<MapLoader setMap={setMap} />

					<MapEventsHandler dispatch={dispatch} geofencePointOfInterestIsOpen={geofencePointOfInterestIsOpen} />

					<ZoomControl position='topright' />

					{isTrafficSelected && (
						<TileLayer
							url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
							attribution='&copy; OpenTopoMap contributors'
						/>
					)}

					{children}
				</MapContainer>

				{/* Map type switcher */}
				<div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
					<div onClick={handleToggleMapType}>
						<img
							src={mapType1 === 'osm' ? mapboxIcon : OSMIcon}
							alt={mapType1 === 'osm' ? 'Mapbox' : 'OSM Map'}
							style={{ width: '120px', height: '120px', objectFit: 'contain' }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(GlobalMap);
