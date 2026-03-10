// src/pages/alarms_notifications/components/AlertDetailModal.tsx
// Ravity light theme — purple/pink palette — real media wired from attachments
import React, { FC, useState } from 'react';

const T = {
	purple:      '#6c5dd3',
	purpleLight: '#f0eeff',
	purpleBorder:'#d4ccff',
	pink:        '#f00d69',
	border:      '#e8e8f0',
	textPrimary: '#1a1a2e',
	textMuted:   '#9090b0',
	textSecondary:'#4a4a6a',
};

const SEV: Record<string, { bg: string; color: string; dot: string; border: string }> = {
	Critical: { bg:'#fff0f0', color:'#d32f2f', dot:'#d32f2f', border:'#ffcdd2' },
	High:     { bg:'#fff4ec', color:'#e65100', dot:'#ff6b35', border:'#ffd0b0' },
	Warning:  { bg:'#fffbec', color:'#b45309', dot:'#f59e0b', border:'#fde68a' },
	Info:     { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6', border:'#bfdbfe' },
	Normal:   { bg:'#f0fdf4', color:'#166534', dot:'#22c55e', border:'#bbf7d0' },
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconDashcam: FC<{ size?: number; color?: string }> = ({ size=16, color=T.purple }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
	</svg>
);
const IconPhoto: FC<{ size?: number; color?: string }> = ({ size=16, color=T.pink }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
	</svg>
);
const IconLocation: FC = () => (
	<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
	</svg>
);

// ── Share Popup ───────────────────────────────────────────────────────────────
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
	const [copied, setCopied] = useState(false);
	const copy = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:10002, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			<div style={{ background:'#fff', borderRadius:14, padding:28, width:440, maxWidth:'92vw', boxShadow:'0 8px 40px rgba(108,93,211,0.18)' }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
					<span style={{ fontWeight:700, fontSize:15, color:T.textPrimary }}>Share Link</span>
					<button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer' }}>✕</button>
				</div>
				<div style={{ display:'flex', gap:8 }}>
					<input readOnly value={url} style={{ flex:1, border:`1px solid ${T.purpleBorder}`, borderRadius:7, padding:'8px 10px', fontSize:11, fontFamily:'monospace', color:T.purple, background:T.purpleLight, outline:'none' }} />
					<button onClick={copy} style={{ background:copied ? '#22c55e' : T.pink, border:'none', color:'#fff', borderRadius:7, padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:12, whiteSpace:'nowrap' }}>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
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
	const download = () => { const a = document.createElement('a'); a.href = video.file_url; a.download = `alert_video_${Date.now()}.mp4`; a.click(); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={video.file_url} onClose={() => setShowShare(false)} />}
			<div style={{ background:'#fff', borderRadius:14, width:860, maxWidth:'97vw', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background:'#fafaff', padding:'12px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
					<IconDashcam size={16} />
					<span style={{ fontWeight:700, fontSize:14, color:T.textPrimary }}>Video Playback</span>
					{video.alert_type && <span style={{ background:T.purpleLight, color:T.purple, fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>{video.alert_type}</span>}
					<span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>CH {video.channel}</span>
					<span style={{ color:T.textMuted, fontSize:11, marginLeft:'auto' }}>{video.recorded_at ? new Date(video.recorded_at).toLocaleString() : ''}</span>
					<button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
				</div>
				<div style={{ background:'#111' }}>
					<video ref={ref} src={video.file_url} controls autoPlay style={{ width:'100%', maxHeight:'55vh', display:'block', objectFit:'contain' }} />
				</div>
				<div style={{ background:'#fff', padding:'10px 18px', display:'flex', alignItems:'center', gap:8, borderTop:`1px solid ${T.border}` }}>
					<span style={{ color:T.textMuted, fontSize:11, fontFamily:'monospace', flex:1 }}>{video.imei}</span>
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
										{s === 1 ? 'Normal' : `${s}×`}{s === speed && <span style={{ color:T.purple }}>✓</span>}
									</button>
								))}
								<button onClick={async () => { if (ref.current && document.pictureInPictureEnabled) try { await ref.current.requestPictureInPicture(); } catch {} setShowMenu(false); }}
									style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', border:'none', borderTop:`1px solid ${T.border}`, background:'transparent', cursor:'pointer', fontSize:13, color:T.textPrimary }}>⧉ Picture in Picture</button>
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
	const download = () => { const a = document.createElement('a'); a.href = image.file_url; a.download = `alert_image_${Date.now()}.jpg`; a.click(); };
	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={image.file_url} onClose={() => setShowShare(false)} />}
			<div style={{ background:'#fff', borderRadius:14, width:900, maxWidth:'97vw', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
				<div style={{ background:'#fafaff', padding:'12px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
					<IconPhoto size={16} />
					<span style={{ fontWeight:700, fontSize:14, color:T.textPrimary }}>Image Detail</span>
					{image.alert_type && <span style={{ background:'#fff0f6', color:T.pink, fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>{image.alert_type}</span>}
					<span style={{ background:'#eff6ff', color:'#1d4ed8', fontSize:11, fontWeight:700, borderRadius:5, padding:'2px 8px' }}>CH {image.channel}</span>
					{image.file_size_kb && <span style={{ color:T.textMuted, fontSize:11 }}>{image.file_size_kb} KB</span>}
					<button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer' }}>✕</button>
				</div>
				<div style={{ background:'#f4f5f9', display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 }}>
					<img src={image.file_url} alt='alert' style={{ maxWidth:'100%', maxHeight:'60vh', objectFit:'contain', display:'block' }} />
				</div>
				<div style={{ background:'#fff', padding:'10px 18px', borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
					{image.gps && (
						<a href={`https://maps.google.com/?q=${image.gps}`} target='_blank' rel='noreferrer'
							style={{ color:T.purple, fontSize:12, fontWeight:600, textDecoration:'none', flex:1, display:'flex', alignItems:'center', gap:4 }}>
							<IconLocation /> {image.gps}
						</a>
					)}
					{!image.gps && <span style={{ flex:1 }} />}
					<button onClick={() => setShowShare(true)} style={{ background:'#fff', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:12 }}>Share</button>
					<button onClick={download} style={{ background:T.pink, border:'none', color:'#fff', borderRadius:7, padding:'6px 16px', cursor:'pointer', fontSize:12, fontWeight:700 }}>⬇ Download</button>
				</div>
			</div>
		</div>
	);
};

// ── Alert Detail Modal ────────────────────────────────────────────────────────
interface AlertDetailModalProps {
	alert: any;
	onClose: () => void;
	relatedMedia?: any;   // { file_url, alert_type, channel, recorded_at, imei }
	relatedImage?: any;   // { file_url, alert_type, channel, file_size_kb, gps, speed }
}

const AlertDetailModal: FC<AlertDetailModalProps> = ({ alert, onClose, relatedMedia, relatedImage }) => {
	const [showShare, setShowShare]         = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const sev = SEV[alert.severity] || SEV.Info;
	const hasVideo = !!relatedMedia;
	const hasImage = !!relatedImage;

	return (
		<div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.45)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			{showShare && <SharePopup url={`${window.location.href}?alert=${alert.id}`} onClose={() => setShowShare(false)} />}
			{showVideoModal && relatedMedia && <VideoModal video={relatedMedia} onClose={() => setShowVideoModal(false)} />}
			{showImageModal && relatedImage && <ImageModal image={relatedImage} onClose={() => setShowImageModal(false)} />}

			<div style={{ background:'#fff', borderRadius:16, width:640, maxWidth:'95vw', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 16px 56px rgba(108,93,211,0.22)' }}>

				{/* ── Header ─────────────────────────────────────── */}
				<div style={{ background:sev.bg, borderBottom:`2px solid ${sev.border}`, padding:'18px 22px', display:'flex', alignItems:'center', gap:10, borderRadius:'16px 16px 0 0', flexWrap:'wrap' }}>
					<span style={{ fontSize:18 }}>⚠️</span>
					<span style={{ color:T.textPrimary, fontWeight:800, fontSize:17 }}>{alert.type}</span>
					<span style={{ background:sev.color, color:'#fff', fontSize:11, fontWeight:700, borderRadius:20, padding:'3px 12px', display:'inline-flex', alignItems:'center', gap:5 }}>
						<span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.6)', display:'inline-block' }} />
						{alert.severity}
					</span>
					<span style={{ background:'#fff', color:T.textMuted, fontSize:11, borderRadius:7, padding:'3px 10px', border:`1px solid ${T.border}` }}>Event</span>
					<span style={{ background:'#fff', color:T.textMuted, fontSize:11, borderRadius:7, padding:'3px 10px', border:`1px solid ${T.border}` }}>ID: {10000 + (alert.id || 0)}</span>
					<button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:T.textMuted, fontSize:22, cursor:'pointer', lineHeight:1 }}>✕</button>
				</div>

				<div style={{ padding:'20px 22px' }}>

					{/* Description banner */}
					<div style={{ background:'#fafaff', borderRadius:9, padding:'12px 16px', marginBottom:18, color:T.textSecondary, fontSize:13, borderLeft:`3px solid ${T.purple}` }}>
						{hasVideo || hasImage
							? `Dashcam alert: ${alert.type}. ${hasVideo ? 'Video' : ''}${hasVideo && hasImage ? ' and image evidence' : hasImage ? 'Image evidence' : ''} available below.`
							: `Device telemetry alert: ${alert.type}. No dashcam media for this event.`}
					</div>

					{/* Device + Time */}
					<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
						{[
							{ label:'DEVICE', value: alert.device, sub: alert.imei },
							{ label:'TIME',   value: alert.time,   sub: alert.timeAgo },
						].map(item => (
							<div key={item.label} style={{ background:'#fff', border:`1px solid ${T.border}`, borderRadius:10, padding:'14px 16px', boxShadow:'0 1px 4px rgba(108,93,211,0.06)' }}>
								<div style={{ color:T.textMuted, fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{item.label}</div>
								<div style={{ color:T.textPrimary, fontWeight:700, fontSize:14 }}>{item.value || '—'}</div>
								<div style={{ color:T.textMuted, fontSize:11, marginTop:2, fontFamily:'monospace' }}>{item.sub}</div>
							</div>
						))}
					</div>

					{/* Location */}
					{alert.location && (
						<div style={{ background:'#f0eeff', border:`1px solid ${T.purpleBorder}`, borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
							<div style={{ color:T.purple, fontSize:11, textTransform:'uppercase', letterSpacing:1, marginBottom:6, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
								<IconLocation /> Location
							</div>
							<a href={`https://maps.google.com/?q=${alert.location}`} target='_blank' rel='noreferrer'
								style={{ color:T.purple, fontWeight:700, fontSize:14, textDecoration:'none' }}>
								{alert.location}
							</a>
						</div>
					)}

					{/* ── Dashcam Video ── */}
					{hasVideo && (
						<div style={{ marginBottom:16 }}>
							<div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
								<IconDashcam size={13} />
								<span style={{ color:T.textSecondary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8 }}>Dashcam Video</span>
							</div>
							<div style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${T.purpleBorder}`, cursor:'pointer', position:'relative', boxShadow:'0 2px 8px rgba(108,93,211,0.1)' }}
								onClick={() => setShowVideoModal(true)}>
								<div style={{ background:'#111', position:'relative' }}>
									<video src={relatedMedia.file_url} style={{ width:'100%', maxHeight:180, objectFit:'cover', opacity:0.82, display:'block' }} preload='metadata' />
									<div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(transparent, rgba(0,0,0,0.55))' }} />
								</div>
								<div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
									<div style={{ width:46, height:46, background:T.purple, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 16px rgba(108,93,211,0.5)` }}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
									</div>
								</div>
								<div style={{ position:'absolute', top:8, left:10, display:'flex', gap:4 }}>
									<span style={{ background:T.purple, color:'#fff', fontSize:9, fontWeight:800, borderRadius:4, padding:'2px 6px' }}>{(relatedMedia.alert_type || '').toUpperCase() || 'VIDEO'}</span>
									<span style={{ background:'rgba(255,255,255,0.92)', color:'#1d4ed8', fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>CH {relatedMedia.channel}</span>
								</div>
								<div style={{ position:'absolute', bottom:10, right:10 }}>
									<button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = relatedMedia.file_url; a.download = 'alert_video.mp4'; a.click(); }}
										style={{ background:T.purple, border:'none', color:'#fff', borderRadius:6, padding:'4px 12px', cursor:'pointer', fontSize:11, fontWeight:700 }}>⬇ Download</button>
								</div>
							</div>
						</div>
					)}

					{/* ── Alert Image ── */}
					{hasImage && (
						<div style={{ marginBottom:16 }}>
							<div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
								<IconPhoto size={13} />
								<span style={{ color:T.textSecondary, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8 }}>Alert Image</span>
							</div>
							<div style={{ borderRadius:12, overflow:'hidden', border:`1px solid #ffc0d8`, cursor:'pointer', position:'relative', background:'#f4f5f9', boxShadow:'0 2px 8px rgba(240,13,105,0.08)' }}
								onClick={() => setShowImageModal(true)}>
								<img src={relatedImage.file_url} alt='alert' style={{ width:'100%', maxHeight:180, objectFit:'cover', display:'block' }} />
								<div style={{ position:'absolute', top:8, left:10, display:'flex', gap:4 }}>
									<span style={{ background:T.pink, color:'#fff', fontSize:9, fontWeight:800, borderRadius:4, padding:'2px 6px' }}>{(relatedImage.alert_type || '').toUpperCase() || 'IMAGE'}</span>
									<span style={{ background:'rgba(255,255,255,0.92)', color:'#1d4ed8', fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>CH {relatedImage.channel}</span>
								</div>
								<div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.6))', padding:'18px 10px 8px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
									{relatedImage.gps && <span style={{ color:'#fff', fontSize:10, fontFamily:'monospace' }}>📍 {relatedImage.gps}</span>}
									<button onClick={e => { e.stopPropagation(); const a = document.createElement('a'); a.href = relatedImage.file_url; a.download = 'alert_image.jpg'; a.click(); }}
										style={{ background:T.pink, border:'none', color:'#fff', borderRadius:5, padding:'3px 10px', cursor:'pointer', fontSize:10, fontWeight:700, marginLeft:'auto' }}>⬇</button>
								</div>
							</div>
						</div>
					)}

					{/* ── Telemetry ── */}
					<div style={{ background:'#fafaff', border:`1px solid ${T.border}`, borderRadius:10, padding:'14px 16px' }}>
						<div style={{ color:T.purple, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>〜 Telemetry Data</div>
						<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
							{[
								['fringStatus',  hasVideo || hasImage ? 'Active' : 'Inactive'],
								['gpsSpeed',     '0 km/h'],
								['deviceStatus', 'Online'],
								['batteryLevel', '87%'],
							].map(([k, v]) => (
								<div key={k} style={{ background:'#fff', border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 12px' }}>
									<div style={{ color:T.textMuted, fontSize:10, marginBottom:3 }}>{k}</div>
									<div style={{ color:T.textPrimary, fontSize:13, fontWeight:600 }}>{v}</div>
								</div>
							))}
						</div>
					</div>

					{/* ── Actions ── */}
					<div style={{ display:'flex', gap:8, marginTop:20 }}>
						<button onClick={() => setShowShare(true)}
							style={{ background:'#fff', border:`1px solid ${T.border}`, color:T.textSecondary, borderRadius:9, padding:'10px 18px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
							🔗 Share
						</button>
						<button onClick={onClose}
							style={{ flex:1, background:T.pink, border:'none', color:'#fff', borderRadius:9, padding:'10px 18px', cursor:'pointer', fontSize:13, fontWeight:700 }}>
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
