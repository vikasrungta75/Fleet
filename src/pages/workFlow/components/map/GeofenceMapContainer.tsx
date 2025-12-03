// import { Circle, DrawingManager, Marker, Polygon } from '@react-google-maps/api';
// import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Marker, Circle } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import React, { useContext, useEffect, useRef, useState } from 'react';
import point from '../../../../assets/svg/custom-point-marker.svg';
import ThemeContext from '../../../../contexts/themeContext';
import Page from '../../../../layout/Page/Page';
import '../../../../styles/pages/_vehicles.scss';
import { ICoordinates } from '../../../../type/geofences-type';
import { geofenceOptions } from '../../constants/constants';
import Map, { MapType } from './GeofenceMap';
import { RootState } from '../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import HomePin from '../../../../assets/svg/home_pin.svg';
import L from 'leaflet';

interface IGeofenceMapContainer {
	radiusCircle: Number;
	geofencePoint: any;
	GeofenceShape: {
		polygone: boolean;
		circle: boolean;
		polyline: boolean;
	};
	setGeofencePoint: (value: any) => void;
	setGeofenceShape: (value: any) => void;
	setPolygonPoints: (value: any) => void;
	setPolygon: (value: any) => void;
	setPolyline: (value: any) => void;
	isFullScreen: boolean;
	setIsFullScreen: any;
	polygon: any;
	inMyFleet: boolean;
	groupType?: 'start' | 'end';
}

