import React, { useEffect, useState } from 'react';
import { IvehicleLocation } from '../../../../../type/vehicles-type';
import Card from '../../../../../components/bootstrap/Card';
// import { Circle, InfoWindow, Marker, MarkerClusterer, Polyline } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import mapIcon from '../../../../../assets/mapIcon.png';
import L from 'leaflet';
import Map from '../../map/Map';
import CustomMarker from '../../CustomMarker';
import { svg } from '../../../../../assets';
import { statusInformations } from '../constants/mapConstants';
import { TitleInfo } from '../../Card/HistoryDetailsCard';
import { geofenceOptions } from '../../../../setup-admin/geofences/constants/constants';
import point from '../../../../../assets/svg/custom-point-marker.svg';
import HomePin from '../../../../../assets/svg/home_pin.svg';
import endFlag from '../../../../../assets/svg/flag-damier.svg';
import { useGetPoiList } from '../../../../../services/geofences';
import {
	History,
	LocalGasStation,
	Speed,
	Thermostat,
} from '../../../../../components/icon/material-icons';
import { dateFormatter } from '../../../../../helpers/helpers';
import TrafficPolyline from './CustomPolyline';
interface Coordinates {
	lat: number;
	lng: number;
}
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
	// endFlag: string;
	carcustom: string;
	geofencePointOfInterest: any;
	raduisPointOfInterest: number;
	geofencePointOfInterestIsOpen: boolean;
	map: any;
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
	// endFlag,
	carcustom,
	geofencePointOfInterest,
	raduisPointOfInterest,
	geofencePointOfInterestIsOpen,
	map,
}) => {
	const [showToolTip, setShowToolTip] = useState<{ [key: number]: boolean }>({});
	const [showToolTipEndTrip, setShowToolTipEndTrip] = useState<{ [key: number]: boolean }>({});
	const { data: dataPOI, isLoading: isLoadingPOI } = useGetPoiList();
	const [indexOfRoadHovered, setindexOfRoadHovered] = useState(-1);

	const [ArrowHovered, setArrowHovered] = useState<{
		lat: number;
		lng: number;
		item: any;
		isOpen: boolean;
	}>({
		lat: 0,
		lng: 0,
		item: {},
		isOpen: false,
	});

	function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // Radius of the Earth in kilometers
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // Distance in kilometers
		return distance;
	}

	function findClosestIndex(
		targetLat: number,
		targetLng: number,
		coordinates: Coordinates[],
	): number {
		let closestIndex = -1;
		let minDistance = Number.MAX_VALUE;

		for (let i = 0; i < coordinates.length; i++) {
			const { lat, lng } = coordinates[i];
			const distance = calculateDistance(targetLat, targetLng, lat, lng);

			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = i;
			}
		}

		return closestIndex;
	}

	useEffect(() => {
		if (Object.keys(ArrowHovered.item).length > 0) {
			const closestIndex = findClosestIndex(
				ArrowHovered.lat,
				ArrowHovered.lng,
				ArrowHovered.item.RoadTripReformed,
			);
			setindexOfRoadHovered(closestIndex);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ArrowHovered]);

	const homePinIcon = L.icon({
		iconUrl: HomePin, // Use iconUrl instead of url
		iconSize: [25, 25], // Leaflet uses an array for size, not google.maps.Size
		iconAnchor: [12, 25], // Adjust anchor accordingly
	});

	const pointIcon = L.icon({
		iconUrl: point, // Use iconUrl instead of url
		iconSize: [25, 25], // Leaflet uses an array for size, not google.maps.Size
		iconAnchor: [12, 25], // Adjust anchor accordingly
	});

	// Define custom icon
	const endFlagIcon = L.icon({
		iconUrl: endFlag,
		iconSize: [25, 25],
		iconAnchor: [12, 25],
	  });

	return (
		<Card className='fleet-map rounded mh-100'>
			{(() => {
				switch (true) {
					case vehicleDetailSelected.length > 0:
						return (
							<>
								<Map
									map={map}
									setWheelStateEvent={setWheelStateEvent}
									setvehicleSelectedCard={setvehicleSelectedCard}
									setMap={setMap}
									isFullScreen={true}
									setIsFullScreen={setIsFullScreen}
									latitude={0}
									longitude={0}
									zoom={0}
									bearing={0}
									pitch={0}
									setIsModalOpen={setIsModalOpen}
									>
									<MarkerClusterGroup chunkedLoading>
										{vehicleDetailSelected?.map((loc: IvehicleLocation) => (
											<CustomMarker
												key={loc.lng}
												vehicleLocation={loc}
												position={{
													lat: parseFloat(loc.lat),
													lng: parseFloat(loc.lng),
												}}
												setVehicleDetails={setVehicleDetails}
												setIsModalOpen={setIsModalOpen}
											/>
										))}
									</MarkerClusterGroup>
								</Map>
							</>
						);
					case selectedTrajectHistory.length > 0:
						return (
							<>
								<Map
									setWheelStateEvent={setWheelStateEvent}
									setvehicleSelectedCard={setvehicleSelectedCard}
									setMap={setMap}
									map={map}
									isFullScreen={true}
									setIsFullScreen={setIsFullScreen}
									latitude={0}
									longitude={0}
									zoom={0}
									bearing={0}
									pitch={0}
									setIsModalOpen={setIsModalOpen}>
									{selectedTrajectHistory.map((arg, ind) => {
										const status = selectedTrajectHistory[ind]?.status;
										const iconUrl = statusInformations[status]?.url
											? `${statusInformations[status].url}?${selectedTrajectHistory[ind]._id}`
											: ''; // Fallback if URL is missing

										// Define the Leaflet icon
										const customIcon = L.icon({
											iconUrl,
											iconSize: [50, 50], // Leaflet expects [width, height]
											iconAnchor: [25, 15], // Anchor point (matches Google Maps equivalent)
										});

										return (
											<>
												{arg.type === 'road' && (
													<>
														<TrafficPolyline
															path={
																selectedTrajectHistory[ind]
																	?.RoadTripReformed || []
															}
															speedData={
																selectedTrajectHistory[ind]
																	?.speed || []
															}
															options={optionsmapFleetTraject}
															setArrowHovered={setArrowHovered}
															selectedTrajectHistory={
																selectedTrajectHistory[ind] || {}
															}
														/>

														{ArrowHovered.isOpen && (
															<Popup
																position={[
																	ArrowHovered.lat,
																	ArrowHovered.lng,
																]}
																eventHandlers={{
																	remove: () =>
																		setArrowHovered({
																			lat: 0,
																			lng: 0,
																			item: {},
																			isOpen: false,
																		}),
																}}>
																<div
																	className='d-flex flex-column mb-3'
																	style={{ width: '150px' }}>
																	<div className='arrow-item'>
																		<div className='svg-item'>
																			<Thermostat
																				fontSize={'25px'}
																			/>
																		</div>
																		<div>
																			{selectedTrajectHistory[
																				ind
																			]?.temperature?.[
																				indexOfRoadHovered
																			] ?? 'N/A'}
																		</div>
																	</div>
																	<div className='arrow-item'>
																		<div className='svg-item'>
																			<LocalGasStation
																				fontSize={'25px'}
																			/>
																		</div>
																		<div>
																			{selectedTrajectHistory[
																				ind
																			]?.fuel_level?.[
																				indexOfRoadHovered
																			] ?? 'N/A'}
																		</div>
																	</div>
																	<div className='arrow-item'>
																		<div className='svg-item'>
																			<Speed
																				fontSize={'25px'}
																			/>
																		</div>
																		<div>
																			{selectedTrajectHistory[
																				ind
																			]?.speed?.[
																				indexOfRoadHovered
																			] ?? 'N/A'}
																		</div>
																	</div>
																	<div className='arrow-item'>
																		<div className='svg-item'>
																			<History
																				fontSize={'25px'}
																			/>
																		</div>
																		<div>
																			{selectedTrajectHistory[
																				ind
																			]?.datetime?.[
																				indexOfRoadHovered
																			]?.$date
																				? new Date(
																						selectedTrajectHistory[
																							ind
																						].datetime[
																							indexOfRoadHovered
																						].$date,
																				  ).toLocaleString()
																				: 'Not available'}
																		</div>
																	</div>
																</div>
															</Popup>
														)}

														{/* Departure Marker */}
														{selectedTrajectHistory[ind]
															?.RoadTripReformed &&
															selectedTrajectHistory[ind]
																?.markerPositionState?.Departure &&
															Array.isArray(
																selectedTrajectHistory[ind]
																	.markerPositionState.Departure,
															) &&
															selectedTrajectHistory[ind]
																.markerPositionState.Departure
																.length === 2 &&
															!isNaN(
																selectedTrajectHistory[ind]
																	.markerPositionState
																	.Departure[0],
															) &&
															!isNaN(
																selectedTrajectHistory[ind]
																	.markerPositionState
																	.Departure[1],
															) && (
																<Marker
																	position={
																		selectedTrajectHistory[ind]
																			.markerPositionState
																			.Departure
																	}
																	eventHandlers={{
																		mouseover: () =>
																			setShowToolTip(
																				(prevState) => ({
																					...prevState,
																					[ind]: true,
																				}),
																			),
																		mouseout: () =>
																			setShowToolTip(
																				(prevState) => ({
																					...prevState,
																					[ind]: false,
																				}),
																			),
																	}}>
																	{showToolTip[ind] && (
																		<Popup
																			eventHandlers={{
																				remove: () =>
																					setShowToolTip(
																						(
																							prevState,
																						) => ({
																							...prevState,
																							[ind]: false,
																						}),
																					),
																			}}>
																			<ul
																				style={{
																					width: '250px',
																				}}
																				className='d-flex flex-column align-items-start'>
																				<li>
																					<TitleInfo
																						titleStyle='fw-bold'
																						className='mb-1 mt-1'
																						title='VIN'
																						info={
																							selectedTrajectHistory[
																								ind
																							]?.vin
																						}
																					/>
																				</li>
																				<li>
																					<TitleInfo
																						titleStyle='fw-bold'
																						className='mb-1 mt-1'
																						title='Address'
																						info={
																							selectedTrajectHistory[
																								ind
																							]
																								?.start_address
																						}
																					/>
																				</li>
																			</ul>
																		</Popup>
																	)}
																</Marker>
															)}

														{/* End Trip Marker */}
														{selectedTrajectHistory[ind]
															?.markerPositionState?.Current &&
															Array.isArray(
																selectedTrajectHistory[ind]
																	.markerPositionState.Current,
															) &&
															selectedTrajectHistory[ind]
																.markerPositionState.Current
																.length === 2 &&
															!isNaN(
																selectedTrajectHistory[ind]
																	.markerPositionState.Current[0],
															) &&
															!isNaN(
																selectedTrajectHistory[ind]
																	.markerPositionState.Current[1],
															) && (
																<Marker
																	icon={endFlagIcon}
																	position={
																		selectedTrajectHistory[ind]
																			.markerPositionState
																			.Current
																	}
																	eventHandlers={{
																		mouseover: () =>
																			setShowToolTipEndTrip(
																				(prevState) => ({
																					...prevState,
																					[ind]: true,
																				}),
																			),
																		mouseout: () =>
																			setShowToolTipEndTrip(
																				(prevState) => ({
																					...prevState,
																					[ind]: false,
																				}),
																			),
																	}}>
																	{showToolTipEndTrip[ind] && (
																		<Popup
																			eventHandlers={{
																				remove: () =>
																					setShowToolTipEndTrip(
																						(
																							prevState,
																						) => ({
																							...prevState,
																							[ind]: false,
																						}),
																					),
																			}}>
																			<ul
																				style={{
																					width: '250px',
																				}}
																				className='d-flex flex-column align-items-start'>
																				<li key={'end_vin'}>
																					<TitleInfo
																						titleStyle='fw-bold'
																						className='mb-1 mt-1'
																						title='VIN'
																						info={
																							selectedTrajectHistory[
																								ind
																							]?.vin
																						}
																					/>
																				</li>
																				<li
																					key={
																						'end_address'
																					}>
																					<TitleInfo
																						titleStyle='fw-bold'
																						className='mb-1 mt-1'
																						title='Address'
																						info={
																							selectedTrajectHistory[
																								ind
																							]
																								?.end_address
																						}
																					/>
																				</li>
																			</ul>
																		</Popup>
																	)}
																</Marker>
															)}
													</>
												)}

												{arg.type === 'parked' &&
													selectedTrajectHistory[ind]?.parkedPosition &&
													!isNaN(
														selectedTrajectHistory[ind].parkedPosition
															.lat,
													) &&
													!isNaN(
														selectedTrajectHistory[ind].parkedPosition
															.lng,
													) && (
														<Marker
															icon={customIcon}
															position={[
																selectedTrajectHistory[ind]
																	.parkedPosition.lat,
																selectedTrajectHistory[ind]
																	.parkedPosition.lng,
															]}
														/>
													)}
											</>
										);
									})}
								</Map>
							</>
						);
					default:
						return (
							<>
								<Map
									map={map}
									setWheelStateEvent={setWheelStateEvent}
									setvehicleSelectedCard={setvehicleSelectedCard}
									setMap={setMap}
									isFullScreen={true}
									setIsFullScreen={setIsFullScreen}
									latitude={0}
									longitude={0}
									zoom={0}
									bearing={0}
									pitch={0}
									setIsModalOpen={setIsModalOpen}>
									<MarkerClusterGroup chunkedLoading>
										{filteredVehicles?.map((loc: IvehicleLocation) => (
											<CustomMarker
												key={loc.lng}
												vehicleLocation={loc}
												position={{
													lat: parseFloat(loc.lat),
													lng: parseFloat(loc.lng),
												}}
												// clusterer={clusterer}
												setVehicleDetails={setVehicleDetails}
												setIsModalOpen={setIsModalOpen}
											/>
										))}
									</MarkerClusterGroup>
									{geofencePointOfInterestIsOpen && (
										<>
											{dataPOI &&
												dataPOI.map((item: any, index: number) => {
													return (
														<Marker
															key={item.poi_id}
															icon={homePinIcon}
															position={{
																lat: Number(
																	item.coordinates[0].lat,
																),
																lng: Number(
																	item.coordinates[0].lng,
																),
															}}
														/>
													);
												})}

											<Marker
												icon={pointIcon}
												draggable={true}
												eventHandlers={{
													dragend: (e) => {
														const latlng = (
															e.target as L.Marker
														).getLatLng();
														dispatch.appStoreNoPersist.handleChangePointInterest(
															{
																lat: latlng.lat,
																lng: latlng.lng,
															},
														);
													},
												}}
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
												pathOptions={{
													color: 'blue',
													fillColor: 'lightblue',
													fillOpacity: 0.4,
												}}
												eventHandlers={{
													dragend: (e) => {
														const latlng = (
															e.target as L.Circle
														).getLatLng();
														dispatch.appStoreNoPersist.handleChangePointInterest(
															{
																lat: latlng.lat,
																lng: latlng.lng,
															},
														);
													},
												}}
											/>
										</>
									)}
								</Map>
							</>
						);
				}
			})()}
		</Card>
	);
};

export default MapComponent;




