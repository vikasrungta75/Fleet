// src/pages/alarms_notifications/AlertsAndNotifications.tsx
// LIGHT THEME — fetches all data from IoT API via dashcamService
import React, { FC, useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import AlertDetailModal from './components/AlertDetailModal';
import {
	fetchAlerts,
	fetchResources,
	resolveMediaUrl,
	alertHasVideo,
	alertHasMedia,
	type IotAlert,
	type IotResource,
} from '../../services/dashcamService';

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
	bg: '#f8f9fa',
	card: '#ffffff',
	border: '#e8e8e8',
	borderMed: '#d0d0d0',
	textPrimary: '#1a1a2e',
	textSecondary: '#555',
	textMuted: '#888',
	pink: '#f00d69',
	purple: '#6c5dd3',
	rowHover: '#fafafa',
};

// ── SEVERITY ──────────────────────────────────────────────────────────────────
type Severity = 'Critical' | 'High' | 'Warning' | 'Info' | 'Normal';

const getSeverity = (alert: IotAlert): Severity => {
	const name = (alert.alertName || alert.alarmType || alert.eventType || '').toLowerCase();
	if (name.includes('sos') || name.includes('collision') || name.includes('fatigue')) return 'Critical';
	if (name.includes('overspeed') || name.includes('speed')) return 'High';
	if (name.includes('alarm') || name.includes('warning') || name.includes('hard') || name.includes('sleep')) return 'Warning';
	if (name.includes('normal') || name.includes('device normal')) return 'Normal';
	return 'Info';
};