const GeofenceMapContainer = (props: IGeofenceMapContainer) => {
	const dispatch = useDispatch();

	const {
		radiusCircle,
		setGeofencePoint,
		geofencePoint,
		isFullScreen,
		setIsFullScreen,
		GeofenceShape,
		setGeofenceShape,
		setPolygonPoints,
		setPolygon,
		setPolyline,
		polygon,
		inMyFleet,
		groupType,
	} = props;
	const { mobileDesign } = useContext(ThemeContext);

	const [map, setMap] = useState<MapType | null>(null);

	const [cercleGeofence, setCercleGeofence] = useState<ICoordinates>();
	const circleRef = useRef(null);
	const [polygonRef, setPolygonRef] = React.useState(null);

	const options = {
		...geofenceOptions,
	};

	const optionsxx = {
		drawingControl: false,
	};

	const onPolygonComplete = React.useCallback(function onPolygonComplete(poly: any) {
		const polyArray = poly.getPath().getArray();
		const paths = polyArray.map((pointxx: any) => ({
			lat: pointxx.lat(),
			lng: pointxx.lng(),
		}));

		// Update the state with the polygon paths
		setPolygonPoints(paths);
		setPolygon(paths);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPolylineComplete = React.useCallback(function onPolylineComplete(poly: any) {
		const polyArray = poly.getPath().getArray();
		const paths = polyArray.map((pointxx: any) => ({
			lat: pointxx.lat(),
			lng: pointxx.lng(),
		}));

		setPolyline(paths);

		// Update the state with the polygon paths
		// setPolygonPoints(paths);
		// setPolygon(paths);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const onDrawingManagerLoad = React.useCallback(function onDrawingManagerLoad(
		drawingManager: any,
	) {
		// shapeGeofenceRef.current = drawingManager
	},
	[]);

	const [shapes, setShapes] = useState<any>([]);

	const handleOverlayComplete = (e: any) => {
		const shape = e.overlay;
		shape.type = e.type;
		google.maps.event.addListener(shape, 'click', () => {
			toggleSelection(shape);
		});
		toggleSelection(shape);
		setShapes([...shapes, shape]);
	};

	const toggleSelection = (shape: any) => {
		if (shape.getEditable() === true) shape.setEditable(false);
		else shape.setEditable(true);
	};

	const deleteShapes = () => {
		shapes.forEach((shape: any) => shape.setMap(null));
		setShapes([]);
	};
	useEffect(() => {
		if (GeofenceShape.circle) {
			deleteShapes();
			setPolygon(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [GeofenceShape]);
	const onPolygonLoad = (polygonxx: any) => {
		setPolygonRef(polygonxx);
	};
	const onPolygonMouseUp = () => {
		onPolygonComplete(polygonRef);
	};

	useEffect(() => {
		deleteShapes();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [polygon]);

	useEffect(() => {
		setPolygon(null);

		return () => {
			setPolygon(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// const { data: dataPOI, isLoading: isLoadingPOI } = useGetPoiList();
	const {
		selectedTrajectHistory,
		searchInputGeneral,
		fleetSearched,
		vehicleDetailSelected,
		geofencePointOfInterest,
		raduisPointOfInterest,
		geofencePointOfInterestIsOpen,
		startGeofencePointOfInterest,
		endGeofencePointOfInterest,
		startGeofencePointOfInterestIsOpen,
		endGeofencePointOfInterestIsOpen,
		dataPOIStart,
		dataPOIEnd,
	} = useSelector((state: RootState) => state.appStoreNoPersist);
	const dataPOI = useSelector((state: RootState) => state.appStoreNoPersist.dataPOI);

	// Create custom icon
	const customIcon = L.icon({
		iconUrl: point,
		iconSize: [20, 20], // equivalent to scaledSize
		iconAnchor: [10, 20], // adjust so the marker points at the correct position
	});

	return (
		<Page className={`fleet-map mw-100 ${mobileDesign ? 'px-0' : 'px-3 pt-0'}`}>
			<div id='pageContainer'>
				<Map
					isFullScreen={isFullScreen}
					setIsFullScreen={setIsFullScreen}
					cercleGeofence={geofencePoint}
					setGeofenceShape={setGeofenceShape}
					GeofenceShape={GeofenceShape}
					inMyFleet={inMyFleet}
					setMap={setMap}>
					{/* {polygon ? (
						<Polygon
							paths={polygon}
							onLoad={onPolygonLoad}
							onMouseUp={onPolygonMouseUp}
							options={{
								clickable: true,
								draggable: true,
								editable: true,
								fillColor: '#f1156e',
								strokeColor: '#f1156e',
							}}
						/>
					) : (
						<>
							{(GeofenceShape.polygone || GeofenceShape.polyline) && (
								<DrawingManager
									drawingMode={
										window.google
											? GeofenceShape.polygone
												? window.google.maps.drawing.OverlayType.POLYGON
												: GeofenceShape.polyline
												? window.google.maps.drawing.OverlayType.POLYLINE
												: undefined
											: undefined
									}
									options={{
										...optionsxx,
										polygonOptions: {
											clickable: true,
											draggable: true,
											editable: true,
											fillColor: '#f1156e',
											strokeColor: '#f1156e',
										},
										polylineOptions: {
											clickable: true,
											draggable: true,
											editable: true,
											strokeColor: '#f1156e',
										},
									}}
									onOverlayComplete={handleOverlayComplete}
									onPolylineComplete={onPolylineComplete}
									onPolygonComplete={onPolygonComplete}
									onLoad={onDrawingManagerLoad}
								/>
							)}
						</>
					)} */}

					{polygon && polygon.length > 0 ? (
						<Polygon
							positions={polygon} // Leaflet uses positions, not paths
							pathOptions={{
								color: '#f1156e',
								weight: 2,
								fillColor: '#f1156e',
								fillOpacity: 0.4,
							}}
						/>
					) : (
						<>
							{(GeofenceShape.polygone || GeofenceShape.polyline) && (
								<FeatureGroup>
									<EditControl
										position='topright'
										draw={{
											rectangle: false,
											circle: false,
											circlemarker: false,
											marker: false,
											polyline: GeofenceShape.polyline,
											polygon: GeofenceShape.polygone
												? {
														allowIntersection: false,
														shapeOptions: { color: '#f1156e' },
												  }
												: false,
										}}
										onCreated={(e) => {
											if (e.layerType === 'polygon') {
												const latlngs = e.layer
													.getLatLngs()[0]
													.map((ll: any) => [ll.lat, ll.lng]);
												setPolygon(latlngs);
												setPolygonPoints(latlngs);
											} else if (e.layerType === 'polyline') {
												const latlngs = e.layer
													.getLatLngs()
													.map((ll: any) => [ll.lat, ll.lng]);
												setPolyline(latlngs);
											}
										}}
										onEdited={(e) => {
											e.layers.eachLayer((layer: any) => {
												const latlngs = layer
													.getLatLngs()[0]
													.map((ll: any) => [ll.lat, ll.lng]);
												setPolygon(latlngs);
												setPolygonPoints(latlngs);
											});
										}}
									/>
								</FeatureGroup>
							)}
						</>
					)}

					{GeofenceShape.circle && (
						<>
							<Marker
								// icon={{
								// 	url: point,
								// 	// scaledSize: new google.maps.Size(20, 20), // scaled size
								// }}
								icon={customIcon}
								draggable={inMyFleet ? false : true}
								// onDragEnd={(e: { latLng: { lat: () => any; lng: () => any; }; }) => {
								// 	if (e.latLng) {
								// 		setGeofencePoint({
								// 			lat: e.latLng?.lat(),
								// 			lng: e.latLng?.lng(),
								// 		});
								// 		setCercleGeofence({
								// 			lat: e.latLng?.lat(),
								// 			lng: e.latLng?.lng(),
								// 		});
								// 	}
								// }}
								eventHandlers={{
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										setGeofencePoint({ lat, lng });
										setCercleGeofence({ lat, lng });
									},
								}}
								position={geofencePoint}
							/>

							<Circle
								ref={circleRef}
								// required
								center={geofencePoint}
								radius={Number(radiusCircle)}
								// required
								// options={{ ...options, draggable: inMyFleet ? false : true }}
								// onDragEnd={(e: { latLng: { lat: () => any; lng: () => any; }; }) => {
								// 	// setCercleGeofence({ lat: e.latLng?.lat(), lng: e.latLng?.lng()})
								// 	if (e.latLng) {
								// 		setCercleGeofence({
								// 			lat: Number(e.latLng?.lat()),
								// 			lng: Number(e.latLng?.lng()),
								// 		});
								// 		setGeofencePoint({
								// 			lat: Number(e.latLng?.lat()),
								// 			lng: Number(e.latLng?.lng()),
								// 		});
								// 	}
								// }}
							/>
						</>
					)}
					{/* 
					{geofencePointOfInterestIsOpen && (
						<>
							{dataPOI &&
								dataPOI.map((item: any, index: number) => {
									return (
										<Marker
											key={item.poi_id}
											icon={{
												url: HomePin,
												scaledSize: new google.maps.Size(25, 25), // scaled size
											}}
											position={{
												lat: Number(item.coordinates[0].lat),
												lng: Number(item.coordinates[0].lng),
											}}
										/>
									);
								})}

							<Marker
								icon={{
									url: point,
									// scaledSize: new google.maps.Size(20, 20), // scaled size
								}}
								draggable={true}
								onDragEnd={(e) => {
									if (e.latLng) {
										dispatch.appStoreNoPersist.handleChangePointInterest({
											lat: e.latLng?.lat(),
											lng: e.latLng?.lng(),
											// radius: 500,
										});
									}
								}}
								position={{
									lat: Number(geofencePointOfInterest.lat),
									lng: Number(geofencePointOfInterest.lng),
								}}
							/>

							<Circle
								// ref={circleRef}
								// required
								center={{
									lat: Number(geofencePointOfInterest.lat),
									lng: Number(geofencePointOfInterest.lng),
								}}
								radius={Number(raduisPointOfInterest)}
								// required
								options={geofenceOptions}
								onDragEnd={(e) => {
									// setCercleGeofence({ lat: e.latLng?.lat(), lng: e.latLng?.lng()})
									if (e.latLng) {
										dispatch.appStoreNoPersist.handleChangePointInterest({
											lat: Number(e.latLng?.lat()),
											lng: Number(e.latLng?.lng()),
											// radius: 500,
										});
									}
								}}
							/>
						</>
					)} */}

					{startGeofencePointOfInterestIsOpen && (
						<>
							{dataPOIStart &&
								dataPOIStart.map((item: any, index: number) => (
									<Marker
										key={item.poi_id}
										icon={customIcon}
										// icon={{
										// 	url: HomePin,
										// 	scaledSize: new google.maps.Size(25, 25),
										// 	anchor: new google.maps.Point(25, 15),
										// }}
										position={{
											lat: Number(item.coordinates[0].lat),
											lng: Number(item.coordinates[0].lng),
										}}
									/>
								))}

							<Marker
								// icon={{ url: point }}
								icon={customIcon}
								draggable={true}
								eventHandlers={{
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										dispatch.appStoreNoPersist.handleEndPointInterest({
											lat,
											lng,
										});
									},
								}}
								// onDragEnd={(e) => {
								// 	if (e.latLng) {
								// 		dispatch.appStoreNoPersist.handleStartPointInterest({
								// 			lat: e.latLng?.lat(),
								// 			lng: e.latLng?.lng(),
								// 		});
								// 	}
								// }}
								position={{
									lat: Number(startGeofencePointOfInterest.lat),
									lng: Number(startGeofencePointOfInterest.lng),
								}}
							/>

							<Circle
								center={{
									lat: Number(startGeofencePointOfInterest.lat),
									lng: Number(startGeofencePointOfInterest.lng),
								}}
								radius={Number(raduisPointOfInterest)}
								// options={geofenceOptions}
								// 	pathOptions={{
								// 	color: geofenceOptions?.strokeColor || 'blue',
								// 	weight: geofenceOptions?.strokeWeight || 2,
								// 	fillColor: geofenceOptions?.fillColor || 'blue',
								// 	fillOpacity: geofenceOptions?.fillOpacity || 0.4,
								// }}
								// onDragEnd={(e) => {
								// 	if (e.latLng) {
								// 		dispatch.appStoreNoPersist.handleStartPointInterest({
								// 			lat: Number(e.latLng?.lat()),
								// 			lng: Number(e.latLng?.lng()),
								// 		});
								// 	}
								// }}
							/>
						</>
					)}

					{endGeofencePointOfInterestIsOpen && (
						<>
							{dataPOIEnd &&
								dataPOIEnd.map((item: any, index: number) => (
									<Marker
										icon={customIcon}
										key={item.poi_id}
										// icon={{
										// 	url: HomePin,
										// 	scaledSize: new google.maps.Size(25, 25),
										// 	anchor: new google.maps.Point(25, 15),
										// }}
										position={{
											lat: Number(item.coordinates[0].lat),
											lng: Number(item.coordinates[0].lng),
										}}
									/>
								))}

							<Marker
								// icon={{ url: point }}
								icon={customIcon}
								draggable={true}
								// onDragEnd={(e: { latLng: { lat: () => any; lng: () => any; }; }) => {
								// 	if (e.latLng) {
								// 		dispatch.appStoreNoPersist.handleEndPointInterest({
								// 			lat: e.latLng?.lat(),
								// 			lng: e.latLng?.lng(),
								// 		});
								// 	}
								// }}
								eventHandlers={{
									dragend: (e) => {
										const { lat, lng } = e.target.getLatLng();
										dispatch.appStoreNoPersist.handleEndPointInterest({
											lat,
											lng,
										});
									},
								}}
								position={{
									lat: Number(endGeofencePointOfInterest.lat),
									lng: Number(endGeofencePointOfInterest.lng),
								}}
							/>

							<Circle
								center={{
									lat: Number(endGeofencePointOfInterest.lat),
									lng: Number(endGeofencePointOfInterest.lng),
								}}
								radius={Number(raduisPointOfInterest)}
								// options={geofenceOptions}
								// pathOptions={{
								// 	color: geofenceOptions?.strokeColor || 'blue',
								// 	weight: geofenceOptions?.strokeWeight || 2,
								// 	fillColor: geofenceOptions?.fillColor || 'blue',
								// 	fillOpacity: geofenceOptions?.fillOpacity || 0.4,
								// }}
								// onDragEnd={(e: { latLng: { lat: () => any; lng: () => any } }) => {
								// 	if (e.latLng) {
								// 		dispatch.appStoreNoPersist.handleEndPointInterest({
								// 			lat: Number(e.latLng?.lat()),
								// 			lng: Number(e.latLng?.lng()),
								// 		});
								// 	}
								// }}
							/>
						</>
					)}
				</Map>
			</div>
		</Page>
	);
};

export default GeofenceMapContainer;
