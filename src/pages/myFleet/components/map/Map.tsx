import React, { useEffect, useState, useContext, Dispatch } from 'react';
import { defaultCenter, listImg, settingImg } from './constants/mapConstants';
import i18n from '../../../../i18n';
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
interface MapEventsHandlerProps {
	dispatch: Dispatch<any>;
	geofencePointOfInterestIsOpen: boolean;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
	dispatch,
	geofencePointOfInterestIsOpen,
}) => {
	useMapEvents({
		dragend: (e) => {
			const map = e.target;
			const newCenter = map.getCenter();
			dispatch({
				type: 'HANDLE_CENTER_POINT_INTEREST',
				payload: {
					lat: newCenter.lat,
					lng: newCenter.lng,
				},
			});
		},
		click: (e) => {
			if (geofencePointOfInterestIsOpen) {
				dispatch({
					type: 'HANDLE_CHANGE_POINT_INTEREST',
					payload: {
						lat: e.latlng.lat,
						lng: e.latlng.lng,
					},
				});
			}
		},
	});

	return null;
};

const GlobalMap = (props: MapProps) => {
	const { mobileDesign } = useContext(ThemeContext);
	const {
		setMap,
		children,
		isFullScreen,
		setIsFullScreen,
		setvehicleSelectedCard,
		setWheelStateEvent,
		map,
		setIsModalOpen,
	} = props;

	const [isExpanded, setIsExpanded] = useState(false);
	const handleToggleExpand = () => {
		setIsExpanded((prev) => !prev);
	};

	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);
	const [isTrafficSelected, setIsTrafficSelected] = useState<boolean>(false);
	const [mapCenter, setmapCenter] = useState<typeof defaultCenter>(defaultCenter);
	const [showSearchAutoComplete, setShowSearchAutoComplete] = useState<boolean>(false);
	const [lineGraphState, setlineGraphState] = useState<{
		vitess: boolean;
		temperature: boolean;
		fuel: boolean;
	}>({
		vitess: false,
		temperature: false,
		fuel: false,
	});

	useEffect(() => {}, [isFullScreen, t]);

	const searchAutoCompleteToggle = () => {
		setShowSearchAutoComplete(!showSearchAutoComplete);
	};

	useEffect(() => {
		if (!showSearchAutoComplete) {
			dispatch.appStoreNoPersist.changeFleetDetailMap({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showSearchAutoComplete]);

	useEffect(() => {
		const buttonTraffic = document.getElementById('TrafficButton');
		if (buttonTraffic) {
			if (isTrafficSelected) {
				buttonTraffic.className = 'mapBtn active-btn';
			} else {
				buttonTraffic.className = 'mapBtn';
			}
		}

		const searchAutoComplet = document.getElementById('SearchAutoComplete');
		if (searchAutoComplet) {
			if (showSearchAutoComplete) {
				searchAutoComplet.style.display = 'flex';
			} else {
				searchAutoComplet.style.display = 'none';
			}
		}
	}, [isTrafficSelected, showSearchAutoComplete]);

	const mapBtnSettings = [
		<MapButton
			key={1}
			className='invisible'
			id='settingButton'
			icon={settingImg}
			title={t('Settings')}
			text=''
			onClick={() => {
				handleFunctionSetting();
			}}
		/>,
	];

	// const refMap: any = useRef(null);
	const [isVisible, setCardShowing] = useState(false);

	const handleCardVisibility = () => {
		setCardShowing(!isVisible);
	};
	const [isSettingVisible, setIsSettingVisible] = useState(false);
	const [isPOIVisible, setIsPOIVisible] = useState(false);

	const handleFunctionSetting = () => {
		setIsSettingVisible(!isSettingVisible);
	};

	const handleFunctionPOI = () => {
		setIsPOIVisible(!isPOIVisible);
		dispatch.appStoreNoPersist.handleStateMapPointInterest(!isPOIVisible);
	};

	const [mapType, setmapType] = useState('terrain');

	const [mapType1, setmapType1] = useState('mapbox'); // OSM as default

	const { geofencePointOfInterestIsOpen, selectedTrajectHistory } = useSelector(
		(state: RootState) => state.appStoreNoPersist,
	);

	const [data, setdata] = useState<any>([]);
	useEffect(() => {
		// Check if there are selected items and they are of type 'road'
		if (selectedTrajectHistory.length > 0) {
			// Initialize an array to store combined speed data
			const combinedSpeedData: any = [];

			// Iterate over each selected item
			selectedTrajectHistory.forEach((item) => {
				if (item.type === 'raod') {
					const speedData = item.datetime.map((dateObj, index) => {
						const datetime = new Date(dateObj.$date).toLocaleString();
						const speedValue = parseFloat(item.speed[index].match(/\d+/)[0]);

						return { datetime, speed: speedValue };
					});

					// Concatenate speed data from the current selected item to the combined array
					combinedSpeedData.push(...speedData);
				}
				// Map datetime and speed data from the current selected item
			});

			// Set the combined speed data to state
			setdata(combinedSpeedData);
		} else {
			// Reset data if there are no selected items or they are not of type 'road'
			setdata([]);
		}
	}, [selectedTrajectHistory]);

	const [mapZoom, setMapZoom] = useState(2); // State to track zoom level

	const renderMap = () => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const MapLoader = ({ setMap }: { setMap: (map: any) => void }) => {
			// eslint-disable-next-line @typescript-eslint/no-shadow
			const map = useMap(); // Get the current map instance
			useEffect(() => {
				setMap(map); // Set map instance to parent state
			}, [map, setMap]);
			return null;
		};

		const styles = [
			{
				featureType: 'administrative.country',
				elementType: 'geometry.stroke',
				stylers: [
					{
						visibility: 'off', // Hide the country borders
					},
				],
			},
			{
				featureType: 'administrative.country',
				elementType: 'labels',
				stylers: [
					{
						visibility: 'off', // Hide the country borders
					},
				],
			},
		];

		const handleCenterChanged = () => {
			if (map) {
				const newCenter = map.getCenter();
				dispatch.appStoreNoPersist.handleCenterPointInterest({
					lat: newCenter.lat(),
					lng: newCenter.lng(),
				});
			}
		};

		return (
			<div
				onWheel={() => {
					setWheelStateEvent(true);
					dispatch.vehicles.changeShowAllVehicle(false);
				}}
				className={` ${isFullScreen ? 'col-sm-12' : 'col-sm-7 ps-0'}`}>
				<div
					className={`${mobileDesign ? 'mapContainer ' : ''} "position-relative" `}
					style={{ flex: '1', display: 'flex' }}>
					<div
						className='position-absolute d-flex flex-column align-items-start'
						style={{
							top: 2,
							left: 20,
							zIndex: 401,
							gap: 0,
						}}>
						{isVisible ? (
							<CardMap
								key={3}
								setIsSettingVisible={handleCardVisibility}
								setIsModalOpen={setIsModalOpen}
							/>
						) : (
							<MapButton
								key={2}
								id='myFleet'
								icon={listImg}
								text={t('My Fleet')}
								title=''
								onClick={handleCardVisibility}
								tooltip={t('My Fleet')}
							/>
						)}
					</div>
					<div
						className='position-absolute'
						style={{ height: 50, width: 53, right: 45, zIndex: 401 }}>
						<MapButton
							key={2}
							id='SettingButton'
							icon={settingImg}
							text={''}
							title=''
							onClick={handleFunctionSetting}
						/>
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
					<div
						className='position-absolute'
						style={{ height: 50, width: 53, right: 100, zIndex: 401 }}>
						<EditLocationMapButton
							className={
								isPOIVisible ? 'colored-button border-button-geofence-colored' : ''
							}
							key={5}
							id='SettingButton'
							icon={
								<SvgEditLocationAlt
									fontSize={'large'}
									color={isPOIVisible ? '#f1156e' : ''}
								/>
							}
							text={''}
							title=''
							onClick={handleFunctionPOI}
						/>
					</div>
					<div
						className='position-absolute'
						style={{ height: 50, width: 40, right: 68, zIndex: 401, top: 10 }}>
						{isPOIVisible && (
							<PointOfInterest
								isPOIVisible={isPOIVisible}
								setIsPOIVisible={setIsPOIVisible}
								key={3}
							/>
						)}
					</div>
					<MapContainer
						center={mapCenter}
						zoom={mapZoom}
						style={{
							height: selectedTrajectHistory.length > 0 ? '100vh' : '100vh',
							width: '100%',
						}}
						zoomControl={false}>
						{/* TileLayer for the map background */}

						{/* Conditional TileLayer */}
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

						{/* Load Map Instance */}
						<MapLoader setMap={setMap} />

						<MapEventsHandler
							dispatch={dispatch}
							geofencePointOfInterestIsOpen={geofencePointOfInterestIsOpen}
						/>

						{/* Zoom Control moved to the top-right */}
						<ZoomControl position='topright' />

						{/* Traffic Layer or other layers can be added here */}
						{isTrafficSelected && (
							<TileLayer
								url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
								attribution='&copy; OpenTopoMap contributors'
							/>
						)}
						{/* Child components */}
						{children}
					</MapContainer>
					<div
						className=''
						style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
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
			</div>
		);
	};

	return renderMap();
};

export default GlobalMap;
