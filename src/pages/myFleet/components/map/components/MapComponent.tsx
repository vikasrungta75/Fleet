import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { IvehicleLocation } from '../../../../../type/vehicles-type';
import Card from '../../../../../components/bootstrap/Card';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import Map from '../../map/Map';
import CustomMarker from '../../CustomMarker';
import { statusInformations } from '../constants/mapConstants';
import { TitleInfo } from '../../Card/HistoryDetailsCard';
import point from '../../../../../assets/svg/custom-point-marker.svg';
import HomePin from '../../../../../assets/svg/home_pin.svg';
import endFlag from '../../../../../assets/svg/flag-damier.svg';
import { useGetPoiList } from '../../../../../services/geofences';
import { History, LocalGasStation, Speed, Thermostat } from '../../../../../components/icon/material-icons';
import TrafficPolyline from './CustomPolyline';

interface Coordinates { lat: number; lng: number; }

interface MapComponentProps {
	filteredVehicles: IvehicleLocation[] | null;
	vehicleDetailSelected: IvehicleLocation[];
	selectedTrajectHistory: any[];
	setWheelStateEvent: (value: boolean) => void;
	setvehicleSelectedCard: (value: any) => void;
	setMap: (value: any) => void;
	setIsFullScreen: (value: boolean) => void;
	setVehicleDetails: (value: any) => void;
	setIsModalOpen: (value: boolean) => void;
	dispatch: any;
	colorsOptionMap: any;
	optionsmapFleetTraject: any;
	carcustom: string;
	geofencePointOfInterest: any;
	raduisPointOfInterest: number;
	geofencePointOfInterestIsOpen: boolean;
	map: any;
}

// PERF: Extracted to a stable top-level component so it isn't
// re-created as a new function reference on every MapComponent render,
// which would cause Leaflet to unmount and remount the entire cluster group.
const VehicleMarkers = React.memo(({
	vehicles,
	setVehicleDetails,
	setIsModalOpen,
}: {
	vehicles: IvehicleLocation[];
	setVehicleDetails: (v: any) => void;
	setIsModalOpen: (v: boolean) => void;
}) => (
	<MarkerClusterGroup chunkedLoading maxClusterRadius={60} disableClusteringAtZoom={16}>
		{vehicles.map((loc) => (
			<CustomMarker
				key={loc.vin || loc.lng}
				vehicleLocation={loc}
				position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
				setVehicleDetails={setVehicleDetails}
				setIsModalOpen={setIsModalOpen}
			/>
		))}
	</MarkerClusterGroup>
));

// PERF: Haversine distance — extracted outside component to avoid
// re-allocation on every ArrowHovered effect tick.
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findClosestIndex(targetLat: number, targetLng: number, coordinates: Coordinates[]): number {
	let closestIndex = -1;
	let minDistance = Number.MAX_VALUE;
	for (let i = 0; i < coordinates.length; i++) {
		const d = calculateDistance(targetLat, targetLng, coordinates[i].lat, coordinates[i].lng);
		if (d < minDistance) { minDistance = d; closestIndex = i; }
	}
	return closestIndex;
}

