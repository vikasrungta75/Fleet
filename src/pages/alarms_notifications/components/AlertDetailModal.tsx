// src/pages/alarms_notifications/components/AlertDetailModal.tsx
// Light-themed alert detail modal — white cards with colour accents
// Drop this file in and import it in AlertsAndNotifications.tsx

import React, { FC, useState } from 'react';

const SEVERITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
	Critical: { bg: '#fff0f0', color: '#d32f2f', border: '#ffcdd2' },
	High:     { bg: '#fff8e1', color: '#e65100', border: '#ffe0b2' },
	Warning:  { bg: '#fffde7', color: '#f57f17', border: '#fff9c4' },
	Info:     { bg: '#e3f2fd', color: '#1565c0', border: '#bbdefb' },
	Normal:   { bg: '#e8f5e9', color: '#2e7d32', border: '#c8e6c9' },
};

const ALERT_COLORS: Record<string, string> = {
	'Overspeed':          '#d32f2f',
	'Harsh Brake':        '#e65100',
	'Harsh Acceleration': '#f57f17',
	'Fatigue Detection':  '#7b1fa2',
	'Phone Use':          '#c62828',
	'Lane Departure':     '#1565c0',
	'Collision Warning':  '#b71c1c',
	'About To Sleep':     '#f57f17',
	'Device Normal':      '#2e7d32',
	'Connection Lost':    '#c62828',
};

