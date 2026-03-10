import React, { FC, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dashcamIcon from '../../../../assets/img/dashcam-icon.png';

interface IDashcamModalProps {
	vehicle: {
		vin: string;
		registration_no?: string;
		group_name?: string;
		status?: string;
		dashcamStreamUrl?: string;
	};
	onClose: () => void;
}

// Channels to simulate — in production each would be a separate stream URL
const CHANNELS = ['CH 1', 'CH 2', 'CH 3', 'CH 4'];

const DashcamModal: FC<IDashcamModalProps> = ({ vehicle, onClose }) => {
	const { t } = useTranslation(['vehicles']);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [activeChannel, setActiveChannel] = useState(0);
	const [captureFlash, setCaptureFlash] = useState(false);
	const [capturedThumb, setCapturedThumb] = useState<string | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [liveTime, setLiveTime] = useState(new Date());

	// Tick the live clock
	useEffect(() => {
		const id = setInterval(() => setLiveTime(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	// Close on Escape key
	useEffect(() => {
		const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	// ── Capture current video frame ──────────────────────────────────────────
	const handleCapture = () => {
		const vid = videoRef.current;
		if (!vid) return;

		const canvas = document.createElement('canvas');
		canvas.width = vid.videoWidth || 1280;
		canvas.height = vid.videoHeight || 720;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
		const url = canvas.toDataURL('image/png');

		// Show captured thumbnail in footer
		setCapturedThumb(url);

		// Flash effect
		setCaptureFlash(true);
		setTimeout(() => setCaptureFlash(false), 300);

		// Trigger download
		const a = document.createElement('a');
		a.href = url;
		a.download = `dashcam_${vehicle.vin}_CH${activeChannel + 1}_${Date.now()}.png`;
		a.click();
	};

	// ── Share: copy stream URL to clipboard ─────────────────────────────────
	const handleShare = () => {
		const url = vehicle.dashcamStreamUrl ?? `mock-stream://${vehicle.vin}/ch${activeChannel + 1}`;
		navigator.clipboard.writeText(url).catch(() => {});
		alert(t('Stream URL copied to clipboard'));
	};

	// ── Toggle native fullscreen ─────────────────────────────────────────────
	const handleFullscreen = () => {
		if (videoRef.current) {
			if (!document.fullscreenElement) {
				videoRef.current.requestFullscreen().then(() => setIsFullscreen(true));
			} else {
				document.exitFullscreen().then(() => setIsFullscreen(false));
			}
		}
	};

	const streamAvailable = Boolean(vehicle.dashcamStreamUrl);
	const fileLabel = `${vehicle.vin}_${CHANNELS[activeChannel].replace(' ', '')}_${liveTime
		.toISOString()
		.slice(0, 10)}`;

	// ── Size info mock ───────────────────────────────────────────────────────
	const mockSize = `${(Math.random() * 400 + 300).toFixed(1)} KB`;

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0,0,0,0.82)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 9999,
			}}
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

			<div
				style={{
					backgroundColor: '#1a1a2e',
					borderRadius: '10px',
					width: '880px',
					maxWidth: '96vw',
					overflow: 'hidden',
					boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
					display: 'flex',
					flexDirection: 'column',
				}}>

				{/* ── HEADER ───────────────────────────────────────────────────── */}
				<div
					style={{
						background: '#111',
						padding: '10px 16px',
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						borderBottom: '1px solid #2a2a2a',
						flexWrap: 'wrap',
					}}>
					{/* Icon + title */}
					<img src={dashcamIcon} alt='dashcam' style={{ width: '20px', height: '20px', filter: 'invert(1)', opacity: 0.85 }} />
					<span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
						{t('Video Playback')}
					</span>

					{/* Channel tabs */}
					<div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
						{CHANNELS.map((ch, idx) => (
							<button
								key={ch}
								onClick={() => setActiveChannel(idx)}
								style={{
									background: activeChannel === idx ? '#0af' : 'transparent',
									color: activeChannel === idx ? '#000' : '#666',
									border: `1px solid ${activeChannel === idx ? '#0af' : '#333'}`,
									borderRadius: '3px',
									padding: '2px 8px',
									fontSize: '11px',
									fontWeight: 700,
									cursor: 'pointer',
									transition: 'all 0.15s',
								}}>
								{ch}
							</button>
						))}
					</div>

					{/* Meta chips */}
					<span style={{ color: '#aaa', fontSize: '11px', marginLeft: '8px' }}>
						{liveTime.toLocaleString()}
					</span>
					<span
						style={{
							background: '#222',
							color: '#aaa',
							fontSize: '11px',
							borderRadius: '3px',
							padding: '1px 8px',
						}}>
						{mockSize}
					</span>
					<span
						style={{
							background: '#222',
							color: '#aaa',
							fontSize: '11px',
							borderRadius: '3px',
							padding: '1px 8px',
							fontFamily: 'monospace',
						}}>
						{vehicle.vin}
					</span>

					{/* Vehicle name */}
					<span style={{ color: '#f00d69', fontWeight: 700, fontSize: '12px', marginLeft: 'auto' }}>
						{vehicle.registration_no ?? vehicle.vin}
					</span>
					{vehicle.group_name && (
						<span style={{ color: '#666', fontSize: '11px' }}>{vehicle.group_name}</span>
					)}

					{/* Close */}
					<button
						onClick={onClose}
						style={{
							background: 'transparent',
							border: 'none',
							color: '#aaa',
							fontSize: '18px',
							cursor: 'pointer',
							lineHeight: 1,
							padding: '0 4px',
							marginLeft: '8px',
						}}>
						✕
					</button>
				</div>

				{/* ── VIDEO AREA ───────────────────────────────────────────────── */}
				<div
					style={{
						position: 'relative',
						background: '#000',
						width: '100%',
						minHeight: '440px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					{/* Capture flash overlay */}
					{captureFlash && (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background: 'rgba(255,255,255,0.5)',
								zIndex: 10,
								pointerEvents: 'none',
							}}
						/>
					)}

					{/* Live watermark */}
					<div
						style={{
							position: 'absolute',
							top: '10px',
							left: '12px',
							zIndex: 5,
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							pointerEvents: 'none',
						}}>
						<span
							style={{
								background: '#f00d69',
								color: '#fff',
								fontSize: '10px',
								fontWeight: 800,
								borderRadius: '3px',
								padding: '2px 6px',
								letterSpacing: '1px',
							}}>
							● LIVE
						</span>
						<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: 'monospace' }}>
							{liveTime.toTimeString().slice(0, 8)}
						</span>
					</div>

					{/* Channel watermark */}
					<div
						style={{
							position: 'absolute',
							top: '10px',
							right: '12px',
							color: 'rgba(255,255,255,0.5)',
							fontSize: '11px',
							fontFamily: 'monospace',
							pointerEvents: 'none',
							zIndex: 5,
						}}>
						{CHANNELS[activeChannel]}
					</div>

					{streamAvailable ? (
						<video
							ref={videoRef}
							key={`${vehicle.vin}-ch${activeChannel}`}
							src={vehicle.dashcamStreamUrl}
							autoPlay
							muted
							playsInline
							style={{ width: '100%', maxHeight: '480px', display: 'block', objectFit: 'cover' }}
						/>
					) : (
						// ── No stream fallback ──────────────────────────────────────
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: '14px',
								color: '#555',
								padding: '40px',
							}}>
							<img
								src={dashcamIcon}
								alt='dashcam'
								style={{ width: '64px', filter: 'invert(0.3)', opacity: 0.4 }}
							/>
							<p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
								{t('Live stream not available for this vehicle')}
							</p>
							<p style={{ margin: 0, fontSize: '12px', color: '#444' }}>
								VIN: {vehicle.vin} · {CHANNELS[activeChannel]}
							</p>
						</div>
					)}
				</div>

				{/* ── FOOTER ───────────────────────────────────────────────────── */}
				<div
					style={{
						background: '#111',
						padding: '10px 16px',
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						borderTop: '1px solid #2a2a2a',
						flexWrap: 'wrap',
					}}>
					{/* Captured thumbnail (appears after first capture) */}
					{capturedThumb && (
						<div style={{ position: 'relative' }}>
							<img
								src={capturedThumb}
								alt='captured'
								style={{
									width: '44px',
									height: '30px',
									objectFit: 'cover',
									borderRadius: '3px',
									border: '2px solid #f00d69',
								}}
							/>
							<span
								style={{
									position: 'absolute',
									bottom: '1px',
									right: '2px',
									fontSize: '7px',
									color: '#fff',
									background: 'rgba(0,0,0,0.6)',
									padding: '0 2px',
									borderRadius: '2px',
								}}>
								📸
							</span>
						</div>
					)}

					{/* File label */}
					<span style={{ color: '#555', fontSize: '11px', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{fileLabel}
					</span>

					{/* Fullscreen */}
					<button
						onClick={handleFullscreen}
						title='Fullscreen'
						style={{
							background: 'transparent',
							border: '1px solid #333',
							color: '#aaa',
							borderRadius: '4px',
							padding: '6px 10px',
							cursor: 'pointer',
							fontSize: '13px',
						}}>
						⛶
					</button>

					{/* Share */}
					<button
						onClick={handleShare}
						style={{
							background: 'transparent',
							border: '1px solid #444',
							color: '#aaa',
							borderRadius: '4px',
							padding: '6px 14px',
							cursor: 'pointer',
							fontSize: '13px',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
						}}>
						🔗 {t('Share')}
					</button>

					{/* Capture — replaces Download */}
					<button
						onClick={handleCapture}
						style={{
							background: '#f00d69',
							border: 'none',
							color: '#fff',
							borderRadius: '4px',
							padding: '6px 18px',
							cursor: 'pointer',
							fontSize: '13px',
							fontWeight: 700,
							display: 'flex',
							alignItems: 'center',
							gap: '7px',
							boxShadow: '0 2px 8px rgba(240,13,105,0.4)',
						}}>
						📸 {t('Capture')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DashcamModal;