const MapComponent: React.FC<MapComponentProps> = ({
	filteredVehicles,
	vehicleDetailSelected,
	selectedTrajectHistory,
	setWheelStateEvent,
	setvehicleSelectedCard,
	setMap,
	setIsFullScreen,
	setVehicleDetails,
	setIsModalOpen,
	dispatch,
	colorsOptionMap,
	optionsmapFleetTraject,
	carcustom,
	geofencePointOfInterest,
	raduisPointOfInterest,
	geofencePointOfInterestIsOpen,
	map,
}) => {
	const [showToolTip, setShowToolTip] = useState<{ [key: number]: boolean }>({});
	const [showToolTipEndTrip, setShowToolTipEndTrip] = useState<{ [key: number]: boolean }>({});
	const { data: dataPOI } = useGetPoiList();
	const [indexOfRoadHovered, setindexOfRoadHovered] = useState(-1);
	const [ArrowHovered, setArrowHovered] = useState<{
		lat: number; lng: number; item: any; isOpen: boolean;
	}>({ lat: 0, lng: 0, item: {}, isOpen: false });

	// PERF: Memoize static Leaflet icon objects — previously recreated on every render.
	const homePinIcon = useMemo(() => L.icon({ iconUrl: HomePin, iconSize: [25, 25], iconAnchor: [12, 25] }), []);
	const pointIcon   = useMemo(() => L.icon({ iconUrl: point,   iconSize: [25, 25], iconAnchor: [12, 25] }), []);
	const endFlagIcon = useMemo(() => L.icon({ iconUrl: endFlag, iconSize: [25, 25], iconAnchor: [12, 25] }), []);

	// PERF: Memoize per-trip icons so they don't rebuild every render cycle.
	const tripIcons = useMemo(
		() =>
			selectedTrajectHistory.map((trip) => {
				const url = statusInformations[trip.status]?.url
					? `${statusInformations[trip.status].url}?${trip._id}`
					: '';
				return L.icon({ iconUrl: url, iconSize: [50, 50], iconAnchor: [25, 15] });
			}),
		// Rebuild only when the trip list identity changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedTrajectHistory.length],
	);

	useEffect(() => {
		if (Object.keys(ArrowHovered.item).length > 0) {
			const closestIndex = findClosestIndex(
				ArrowHovered.lat,
				ArrowHovered.lng,
				ArrowHovered.item.RoadTripReformed,
			);
			setindexOfRoadHovered(closestIndex);
		}
	}, [ArrowHovered]);

	// PERF: Stable handler for POI drag so the Circle/Marker don't re-bind each render
	const handlePoiDragEnd = useCallback(
		(e: any) => {
			const latlng = (e.target as L.Marker).getLatLng();
			dispatch.appStoreNoPersist.handleChangePointInterest({ lat: latlng.lat, lng: latlng.lng });
		},
		[dispatch.appStoreNoPersist],
	);

	const commonMapProps = {
		map, setWheelStateEvent, setvehicleSelectedCard, setMap,
		isFullScreen: true, setIsFullScreen,
		latitude: 0, longitude: 0, zoom: 0, bearing: 0, pitch: 0,
		setIsModalOpen,
	};

	return (
		<Card className='fleet-map rounded mh-100'>
			{(() => {
				// ── Case 1: specific vehicles selected ──────────────────────────
				if (vehicleDetailSelected.length > 0) {
					return (
						<Map {...commonMapProps}>
							<VehicleMarkers
								vehicles={vehicleDetailSelected}
								setVehicleDetails={setVehicleDetails}
								setIsModalOpen={setIsModalOpen}
							/>
						</Map>
					);
				}

				// ── Case 2: trip history selected ────────────────────────────────
				if (selectedTrajectHistory.length > 0) {
					return (
						<Map {...commonMapProps}>
							{selectedTrajectHistory.map((arg, ind) => (
								<React.Fragment key={arg._id ?? ind}>
									{arg.type === 'road' && (
										<>
											<TrafficPolyline
												path={arg.RoadTripReformed || []}
												speedData={arg.speed || []}
												options={optionsmapFleetTraject}
												setArrowHovered={setArrowHovered}
												selectedTrajectHistory={arg}
											/>

											{ArrowHovered.isOpen && (
												<Popup
													position={[ArrowHovered.lat, ArrowHovered.lng]}
													eventHandlers={{ remove: () => setArrowHovered({ lat: 0, lng: 0, item: {}, isOpen: false }) }}>
													<div className='d-flex flex-column mb-3' style={{ width: '150px' }}>
														{[
															{ Icon: Thermostat, val: arg.temperature?.[indexOfRoadHovered] },
															{ Icon: LocalGasStation, val: arg.fuel_level?.[indexOfRoadHovered] },
															{ Icon: Speed, val: arg.speed?.[indexOfRoadHovered] },
															{ Icon: History, val: arg.datetime?.[indexOfRoadHovered]?.$date
																? new Date(arg.datetime[indexOfRoadHovered].$date).toLocaleString()
																: 'Not available' },
														].map(({ Icon, val }, i) => (
															<div key={i} className='arrow-item'>
																<div className='svg-item'><Icon fontSize='25px' /></div>
																<div>{val ?? 'N/A'}</div>
															</div>
														))}
													</div>
												</Popup>
											)}

											{/* Departure marker */}
											{arg.markerPositionState?.Departure?.length === 2 &&
												!isNaN(arg.markerPositionState.Departure[0]) &&
												!isNaN(arg.markerPositionState.Departure[1]) && (
													<Marker
														position={arg.markerPositionState.Departure}
														eventHandlers={{
															mouseover: () => setShowToolTip((p) => ({ ...p, [ind]: true })),
															mouseout:  () => setShowToolTip((p) => ({ ...p, [ind]: false })),
														}}>
														{showToolTip[ind] && (
															<Popup eventHandlers={{ remove: () => setShowToolTip((p) => ({ ...p, [ind]: false })) }}>
																<ul style={{ width: '250px' }} className='d-flex flex-column align-items-start'>
																	<li><TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title='VIN' info={arg.vin} /></li>
																	<li><TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title='Address' info={arg.start_address} /></li>
																</ul>
															</Popup>
														)}
													</Marker>
												)}

											{/* End-trip marker */}
											{arg.markerPositionState?.Current?.length === 2 &&
												!isNaN(arg.markerPositionState.Current[0]) &&
												!isNaN(arg.markerPositionState.Current[1]) && (
													<Marker
														icon={endFlagIcon}
														position={arg.markerPositionState.Current}
														eventHandlers={{
															mouseover: () => setShowToolTipEndTrip((p) => ({ ...p, [ind]: true })),
															mouseout:  () => setShowToolTipEndTrip((p) => ({ ...p, [ind]: false })),
														}}>
														{showToolTipEndTrip[ind] && (
															<Popup eventHandlers={{ remove: () => setShowToolTipEndTrip((p) => ({ ...p, [ind]: false })) }}>
																<ul style={{ width: '250px' }} className='d-flex flex-column align-items-start'>
																	<li key='end_vin'><TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title='VIN' info={arg.vin} /></li>
																	<li key='end_address'><TitleInfo titleStyle='fw-bold' className='mb-1 mt-1' title='Address' info={arg.end_address} /></li>
																</ul>
															</Popup>
														)}
													</Marker>
												)}
										</>
									)}

									{arg.type === 'parked' &&
										arg.parkedPosition &&
										!isNaN(arg.parkedPosition.lat) &&
										!isNaN(arg.parkedPosition.lng) && (
											<Marker
												icon={tripIcons[ind]}
												position={[arg.parkedPosition.lat, arg.parkedPosition.lng]}
											/>
										)}
								</React.Fragment>
							))}
						</Map>
					);
				}

				// ── Default: all vehicles ────────────────────────────────────────
				return (
					<Map {...commonMapProps}>
						<VehicleMarkers
							vehicles={filteredVehicles ?? []}
							setVehicleDetails={setVehicleDetails}
							setIsModalOpen={setIsModalOpen}
						/>

						{geofencePointOfInterestIsOpen && (
							<>
								{dataPOI?.map((item: any) => (
									<Marker
										key={item.poi_id}
										icon={homePinIcon}
										position={{
											lat: Number(item.coordinates[0].lat),
											lng: Number(item.coordinates[0].lng),
										}}
									/>
								))}

								<Marker
									icon={pointIcon}
									draggable={true}
									eventHandlers={{ dragend: handlePoiDragEnd }}
									position={{
										lat: Number(geofencePointOfInterest.lat),
										lng: Number(geofencePointOfInterest.lng),
									}}
								/>

								<Circle
									center={{
										lat: Number(geofencePointOfInterest.lat),
										lng: Number(geofencePointOfInterest.lng),
									}}
									radius={Number(raduisPointOfInterest)}
									pathOptions={{ color: 'blue', fillColor: 'lightblue', fillOpacity: 0.4 }}
								/>
							</>
						)}
					</Map>
				);
			})()}
		</Card>
	);
};

export default React.memo(MapComponent);
