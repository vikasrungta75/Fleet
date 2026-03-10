// src/pages/alarms_notifications/AlertsAndNotifications.tsx
// Ravity design — purple/pink palette, proper dashcam + image icons, media wired to detail modal
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
	type IotAttachment,
	type IotResource,
} from '../../services/dashcamService';

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
	bg:           '#f4f5f9',
	card:         '#ffffff',
	border:       '#e8e8f0',
	borderMed:    '#d0d0e0',
	textPrimary:  '#1a1a2e',
	textSecondary:'#4a4a6a',
	textMuted:    '#9090b0',
	pink:         '#f00d69',
	purple:       '#6c5dd3',
	purpleLight:  '#f0eeff',
	purpleBorder: '#d4ccff',
	rowHover:     '#f8f7ff',
	headerBg:     '#fafaff',
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

const SEV: Record<Severity, { bg: string; color: string; dot: string }> = {
	Critical: { bg: '#fff0f0', color: '#d32f2f', dot: '#d32f2f' },
	High:     { bg: '#fff4ec', color: '#e65100', dot: '#ff6b35' },
	Warning:  { bg: '#fffbec', color: '#b45309', dot: '#f59e0b' },
	Info:     { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
	Normal:   { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
};

const KNOWN_ALERT_TYPES = [
	'Overspeed','Harsh Brake','Harsh Acceleration','Fatigue Detection',
	'Phone Use','Lane Departure','Collision Warning','Tailgating',
	'Seatbelt','About To Sleep','Device Normal','Connection Lost',
	'SOS','Geofence Enter','Geofence Exit','Low Battery','Tampering','Vibration',
];

type SortField = 'SEVERITY' | 'TYPE' | 'DEVICE' | 'TIME' | null;
type SortDir   = 'asc' | 'desc';

const timeAgo = (ms: number) => {
	const d = Date.now() - ms, m = Math.floor(d / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
};

// ── SVG ICONS (Ravity-style, no emoji) ────────────────────────────────────────
const IconDashcam: FC<{ size?: number; color?: string }> = ({ size = 18, color = T.purple }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M23 7l-7 5 7 5V7z"/>
		<rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
	</svg>
);

const IconPhoto: FC<{ size?: number; color?: string }> = ({ size = 18, color = T.pink }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<rect x="3" y="3" width="18" height="18" rx="2"/>
		<circle cx="8.5" cy="8.5" r="1.5"/>
		<polyline points="21,15 16,10 5,21"/>
	</svg>
);

const IconEye: FC<{ size?: number; color?: string }> = ({ size = 16, color = '#3b82f6' }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
		<circle cx="12" cy="12" r="3"/>
	</svg>
);

const IconPlay: FC<{ size?: number }> = ({ size = 14 }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
);

// ── SHARE POPUP ───────────────────────────────────────────────────────────────
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
	const [copied, setCopied] = useState(false);
	const copy = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:10002, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			<div style={{ background:'#fff', borderRadius:14, padding:28, width:440, maxWidth:'92vw', boxShadow:'0 8px 40px rgba(108,93,211,0.18)' }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
					<span style={{ color:T.textPrimary, fontWeight:700, fontSize:15 }}>Share Link</span>
					<button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
				</div>
				<div style={{ display:'flex', gap:8 }}>
					<input readOnly value={url} style={{ flex:1, background:'#f8f7ff', border:`1px solid ${T.purpleBorder}`, borderRadius:7, color:T.purple, padding:'8px 10px', fontSize:11, fontFamily:'monospace', outline:'none' }} />
					<button onClick={copy} style={{ background:copied ? '#22c55e' : T.pink, border:'none', color:'#fff', borderRadius:7, padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:12, whiteSpace:'nowrap' }}>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
				</div>
			</div>
		</div>
	);
};

// ── VIDEO VIEWER MODAL ────────────────────────────────────────────────────────
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoViewerModal: FC<{ url: string; title?: string; ch?: number; onClose: () => void }> = ({ url, title, ch, onClose }) => {
	const ref = React.useRef<HTMLVideoElement>(null);
	const [speed, setSpeed] = useState(1);
	const [showMenu, setShowMenu] = useState(false);
	const [showShare, setShowShare] = useState(false);
	React.useEffect(() => { if (ref.current) ref.current.playbackRate = speed; }, [speed]);
	const download = () => { const a = document.createElement('a'); a.href = url; a.download = `alert_video_${Date.now()}.mp4`; a.click(); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={url} onClose={() => setShowShare(false)} />}
			<div style={{ background:'#fff', borderRadius:14, width:860, maxWidth:'97vw', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background:T.headerBg, padding:'12px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
					<IconDashcam size={16} />
					<span style={{ fontWeight:700, fontSize:14, color:T.textPrimary }}>Video Playback</span>
					{title && <span style={{ background:T.purpleLight, color:T.purple, fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>{title}</span>}
					{ch !== undefined && <span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>CH {ch}</span>}
					<button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
				</div>
				<div style={{ background:'#111' }}>
					<video ref={ref} src={url} controls autoPlay style={{ width:'100%', maxHeight:'55vh', display:'block', objectFit:'contain' }} />
				</div>
				<div style={{ background:'#fff', padding:'10px 18px', display:'flex', alignItems:'center', gap:8, borderTop:`1px solid ${T.border}` }}>
					<span style={{ color:T.textMuted, fontSize:11, fontFamily:'monospace', flex:1 }}>{url.split('/').pop()}</span>
					<button onClick={() => setShowShare(true)} style={{ background:'#fff', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:12 }}>Share</button>
					<button onClick={download} style={{ background:T.pink, border:'none', color:'#fff', borderRadius:7, padding:'6px 16px', cursor:'pointer', fontSize:12, fontWeight:700 }}>⬇ Download</button>
					<div style={{ position:'relative' }}>
						<button onClick={() => setShowMenu(m => !m)} style={{ background:'#f5f5f5', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:7, padding:'6px 10px', cursor:'pointer', fontSize:16 }}>⋮</button>
						{showMenu && (
							<div style={{ position:'absolute', bottom:'110%', right:0, background:'#fff', borderRadius:10, boxShadow:'0 4px 20px rgba(0,0,0,0.15)', minWidth:180, zIndex:100, border:`1px solid ${T.border}`, overflow:'hidden' }}>
								<div style={{ padding:'8px 14px 4px', fontSize:10, color:T.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Playback Speed</div>
								{SPEEDS.map(s => (
									<button key={s} onClick={() => { setSpeed(s); setShowMenu(false); }}
										style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'9px 16px', border:'none', background: s === speed ? T.purpleLight : 'transparent', cursor:'pointer', fontSize:13, color: s === speed ? T.purple : T.textPrimary, fontWeight: s === speed ? 700 : 400 }}>
										{s === 1 ? 'Normal' : `${s}×`}
										{s === speed && <span style={{ color:T.purple }}>✓</span>}
									</button>
								))}
								<button onClick={async () => { if (ref.current && document.pictureInPictureEnabled) { try { await ref.current.requestPictureInPicture(); } catch {} } setShowMenu(false); }}
									style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', border:'none', borderTop:`1px solid ${T.border}`, background:'transparent', cursor:'pointer', fontSize:13, color:T.textPrimary }}>⧉ Picture in Picture</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// ── IMAGE VIEWER MODAL ────────────────────────────────────────────────────────
const ImageViewerModal: FC<{ url: string; title?: string; ch?: number; onClose: () => void }> = ({ url, title, ch, onClose }) => {
	const [showShare, setShowShare] = useState(false);
	const download = () => { const a = document.createElement('a'); a.href = url; a.download = `alert_image_${Date.now()}.jpg`; a.click(); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={url} onClose={() => setShowShare(false)} />}
			<div style={{ background:'#fff', borderRadius:14, width:900, maxWidth:'97vw', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background:T.headerBg, padding:'12px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
					<IconPhoto size={16} />
					<span style={{ fontWeight:700, fontSize:14, color:T.textPrimary }}>Image Detail</span>
					{title && <span style={{ background:'#fff0f6', color:T.pink, fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>{title}</span>}
					{ch !== undefined && <span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>CH {ch}</span>}
					<button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
				</div>
				<div style={{ background:'#f4f5f9', display:'flex', alignItems:'center', justifyContent:'center', minHeight:280 }}>
					<img src={url} alt='alert' style={{ maxWidth:'100%', maxHeight:'60vh', objectFit:'contain', display:'block' }} />
				</div>
				<div style={{ background:'#fff', padding:'10px 18px', borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
					<span style={{ color:T.textMuted, fontSize:11, fontFamily:'monospace', flex:1 }}>{url.split('/').pop()}</span>
					<button onClick={() => setShowShare(true)} style={{ background:'#fff', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:12 }}>Share</button>
					<button onClick={download} style={{ background:T.pink, border:'none', color:'#fff', borderRadius:7, padding:'6px 16px', cursor:'pointer', fontSize:12, fontWeight:700 }}>⬇ Download</button>
				</div>
			</div>
		</div>
	);
};

// ── MEDIA ICON CELL — shows dashcam 📹 or image 🖼 badge, opens correct viewer ─
const MediaCell: FC<{ alert: IotAlert }> = ({ alert }) => {
	const [viewVideo, setViewVideo] = useState<IotAttachment | null>(null);
	const [viewImage, setViewImage] = useState<IotAttachment | null>(null);

	const attachments = alert.attachment || [];
	const videos = attachments.filter(a => a.mediaType === 1);
	const images = attachments.filter(a => a.mediaType === 0);
	const hasVideo = videos.length > 0;
	const hasImage = images.length > 0;

	if (!hasVideo && !hasImage) {
		return <span style={{ color:T.borderMed, fontSize:14 }}>—</span>;
	}

	const name = alert.alertName || alert.alarmType || alert.eventType;

	return (
		<div style={{ display:'flex', gap:6, alignItems:'center' }}>
			{hasVideo && (
				<button title={`View dashcam video (${videos.length})`}
					onClick={() => setViewVideo(videos[0])}
					style={{ background:T.purpleLight, border:`1px solid ${T.purpleBorder}`, borderRadius:6, padding:'4px 7px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, transition:'all 0.15s' }}
					onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.purple; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
					onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = T.purpleLight; (e.currentTarget as HTMLButtonElement).style.color = ''; }}>
					<IconDashcam size={13} color={T.purple} />
					{videos.length > 1 && <span style={{ fontSize:9, fontWeight:700, color:T.purple }}>{videos.length}</span>}
				</button>
			)}
			{hasImage && (
				<button title={`View alert image (${images.length})`}
					onClick={() => setViewImage(images[0])}
					style={{ background:'#fff0f6', border:`1px solid #ffc0d8`, borderRadius:6, padding:'4px 7px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, transition:'all 0.15s' }}
					onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.pink; }}
					onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff0f6'; }}>
					<IconPhoto size={13} color={T.pink} />
					{images.length > 1 && <span style={{ fontSize:9, fontWeight:700, color:T.pink }}>{images.length}</span>}
				</button>
			)}

			{viewVideo && (
				<VideoViewerModal
					url={resolveMediaUrl(viewVideo.storagePath)}
					title={name}
					ch={viewVideo.channel}
					onClose={() => setViewVideo(null)}
				/>
			)}
			{viewImage && (
				<ImageViewerModal
					url={resolveMediaUrl(viewImage.storagePath)}
					title={name}
					ch={viewImage.channel}
					onClose={() => setViewImage(null)}
				/>
			)}
		</div>
	);
};

// ── LOADING / EMPTY ───────────────────────────────────────────────────────────
const Spinner: FC = () => (
	<div style={{ textAlign:'center', padding:60, color:T.textMuted }}>
		<div style={{ width:36, height:36, border:`3px solid ${T.purpleLight}`, borderTop:`3px solid ${T.purple}`, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
		<p style={{ fontSize:13 }}>Loading alerts…</p>
		<style>{`@keyframes spin { to { transform:rotate(360deg); }}`}</style>
	</div>
);

const EmptyState: FC<{ icon: React.ReactNode; msg: string }> = ({ icon, msg }) => (
	<div style={{ textAlign:'center', padding:60, color:T.textMuted }}>
		<div style={{ marginBottom:10 }}>{icon}</div>
		<p style={{ fontSize:13 }}>{msg}</p>
	</div>
);

const StatusBar: FC<{ apiError: string | null; total: number; label: string }> = ({ apiError, total, label }) => (
	<div style={{ background: apiError ? '#fff0f0' : '#f0fdf4', borderTop:`1px solid ${apiError ? '#ffb3b3' : '#bbf7d0'}`, padding:'5px 20px', fontSize:11, color: apiError ? '#c00' : '#166534', marginTop:16 }}>
		{apiError ? `❌ API error: ${apiError}` : `✓ Live data from iot.ravity.io — ${total} ${label}`}
	</div>
);

// ── FILTER BAR ────────────────────────────────────────────────────────────────
const FilterBar: FC<{
	search: string; onSearch: (v: string) => void;
	options: string[]; selected: string; onSelect: (v: string) => void;
	placeholder: string; count: number; total: number; label: string;
}> = ({ search, onSearch, options, selected, onSelect, placeholder, count, total, label }) => (
	<div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
		<div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:`1px solid ${T.border}`, borderRadius:8, padding:'0 12px', boxShadow:'0 1px 4px rgba(108,93,211,0.06)' }}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
			<input value={search} onChange={e => onSearch(e.target.value)} placeholder='Search…'
				style={{ background:'transparent', border:'none', color:T.textPrimary, padding:'8px 6px', fontSize:13, outline:'none', width:180 }} />
		</div>
		<select value={selected} onChange={e => onSelect(e.target.value)}
			style={{ background:'#fff', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer', outline:'none' }}>
			<option value=''>{placeholder}</option>
			{options.map(v => <option key={v} value={v}>{v}</option>)}
		</select>
		<span style={{ color:T.textMuted, fontSize:12, marginLeft:'auto' }}>{label}: <strong style={{ color:T.textPrimary }}>{count}</strong> / {total}</span>
	</div>
);

// ── PAGINATION ────────────────────────────────────────────────────────────────
const Pagination: FC<{ page: number; totalPages: number; total: number; onPage: (p: number) => void }> = ({ page, totalPages, total, onPage }) => (
	<div style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${T.border}`, background:T.headerBg }}>
		<span style={{ color:T.textMuted, fontSize:12 }}>Page {page} of {totalPages} • {total} total</span>
		<div style={{ display:'flex', gap:8 }}>
			<button disabled={page === 1} onClick={() => onPage(page - 1)}
				style={{ background:'#fff', border:`1px solid ${T.border}`, color: page === 1 ? T.borderMed : T.textSecondary, borderRadius:7, padding:'5px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize:12 }}>← Prev</button>
			{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
				const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
				return (
					<button key={n} onClick={() => onPage(n)}
						style={{ background: n === page ? T.purple : '#fff', border:`1px solid ${n === page ? T.purple : T.border}`, color: n === page ? '#fff' : T.textSecondary, borderRadius:7, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight: n === page ? 700 : 400, minWidth:32 }}>{n}</button>
				);
			})}
			<button disabled={page === totalPages} onClick={() => onPage(page + 1)}
				style={{ background: page === totalPages ? '#f5f5f5' : T.pink, border:'none', color: page === totalPages ? T.borderMed : '#fff', borderRadius:7, padding:'5px 14px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize:12, fontWeight:700 }}>Next →</button>
		</div>
	</div>
);

// ── TAB 1: ALERTS ─────────────────────────────────────────────────────────────
// Alert type colour mapping (matches Image 1 design)
const ALERT_TYPE_COLOR: Record<string, string> = {
	'Device Normal':      '#2da44e',
	'About To Sleep':     '#f59e0b',
	'Ignition Off':       '#6c5dd3',
	'Ignition On':        '#3b82f6',
	'Emergency Sos':      '#d32f2f',
	'Emergency SOS':      '#d32f2f',
	'Hard Braking':       '#e65100',
	'Harsh Brake':        '#e65100',
	'Harsh Acceleration': '#f59e0b',
	'Speeding':           '#d32f2f',
	'Overspeed':          '#d32f2f',
	'Fatigue Detection':  '#7b1fa2',
	'Phone Use':          '#c62828',
	'Lane Departure':     '#1565c0',
	'Collision Warning':  '#b71c1c',
	'Connection Lost':    '#c62828',
	'Tailgating':         '#f39c12',
	'Seatbelt':           '#1abc9c',
};
const getAlertTypeColor = (name: string) =>
	ALERT_TYPE_COLOR[name] || ALERT_TYPE_COLOR[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()] || '#6c5dd3';

// Inline media attachment icons (like Image 1 — outline when no media, filled/coloured when available)
const AttachmentCell: FC<{ alert: IotAlert }> = ({ alert }) => {
	const [viewVideo, setViewVideo] = useState<IotAttachment | null>(null);
	const [viewImage, setViewImage] = useState<IotAttachment | null>(null);
	const attachments = (alert as any).attachment || [];
	const videos = attachments.filter((a: IotAttachment) => a.mediaType === 1);
	const images = attachments.filter((a: IotAttachment) => a.mediaType === 0);
	const hasVideo = videos.length > 0;
	const hasImage = images.length > 0;
	const name = alert.alertName || alert.alarmType || alert.eventType;
	return (
		<div style={{ display:'flex', gap:8, alignItems:'center' }}>
			{/* Image attachment icon */}
			<button title={hasImage ? 'View image' : 'No image'} onClick={() => hasImage && setViewImage(images[0])}
				style={{ background:'none', border:'none', cursor: hasImage ? 'pointer' : 'default', padding:2, opacity: hasImage ? 1 : 0.28, display:'flex', alignItems:'center' }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill={hasImage ? T.pink : 'none'} stroke={hasImage ? T.pink : T.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
				</svg>
			</button>
			{/* Video attachment icon */}
			<button title={hasVideo ? 'View video' : 'No video'} onClick={() => hasVideo && setViewVideo(videos[0])}
				style={{ background:'none', border:'none', cursor: hasVideo ? 'pointer' : 'default', padding:2, opacity: hasVideo ? 1 : 0.28, display:'flex', alignItems:'center' }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill={hasVideo ? T.purple : 'none'} stroke={hasVideo ? T.purple : T.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
					<polygon points="5,3 19,12 5,21" fill={hasVideo ? T.purple : 'none'}/>
					<circle cx="12" cy="12" r="10" fill="none"/>
				</svg>
			</button>
			{viewVideo && <VideoViewerModal url={resolveMediaUrl(viewVideo.storagePath)} title={name} ch={viewVideo.channel} onClose={() => setViewVideo(null)} />}
			{viewImage && <ImageViewerModal url={resolveMediaUrl(viewImage.storagePath)} title={name} ch={viewImage.channel} onClose={() => setViewImage(null)} />}
		</div>
	);
};

// Dismiss icon (bell with slash)
const IconDismiss: FC<{ color?: string }> = ({ color = '#f59e0b' }) => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
		<line x1="1" y1="1" x2="23" y2="23"/>
	</svg>
);

const AlertsTab: FC<{ onSelectAlert: (a: IotAlert) => void }> = ({ onSelectAlert }) => {
	const [alerts, setAlerts]         = useState<IotAlert[]>([]);
	const [dismissed, setDismissed]   = useState<Set<number>>(new Set());
	const [loading, setLoading]       = useState(true);
	const [apiError, setApiError]     = useState<string | null>(null);
	const [page, setPage]             = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal]           = useState(0);
	const [search, setSearch]         = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [sortField, setSortField]   = useState<SortField>(null);
	const [sortDir, setSortDir]       = useState<SortDir>('desc');
	const PAGE_SIZE = 20;

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchAlerts(p, PAGE_SIZE, { keyword: search || undefined });
			if (res?.data) { setAlerts(res.data); setTotalPages(res.totalPages || 1); setTotal(res.total || 0); }
			else { setAlerts([]); setTotal(0); }
		} catch (err: any) {
			const detail = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 120) : (err?.message ?? 'Network error');
			setApiError(err?.response?.status ? `HTTP ${err.response.status} — ${detail}` : detail);
			setAlerts([]);
		} finally { setLoading(false); }
	}, [search]);

	useEffect(() => { load(page); }, [page, load]);

	const dynamicTypes = Array.from(new Set(alerts.map(a => a.alertName || a.alarmType || a.eventType || '').filter(Boolean)));
	const alertTypes = Array.from(new Set([...KNOWN_ALERT_TYPES, ...dynamicTypes])).sort();

	let displayed = alerts.filter(a => !dismissed.has(a.id));
	if (typeFilter) displayed = displayed.filter(a => (a.alertName || a.alarmType || a.eventType || '') === typeFilter);

	if (sortField) {
		const SORD: Record<string, number> = { Critical:0, High:1, Warning:2, Info:3, Normal:4 };
		displayed = [...displayed].sort((a, b) => {
			let av: string | number = '', bv: string | number = '';
			if (sortField === 'SEVERITY') { av = SORD[getSeverity(a)] ?? 5; bv = SORD[getSeverity(b)] ?? 5; }
			if (sortField === 'TYPE')     { av = a.alertName || a.alarmType || a.eventType || ''; bv = b.alertName || b.alarmType || b.eventType || ''; }
			if (sortField === 'DEVICE')   { av = a.deviceName || ''; bv = b.deviceName || ''; }
			if (sortField === 'TIME')     { av = a.alertTime; bv = b.alertTime; }
			if (av < bv) return sortDir === 'asc' ? -1 : 1;
			if (av > bv) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
	}

	const handleSort = (f: SortField) => {
		if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
		else { setSortField(f); setSortDir('asc'); }
	};

	const SortBtn: FC<{ field: SortField }> = ({ field }) => (
		<span onClick={() => handleSort(field)} style={{ cursor:'pointer', userSelect:'none', marginLeft:3, color: sortField === field ? T.purple : T.textMuted, fontSize:10 }}>
			{sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
		</span>
	);

	// Columns matching Image 1: ID | Alert Time | Alert Type | Trigger Type | Device ID | Device Name | Location | Attachment | Actions
	const COLS = [
		{ label:'ID',           field:null       as SortField, width:'60px' },
		{ label:'Alert Time',   field:'TIME'     as SortField, width:'160px' },
		{ label:'Alert Type',   field:'TYPE'     as SortField, width:'1fr' },
		{ label:'Trigger Type', field:null       as SortField, width:'110px' },
		{ label:'Device ID',    field:null       as SortField, width:'1fr' },
		{ label:'Device Name',  field:'DEVICE'   as SortField, width:'120px' },
		{ label:'Location',     field:null       as SortField, width:'1fr' },
		{ label:'Attachment',   field:null       as SortField, width:'100px' },
		{ label:'Actions',      field:null       as SortField, width:'90px' },
	];
	const grid = COLS.map(c => c.width).join(' ');

	return (
		<div>
			<FilterBar search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={alertTypes} selected={typeFilter} onSelect={v => { setTypeFilter(v); setPage(1); }}
				placeholder='All Alert Types' count={displayed.length} total={total} label='Alerts' />

			<div style={{ background:T.card, borderRadius:12, border:`1px solid ${T.border}`, overflow:'auto', boxShadow:'0 2px 8px rgba(108,93,211,0.07)' }}>
				{/* Header */}
				<div style={{ display:'grid', gridTemplateColumns:grid, borderBottom:`1px solid ${T.border}`, padding:'11px 20px', background:T.headerBg, minWidth:900 }}>
					{COLS.map(({ label, field }) => (
						<div key={label} style={{ color:T.textMuted, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, display:'flex', alignItems:'center', whiteSpace:'nowrap' }}>
							{label}{field && <SortBtn field={field} />}
						</div>
					))}
				</div>

				{loading ? <Spinner /> : displayed.length === 0
					? <EmptyState icon={<IconDashcam size={32} color={T.textMuted} />} msg='No alerts found' />
					: displayed.map((alert, i) => {
						const name = alert.alertName || alert.alarmType || alert.eventType || 'Unknown';
						const typeColor = getAlertTypeColor(name);
						const loc = (alert as any).location || '';
						// Format time as YYYY-MM-DD HH:mm:ss
						const dt = new Date(alert.alertTime);
						const alertTimeStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`;
						return (
							<div key={alert.id}
								style={{ display:'grid', gridTemplateColumns:grid, borderBottom: i < displayed.length - 1 ? `1px solid ${T.border}` : 'none', padding:'13px 20px', alignItems:'center', transition:'background 0.1s', minWidth:900 }}
								onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = T.rowHover}
								onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
								{/* ID */}
								<div style={{ color:T.textMuted, fontSize:13 }}>{alert.id}</div>
								{/* Alert Time */}
								<div style={{ color:T.textSecondary, fontSize:12 }}>{alertTimeStr}</div>
								{/* Alert Type — coloured text, uppercase */}
								<div style={{ color:typeColor, fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:0.3 }}>{name}</div>
								{/* Trigger Type */}
								<div>
									<span style={{ background:'#e8f5e9', color:'#2e7d32', border:'1px solid #c8e6c9', fontSize:11, fontWeight:600, borderRadius:5, padding:'2px 10px' }}>
										{(alert as any).triggerType || 'Event'}
									</span>
								</div>
								{/* Device ID (IMEI) */}
								<div style={{ color:T.textSecondary, fontSize:12, fontFamily:'monospace' }}>{alert.imei}</div>
								{/* Device Name */}
								<div style={{ color:T.textSecondary, fontSize:12 }}>{alert.deviceName || '—'}</div>
								{/* Location */}
								<div style={{ color:T.textMuted, fontSize:11, fontFamily:'monospace' }}>
									{loc
										? <a href={`https://maps.google.com/?q=${loc}`} target='_blank' rel='noreferrer'
											style={{ color:T.purple, textDecoration:'none', fontSize:11 }}>{loc}</a>
										: '—'}
								</div>
								{/* Attachment icons */}
								<AttachmentCell alert={alert} />
								{/* Actions: View + Dismiss */}
								<div style={{ display:'flex', gap:8, alignItems:'center' }}>
									<button title='View details' onClick={() => onSelectAlert(alert)}
										style={{ background:'#eff6ff', border:`1px solid #bfdbfe`, borderRadius:7, padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
										<IconEye size={15} color='#3b82f6' />
									</button>
									<button title='Dismiss alert' onClick={() => setDismissed(d => new Set([...d, alert.id]))}
										style={{ background:'#fffbeb', border:`1px solid #fde68a`, borderRadius:7, padding:'5px 8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
										<IconDismiss />
									</button>
								</div>
							</div>
						);
					})}

				{!loading && total > PAGE_SIZE && (
					<Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
				)}
			</div>
			<StatusBar apiError={apiError} total={total} label='alerts' />
		</div>
	);
};

// ── MEDIA GRID CARD ───────────────────────────────────────────────────────────
const VideoCard: FC<{ r: IotResource; onClick: () => void }> = ({ r, onClick }) => (
	<div onClick={onClick}
		style={{ background:T.card, borderRadius:12, overflow:'hidden', cursor:'pointer', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(108,93,211,0.06)', transition:'transform 0.15s, box-shadow 0.15s' }}
		onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-2px)'; d.style.boxShadow = '0 6px 20px rgba(108,93,211,0.16)'; }}
		onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'none'; d.style.boxShadow = '0 2px 8px rgba(108,93,211,0.06)'; }}>
		<div style={{ position:'relative', background:'#111', height:130 }}>
			<video src={resolveMediaUrl(r.storagePath)} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.8 }} preload='metadata' />
			<div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
				<div style={{ width:38, height:38, background:T.purple, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px rgba(108,93,211,0.5)` }}>
					<IconPlay size={14} />
				</div>
			</div>
			<div style={{ position:'absolute', top:7, left:8, display:'flex', gap:4 }}>
				<span style={{ background:T.purple, color:'#fff', fontSize:9, fontWeight:800, borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
					<IconDashcam size={9} color="#fff" /> VIDEO
				</span>
				<span style={{ background:'rgba(255,255,255,0.92)', color:'#1d4ed8', fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>CH {r.channel}</span>
			</div>
		</div>
		<div style={{ padding:'10px 12px' }}>
			<div style={{ color:T.textPrimary, fontWeight:700, fontSize:12, marginBottom:3 }}>{r.eventType || 'Alert Video'}</div>
			<div style={{ color:T.textMuted, fontSize:10, fontFamily:'monospace' }}>{r.imei}</div>
			<div style={{ color:T.textMuted, fontSize:10, marginTop:2 }}>{new Date(r.captureTime).toLocaleString()}</div>
			<div style={{ color:T.textMuted, fontSize:10 }}>{(r.fileSize / 1024).toFixed(0)} KB</div>
		</div>
	</div>
);

const ImageCard: FC<{ r: IotResource; onClick: () => void }> = ({ r, onClick }) => (
	<div onClick={onClick}
		style={{ background:T.card, borderRadius:12, overflow:'hidden', cursor:'pointer', border:`1px solid ${T.border}`, boxShadow:'0 2px 8px rgba(240,13,105,0.06)', transition:'transform 0.15s, box-shadow 0.15s' }}
		onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-2px)'; d.style.boxShadow = '0 6px 20px rgba(240,13,105,0.16)'; }}
		onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'none'; d.style.boxShadow = '0 2px 8px rgba(240,13,105,0.06)'; }}>
		<div style={{ position:'relative', height:130, background:'#f4f5f9' }}>
			<img src={resolveMediaUrl(r.storagePath)} alt='alert' style={{ width:'100%', height:'100%', objectFit:'cover' }} />
			<div style={{ position:'absolute', top:7, left:8, display:'flex', gap:4 }}>
				<span style={{ background:T.pink, color:'#fff', fontSize:9, fontWeight:800, borderRadius:4, padding:'2px 6px', display:'flex', alignItems:'center', gap:3 }}>
					<IconPhoto size={9} color="#fff" /> IMAGE
				</span>
				<span style={{ background:'rgba(255,255,255,0.92)', color:'#1d4ed8', fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>CH {r.channel}</span>
			</div>
		</div>
		<div style={{ padding:'10px 12px' }}>
			<div style={{ color:T.textPrimary, fontWeight:700, fontSize:12, marginBottom:3 }}>{r.eventType || 'Alert Image'}</div>
			<div style={{ color:T.textMuted, fontSize:10, fontFamily:'monospace' }}>{r.imei}</div>
			<div style={{ color:T.textMuted, fontSize:10, marginTop:2 }}>{new Date(r.captureTime).toLocaleString()}</div>
			<div style={{ color:T.textMuted, fontSize:10 }}>{(r.fileSize / 1024).toFixed(1)} KB</div>
		</div>
	</div>
);

// ── TAB 2: MEDIA ALERTS (Videos) ──────────────────────────────────────────────
const MediaAlertsTab: FC = () => {
	const [resources, setResources] = useState<IotResource[]>([]);
	const [loading, setLoading]     = useState(true);
	const [apiError, setApiError]   = useState<string | null>(null);
	const [total, setTotal]         = useState(0);
	const [page, setPage]           = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch]       = useState('');
	const [imeiFilter, setImeiFilter] = useState('');
	const [selected, setSelected]   = useState<IotResource | null>(null);

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchResources(p, 20, { mediaType:1, keyword:search || undefined, imei:imeiFilter || undefined });
			if (res?.data) { setResources(res.data); setTotalPages(res.totalPages || 1); setTotal(res.total || 0); }
		} catch (err: any) {
			setApiError(err?.message ?? 'Network error');
			setResources([]);
		} finally { setLoading(false); }
	}, [search, imeiFilter]);

	useEffect(() => { load(page); }, [page, load]);
	const imeis = Array.from(new Set(resources.map(r => r.imei)));

	return (
		<div style={{ minHeight:'60vh' }}>
			{selected && <VideoViewerModal url={resolveMediaUrl(selected.storagePath)} title={selected.eventType} ch={selected.channel} onClose={() => setSelected(null)} />}
			<FilterBar search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={imeis} selected={imeiFilter} onSelect={v => { setImeiFilter(v); setPage(1); }}
				placeholder='All Devices' count={resources.length} total={total} label='Videos' />
			{loading ? <Spinner /> : resources.length === 0
				? <EmptyState icon={<IconDashcam size={32} color={T.textMuted} />} msg='No video alerts found' />
				: <>
					<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14 }}>
						{resources.map(r => <VideoCard key={r.id} r={r} onClick={() => setSelected(r)} />)}
					</div>
					{totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />}
				</>}
			<StatusBar apiError={apiError} total={total} label='videos' />
		</div>
	);
};

// ── TAB 3: IMAGE ALERTS ───────────────────────────────────────────────────────
const ImageAlertsTab: FC = () => {
	const [resources, setResources] = useState<IotResource[]>([]);
	const [loading, setLoading]     = useState(true);
	const [apiError, setApiError]   = useState<string | null>(null);
	const [total, setTotal]         = useState(0);
	const [page, setPage]           = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch]       = useState('');
	const [imeiFilter, setImeiFilter] = useState('');
	const [selected, setSelected]   = useState<IotResource | null>(null);

	const load = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetchResources(p, 20, { mediaType:0, keyword:search || undefined, imei:imeiFilter || undefined });
			if (res?.data) { setResources(res.data); setTotalPages(res.totalPages || 1); setTotal(res.total || 0); }
		} catch (err: any) {
			setApiError(err?.message ?? 'Network error');
			setResources([]);
		} finally { setLoading(false); }
	}, [search, imeiFilter]);

	useEffect(() => { load(page); }, [page, load]);
	const imeis = Array.from(new Set(resources.map(r => r.imei)));

	return (
		<div style={{ minHeight:'60vh' }}>
			{selected && <ImageViewerModal url={resolveMediaUrl(selected.storagePath)} title={selected.eventType} ch={selected.channel} onClose={() => setSelected(null)} />}
			<FilterBar search={search} onSearch={v => { setSearch(v); setPage(1); }}
				options={imeis} selected={imeiFilter} onSelect={v => { setImeiFilter(v); setPage(1); }}
				placeholder='All Devices' count={resources.length} total={total} label='Images' />
			{loading ? <Spinner /> : resources.length === 0
				? <EmptyState icon={<IconPhoto size={32} color={T.textMuted} />} msg='No image alerts found' />
				: <>
					<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:14 }}>
						{resources.map(r => <ImageCard key={r.id} r={r} onClick={() => setSelected(r)} />)}
					</div>
					{totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />}
				</>}
			<StatusBar apiError={apiError} total={total} label='images' />
		</div>
	);
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
type TabId = 'alerts' | 'media' | 'images';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
	{ id:'alerts', label:'Alerts',       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
	{ id:'media',  label:'Dashcam Video', icon:<IconDashcam size={14} color="currentColor" /> },
	{ id:'images', label:'Alert Images',  icon:<IconPhoto size={14} color="currentColor" /> },
];

const AlertsAndNotifications: FC = () => {
	const [activeTab, setActiveTab]     = useState<TabId>('alerts');
	const [selectedAlert, setSelectedAlert] = useState<IotAlert | null>(null);

	// Build relatedMedia + relatedImage from the real attachment data on the alert
	const getRelatedVideo = (alert: IotAlert) => {
		const att = alert.attachment?.find(a => a.mediaType === 1);
		if (!att) return undefined;
		return {
			file_url:    resolveMediaUrl(att.storagePath),
			alert_type:  alert.alertName || alert.alarmType || alert.eventType || '',
			channel:     att.channel,
			recorded_at: att.captureTime,
			imei:        att.imei,
		};
	};

	const getRelatedImage = (alert: IotAlert) => {
		const att = alert.attachment?.find(a => a.mediaType === 0);
		if (!att) return undefined;
		return {
			file_url:    resolveMediaUrl(att.storagePath),
			alert_type:  alert.alertName || alert.alarmType || alert.eventType || '',
			channel:     att.channel,
			file_size_kb: (att.fileSize / 1024).toFixed(1),
			gps:         '',
			speed:       '—',
		};
	};

	const alertModalProps: any = selectedAlert ? {
		...selectedAlert,
		type:       selectedAlert.alertName || selectedAlert.alarmType || selectedAlert.eventType || 'Unknown',
		severity:   getSeverity(selectedAlert),
		device:     selectedAlert.deviceName || selectedAlert.imei,
		imei:       selectedAlert.imei,
		time:       new Date(selectedAlert.alertTime).toLocaleString(),
		timeAgo:    timeAgo(selectedAlert.alertTime),
		location:   (selectedAlert as any).location || '',
		hasDashcam: alertHasMedia(selectedAlert),
	} : null;

	return (
		<PageWrapper isProtected title='Alerts'>
			<SubHeader>
				<SubHeaderLeft>
					<span style={{ fontSize:20, fontWeight:700, color:T.textPrimary }}>Alerts & Notifications</span>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				{/* Tab bar */}
				<div style={{ borderBottom:`2px solid ${T.border}`, marginBottom:24, display:'flex', gap:0 }}>
					{TABS.map(tab => (
						<button key={tab.id} onClick={() => setActiveTab(tab.id)}
							style={{
								background:'none', border:'none',
								borderBottom: activeTab === tab.id ? `2px solid ${T.purple}` : '2px solid transparent',
								marginBottom:-2, padding:'10px 22px', cursor:'pointer',
								fontWeight: activeTab === tab.id ? 700 : 500, fontSize:14,
								color: activeTab === tab.id ? T.purple : T.textMuted,
								display:'flex', alignItems:'center', gap:7, transition:'color 0.15s',
							}}>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				{activeTab === 'alerts' && <AlertsTab onSelectAlert={setSelectedAlert} />}
				{activeTab === 'media'  && <MediaAlertsTab />}
				{activeTab === 'images' && <ImageAlertsTab />}
			</Page>

			{alertModalProps && (
				<AlertDetailModal
					alert={alertModalProps}
					onClose={() => setSelectedAlert(null)}
					relatedMedia={selectedAlert ? getRelatedVideo(selectedAlert) : undefined}
					relatedImage={selectedAlert ? getRelatedImage(selectedAlert) : undefined}
				/>
			)}
		</PageWrapper>
	);
};

export default AlertsAndNotifications;
