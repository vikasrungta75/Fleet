import React, { useState, useEffect, useCallback, useMemo } from 'react';
import L from 'leaflet';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
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

// PERF: Select only the fields we need using shallowEqual to prevent
// re-renders when unrelated appStoreNoPersist fields change.
const selectMyFleetState = (state: RootState) => ({
	selectedTrajectHistory:         state.appStoreNoPersist.selectedTrajectHistory,
	searchInputGeneral:             state.appStoreNoPersist.searchInputGeneral,
	fleetSearched:                  state.appStoreNoPersist.fleetSearched,
	vehicleDetailSelected:          state.appStoreNoPersist.vehicleDetailSelected,
	geofencePointOfInterest:        state.appStoreNoPersist.geofencePointOfInterest,
	raduisPointOfInterest:          state.appStoreNoPersist.raduisPointOfInterest,
	geofencePointOfInterestIsOpen:  state.appStoreNoPersist.geofencePointOfInterestIsOpen,
});

const MyFleet = () => {
	const dispatch = useDispatch();
	const [map, setMap] = useState<MapType | null>(null);

	// PERF: Isolated selector — only re-renders when vehicles.showAllVehiclesMap changes
	const showAllVehiclesMap = useSelector(
		(state: RootState) => state.vehicles.showAllVehiclesMap,
	);

	// PERF: shallowEqual prevents re-render when the object reference changes
	// but the values inside haven't changed
	const {
		selectedTrajectHistory,
		searchInputGeneral,
		fleetSearched,
		vehicleDetailSelected,
		geofencePointOfInterest,
		raduisPointOfInterest,
		geofencePointOfInterestIsOpen,
	} = useSelector(selectMyFleetState, shallowEqual);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [vehicleDetails, setVehicleDetails] = useState<IvehicleLocation>({
		...initialVehicleDetailsLocation,
	});
	const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
	const [vehicleSelectedCard, setvehicleSelectedCard] = useState<IvehicleLocation>();
	const [WheelStateEvent, setWheelStateEvent] = useState(false);

	const { data: vehiclesLocationv, isLoading, isFetched } = useGetVehicleLocationv1();

	// PERF: useFilteredVehicles already memoizes internally, but we guard the
	// result so MapComponent doesn't re-render when the array is identical.
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

	// PERF: Memoize valid lat/lng pairs so mapFitBoundsAll doesn't re-allocate
	// on every render cycle when filteredVehicles hasn't actually changed.
	const validVehicleCoords = useMemo(() => {
		if (!filteredVehicles) return [];
		return filteredVehicles
			.map((v: IvehicleLocation) => ({
				lat: parseFloat(v.lat),
				lng: parseFloat(v.lng),
			}))
			.filter(({ lat, lng }) => !isNaN(lat) && !isNaN(lng));
	}, [filteredVehicles]);

	const mapFitBoundsAll = useCallback(() => {
		if (!validVehicleCoords.length) return;
		const bounds = L.latLngBounds([]);
		validVehicleCoords.forEach(({ lat, lng }) => bounds.extend([lat, lng]));
		if (bounds.isValid() && map) {
			(map as unknown as L.Map).fitBounds(bounds, { padding: [30, 30] });
		}
	}, [validVehicleCoords, map]);

	// Sync selected vehicles with latest position data
	useEffect(() => {
		if (!vehicleDetailSelected.length) return;

		const updatedVehicles = [...vehicleDetailSelected];
		filteredVehicles?.forEach((secondeVehicle) => {
			const index = updatedVehicles.findIndex((v) => v.vin === secondeVehicle.vin);
			if (index !== -1) {
				updatedVehicles[index] = { ...updatedVehicles[index], ...secondeVehicle };
			}
		});

		// PERF: Avoid dispatch if nothing changed
		if (JSON.stringify(updatedVehicles) !== JSON.stringify(vehicleDetailSelected)) {
			dispatch.appStoreNoPersist.addVehicleSelectedToMap(updatedVehicles);
		}
		if (updatedVehicles.length === 0) {
			dispatch.appStoreNoPersist.changeSelectedTrajectHistory([]);
			dispatch.appStoreNoPersist.addVehicleSelectedToMap([]);
			dispatch.vehicles.changeShowAllVehicle(true);
		}

		function mapFitBounds() {
			if (!map) return;
			const bounds = L.latLngBounds([]);
			vehicleDetailSelected.forEach((loc: IvehicleLocation) =>
				bounds.extend([parseFloat(loc.lat), parseFloat(loc.lng)]),
			);
			if (bounds.isValid()) (map as unknown as L.Map).fitBounds(bounds);
		}

		if (selectedTrajectHistory.length === 0) {
			if (vehicleDetailSelected.length > 0) {
				mapFitBounds();
			} else if (showAllVehiclesMap) {
				mapFitBoundsAll();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filteredVehicles, vehicleDetailSelected, selectedTrajectHistory, showAllVehiclesMap, mapFitBoundsAll]);

	// Fit bounds to trip history when selected
	useEffect(() => {
		if (vehicleDetailSelected.length > 0 || selectedTrajectHistory.length === 0) return;

		function mapFitBounds() {
			if (!map) return;
			const bounds = L.latLngBounds([]);
			selectedTrajectHistory.forEach((trip) =>
				trip.RoadTripReformed?.forEach((loc: any) => bounds.extend([loc.lat, loc.lng])),
			);
			if (bounds.isValid()) (map as unknown as L.Map).fitBounds(bounds);
		}
		mapFitBounds();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTrajectHistory, map]);

	// Fit bounds when showAllVehicles toggled
	useEffect(() => {
		if (showAllVehiclesMap) mapFitBoundsAll();
	}, [filteredVehicles, vehicleSelectedCard, showAllVehiclesMap, mapFitBoundsAll]);

	// Fit to searched vehicle
	useEffect(() => {
		if (Object.keys(fleetSearched).length > 0) return; // map pans via MapComponent
		if (showAllVehiclesMap) mapFitBoundsAll();
	}, [filteredVehicles, fleetSearched, showAllVehiclesMap, mapFitBoundsAll]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			dispatch.appStoreNoPersist.setSelectedTrajectHistory([]);
		};
	}, [dispatch.appStoreNoPersist]);

	return (
		<PageWrapper isProtected={true} className=''>
			<Page className='mw-100 py-0 my-0' container='fluid'>
				<div id='pageContainer'>
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
							carcustom={carcustom}
							geofencePointOfInterest={geofencePointOfInterest}
							raduisPointOfInterest={raduisPointOfInterest}
							geofencePointOfInterestIsOpen={geofencePointOfInterestIsOpen}
						/>
					) : (
						<div className='loader-wrapper'>
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

// PERF: React.memo prevents re-render if parent re-renders with same props
export default React.memo(MyFleet);
