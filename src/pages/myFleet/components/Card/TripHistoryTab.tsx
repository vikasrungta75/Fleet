// src/pages/myFleet/components/Card/TripHistoryTab.tsx
// Ravity Trip History — integrated with real API (vc_history_trip_route_adv0 / adv2)
import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import Spinner from '../../../../components/bootstrap/Spinner';

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
	bg: '#f8f9fa',
	card: '#ffffff',
	border: '#e8e8e8',
	primary: '#6c5dd3',
	primaryLight: '#f0eeff',
	pink: '#f00d69',
	pinkLight: '#fff0f5',
	textPrimary: '#1a1a2e',
	textSecondary: '#555',
	textMuted: '#888',
	success: '#2da44e',
	warning: '#f57c00',
	error: '#d32f2f',
	info: '#1565c0',
};

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface TripEntry {
	_id: string;
	trip_start?: { $date: string };
	trip_end?: { $date: string };
	start_address?: string;
	end_address?: string;
	distance?: string;
	duration: string;
	status?: string; // 'Stopped'
	stop_address?: string;
	coordinates?: { Mapped_latitude: number; Mapped_longitude: number; time: string };
}

interface RoutePoint {
	Mapped_latitude: number;
	Mapped_longitude: number;
	time: string;
}

interface RouteData {
	datetime: { $date: string }[];
	coordinates: RoutePoint[];
	speed: string[];
	fuel_level: string[];
	temperature: string[];
	_id: string;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const speedValue = (s: string) => parseInt(s?.replace(/[^0-9]/g, '') || '0');

const speedToColor = (speed: number): string => {
	if (speed === 0) return '#888';
	if (speed < 40) return T.success;
	if (speed < 70) return T.warning;
	if (speed < 90) return '#e65100';
	return T.error;
};

const formatDate = (isoString: string) => {
	try {
		const d = new Date(isoString);
		return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
	} catch {
		return '';
	}
};

const formatTime = (isoString: string) => {
	try {
		const d = new Date(isoString);
		return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
	} catch {
		return '';
	}
};

// ── MAP FIT BOUNDS ────────────────────────────────────────────────────────────
const MapFitBounds: FC<{ points: { lat: number; lng: number }[] }> = ({ points }) => {
	const map = useMap();
	useEffect(() => {
		if (points.length > 0) {
			const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
			map.fitBounds(bounds, { padding: [30, 30] });
		}
	}, [points, map]);
	return null;
};

// ── MOVING MARKER ─────────────────────────────────────────────────────────────
const MovingMarker: FC<{ position: [number, number]; speed: number }> = ({ position, speed }) => {
	const map = useMap();
	useEffect(() => {
		map.panTo(position, { animate: true, duration: 0.5 });
	}, [position, map]);

	const icon = L.divIcon({
		html: `<div style="width:28px;height:28px;background:${speedToColor(speed)};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:10px;color:white;font-weight:700">${speed}</div>`,
		className: '',
		iconSize: [28, 28],
		iconAnchor: [14, 14],
	});

	return (
		<Marker position={position} icon={icon}>
			<Popup>{speed} km/h</Popup>
		</Marker>
	);
};

// ── START / END MARKERS ───────────────────────────────────────────────────────
const makeStartIcon = () =>
	L.divIcon({
		html: `<div style="width:22px;height:22px;background:${T.success};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:10px;font-weight:700">S</span></div>`,
		className: '',
		iconSize: [22, 22],
		iconAnchor: [11, 11],
	});

const makeEndIcon = () =>
	L.divIcon({
		html: `<div style="width:22px;height:22px;background:${T.error};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:10px;font-weight:700">E</span></div>`,
		className: '',
		iconSize: [22, 22],
		iconAnchor: [11, 11],
	});

// ── COLORED POLYLINE SEGMENTS ─────────────────────────────────────────────────
const ColoredPolyline: FC<{
	points: { lat: number; lng: number; speed: number }[];
}> = ({ points }) => {
	if (points.length < 2) return null;
	const segments: JSX.Element[] = [];
	for (let i = 0; i < points.length - 1; i++) {
		const avgSpeed = (points[i].speed + points[i + 1].speed) / 2;
		segments.push(
			<Polyline
				key={i}
				positions={[
					[points[i].lat, points[i].lng],
					[points[i + 1].lat, points[i + 1].lng],
				]}
				pathOptions={{ color: speedToColor(avgSpeed), weight: 4, opacity: 0.85 }}
			/>,
		);
	}
	return <>{segments}</>;
};

// ── STAT CHIP ─────────────────────────────────────────────────────────────────
const StatChip: FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
	<div
		style={{
			background: `${color}12`,
			border: `1px solid ${color}30`,
			borderRadius: 8,
			padding: '6px 10px',
			minWidth: 80,
			textAlign: 'center',
		}}>
		<div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
		<div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{label}</div>
	</div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface TripHistoryTabProps {
	selectedVin?: string; // pre-selected VIN from the fleet card
}

const TripHistoryTab: FC<TripHistoryTabProps> = ({ selectedVin }) => {

	// ── Auth / user state
	const { allVehicles } = useSelector((state: RootState) => state.vehicles);

	// ── Date filter
	const today = new Date();
	const todayStr = today.toISOString().split('T')[0];
	const weekAgoStr = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
	const [startDate, setStartDate] = useState(weekAgoStr);
	const [endDate, setEndDate] = useState(todayStr);

	// ── Vehicle selection
	const [vin, setVin] = useState<string>(selectedVin || '');

	// ── Trip list
	const [trips, setTrips] = useState<TripEntry[]>([]);
	const [tripsLoading, setTripsLoading] = useState(false);
	const [tripsError, setTripsError] = useState('');

	// ── Selected trip & route
	const [selectedTrip, setSelectedTrip] = useState<TripEntry | null>(null);
	const [routeData, setRouteData] = useState<RouteData | null>(null);
	const [routeLoading, setRouteLoading] = useState(false);

	// ── Replay state
	const [isPlaying, setIsPlaying] = useState(false);
	const [replayIndex, setReplayIndex] = useState(0);
	const [replaySpeed, setReplaySpeed] = useState(1);
	const intervalRef = useRef<any>(null);

	// ── Tab
	const [activeTab, setActiveTab] = useState<'timeline' | 'stats'>('timeline');

	// ── Derived: route points with speed
	const routePoints: { lat: number; lng: number; speed: number }[] = routeData
		? routeData.coordinates
				.map((c, i) => ({
					lat: c.Mapped_latitude,
					lng: c.Mapped_longitude,
					speed: speedValue(routeData.speed[i] || '0'),
				}))
				.filter((p) => p.lat !== 0 && p.lng !== 0)
		: [];

	const currentPoint = routePoints[replayIndex];
	const progress = routePoints.length > 1 ? (replayIndex / (routePoints.length - 1)) * 100 : 0;

	// ── API: fetch trip list
	const fetchTrips = useCallback(async () => {
		if (!vin) return;
		setTripsLoading(true);
		setTripsError('');
		setTrips([]);
		setSelectedTrip(null);
		setRouteData(null);

		try {
			const baseUrl = process.env.REACT_APP_REST_URL || '';
			const endpoint = `${baseUrl}vc_history_trip_route_adv0?vin=${vin}&startdate=${startDate}&enddate=${endDate}`;
			const resp = await fetch(endpoint, {
				headers: {
					clientid: process.env.REACT_APP_CLIENT_ID || '',
					clientsecret: process.env.REACT_APP_CLIENT_SECRET || '',
					appname: process.env.REACT_APP_APP_NAME || '',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			const data = await resp.json();
			const list = Array.isArray(data) ? data : [];
			setTrips(list);
		} catch (err: any) {
			setTripsError('Failed to load trips. Check your connection.');
		} finally {
			setTripsLoading(false);
		}
	}, [vin, startDate, endDate]);

	// ── API: fetch route for a trip
	const fetchRoute = useCallback(async (tripId: string) => {
		setRouteLoading(true);
		setRouteData(null);
		setIsPlaying(false);
		setReplayIndex(0);

		try {
			const baseUrl = process.env.REACT_APP_REST_URL || '';
			const endpoint = `${baseUrl}vc_history_trip_route_adv2?trip_id=${tripId}`;
			const resp = await fetch(endpoint, {
				headers: {
					clientid: process.env.REACT_APP_CLIENT_ID || '',
					clientsecret: process.env.REACT_APP_CLIENT_SECRET || '',
					appname: process.env.REACT_APP_APP_NAME || '',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			const data = await resp.json();
			// Response: [{ values: [RouteData], vin }]
			const values = Array.isArray(data) && data[0]?.values ? data[0].values : [];
			const routeEntry: RouteData | undefined = values.find((v: RouteData) => v._id === tripId) || values[0];
			setRouteData(routeEntry || null);
		} catch (err) {
			setRouteData(null);
		} finally {
			setRouteLoading(false);
		}
	}, []);

	// ── Replay interval
	useEffect(() => {
		if (isPlaying && routePoints.length > 0) {
			intervalRef.current = setInterval(() => {
				setReplayIndex((prev) => {
					if (prev >= routePoints.length - 1) {
						setIsPlaying(false);
						return prev;
					}
					return prev + 1;
				});
			}, 300 / replaySpeed);
		}
		return () => clearInterval(intervalRef.current);
	}, [isPlaying, replaySpeed, routePoints.length]);

	// ── Stop replay when trip changes
	useEffect(() => {
		setIsPlaying(false);
		setReplayIndex(0);
	}, [selectedTrip]);

	// ── Auto-fetch on VIN change from parent
	useEffect(() => {
		if (selectedVin) setVin(selectedVin);
	}, [selectedVin]);

	const onSelectTrip = (trip: TripEntry) => {
		if (trip.status === 'Stopped') return; // stops don't have routes
		setSelectedTrip(trip);
		fetchRoute(trip._id);
	};

	// ── Pure-trip entries (no stops)
	const tripEntries = trips.filter((trip) => !trip.status);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				fontFamily: 'Manrope, Nunito Sans, sans-serif',
				background: T.bg,
				overflow: 'hidden',
			}}>
			{/* ── VEHICLE + DATE FILTER ── */}
			<div
				style={{
					background: T.card,
					padding: '10px 12px',
					borderBottom: `1px solid ${T.border}`,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
				}}>
				{/* VIN selector */}
				<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
					<span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>Vehicle:</span>
					<select
						value={vin}
						onChange={(e) => setVin(e.target.value)}
						style={{
							flex: 1,
							border: `1px solid ${T.border}`,
							borderRadius: 6,
							padding: '4px 8px',
							fontSize: 12,
							color: T.textPrimary,
							background: T.card,
							outline: 'none',
						}}>
						<option value=''>— Select vehicle —</option>
						{Array.isArray(allVehicles) &&
							allVehicles.map((v: any) => (
								<option key={v.vin || v.vin_no} value={v.vin || v.vin_no}>
									{v.plate_no || v.name || v.vin || v.vin_no}
								</option>
							))}
					</select>
				</div>

				{/* Date range */}
				<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
					<input
						type='date'
						value={startDate}
						max={endDate}
						onChange={(e) => setStartDate(e.target.value)}
						style={{
							flex: 1,
							border: `1px solid ${T.border}`,
							borderRadius: 6,
							padding: '4px 6px',
							fontSize: 11,
							color: T.textPrimary,
							background: T.card,
						}}
					/>
					<span style={{ fontSize: 10, color: T.textMuted }}>to</span>
					<input
						type='date'
						value={endDate}
						min={startDate}
						max={todayStr}
						onChange={(e) => setEndDate(e.target.value)}
						style={{
							flex: 1,
							border: `1px solid ${T.border}`,
							borderRadius: 6,
							padding: '4px 6px',
							fontSize: 11,
							color: T.textPrimary,
							background: T.card,
						}}
					/>
					<button
						onClick={fetchTrips}
						disabled={!vin || tripsLoading}
						style={{
							background: vin ? T.primary : '#ccc',
							border: 'none',
							borderRadius: 6,
							padding: '5px 10px',
							color: 'white',
							fontSize: 11,
							fontWeight: 700,
							cursor: vin ? 'pointer' : 'not-allowed',
							whiteSpace: 'nowrap',
						}}>
						{tripsLoading ? '...' : 'Search'}
					</button>
				</div>
			</div>

			{/* ── TRIP LIST ── */}
			<div style={{ flex: '0 0 auto', maxHeight: 220, overflowY: 'auto', background: T.card }}>
				{tripsLoading && (
					<div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
						<Spinner color='secondary' size='2rem' />
					</div>
				)}
				{tripsError && (
					<div style={{ color: T.error, fontSize: 12, padding: '10px 12px', textAlign: 'center' }}>
						{tripsError}
					</div>
				)}
				{!tripsLoading && !tripsError && trips.length === 0 && vin && (
					<div
						style={{
							color: T.textMuted,
							fontSize: 12,
							padding: '16px 12px',
							textAlign: 'center',
						}}>
						No trips found for this date range.
					</div>
				)}
				{!tripsLoading &&
					tripEntries.map((trip, idx) => {
						const isSelected = selectedTrip?._id === trip._id;
						return (
							<div
								key={trip._id}
								onClick={() => onSelectTrip(trip)}
								style={{
									padding: '8px 12px',
									borderBottom: `1px solid ${T.border}`,
									cursor: 'pointer',
									background: isSelected ? T.primaryLight : T.card,
									borderLeft: isSelected ? `3px solid ${T.primary}` : '3px solid transparent',
									transition: 'all 0.15s',
								}}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: 3,
									}}>
									<span
										style={{
											fontSize: 11,
											fontWeight: 700,
											color: isSelected ? T.primary : T.textPrimary,
										}}>
										Trip {idx + 1}
									</span>
									<span
										style={{
											fontSize: 10,
											color: T.textMuted,
											background: T.bg,
											borderRadius: 4,
											padding: '1px 6px',
										}}>
										{trip.duration}
									</span>
								</div>
								<div
									style={{
										display: 'flex',
										gap: 8,
										fontSize: 10,
										color: T.textSecondary,
										marginBottom: 2,
									}}>
									<span style={{ color: T.success, fontWeight: 600 }}>
										▶{' '}
										{trip.trip_start?.$date
											? `${formatDate(trip.trip_start.$date)} ${formatTime(trip.trip_start.$date)}`
											: '—'}
									</span>
									<span>→</span>
									<span style={{ color: T.error, fontWeight: 600 }}>
										⏹{' '}
										{trip.trip_end?.$date
											? `${formatDate(trip.trip_end.$date)} ${formatTime(trip.trip_end.$date)}`
											: '—'}
									</span>
								</div>
								<div style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									{trip.start_address?.split(',').slice(0, 2).join(', ')} → {trip.end_address?.split(',').slice(0, 2).join(', ')}
								</div>
								<div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
									<span
										style={{
											fontSize: 10,
											color: T.primary,
											background: T.primaryLight,
											borderRadius: 4,
											padding: '1px 5px',
										}}>
										📏 {trip.distance || '—'}
									</span>
								</div>
							</div>
						);
					})}
			</div>

			{/* ── MAP AREA ── */}
			<div style={{ flex: 1, position: 'relative', minHeight: 200, overflow: 'hidden' }}>
				{routeLoading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							zIndex: 500,
							background: 'rgba(255,255,255,0.8)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<Spinner color='secondary' size='3rem' />
					</div>
				)}

				{routePoints.length > 0 ? (
					<MapContainer
						center={[routePoints[0].lat, routePoints[0].lng]}
						zoom={14}
						style={{ width: '100%', height: '100%' }}
						zoomControl={false}>
						<TileLayer
							url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
							attribution='© OpenStreetMap'
						/>
						<MapFitBounds points={routePoints} />

						{/* Colored route */}
						<ColoredPolyline points={routePoints} />

						{/* Start marker */}
						<Marker position={[routePoints[0].lat, routePoints[0].lng]} icon={makeStartIcon()}>
							<Popup>
								<strong>Start</strong>
								<br />
								{selectedTrip?.start_address?.split(',').slice(0, 3).join(', ')}
							</Popup>
						</Marker>

						{/* End marker */}
						<Marker
							position={[
								routePoints[routePoints.length - 1].lat,
								routePoints[routePoints.length - 1].lng,
							]}
							icon={makeEndIcon()}>
							<Popup>
								<strong>End</strong>
								<br />
								{selectedTrip?.end_address?.split(',').slice(0, 3).join(', ')}
							</Popup>
						</Marker>

						{/* Replay moving marker */}
						{(isPlaying || replayIndex > 0) && currentPoint && (
							<MovingMarker
								position={[currentPoint.lat, currentPoint.lng]}
								speed={currentPoint.speed}
							/>
						)}
					</MapContainer>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							background: T.primaryLight,
							color: T.textMuted,
							gap: 8,
							padding: 16,
							textAlign: 'center',
						}}>
						<span style={{ fontSize: 36 }}>🗺️</span>
						<div style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>
							{selectedTrip ? 'No route data available' : vin ? 'Select a trip to view route' : 'Select a vehicle to begin'}
						</div>
						<div style={{ fontSize: 11, color: T.textMuted }}>
							Trip route will appear on the map
						</div>
					</div>
				)}

