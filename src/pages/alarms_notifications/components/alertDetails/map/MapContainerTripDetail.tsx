import React, { useState, useEffect } from 'react';
import Map, { MapType } from './MapDetailTrip';
import { Marker, Polyline } from '@react-google-maps/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import endFlag from '../../../../../assets/svg/flag-damier.svg';
import { useParams } from 'react-router-dom';
import Spinner from '../../../../../components/bootstrap/Spinner';
import { IAlarmRoadTrip } from '../../../../../type/alert-types';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import { useTranslation } from 'react-i18next';
import NoData from '../../../../../components/NoData';

const MapContainerTripDetail = () => {
	const { t } = useTranslation(['alertNotification']);
	const [map, setMap] = useState<MapType | null>(null);
	const dispatch = useDispatch();
	const { alarmRoadTrip } = useSelector((state: RootState) => state.alertsNotifications);
	const isLoadingTripRoad = useSelector(
		(state: RootState) => state.loading.effects.alertsNotifications.getAlarmTripRoadDetail,
	);
	let params = useParams();
	const { datetime, vin } = params;

	const payloadTripDetail = {
		datetime,
		vin,
	};

	useEffect(() => {
		const getTripRouteDetail = async () => {
			await dispatch.alertsNotifications.getAlarmTripRoadDetail(payloadTripDetail);
		};

		getTripRouteDetail();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [tripRouteRoadState, settripRouteRoadState] = useState<any>([]);
	const [markerPositionState, setmarkerPositionState] = useState<any>({});

	useEffect(() => {
		if (alarmRoadTrip.length !== 0) {
			const RoadTripReformed = alarmRoadTrip?.map((TripRoute: IAlarmRoadTrip) => {
				const container = {
					lat: 0,
					lng: 0,
				};
				container.lat = parseFloat(TripRoute.latitude);
				container.lng = parseFloat(TripRoute.longitude);
				return container;
			});
			settripRouteRoadState(RoadTripReformed);
		}
	}, [alarmRoadTrip]);

	useEffect(() => {
		if (tripRouteRoadState.length !== 0) {
			const MarkerPostion = {
				Departure: {
					lat: tripRouteRoadState[0].lat ?? '',
					lng: tripRouteRoadState[0].lng ?? '',
				},
				Current: {
					lat: tripRouteRoadState[Object.keys(tripRouteRoadState).length - 1].lat ?? '',
					lng: tripRouteRoadState[Object.keys(tripRouteRoadState).length - 1].lng ?? '',
				},
			};
			setmarkerPositionState(MarkerPostion);
		}
	}, [tripRouteRoadState]);

	useEffect(() => {
		function mapFitBounds() {
			if (!map) return;

			const bounds = new google.maps.LatLngBounds();
			tripRouteRoadState.map((loc: any) =>
				bounds.extend(new google.maps.LatLng(loc.lat, loc.lng)),
			);

			map.fitBounds(bounds);
		}

		if (map) {
			// map.panTo(...)
			mapFitBounds();
		}
	}, [map, tripRouteRoadState]);

	// MarkerPositions.lng = xx[Object.keys(xx).length - 1].lng;

	const options = {
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		clickable: false,
		draggable: false,
		editable: false,
		visible: true,
		radius: 30000,
		zIndex: 1,
	};

	return !isLoadingTripRoad && alarmRoadTrip.length === 0 ? (
		<NoData text={t('No alarm detail to display')} />
	) : (
		<Card>
			<div className='row' style={{ flex: '1' }}>
				<div>
					{!isLoadingTripRoad ? (
						<Map setMap={setMap}>
							<Polyline path={tripRouteRoadState} options={options} />
							{markerPositionState && (
								<>
									<Marker position={markerPositionState.Departure} />
									{/* <Marker
										icon={{
											url: endFlag,
										}}
										position={markerPositionState.Current}
									/> */}
								</>
							)}
						</Map>
					) : (
						<CardBody>
							<div className='d-flex justify-content-center h-100 align-items-center'>
								<Spinner color='secondary' size='5rem' />
							</div>
						</CardBody>
					)}
				</div>
			</div>
		</Card>
	);
};

export default MapContainerTripDetail;
