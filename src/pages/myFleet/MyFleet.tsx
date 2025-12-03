import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { initialVehicleDetailsLocation, IvehicleLocation } from '../../type/vehicles-type';
import { useGetVehicleLocationv1 } from '../../services/vehiclesService';
import Spinner from '../../components/bootstrap/Spinner';
import { MapType } from './components/map/type/type/mapType';
import carcustom from '../../assets/svg/custom-car.svg';
import { useFilteredVehicles } from '../../hooks/useGetFilteredVehicles';
import { colorsOptionMap } from '../../helpers/helpers';
import { optionsmapFleetTraject } from '../setup-admin/geofences/constants/constants';
import FleetDetail from './components/FleetDetails';
import MapComponent from './components/map/components/MapComponent';

const MyFleet = () => {
	const dispatch = useDispatch();
	const [map, setMap] = useState<MapType | null>(null);

	const { showAllVehiclesMap } = useSelector((state: RootState) => state.vehicles);

	const {
		selectedTrajectHistory,
		searchInputGeneral,
		fleetSearched,
		vehicleDetailSelected,
		geofencePointOfInterest,
		raduisPointOfInterest,
		geofencePointOfInterestIsOpen,
	} = useSelector((state: RootState) => state.appStoreNoPersist);

	const [WheelStateEvent, setWheelStateEvent] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [vehicleDetails, setVehicleDetails] = useState<IvehicleLocation>({
		...initialVehicleDetailsLocation,
	});

	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

	const [vehicleSelectedCard, setvehicleSelectedCard] = useState<IvehicleLocation>();
	const { data: vehiclesLocationv, isLoading, isFetched } = useGetVehicleLocationv1();
	const filteredVehicles = useFilteredVehicles(vehiclesLocationv, searchInputGeneral);

	useEffect(() => {
		if (!showAllVehiclesMap) {
			dispatch.vehicles.changeShowAllVehicle(true);
		}

		return () => {
			dispatch.vehicles.changeShowAllVehicle(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const mapFitBoundsAll = useCallback(() => {
		if (!filteredVehicles || filteredVehicles.length === 0) {
			console.warn('No vehicles available to fit bounds');
			return;
		}

		// Initialize bounds
		const bounds = L.latLngBounds([]) as L.LatLngBounds;

		filteredVehicles.forEach((loc: IvehicleLocation, index: number) => {
			const lat = parseFloat(loc.lat);
			const lng = parseFloat(loc.lng);

			if (isNaN(lat) || isNaN(lng)) {
				console.error(`Invalid coordinates at index ${index}:`, loc);
				return;
			}

			bounds.extend([lat, lng]);
		});

		if (!bounds.isValid()) {
			console.error('Generated bounds are invalid');
			return;
		}

		// Fit map to bounds
		// (map as unknown as L.Map).fitBounds(bounds);
	}, [filteredVehicles]);

	useEffect(() => {
		if (vehicleDetailSelected.length) {
			const updatedVehicles = [...vehicleDetailSelected];
			filteredVehicles.forEach((secondeVehicle) => {
				const index = updatedVehicles.findIndex(
					(vehicle) => vehicle.vin === secondeVehicle.vin,
				);
				if (index !== -1) {
					updatedVehicles[index] = { ...updatedVehicles[index], ...secondeVehicle };
				} else {
					return false;
				}
			});

			if (JSON.stringify(updatedVehicles) !== JSON.stringify(vehicleDetailSelected)) {
				dispatch.appStoreNoPersist.addVehicleSelectedToMap(updatedVehicles);
			}
			if (updatedVehicles.length === 0) {
				dispatch.appStoreNoPersist.changeSelectedTrajectHistory([]);
				dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);
				dispatch.vehicles.changeShowAllVehicle(true);
			}
		}

		function mapFitBounds() {
			if (!map) return;
			const bounds = L.latLngBounds([]);

			vehicleDetailSelected &&
				vehicleDetailSelected.map((loc: IvehicleLocation) =>
					bounds.extend([parseFloat(loc.lat), parseFloat(loc.lng)]),
				);
			(map as unknown as L.Map).fitBounds(bounds);
		}

		if (selectedTrajectHistory.length === 0) {
			if (vehicleDetailSelected.length > 0) {
				mapFitBounds();
			} else {
				if (showAllVehiclesMap) {
					mapFitBoundsAll();
				}
			}
		} else return;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		filteredVehicles,
		vehicleDetailSelected,
		selectedTrajectHistory,
		showAllVehiclesMap,
		mapFitBoundsAll,
	]);

	useEffect(() => {
		function mapFitBounds() {
			if (!map) return;
			const bounds = L.latLngBounds([]);

			selectedTrajectHistory.forEach((trip) =>
				trip.RoadTripReformed?.forEach((loc) => bounds.extend([loc.lat, loc.lng])),
			);

			(map as unknown as L.Map).fitBounds(bounds);
		}

		if (vehicleDetailSelected.length === 0) {
			if (selectedTrajectHistory.length > 0) {
				mapFitBounds();
			} else return;
		} else return;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTrajectHistory, map, vehicleDetailSelected, mapFitBoundsAll]);
	//this useEffect for the show all vehicle button
	useEffect(() => {
		if (showAllVehiclesMap) {
			mapFitBoundsAll();
		}
	}, [filteredVehicles, vehicleSelectedCard, showAllVehiclesMap, mapFitBoundsAll]);

	// useEffect for the map selected in search input to consult the fleets selected
	useEffect(() => {
		function mapFitBounds() {
			const bounds = L.latLngBounds([]);

			bounds.extend([parseFloat(fleetSearched.lat), parseFloat(fleetSearched.lng)]);
		}

		if (Object.keys(fleetSearched).length > 0) {
			mapFitBounds();
		} else {
			if (showAllVehiclesMap) {
				mapFitBoundsAll();
			}
		}

		return () => {};
	}, [filteredVehicles, fleetSearched, showAllVehiclesMap, mapFitBoundsAll]);

	useEffect(() => {
		return () => {
			dispatch.appStoreNoPersist.setSelectedTrajectHistory([]);
		};
	}, [dispatch.appStoreNoPersist]);

	return (
		<PageWrapper isProtected={true} className=''>
			<Page className='mw-100 py-0 my-0' container='fluid'>
				<div id='pageContainer '>
					{/* {Object.keys(fleetSearched).length > 0 && (
						<MarkerClusterer
							onClick={() => {
								dispatch.vehicles.changeShowAllVehicle(false);
								setWheelStateEvent(true);
							}}>
							{(clusterer) => (
								<>
									<CustomMarker
										key={fleetSearched!.lng}
										vehicleLocation={fleetSearched!}
										position={{
											lat: parseFloat(fleetSearched!.lat),
											lng: parseFloat(fleetSearched!.lng),
										}}
										clusterer={clusterer}
										setVehicleDetails={setVehicleDetails}
										setIsModalOpen={setIsModalOpen}
									/>
								</>
							)}
						</MarkerClusterer>
					)} */}
					{filteredVehicles ? (
						<MapComponent
							filteredVehicles={filteredVehicles}
							vehicleDetailSelected={vehicleDetailSelected}
							selectedTrajectHistory={selectedTrajectHistory}
							setWheelStateEvent={setWheelStateEvent}
							setvehicleSelectedCard={setvehicleSelectedCard}
							setMap={setMap}
							map={map}
							setIsFullScreen={setIsFullScreen}
							setVehicleDetails={setVehicleDetails}
							setIsModalOpen={setIsModalOpen}
							dispatch={dispatch}
							colorsOptionMap={colorsOptionMap}
							optionsmapFleetTraject={optionsmapFleetTraject}
							// endFlag={endFlag}
							carcustom={carcustom}
							geofencePointOfInterest={geofencePointOfInterest}
							raduisPointOfInterest={raduisPointOfInterest}
							geofencePointOfInterestIsOpen={geofencePointOfInterestIsOpen}
						/>
					) : (
						<div className={`loader-wrapper`}>
							<Spinner className='spinner-center' color='secondary' size='5rem' />
						</div>
					)}

					{isModalOpen && (
						<FleetDetail
							isModalOpen={isModalOpen}
							setIsModalOpen={setIsModalOpen}
							vehicleDetails={vehicleDetails}
						/>
					)}
				</div>
			</Page>
		</PageWrapper>
	);
};

export default MyFleet;