// ── Share Popup ───────────────────────────────────────────────────────────────
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		navigator.clipboard.writeText(url).catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			<div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, maxWidth: '92vw', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
					<span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>🔗 Share Link</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' }}>✕</button>
				</div>
				<div style={{ display: 'flex', gap: 8 }}>
					<input readOnly value={url} style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 10px', fontSize: 11, fontFamily: 'monospace', color: '#1565c0', background: '#f8f9ff' }} />
					<button onClick={copy} style={{ background: copied ? '#2da44e' : '#f00d69', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
						{copied ? '✓ Copied!' : 'Copy'}
					</button>
				</div>
				<div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
					{['Email', 'WhatsApp', 'Teams'].map(s => (
						<button key={s} onClick={() => alert(`Share via ${s}`)}
							style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#555', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
							{s}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

// ── Video Modal ───────────────────────────────────────────────────────────────
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoModal: FC<{ video: any; onClose: () => void }> = ({ video, onClose }) => {
	const ref = React.useRef<HTMLVideoElement>(null);
	const [speed, setSpeed] = useState(1);
	const [showMenu, setShowMenu] = useState(false);
	const [showShare, setShowShare] = useState(false);

	React.useEffect(() => { if (ref.current) ref.current.playbackRate = speed; }, [speed]);

	const download = () => {
		const a = document.createElement('a');
		a.href = video.file_url;
		a.download = `alert_video_${Date.now()}.mp4`;
		a.click();
	};

	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={video.file_url} onClose={() => setShowShare(false)} />}
			<div style={{ background: '#fff', borderRadius: 12, width: 860, maxWidth: '97vw', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}>
				{/* Header — light grey */}
				<div style={{ background: '#f8f9fa', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #e0e0e0' }}>
					<span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>🎥 Video Playback</span>
					<span style={{ background: ALERT_COLORS[video.alert_type] || '#555', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>{video.alert_type}</span>
					<span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>CH {video.channel}</span>
					<span style={{ color: '#888', fontSize: 11, marginLeft: 'auto' }}>{new Date(video.recorded_at).toLocaleString()}</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' }}>✕</button>
				</div>

				{/* Video — dark background only for the actual video player */}
				<div style={{ background: '#111', position: 'relative' }}>
					<video ref={ref} src={video.file_url} controls autoPlay style={{ width: '100%', maxHeight: '55vh', display: 'block' }} />
				</div>

				{/* Controls — white background */}
				<div style={{ background: '#fff', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #e0e0e0' }}>
					<span style={{ color: '#888', fontSize: 11, flex: 1, fontFamily: 'monospace' }}>{video.imei} — CH{video.channel}</span>
					<button onClick={() => setShowShare(true)} style={{ background: '#fff', border: '1px solid #ddd', color: '#555', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>🔗 Share</button>
					<button onClick={download} style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>⬇ Download</button>
					<div style={{ position: 'relative' }}>
						<button onClick={() => setShowMenu(m => !m)} style={{ background: '#f5f5f5', border: '1px solid #ddd', color: '#555', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}>⋮</button>
						{showMenu && (
							<div style={{ position: 'absolute', bottom: '110%', right: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 180, zIndex: 100, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
								<button onClick={download} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#333', borderBottom: '1px solid #f0f0f0' }}>⬇ Download</button>
								<div style={{ padding: '8px 16px 4px', fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Playback Speed</div>
								{SPEEDS.map(s => (
									<button key={s} onClick={() => { setSpeed(s); setShowMenu(false); }}
										style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 16px', border: 'none', background: s === speed ? '#fce4f0' : 'transparent', cursor: 'pointer', fontSize: 13, color: s === speed ? '#f00d69' : '#333', fontWeight: s === speed ? 700 : 400 }}>
										{s === 1 ? 'Normal' : `${s}x`}
										{s === speed && <span style={{ color: '#f00d69' }}>✓</span>}
									</button>
								))}
								<button onClick={async () => { if (ref.current && document.pictureInPictureEnabled) { try { await ref.current.requestPictureInPicture(); } catch {} } setShowMenu(false); }}
									style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', borderTop: '1px solid #f0f0f0', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#333' }}>⧉ Picture in Picture</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// ── Image Modal ───────────────────────────────────────────────────────────────
const ImageModal: FC<{ image: any; onClose: () => void }> = ({ image, onClose }) => {
	const [showShare, setShowShare] = useState(false);
	const download = () => {
		const a = document.createElement('a');
		a.href = image.file_url;
		a.download = `alert_image_${Date.now()}.jpg`;
		a.click();
	};
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={image.file_url} onClose={() => setShowShare(false)} />}
			<div style={{ background: '#fff', borderRadius: 12, width: 900, maxWidth: '97vw', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}>
				<div style={{ background: '#f8f9fa', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #e0e0e0' }}>
					<span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>🖼️ Image Detail</span>
					<span style={{ background: ALERT_COLORS[image.alert_type] || '#555', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>{image.alert_type}</span>
					<span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>CH {image.channel}</span>
					<span style={{ color: '#888', fontSize: 11 }}>{image.file_size_kb} KB</span>
					<button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
				</div>

				{/* Image — white background */}
				<div style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
					<img src={image.file_url} alt='alert' style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
				</div>

				{/* Details bar — white */}
				<div style={{ background: '#fff', padding: '12px 18px', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>GPS Coordinates</div>
						<a href={`https://maps.google.com/?q=${image.gps?.replace('N ', '').replace(' E ', ',')}`} target='_blank' rel='noreferrer'
							style={{ color: '#1565c0', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>📍 {image.gps}</a>
					</div>
					<div>
						<div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Speed</div>
						<div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>🚗 {image.speed}</div>
					</div>
					<div style={{ display: 'flex', gap: 8 }}>
						<button onClick={() => setShowShare(true)} style={{ background: '#fff', border: '1px solid #ddd', color: '#555', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>🔗 Share</button>
						<button onClick={download} style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>⬇ Download</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// ── Alert Detail Modal ────────────────────────────────────────────────────────
interface AlertDetailModalProps {
	alert: any;
	onClose: () => void;
	relatedMedia?: any;
	relatedImage?: any;
}

const AlertDetailModal: FC<AlertDetailModalProps> = ({ alert, onClose, relatedMedia, relatedImage }) => {
	const [showShare, setShowShare] = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const sev = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Info;

	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={`${window.location.href}?alert=${alert.id}`} onClose={() => setShowShare(false)} />}
			{showVideoModal && relatedMedia && <VideoModal video={relatedMedia} onClose={() => setShowVideoModal(false)} />}
			{showImageModal && relatedImage && <ImageModal image={relatedImage} onClose={() => setShowImageModal(false)} />}

			<div style={{ background: '#fff', borderRadius: 14, width: 640, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>

				{/* ── Header — coloured by severity ── */}
				<div style={{ background: sev.bg, borderBottom: `2px solid ${sev.border}`, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: '14px 14px 0 0' }}>
					<span style={{ fontSize: 20 }}>⚠️</span>
					<span style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 17 }}>{alert.type}</span>
					<span style={{ background: sev.color, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 12px' }}>{alert.severity}</span>
					<span style={{ background: '#fff', color: '#888', fontSize: 11, borderRadius: 6, padding: '3px 10px', border: '1px solid #e0e0e0' }}>Event</span>
					<span style={{ background: '#fff', color: '#888', fontSize: 11, borderRadius: 6, padding: '3px 10px', border: '1px solid #e0e0e0' }}>ID: {10000 + alert.id}</span>
					<button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#bbb', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
				</div>

				<div style={{ padding: '20px 22px' }}>
					{/* Description */}
					<div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#555', fontSize: 14, borderLeft: `4px solid ${sev.color}` }}>
						{alert.hasDashcam
							? `Dashcam alert: ${alert.type}. Video and image evidence available below.`
							: `Device telemetry alert: ${alert.type}. No dashcam media for this event.`}
					</div>

					{/* Device + Time — white cards with border */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
						{[
							{ label: 'DEVICE', title: alert.device, sub: alert.imei },
							{ label: 'TIME', title: alert.time, sub: alert.timeAgo },
						].map(item => (
							<div key={item.label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
								<div style={{ color: '#aaa', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
								<div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 14 }}>{item.title}</div>
								<div style={{ color: '#bbb', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>{item.sub}</div>
							</div>
						))}
					</div>

					{/* Location */}
					<div style={{ background: '#f0f7ff', border: '1px solid #bbdefb', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
						<div style={{ color: '#1565c0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>📍 Location</div>
						<a href={`https://maps.google.com/?q=${alert.location}`} target='_blank' rel='noreferrer'
							style={{ color: '#1565c0', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
							{alert.location}
						</a>
					</div>

					{/* ── Dashcam Video ── */}
					{alert.hasDashcam && relatedMedia && (
						<div style={{ marginBottom: 16 }}>
							<div style={{ color: '#555', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🎥 Alert Video</div>
							<div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0', cursor: 'pointer', position: 'relative' }}
								onClick={() => setShowVideoModal(true)}>
								{/* Video thumbnail with white overlay gradient */}
								<div style={{ background: '#111', position: 'relative' }}>
									<video src={relatedMedia.file_url} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', opacity: 0.85, display: 'block' }} preload='metadata' />
									{/* Light gradient overlay at bottom */}
									<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
								</div>
								{/* Play button */}
								<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<div style={{ width: 48, height: 48, background: '#f00d69', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', boxShadow: '0 4px 16px rgba(240,13,105,0.4)' }}>▶</div>
								</div>
								{/* Badges */}
								<div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 4 }}>
									<span style={{ background: ALERT_COLORS[relatedMedia.alert_type] || '#f00d69', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px' }}>{relatedMedia.alert_type.toUpperCase()}</span>
									<span style={{ background: '#1565c0', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>CH {relatedMedia.channel}</span>
								</div>
								{/* Download button bottom-right */}
								<div style={{ position: 'absolute', bottom: 8, right: 10 }}>
									<button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = relatedMedia.file_url; a.download = `alert_video.mp4`; a.click(); }}
										style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
										⬇ Download
									</button>
								</div>
							</div>
						</div>
					)}

					{/* ── Alert Image ── */}
					{alert.hasDashcam && relatedImage && (
						<div style={{ marginBottom: 16 }}>
							<div style={{ color: '#555', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🖼️ Alert Image</div>
							<div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0', cursor: 'pointer', position: 'relative', background: '#f5f5f5' }}
								onClick={() => setShowImageModal(true)}>
								<img src={relatedImage.file_url} alt='alert' style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
								<div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 4 }}>
									<span style={{ background: ALERT_COLORS[relatedImage.alert_type] || '#f00d69', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px' }}>{relatedImage.alert_type.toUpperCase()}</span>
									<span style={{ background: '#1565c0', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>CH {relatedImage.channel}</span>
								</div>
								{/* GPS bottom */}
								<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '16px 10px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
									<span style={{ color: '#fff', fontSize: 10, fontFamily: 'monospace' }}>📍 {relatedImage.gps}</span>
									<button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = relatedImage.file_url; a.download = `alert_image.jpg`; a.click(); }}
										style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
										⬇
									</button>
								</div>
							</div>
						</div>
					)}

					{/* ── Telemetry — light grey card ── */}
					<div style={{ background: '#f8f9fa', border: '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px' }}>
						<div style={{ color: '#1565c0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>〜 Telemetry Data</div>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
							{[
								['fringStatus', alert.hasDashcam ? 'Active' : 'Inactive'],
								['gpsSpeed', '0 km/h'],
								['deviceStatus', 'Online'],
								['batteryLevel', '87%'],
							].map(([k, v]) => (
								<div key={k} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, padding: '10px 12px' }}>
									<div style={{ color: '#bbb', fontSize: 10, marginBottom: 3 }}>{k}</div>
									<div style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>{v}</div>
								</div>
							))}
						</div>
					</div>

					{/* ── Action buttons ── */}
					<div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
						<button onClick={() => setShowShare(true)}
							style={{ background: '#fff', border: '1px solid #e0e0e0', color: '#555', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
							🔗 Share
						</button>
						<button onClick={onClose}
							style={{ flex: 1, background: '#f00d69', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export { VideoModal, ImageModal, SharePopup };
export default AlertDetailModal;
