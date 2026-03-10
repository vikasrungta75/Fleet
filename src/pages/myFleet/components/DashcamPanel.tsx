// src/pages/fleet/components/DashcamPanel.tsx
// ── Light theme — matches platform design system ──────────────────────────────

import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardMenu } from '../../../menu';

const CHANNEL_LABELS: Record<number, string> = {
	1: 'Front Camera',
	2: 'Cabin Camera',
	3: 'Rear Camera',
	4: 'Side Left',
	5: 'Side Right',
	6: 'Cargo',
};

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
	bg: '#f8f9fa',
	card: '#ffffff',
	border: '#e8e8e8',
	borderHover: '#f00d69',
	textPrimary: '#1a1a2e',
	textSecondary: '#555',
	textMuted: '#888',
	pink: '#f00d69',
	pinkBg: '#fff0f5',
	pinkBorder: 'rgba(240,13,105,0.25)',
	green: '#2da44e',
	greenBg: '#e8f5e9',
	greenBorder: '#c8e6c9',
	red: '#d0021b',
	redBg: '#fff0f0',
	redBorder: '#ffcdd2',
	blue: '#1565c0',
	blueBg: '#e3f2fd',
	blueBorder: '#bbdefb',
};

interface DashcamPanelProps {
	vehicles: Array<{
		id: string;
		name: string;
		registration?: string;
		imei?: string;
		status: 'online' | 'offline' | 'reconnecting';
		channels?: number[];
		model?: string;
	}>;
	onClose?: () => void;
}

const DashcamPanel: FC<DashcamPanelProps> = ({ vehicles, onClose }) => {
	const navigate = useNavigate();

	const handleOpenLiveMonitor = (vehicleId: string) => {
		navigate(`/${dashboardMenu.liveMonitor.path}?device=${vehicleId}`);
		if (onClose) onClose();
	};

	const online = vehicles.filter(v => v.status === 'online');
	const offline = vehicles.filter(v => v.status !== 'online');

	return (
		<div style={{ background: T.bg, borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}` }}>

			{/* Header */}
			<div style={{ background: T.card, padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
				<span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>📷 Cameras</span>
				<span style={{ background: T.greenBg, color: T.green, fontSize: 10, fontWeight: 800, borderRadius: 4, padding: '2px 8px', border: `1px solid ${T.greenBorder}` }}>
					{online.length} LIVE
				</span>
				<span style={{ background: T.redBg, color: T.red, fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 8px', border: `1px solid ${T.redBorder}` }}>
					{offline.length} OFFLINE
				</span>
			</div>

			{/* Device list */}
			<div style={{ maxHeight: 400, overflowY: 'auto', padding: 10 }}>
				{vehicles.length === 0 && (
					<div style={{ textAlign: 'center', padding: 32, color: T.textMuted }}>
						<div style={{ fontSize: 32, marginBottom: 10 }}>📹</div>
						<p style={{ fontSize: 13, margin: 0 }}>No dashcam-equipped vehicles</p>
					</div>
				)}

				{vehicles.map(vehicle => {
					const isOnline = vehicle.status === 'online';
					const channels = vehicle.channels || [1, 2];

					return (
						<div key={vehicle.id}
							style={{
								background: T.card,
								borderRadius: 8,
								padding: '12px 14px',
								marginBottom: 8,
								border: `1px solid ${T.border}`,
								borderLeft: `3px solid ${isOnline ? T.green : '#ddd'}`,
								cursor: 'pointer',
								transition: 'box-shadow 0.15s, border-color 0.15s',
								boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
							}}
							onClick={() => handleOpenLiveMonitor(vehicle.id)}
							onMouseEnter={e => {
								(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(240,13,105,0.12)';
								(e.currentTarget as HTMLDivElement).style.borderColor = T.pinkBorder;
							}}
							onMouseLeave={e => {
								(e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
								(e.currentTarget as HTMLDivElement).style.borderColor = T.border;
							}}>

							{/* Vehicle name + status */}
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
								<div>
									<div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{vehicle.name}</div>
									{vehicle.registration && (
										<div style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>{vehicle.registration}</div>
									)}
								</div>
								<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
									{isOnline && (
										<span style={{ display: 'inline-block', width: 7, height: 7, background: T.green, borderRadius: '50%', boxShadow: `0 0 6px ${T.green}`, animation: 'livePulse 2s infinite' }} />
									)}
									<span style={{
										background: isOnline ? T.greenBg : T.redBg,
										color: isOnline ? T.green : T.red,
										fontSize: 9,
										fontWeight: 800,
										borderRadius: 4,
										padding: '2px 8px',
										border: `1px solid ${isOnline ? T.greenBorder : T.redBorder}`,
									}}>
										{isOnline ? '● LIVE' : 'OFFLINE'}
									</span>
								</div>
							</div>

							{/* Channel pills */}
							<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
								{channels.map(ch => (
									<span key={ch} style={{
										background: T.blueBg,
										border: `1px solid ${T.blueBorder}`,
										color: T.blue,
										fontSize: 9,
										borderRadius: 4,
										padding: '2px 7px',
										fontFamily: 'monospace',
										fontWeight: 600,
									}}>
										CH{ch} — {CHANNEL_LABELS[ch] || `Channel ${ch}`}
									</span>
								))}
							</div>

							{/* Footer row */}
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<span style={{ color: T.textMuted, fontSize: 10 }}>{vehicle.model || 'Dashcam Device'}</span>
								<span style={{
									background: isOnline ? T.pinkBg : T.bg,
									color: isOnline ? T.pink : T.textMuted,
									fontSize: 10,
									fontWeight: 700,
									borderRadius: 5,
									padding: '4px 10px',
									border: `1px solid ${isOnline ? T.pinkBorder : T.border}`,
									display: 'flex',
									alignItems: 'center',
									gap: 4,
								}}>
									{isOnline ? '🖥 Open Live Monitor →' : '↗ View Last Stream'}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			<style>{`
				@keyframes livePulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.35; }
				}
			`}</style>
		</div>
	);
};

export default DashcamPanel;

// ═══════════════════════════════════════════════════════════════════════════
// HOW TO USE — In your MyFleet panel, inside the "Cameras" tab:
//
// import DashcamPanel from './components/DashcamPanel';
//
// const dashcamVehicles = allVehicles
//   .filter(v => v.has_dashcam)
//   .map(v => ({
//     id: v.imei || v.id,
//     name: v.name,
//     registration: v.registration_no,
//     imei: v.imei,
//     status: v.dashcam_status || 'offline',
//     channels: v.dashcam_channels?.map((c: any) => c.ch) || [1, 2],
//     model: v.dashcam_model,
//   }));
//
// <DashcamPanel vehicles={dashcamVehicles} />
// ═══════════════════════════════════════════════════════════════════════════