const SEVERITY_STYLES: Record<Severity, { bg: string; color: string; border: string; icon: string }> = {
	Critical: { bg: '#fff0f0', color: '#d32f2f', border: '#ffcdd2', icon: '🔴' },
	High:     { bg: '#fff8e1', color: '#e65100', border: '#ffe0b2', icon: '🟠' },
	Warning:  { bg: '#fffde7', color: '#f57f17', border: '#fff9c4', icon: '🟡' },
	Info:     { bg: '#e3f2fd', color: '#1565c0', border: '#bbdefb', icon: '🔵' },
	Normal:   { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9', icon: '🟢' },
};

const ALERT_COLORS: Record<string, string> = {
	Overspeed: '#f00d69', 'Harsh Brake': '#ff6b35', 'Harsh Acceleration': '#ff9500',
	'Fatigue Detection': '#9b59b6', 'Phone Use': '#e74c3c', 'Lane Departure': '#3498db',
	'Collision Warning': '#e74c3c', Tailgating: '#f39c12', Seatbelt: '#1abc9c',
	'About To Sleep': '#f39c12', 'Device Normal': '#2da44e', 'Connection Lost': '#e74c3c',
};

const getAlertColor = (alert: IotAlert) =>
	ALERT_COLORS[alert.alertName || alert.alarmType || alert.eventType || ''] || T.purple;

// ── KNOWN ALERT TYPES (merged with dynamic list from API) ──────────────────────
const KNOWN_ALERT_TYPES = [
	'Overspeed', 'Harsh Brake', 'Harsh Acceleration', 'Fatigue Detection',
	'Phone Use', 'Lane Departure', 'Collision Warning', 'Tailgating',
	'Seatbelt', 'About To Sleep', 'Device Normal', 'Connection Lost',
	'SOS', 'Geofence Enter', 'Geofence Exit', 'Low Battery', 'Tampering',
	'Vibration',
];

type SortField = 'SEVERITY' | 'TYPE' | 'DEVICE' | 'TIME' | null;
type SortDir = 'asc' | 'desc';

const formatTimeAgo = (ms: number): string => {
	const diff = Date.now() - ms;
	const m = Math.floor(diff / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
};

// ── SHARE POPUP ───────────────────────────────────────────────────────────────
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
	const [copied, setCopied] = useState(false);
	const handleCopy = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			<div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, width: 440, maxWidth: '92vw', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>🔗 Share Link</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 18, cursor: 'pointer' }}>✕</button>
				</div>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<input readOnly value={url} style={{ flex: 1, background: '#f8f9ff', border: `1px solid #e0e0e0`, borderRadius: 6, color: '#1565c0', padding: '8px 10px', fontSize: 11, fontFamily: 'monospace' }} />
					<button onClick={handleCopy} style={{ background: copied ? '#2da44e' : T.pink, border: 'none', color: '#fff', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
						{copied ? '✓ Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		</div>
	);
};

// ── VIDEO MODAL ───────────────────────────────────────────────────────────────
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoModal: FC<{ resource: IotResource; onClose: () => void }> = ({ resource, onClose }) => {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const [showDots, setShowDots] = useState(false);
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [showShare, setShowShare] = useState(false);
	const fileUrl = resolveMediaUrl(resource.storagePath);

	React.useEffect(() => {
		if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
	}, [playbackSpeed]);

	const handleDownload = () => {
		const a = document.createElement('a'); a.href = fileUrl;
		a.download = resource.fileName; a.click();
	};
	const handlePiP = async () => {
		if (videoRef.current && document.pictureInPictureEnabled) {
			try { await videoRef.current.requestPictureInPicture(); } catch {}
		}
	};

	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={fileUrl} onClose={() => setShowShare(false)} />}
			<div style={{ background: '#fff', borderRadius: 12, width: 860, maxWidth: '97vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background: '#f8f9fa', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}` }}>
					<span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>Video Playback</span>
					<span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 7px' }}>CH {resource.channel}</span>
					<span style={{ color: T.textMuted, fontSize: 11, marginLeft: 'auto' }}>{new Date(resource.captureTime).toLocaleString()}</span>
					<span style={{ color: T.pink, fontWeight: 700, fontSize: 12 }}>{resource.imei}</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 18, cursor: 'pointer' }}>✕</button>
				</div>
				<div style={{ background: '#111' }}>
					<video ref={videoRef} src={fileUrl} controls autoPlay style={{ width: '100%', maxHeight: '55vh', display: 'block', objectFit: 'contain' }} />
				</div>
				<div style={{ background: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${T.border}` }}>
					<span style={{ color: T.textMuted, fontSize: 11, fontFamily: 'monospace', flex: 1 }}>{resource.fileName}</span>
					<button onClick={() => setShowShare(true)} style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>🔗 Share</button>
					<button onClick={handleDownload} style={{ background: T.pink, border: 'none', color: '#fff', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>⬇ Download</button>
					<div style={{ position: 'relative' }}>
						<button onClick={() => setShowDots(d => !d)} style={{ background: '#f5f5f5', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>⋮</button>
						{showDots && (
							<div style={{ position: 'absolute', bottom: '110%', right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 180, zIndex: 100, overflow: 'hidden', border: `1px solid ${T.border}` }}>
								<button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: T.textPrimary }}>⬇ Download</button>
								<button onClick={() => setShowSpeedMenu(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 16px', border: 'none', background: showSpeedMenu ? '#f5f5f5' : 'transparent', cursor: 'pointer', fontSize: 14, color: T.textPrimary }}>⏱ Playback speed</button>
								{showSpeedMenu && (
									<div style={{ background: '#fff', borderTop: `1px solid ${T.border}` }}>
										{PLAYBACK_SPEEDS.map(speed => (
											<button key={speed} onClick={() => { setPlaybackSpeed(speed); setShowDots(false); setShowSpeedMenu(false); }}
												style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 24px', border: 'none', background: speed === playbackSpeed ? '#fff0f5' : 'transparent', cursor: 'pointer', fontSize: 14, color: speed === playbackSpeed ? T.pink : T.textPrimary }}>
												{speed === 1 ? 'Normal' : `${speed}x`}
												{speed === playbackSpeed && <span style={{ color: T.pink }}>✓</span>}
											</button>
										))}
									</div>
								)}
								<button onClick={handlePiP} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 16px', border: 'none', borderTop: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 14, color: T.textPrimary }}>⧉ Picture in picture</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// ── IMAGE MODAL ───────────────────────────────────────────────────────────────
const ImageModal: FC<{ resource: IotResource; onClose: () => void }> = ({ resource, onClose }) => {
	const [showShare, setShowShare] = useState(false);
	const fileUrl = resolveMediaUrl(resource.storagePath);
	const handleDownload = () => {
		const a = document.createElement('a'); a.href = fileUrl;
		a.download = resource.fileName; a.click();
	};
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={fileUrl} onClose={() => setShowShare(false)} />}
			<div style={{ background: '#fff', borderRadius: 12, width: 900, maxWidth: '97vw', overflow: 'hidden', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background: '#f8f9fa', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
					<span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>Image Detail</span>
					<span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>CH {resource.channel}</span>
					<span style={{ color: T.textMuted, fontSize: 11 }}>{new Date(resource.captureTime).toLocaleString()}</span>
					<span style={{ color: T.textMuted, fontSize: 11 }}>{(resource.fileSize / 1024).toFixed(1)} KB</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 18, cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
				</div>
				<div style={{ flex: 1, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<img src={fileUrl} alt='alert' style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
				</div>
				<div style={{ background: '#fff', padding: '10px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<span style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace', flex: 1 }}>{resource.fileName}</span>
					<button onClick={() => setShowShare(true)} style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>🔗 Share</button>
					<button onClick={handleDownload} style={{ background: T.pink, border: 'none', color: '#fff', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>⬇ Download</button>
				</div>
			</div>
		</div>
	);
};

// ── LOADING / EMPTY STATES ────────────────────────────────────────────────────
const Spinner: FC = () => (
	<div style={{ textAlign: 'center', padding: 60, color: T.textMuted }}>
		<div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
		<p>Loading from IoT server...</p>
	</div>
);

const EmptyState: FC<{ icon: string; msg: string }> = ({ icon, msg }) => (
	<div style={{ textAlign: 'center', padding: 60, color: T.textMuted }}>
		<div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
		<p>{msg}</p>
	</div>
);

// ── API STATUS BAR ────────────────────────────────────────────────────────────
const StatusBar: FC<{ apiError: string | null; total: number; label: string }> = ({ apiError, total, label }) => (
	<div style={{ background: apiError ? '#fff0f0' : '#e8f5e9', borderTop: `1px solid ${apiError ? '#ffb3b3' : '#c8e6c9'}`, padding: '5px 20px', fontSize: 11, color: apiError ? '#c00' : '#2e7d32', marginTop: 16 }}>
		{apiError
			? `❌ API error: ${apiError}`
			: `✓ Live data from iot.ravity.io — ${total} ${label}`}
	</div>
);

// ── FILTER BAR ────────────────────────────────────────────────────────────────
const FilterBar: FC<{
	search: string; onSearch: (v: string) => void;
	options: string[]; selected: string; onSelect: (v: string) => void;
	placeholder: string; count: number; total: number; label: string;
}> = ({ search, onSearch, options, selected, onSelect, placeholder, count, total, label }) => (
	<div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
		<div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 6, padding: '0 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
			<span style={{ color: T.textMuted, fontSize: 13 }}>🔍</span>
			<input value={search} onChange={e => onSearch(e.target.value)} placeholder='Search...'
				style={{ background: 'transparent', border: 'none', color: T.textPrimary, padding: '8px 6px', fontSize: 13, outline: 'none', width: 180 }} />
		</div>
		<select value={selected} onChange={e => onSelect(e.target.value)}
			style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
			<option value=''>{placeholder}</option>
			{options.map(v => <option key={v} value={v}>{v}</option>)}
		</select>
		<span style={{ color: T.textMuted, fontSize: 12, marginLeft: 'auto' }}>{label} — {count} / {total}</span>
	</div>
);

// ── TAB 1: ALERTS ─────────────────────────────────────────────────────────────
const AlertsTab: FC<{ onSelectAlert: (a: IotAlert) => void }> = ({ onSelectAlert }) => {
	const [alerts, setAlerts] = useState<IotAlert[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [sortField, setSortField] = useState<SortField>(null);
	const [sortDir, setSortDir] = useState<SortDir>('asc');
	const [selectedMedia, setSelectedMedia] = useState<IotAlert | null>(null);
	const PAGE_SIZE = 20;

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchAlerts(p, PAGE_SIZE, {
				keyword: search || undefined,
				// Client-side type filter — API expects numeric codes we may not have
				// so we fetch all and filter locally when typeFilter is set
			});
			if (res?.data && res.data.length > 0) {
				setAlerts(res.data);
				setTotalPages(res.totalPages || 1);
				setTotal(res.total || 0);
						} else {
				setAlerts([]);
				setTotal(0);
						}
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 120) : err?.message ?? 'Network error';
			setApiError(status ? `HTTP ${status} — ${detail}` : detail);
			setAlerts([]);
		} finally {
			setLoading(false);
		}
	}, [search]);

	useEffect(() => { load(page); }, [page, load]);

	// Merge API-sourced types with known list
	const dynamicTypes = Array.from(new Set(alerts.map(a => a.alertName || a.alarmType || a.eventType || '').filter(Boolean)));
	const alertTypes = Array.from(new Set([...KNOWN_ALERT_TYPES, ...dynamicTypes])).sort();

	// Client-side type filter
	let displayed = typeFilter
		? alerts.filter(a => (a.alertName || a.alarmType || a.eventType || '') === typeFilter)
		: alerts;

	// Client-side sorting
	if (sortField) {
		const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Warning: 2, Info: 3, Normal: 4 };
		displayed = [...displayed].sort((a, b) => {
			let av: string | number = '';
			let bv: string | number = '';
			if (sortField === 'SEVERITY') { av = SEVERITY_ORDER[getSeverity(a)] ?? 5; bv = SEVERITY_ORDER[getSeverity(b)] ?? 5; }
			if (sortField === 'TYPE') { av = a.alertName || a.alarmType || a.eventType || ''; bv = b.alertName || b.alarmType || b.eventType || ''; }
			if (sortField === 'DEVICE') { av = a.deviceName || ''; bv = b.deviceName || ''; }
			if (sortField === 'TIME') { av = a.alertTime; bv = b.alertTime; }
			if (av < bv) return sortDir === 'asc' ? -1 : 1;
			if (av > bv) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
	}

	const handleSort = (field: SortField) => {
		if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
		else { setSortField(field); setSortDir('asc'); }
	};

	const SortBtn: FC<{ field: SortField }> = ({ field }) => (
		<span onClick={() => handleSort(field)} style={{ cursor: 'pointer', userSelect: 'none', marginLeft: 3, color: sortField === field ? T.pink : T.textMuted, fontSize: 10 }}>
			{sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
		</span>
	);

	const SORTABLE_COLS: { label: string; field: SortField | null }[] = [
		{ label: 'MEDIA', field: null },
		{ label: 'SEVERITY', field: 'SEVERITY' },
		{ label: 'TYPE', field: 'TYPE' },
		{ label: 'DEVICE', field: 'DEVICE' },
		{ label: 'IMEI', field: null },
		{ label: 'TIME', field: 'TIME' },
		{ label: 'VIEW', field: null },
	];

	return (
		<div>
			{/* Media quick-view modal for clickable media icon */}
			{selectedMedia && (() => {
				const att = (selectedMedia as any).attachment;
				const firstUrl = Array.isArray(att) && att.length > 0
					? `https://iot.ravity.io${att[0].storagePath}`
					: null;
				const isVideo = firstUrl && /\.(mp4|avi|mov|mkv)/i.test(firstUrl);
				return firstUrl ? (
					<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						onClick={() => setSelectedMedia(null)}>
						<div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
							<div style={{ background: '#f8f9fa', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
								<span style={{ fontWeight: 700, color: T.textPrimary, fontSize: 14 }}>Alert Media — {selectedMedia.alertName || selectedMedia.alarmType}</span>
								<button onClick={() => setSelectedMedia(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: T.textMuted }}>✕</button>
							</div>
							<div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								{isVideo
									? <video src={firstUrl} controls autoPlay style={{ maxWidth: '80vw', maxHeight: '65vh' }} />
									: <img src={firstUrl} alt='alert media' style={{ maxWidth: '80vw', maxHeight: '65vh', objectFit: 'contain' }} />}
							</div>
						</div>
					</div>
				) : null;
			})()}

			<FilterBar
				search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={alertTypes} selected={typeFilter} onSelect={v => { setTypeFilter(v); setPage(1); }}
				placeholder='All Alert Types' count={displayed.length} total={total} label='Alerts'
			/>
			<div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
				{/* Sortable Header */}
				<div style={{ display: 'grid', gridTemplateColumns: '60px 110px 1fr 1fr 1fr 1fr 70px', borderBottom: `1px solid ${T.border}`, padding: '10px 20px', background: '#f8f9fa' }}>
					{SORTABLE_COLS.map(({ label, field }) => (
						<div key={label} style={{ color: T.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center' }}>
							{label}
							{field && <SortBtn field={field} />}
						</div>
					))}
				</div>

				{loading ? <Spinner /> : displayed.length === 0 ? <EmptyState icon='🔔' msg='No alerts found' /> : displayed.map((alert, i) => {
					const sev = getSeverity(alert);
					const sevStyle = SEVERITY_STYLES[sev];
					const name = alert.alertName || alert.alarmType || alert.eventType || 'Unknown';
					const hasMedia = alertHasMedia(alert);
					return (
						<div key={alert.id}
							style={{ display: 'grid', gridTemplateColumns: '60px 110px 1fr 1fr 1fr 1fr 70px', borderBottom: i < displayed.length - 1 ? `1px solid ${T.border}` : 'none', padding: '14px 20px', alignItems: 'center' }}
							onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = T.rowHover}
							onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
							<div>
								{hasMedia
									? <span title='View alert media' onClick={() => setSelectedMedia(alert)}
											style={{ fontSize: 18, cursor: 'pointer', filter: 'drop-shadow(0 1px 2px rgba(240,13,105,0.3))', transition: 'transform 0.15s' }}
											onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.transform = 'scale(1.2)'}
											onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.transform = 'scale(1)'}>📹</span>
									: <span style={{ color: T.borderMed, fontSize: 16 }}>—</span>}
							</div>
							<div>
								<span style={{ background: sevStyle.bg, color: sevStyle.color, border: `1px solid ${sevStyle.border}`, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', display: 'inline-block' }}>
									{sevStyle.icon} {sev}
								</span>
							</div>
							<div style={{ color: T.textPrimary, fontWeight: 600, fontSize: 13 }}>{name}</div>
							<div style={{ color: T.textSecondary, fontSize: 12 }}>{alert.deviceName || '—'}</div>
							<div style={{ color: T.textMuted, fontSize: 11, fontFamily: 'monospace' }}>{alert.imei}</div>
							<div>
								<div style={{ color: T.textSecondary, fontSize: 12 }}>{new Date(alert.alertTime).toLocaleString()}</div>
								<div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{formatTimeAgo(alert.alertTime)}</div>
							</div>
							<div>
								<button onClick={() => onSelectAlert(alert)}
									style={{ background: '#e3f2fd', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#1565c0', fontSize: 16 }}>👁</button>
							</div>
						</div>
					);
				})}

				{/* Pagination */}
				{!loading && total > 0 && (
					<div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, background: '#fafafa' }}>
						<span style={{ color: T.textMuted, fontSize: 12 }}>Page {page} of {totalPages} • {total} total</span>
						<div style={{ display: 'flex', gap: 8 }}>
							<button disabled={page === 1} onClick={() => setPage(p => p - 1)}
								style={{ background: '#fff', border: `1px solid ${T.border}`, color: page === 1 ? T.borderMed : T.textSecondary, borderRadius: 5, padding: '5px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Previous</button>
							<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
								style={{ background: page === totalPages ? '#f5f5f5' : T.pink, border: 'none', color: page === totalPages ? T.borderMed : '#fff', borderRadius: 5, padding: '5px 14px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}>Next →</button>
						</div>
					</div>
				)}
			</div>
			<StatusBar apiError={apiError} total={total} label='alerts' />
		</div>
	);
};

// ── TAB 2: MEDIA ALERTS (Videos) ──────────────────────────────────────────────
const MediaAlertsTab: FC = () => {
	const [resources, setResources] = useState<IotResource[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState('');
	const [imeiFilter, setImeiFilter] = useState('');
	const [selectedVideo, setSelectedVideo] = useState<IotResource | null>(null);

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchResources(p, 20, {
				mediaType: 1, // video only
				keyword: search || undefined,
				imei: imeiFilter || undefined,
			});
			if (res?.data) {
				setResources(res.data);
				setTotalPages(res.totalPages || 1);
				setTotal(res.total || 0);
							}
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 120) : err?.message ?? 'Network error';
			setApiError(status ? `HTTP ${status} — ${detail}` : detail);
			setResources([]);
		} finally {
			setLoading(false);
		}
	}, [search, imeiFilter]);

	useEffect(() => { load(page); }, [page, load]);

	const imeis = Array.from(new Set(resources.map(r => r.imei)));

	return (
		<div style={{ minHeight: '60vh' }}>
			{selectedVideo && <VideoModal resource={selectedVideo} onClose={() => setSelectedVideo(null)} />}
			<FilterBar
				search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={imeis} selected={imeiFilter} onSelect={v => { setImeiFilter(v); setPage(1); }}
				placeholder='All Devices' count={resources.length} total={total} label='Videos'
			/>
			{loading ? <Spinner /> : resources.length === 0 ? <EmptyState icon='📹' msg='No video alerts found' /> : (
				<>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
						{resources.map(r => (
							<div key={r.id} onClick={() => setSelectedVideo(r)}
								style={{ background: T.card, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
								onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(240,13,105,0.15)'; }}
								onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
								<div style={{ position: 'relative', background: '#111', height: 130 }}>
									<video src={resolveMediaUrl(r.storagePath)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} preload='metadata' />
									<div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4 }}>
										<span style={{ background: T.pink, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 3, padding: '1px 5px' }}>VIDEO</span>
										<span style={{ background: 'rgba(255,255,255,0.9)', color: '#1565c0', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>CH {r.channel}</span>
									</div>
									<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<div style={{ width: 38, height: 38, background: 'rgba(240,13,105,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>▶</div>
									</div>
								</div>
								<div style={{ padding: '10px 12px' }}>
									<div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{r.eventType || 'Alert Video'}</div>
									<div style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{r.imei}</div>
									<div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{new Date(r.captureTime).toLocaleString()}</div>
									<div style={{ color: T.textMuted, fontSize: 10, marginTop: 1 }}>{(r.fileSize / 1024).toFixed(0)} KB</div>
								</div>
							</div>
						))}
					</div>
					{totalPages > 1 && (
						<div style={{ padding: '16px 0', display: 'flex', gap: 8, justifyContent: 'center' }}>
							<button disabled={page === 1} onClick={() => setPage(p => p - 1)}
								style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '5px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Previous</button>
							<span style={{ color: T.textMuted, fontSize: 12, padding: '5px 10px' }}>Page {page} of {totalPages}</span>
							<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
								style={{ background: page === totalPages ? '#f5f5f5' : T.pink, border: 'none', color: page === totalPages ? T.borderMed : '#fff', borderRadius: 5, padding: '5px 14px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}>Next →</button>
						</div>
					)}
				</>
			)}
			<StatusBar apiError={apiError} total={total} label='videos' />
		</div>
	);
};

// ── TAB 3: IMAGE ALERTS ───────────────────────────────────────────────────────
const ImageAlertsTab: FC = () => {
	const [resources, setResources] = useState<IotResource[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState('');
	const [imeiFilter, setImeiFilter] = useState('');
	const [selectedImage, setSelectedImage] = useState<IotResource | null>(null);

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchResources(p, 20, {
				mediaType: 0, // images only
				keyword: search || undefined,
				imei: imeiFilter || undefined,
			});
			if (res?.data) {
				setResources(res.data);
				setTotalPages(res.totalPages || 1);
				setTotal(res.total || 0);
							}
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 120) : err?.message ?? 'Network error';
			setApiError(status ? `HTTP ${status} — ${detail}` : detail);
			setResources([]);
		} finally {
			setLoading(false);
		}
	}, [search, imeiFilter]);

	useEffect(() => { load(page); }, [page, load]);

	const imeis = Array.from(new Set(resources.map(r => r.imei)));

	return (
		<div style={{ minHeight: '60vh' }}>
			{selectedImage && <ImageModal resource={selectedImage} onClose={() => setSelectedImage(null)} />}
			<FilterBar
				search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={imeis} selected={imeiFilter} onSelect={v => { setImeiFilter(v); setPage(1); }}
				placeholder='All Devices' count={resources.length} total={total} label='Images'
			/>
			{loading ? <Spinner /> : resources.length === 0 ? <EmptyState icon='🖼️' msg='No image alerts found' /> : (
				<>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
						{resources.map(r => (
							<div key={r.id} onClick={() => setSelectedImage(r)}
								style={{ background: T.card, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
								onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(240,13,105,0.15)'; }}
								onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
								<div style={{ position: 'relative', height: 130, background: '#f0f0f0' }}>
									<img src={resolveMediaUrl(r.storagePath)} alt='alert' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
									<div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4 }}>
										<span style={{ background: T.purple, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 3, padding: '1px 5px' }}>IMAGE</span>
										<span style={{ background: 'rgba(255,255,255,0.9)', color: '#1565c0', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>CH {r.channel}</span>
									</div>
								</div>
								<div style={{ padding: '10px 12px' }}>
									<div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{r.eventType || 'Alert Image'}</div>
									<div style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{r.imei}</div>
									<div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{new Date(r.captureTime).toLocaleString()}</div>
									<div style={{ color: T.textMuted, fontSize: 10, marginTop: 1 }}>{(r.fileSize / 1024).toFixed(1)} KB</div>
								</div>
							</div>
						))}
					</div>
					{totalPages > 1 && (
						<div style={{ padding: '16px 0', display: 'flex', gap: 8, justifyContent: 'center' }}>
							<button disabled={page === 1} onClick={() => setPage(p => p - 1)}
								style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '5px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>← Previous</button>
							<span style={{ color: T.textMuted, fontSize: 12, padding: '5px 10px' }}>Page {page} of {totalPages}</span>
							<button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
								style={{ background: page === totalPages ? '#f5f5f5' : T.pink, border: 'none', color: page === totalPages ? T.borderMed : '#fff', borderRadius: 5, padding: '5px 14px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}>Next →</button>
						</div>
					)}
				</>
			)}
			<StatusBar apiError={apiError} total={total} label='images' />
		</div>
	);
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
type TabId = 'alerts' | 'media' | 'images';

const TABS: { id: TabId; label: string; icon: string }[] = [
	{ id: 'alerts', label: 'Alerts',       icon: '🔔' },
	{ id: 'media',  label: 'Media Alerts', icon: '🎥' },
	{ id: 'images', label: 'Image Alerts', icon: '🖼️' },
];

const AlertsAndNotifications: FC = () => {
	const [activeTab, setActiveTab] = useState<TabId>('alerts');
	const [selectedAlert, setSelectedAlert] = useState<IotAlert | null>(null);

	return (
		<PageWrapper isProtected title='Alerts'>
			<SubHeader>
				<SubHeaderLeft>
					<span style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary }}>Alerts & Notifications</span>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				<div style={{ borderBottom: `2px solid ${T.border}`, marginBottom: 24, display: 'flex', gap: 0 }}>
					{TABS.map(tab => (
						<button key={tab.id} onClick={() => setActiveTab(tab.id)}
							style={{
								background: 'none', border: 'none',
								borderBottom: activeTab === tab.id ? `2px solid ${T.pink}` : '2px solid transparent',
								marginBottom: -2, padding: '10px 22px', cursor: 'pointer',
								fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 14,
								color: activeTab === tab.id ? T.pink : '#666',
								display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.15s',
							}}>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				{activeTab === 'alerts' && <AlertsTab onSelectAlert={setSelectedAlert} />}
				{activeTab === 'media'  && <MediaAlertsTab />}
				{activeTab === 'images' && <ImageAlertsTab />}
			</Page>

			{selectedAlert ? (
				<AlertDetailModal
					alert={selectedAlert as any}
					onClose={() => setSelectedAlert(null)}
					relatedMedia={undefined}
					relatedImage={undefined}
				/>
			)  : <></>}
		</PageWrapper>
	);
};

export default AlertsAndNotifications;
