import { FeatureGroup, Polygon, Marker, Circle } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import React, { useContext, useEffect, useRef, useState } from 'react';
import point from '../../../../../assets/svg/custom-point-marker.svg';
import ThemeContext from '../../../../../contexts/themeContext';
import Page from '../../../../../layout/Page/Page';
import { ICoordinates } from '../../../../../type/geofences-type';
import { geofenceOptions } from '../../constants/constants';
import Map from './GeofenceMap';
import { DragEndEvent, Map as LeafletMap } from 'leaflet';
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
	polyline?: any;
	inMyFleet: boolean;
}

const GeofenceMapContainer = (props: IGeofenceMapContainer) => {
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
		polyline,
	} = props;
	const { mobileDesign } = useContext(ThemeContext);

	// const [map, setMap] = useState<MapType | null>(null);
	const [map, setMap] = useState<LeafletMap | null>(null);

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

		if (GeofenceShape.polyline) {
			setPolyline(paths);
		}

		if (GeofenceShape.polygone) {
			setPolygonPoints(paths);
			setPolygon(paths);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPolylineComplete = React.useCallback(function onPolylineComplete(poly: any) {
		const polyArray = poly.getPath().getArray();
		const paths = polyArray.map((pointxx: any) => ({
			lat: pointxx.lat(),
			lng: pointxx.lng(),
		}));

		if (GeofenceShape.polyline) {
			setPolyline(paths);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const onDrawingManagerLoad = React.useCallback(function onDrawingManagerLoad(
		drawingManager: any,
	) {},
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

	// Create custom icon
	const customIcon = L.icon({
		iconUrl: point,
		iconSize: [20, 20],
		iconAnchor: [10, 20],
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
					{polygon && polygon.length > 0 ? (
						<Polygon
							positions={polygon}
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
								icon={customIcon}
								draggable={inMyFleet ? false : true}
								eventHandlers={{
									dragend: (e: DragEndEvent) => {
										const { lat, lng } = e.target.getLatLng();
										setGeofencePoint({ lat, lng });
										setCercleGeofence({ lat, lng });
									},
								}}
								position={geofencePoint}
							/>

							<Circle
								ref={circleRef}
								center={geofencePoint}
								radius={Number(radiusCircle) || 0}
								pathOptions={{
									...options,
								}}
							/>
						</>
					)}
				</Map>
			</div>
		</Page>
	);
};

export default GeofenceMapContainer;