				{/* Speed badge overlay */}
				{currentPoint && (
					<div
						style={{
							position: 'absolute',
							top: 8,
							right: 8,
							zIndex: 999,
							background: 'white',
							border: `2px solid ${speedToColor(currentPoint.speed)}`,
							borderRadius: 8,
							padding: '5px 10px',
							boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
							textAlign: 'center',
							minWidth: 56,
						}}>
						<div
							style={{
								fontSize: 18,
								fontWeight: 800,
								color: speedToColor(currentPoint.speed),
								lineHeight: 1,
							}}>
							{currentPoint.speed}
						</div>
						<div style={{ fontSize: 9, color: T.textMuted }}>km/h</div>
					</div>
				)}
			</div>

			{/* ── REPLAY CONTROLS ── */}
			{selectedTrip && routePoints.length > 0 && (
				<div
					style={{
						background: T.card,
						borderTop: `1px solid ${T.border}`,
						padding: '8px 12px',
					}}>
					{/* Progress bar */}
					<div
						style={{
							width: '100%',
							height: 5,
							background: T.bg,
							borderRadius: 3,
							marginBottom: 8,
							cursor: 'pointer',
							position: 'relative',
						}}
						onClick={(e) => {
							const rect = (e.target as HTMLDivElement).getBoundingClientRect();
							const pct = (e.clientX - rect.left) / rect.width;
							setReplayIndex(Math.floor(pct * (routePoints.length - 1)));
						}}>
						<div
							style={{
								height: '100%',
								width: `${progress}%`,
								background: `linear-gradient(90deg, ${T.primary}, ${T.pink})`,
								borderRadius: 3,
								transition: 'width 0.1s',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: `${progress}%`,
								transform: 'translate(-50%, -50%)',
								width: 10,
								height: 10,
								background: T.primary,
								border: '2px solid white',
								borderRadius: '50%',
								boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
							}}
						/>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
						{/* Controls */}
						<button
							onClick={() => { setIsPlaying(false); setReplayIndex(0); }}
							style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: '4px 7px', cursor: 'pointer', fontSize: 12 }}
							title='Stop'>
							⏹
						</button>
						<button
							onClick={() => setIsPlaying((p) => !p)}
							style={{
								background: T.primary,
								border: 'none',
								borderRadius: 5,
								padding: '5px 12px',
								cursor: 'pointer',
								fontSize: 12,
								color: 'white',
								fontWeight: 700,
								minWidth: 54,
							}}>
							{isPlaying ? '⏸ Pause' : '▶ Play'}
						</button>
						<button
							onClick={() => setReplayIndex(0)}
							style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: '4px 7px', cursor: 'pointer', fontSize: 12 }}
							title='Restart'>
							⏮
						</button>
						<button
							onClick={() =>
								setReplayIndex((p) => Math.max(0, p - Math.floor(routePoints.length / 10)))
							}
							style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: '4px 7px', cursor: 'pointer', fontSize: 12 }}>
							⏪
						</button>
						<button
							onClick={() =>
								setReplayIndex((p) =>
									Math.min(routePoints.length - 1, p + Math.floor(routePoints.length / 10)),
								)
							}
							style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 5, padding: '4px 7px', cursor: 'pointer', fontSize: 12 }}>
							⏩
						</button>

						{/* Speed multipliers */}
						<div style={{ display: 'flex', gap: 3, marginLeft: 2 }}>
							{[1, 2, 5, 10].map((s) => (
								<button
									key={s}
									onClick={() => setReplaySpeed(s)}
									style={{
										background: replaySpeed === s ? T.primary : T.bg,
										border: `1px solid ${replaySpeed === s ? T.primary : T.border}`,
										color: replaySpeed === s ? 'white' : T.textSecondary,
										borderRadius: 4,
										padding: '2px 6px',
										cursor: 'pointer',
										fontSize: 10,
										fontWeight: replaySpeed === s ? 700 : 400,
									}}>
									{s}×
								</button>
							))}
						</div>

						{/* Point counter */}
						<div style={{ marginLeft: 'auto', fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap' }}>
							{replayIndex + 1}/{routePoints.length}
						</div>
					</div>
				</div>
			)}

			{/* ── TRIP DETAIL TABS ── */}
			{selectedTrip && (
				<div
					style={{
						background: T.card,
						borderTop: `1px solid ${T.border}`,
						maxHeight: 160,
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
					}}>
					{/* Tab headers */}
					<div
						style={{
							display: 'flex',
							borderBottom: `1px solid ${T.border}`,
							padding: '0 12px',
						}}>
						{(['timeline', 'stats'] as const).map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								style={{
									padding: '8px 12px',
									background: 'none',
									border: 'none',
									borderBottom: activeTab === tab ? `2px solid ${T.primary}` : '2px solid transparent',
									color: activeTab === tab ? T.primary : T.textSecondary,
									fontWeight: activeTab === tab ? 700 : 400,
									fontSize: 11,
									cursor: 'pointer',
									fontFamily: 'Manrope, sans-serif',
									textTransform: 'capitalize',
									marginBottom: -1,
								}}>
								{tab === 'timeline' ? '📍 Route' : '📊 Stats'}
							</button>
						))}
					</div>

					{/* Tab content */}
					<div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
						{activeTab === 'timeline' && (
							<div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: 0,
									}}>
									<div
										style={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											background: T.success,
											flexShrink: 0,
										}}
									/>
									<div
										style={{
											width: 2,
											flex: 1,
											background: T.border,
											minHeight: 24,
										}}
									/>
									<div
										style={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											background: T.error,
											flexShrink: 0,
										}}
									/>
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ marginBottom: 6 }}>
										<div style={{ fontSize: 11, fontWeight: 700, color: T.success }}>
											Start{' '}
											{selectedTrip.trip_start?.$date
												? `— ${formatTime(selectedTrip.trip_start.$date)}`
												: ''}
										</div>
										<div style={{ fontSize: 10, color: T.textSecondary }}>
											{selectedTrip.start_address?.split(',').slice(0, 3).join(', ')}
										</div>
									</div>
									<div>
										<div style={{ fontSize: 11, fontWeight: 700, color: T.error }}>
											End{' '}
											{selectedTrip.trip_end?.$date
												? `— ${formatTime(selectedTrip.trip_end.$date)}`
												: ''}
										</div>
										<div style={{ fontSize: 10, color: T.textSecondary }}>
											{selectedTrip.end_address?.split(',').slice(0, 3).join(', ')}
										</div>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'stats' && (
							<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
								<StatChip label='Distance' value={selectedTrip.distance || '—'} color={T.primary} />
								<StatChip label='Duration' value={selectedTrip.duration} color={T.primary} />
								<StatChip
									label='Route Pts'
									value={`${routePoints.length}`}
									color={T.info}
								/>
								{routePoints.length > 0 && (
									<StatChip
										label='Max Speed'
										value={`${Math.max(...routePoints.map((p) => p.speed))} km/h`}
										color={T.error}
									/>
								)}
								{routePoints.length > 0 && (
									<StatChip
										label='Avg Speed'
										value={`${Math.round(routePoints.reduce((s, p) => s + p.speed, 0) / routePoints.length)} km/h`}
										color={T.warning}
									/>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default TripHistoryTab;
