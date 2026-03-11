// src/pages/aiFleetManager/AIFleetManager.tsx
import React, { FC, useState, useMemo } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Icon from '../../components/icon/Icon';

// ── AGENT DEFINITIONS ────────────────────────────────────────────────────────
// FIX FEAT-08: Replaced emoji icons (🚛🔧🛡️) with Material icon name strings.
// Emoji render inconsistently across platforms and cannot be styled.
const AGENTS: Record<string, { name: string; domain: string; icon: string; description: string }> = {
	FOI: { name: 'Fleet Operations Intelligence', domain: 'Operations', icon: 'LocalShipping', description: 'Real-time fleet operations monitoring and optimization' },
	MRS: { name: 'Maintenance & Reliability System', domain: 'Maintenance', icon: 'Build', description: 'Predictive maintenance and reliability analytics' },
	SCM: { name: 'Safety & Compliance Monitor', domain: 'Safety', icon: 'Security', description: 'Driver safety and regulatory compliance tracking' },
	DWM: { name: 'Driver Workforce Manager', domain: 'HR & Workforce', icon: 'People', description: 'Driver retention, performance and engagement' },
	FAO: { name: 'Financial Analytics & Optimization', domain: 'Finance', icon: 'AttachMoney', description: 'Cost management and financial performance' },
	SPS: { name: 'Strategic Planning System', domain: 'Strategy', icon: 'BarChart', description: 'Long-term fleet planning and electrification' },
	FDP: { name: 'Fraud Detection & Prevention', domain: 'Security', icon: 'Search', description: 'Anomaly detection and fraud prevention' },
};

// ── ALERT DATA ────────────────────────────────────────────────────────────────
const ALL_ALERTS = [
	{ id: 'FOI-003', agentId: 'FOI', criticality: 'CRITICAL', description: 'Traffic data integration system failure affecting real-time re-routing for 45 active vehicles', entity: '45 Active Vehicles', financialImpact: '$3,400/day', resolutionTime: '24 hours', date: '2026-01-21' },
	{ id: 'MRS-003', agentId: 'MRS', criticality: 'CRITICAL', description: 'Parts inventory stockout for critical brake components affecting 15 scheduled repairs', entity: 'Parts Inventory', financialImpact: '$18,500', resolutionTime: '24 hours', date: '2026-01-21' },
	{ id: 'SCM-002', agentId: 'SCM', criticality: 'CRITICAL', description: '27 driver certifications expiring within 30 days creating compliance risk', entity: '27 Drivers', financialImpact: '$81,000', resolutionTime: '24 hours', date: '2026-01-21' },
	{ id: 'DWM-001', agentId: 'DWM', criticality: 'CRITICAL', description: 'Driver retention rate declined to 68% with quarterly turnover at 32%', entity: 'Driver Workforce', financialImpact: '$375,000', resolutionTime: '1 month', date: '2026-01-14' },
	{ id: 'FAO-001', agentId: 'FAO', criticality: 'CRITICAL', description: 'Cost per mile increased 24% to $2.48 vs $2.00 budget target', entity: 'Fleet-Wide', financialImpact: '$156,000/month', resolutionTime: '1 month', date: '2026-01-14' },
	{ id: 'FAO-004', agentId: 'FAO', criticality: 'CRITICAL', description: 'Budget variance at -15% with Q4 projected overspend of $340,000', entity: 'Budget', financialImpact: '$340,000', resolutionTime: '1 month', date: '2026-01-13' },
	{ id: 'FDP-001', agentId: 'FDP', criticality: 'CRITICAL', description: 'Fuel fraud pattern detected with 6 transactions flagged for unusual locations and timing', entity: '6 Transactions (3 drivers)', financialImpact: '$4,250', resolutionTime: '24 hours', date: '2026-01-21' },
	{ id: 'FOI-005', agentId: 'FOI', criticality: 'CRITICAL', description: 'Demand forecasting model predicts 25% capacity shortfall for peak holiday season', entity: 'Fleet Planning', financialImpact: '$125,000', resolutionTime: '2 weeks', date: '2026-01-20' },
	{ id: 'MRS-001', agentId: 'MRS', criticality: 'HIGH', description: 'Predictive maintenance model flagging 8 vehicles with 85%+ probability of component failure within 14 days', entity: '8 Vehicles', financialImpact: '$20,000', resolutionTime: '72 hours', date: '2026-01-21' },
	{ id: 'SCM-001', agentId: 'SCM', criticality: 'HIGH', description: 'Harsh braking events increased 45% week-over-week across 35 drivers', entity: '35 Drivers', financialImpact: '$8,500', resolutionTime: '48 hours', date: '2026-01-21' },
	{ id: 'SCM-005', agentId: 'SCM', criticality: 'HIGH', description: 'AI dashcam detected 52 distracted driving events in past 48 hours', entity: '23 Drivers', financialImpact: '$15,600', resolutionTime: '48 hours', date: '2026-01-20' },
	{ id: 'DWM-002', agentId: 'DWM', criticality: 'HIGH', description: 'Driver satisfaction survey shows 35% decline in engagement scores', entity: 'Driver Engagement', financialImpact: '$45,000', resolutionTime: '2 weeks', date: '2026-01-18' },
	{ id: 'FAO-002', agentId: 'FAO', criticality: 'HIGH', description: 'Fuel efficiency declined 12% fleet-wide from 8.2 to 7.2 MPG', entity: 'Fuel Economy', financialImpact: '$48,000/month', resolutionTime: '2 weeks', date: '2026-01-17' },
	{ id: 'SPS-001', agentId: 'SPS', criticality: 'HIGH', description: 'EV charging infrastructure deployment 4 months behind schedule', entity: 'EV Infrastructure', financialImpact: '$680,000', resolutionTime: '3 months', date: '2026-01-15' },
	{ id: 'FDP-002', agentId: 'FDP', criticality: 'HIGH', description: 'Odometer rollback suspected in 3 vehicles with GPS-mileage discrepancies', entity: '3 Vehicles', financialImpact: '$12,000', resolutionTime: '48 hours', date: '2026-01-20' },
	{ id: 'FOI-002', agentId: 'FOI', criticality: 'MEDIUM', description: 'Route optimization algorithm detected 18% increase in miles driven for last-mile delivery routes', entity: '25 Delivery Routes', financialImpact: '$1,800/week', resolutionTime: '48 hours', date: '2026-01-21' },
	{ id: 'MRS-002', agentId: 'MRS', criticality: 'MEDIUM', description: '42 vehicles past maintenance schedule by more than 30 days', entity: '42 Vehicles', financialImpact: '$32,000', resolutionTime: '72 hours', date: '2026-01-21' },
	{ id: 'SCM-003', agentId: 'SCM', criticality: 'MEDIUM', description: 'ELD data shows 8 potential HOS violations requiring immediate investigation', entity: '8 Drivers', financialImpact: '$12,000', resolutionTime: '24 hours', date: '2026-01-20' },
	{ id: 'DWM-004', agentId: 'DWM', criticality: 'MEDIUM', description: 'Driver performance scores show 15 drivers below 70% threshold requiring coaching', entity: '15 Drivers', financialImpact: '$9,000', resolutionTime: '2 weeks', date: '2026-01-18' },
	{ id: 'FAO-005', agentId: 'FAO', criticality: 'MEDIUM', description: 'Idle time fuel consumption at 8% of total vs 5% industry benchmark', entity: 'Fuel Management', financialImpact: '$22,000/month', resolutionTime: '1 month', date: '2026-01-16' },
	{ id: 'SPS-003', agentId: 'SPS', criticality: 'MEDIUM', description: 'EV battery health degradation at 15% per year vs 10% projected', entity: '8 EVs', financialImpact: '$42,000', resolutionTime: 'Ongoing', date: '2026-01-12' },
	{ id: 'FDP-004', agentId: 'FDP', criticality: 'MEDIUM', description: 'Time theft pattern - 8 drivers with consistent timesheet-ELD discrepancies', entity: '8 Drivers', financialImpact: '$15,200', resolutionTime: '1 week', date: '2026-01-17' },
	{ id: 'FOI-004', agentId: 'FOI', criticality: 'MEDIUM', description: 'Geofence violations detected for 8 vehicles operating outside authorized service areas', entity: '8 Vehicles', financialImpact: '$1,200', resolutionTime: '24 hours', date: '2026-01-21' },
];

const CRITICALITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
	CRITICAL: { color: '#f44336', bg: 'rgba(244,67,54,0.1)', label: 'Critical' },
	HIGH: { color: '#ff9800', bg: 'rgba(255,152,0,0.1)', label: 'High' },
	MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
	LOW: { color: '#4caf50', bg: 'rgba(76,175,80,0.1)', label: 'Low' },
};

const PRIORITY_FILTERS = [
	{ id: 'ALL', label: 'All Alerts' },
	{ id: 'CRITICAL', label: 'Critical' },
	{ id: 'HIGH', label: 'High' },
	{ id: 'MEDIUM', label: 'Medium' },
];

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────
const DetailPanel: FC<{ alert: any; onClose: () => void }> = ({ alert, onClose }) => {
	const agent = AGENTS[alert.agentId];
	const cfg = CRITICALITY_CONFIG[alert.criticality];
	const actions = [
		`Conduct immediate investigation into ${alert.entity} to identify root causes`,
		`Implement corrective measures based on AI recommendations within ${alert.resolutionTime}`,
		`Monitor key performance metrics daily to verify resolution effectiveness`,
		`Update standard operating procedures to prevent recurrence of this issue`,
	];

	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9000, display: 'flex', justifyContent: 'flex-end' }}
			onClick={e => e.target === e.currentTarget && onClose()}>
			<div style={{ width: 560, maxWidth: '95vw', background: '#fff', height: '100vh', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
				{/* Header */}
				<div style={{ background: '#ffffff', padding: '20px 24px', color: '#1f1e1e', borderBottom: '3px solid #f00d69' }}>
					<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
						<div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
								<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{alert.id}</span>
								<span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '2px 10px', textTransform: 'uppercase' }}>{cfg.label}</span>
							</div>
							<div style={{ color: '#0af', fontSize: 12, fontWeight: 600 }}><Icon icon={agent?.icon as any} size='sm' /> {agent?.name}</div>
						</div>
						<button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 18 }}>✕</button>
					</div>
					<p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{alert.description}</p>
				</div>

				<div style={{ padding: 24, flex: 1 }}>
					{/* Key metrics */}
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
						{[['Entity Affected', alert.entity], ['Financial Impact', alert.financialImpact], ['Resolution Time', alert.resolutionTime], ['Detected', alert.date]].map(([label, value]) => (
							<div key={label} style={{ background: '#fff5f8', borderRadius: 8, padding: '14px 16px', border: '1px solid #fde8ef' }}>
								<div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
								<div style={{ color: '#1f1e1e', fontWeight: 700, fontSize: 14 }}>{value}</div>
							</div>
						))}
					</div>

					{/* AI Recommended Actions */}
					<div style={{ marginBottom: 24 }}>
						<div style={{ fontWeight: 700, fontSize: 14, color: '#1f1e1e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
							<span style={{ background: 'linear-gradient(135deg,#f00d69,#ff3399)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 8, padding: '2px 8px' }}>AI</span>
							Recommended Actions
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							{actions.map((action, i) => (
								<div key={i} style={{ background: '#f8f9fa', borderLeft: '3px solid #f00d69', borderRadius: '0 8px 8px 0', padding: '10px 14px', fontSize: 13, color: '#333', lineHeight: 1.5 }}>
									<span style={{ color: '#f00d69', fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>
									{action}
								</div>
							))}
						</div>
					</div>

					{/* Action buttons */}
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
						<button onClick={() => alert(`Alert ${alert.id} marked as resolved`)}
							style={{ flex: 1, background: '#f00d69', border: 'none', color: '#fff', borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
							✓ Resolve
						</button>
						<button onClick={() => {
							const email = window.prompt('Assign to (email):');
							if (email) window.alert(`Assigned to ${email}`);
						}}
							style={{ flex: 1, background: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
							👤 Assign
						</button>
						<button onClick={() => {
							const dt = window.prompt('Snooze until (date/time):');
							if (dt) window.alert(`Snoozed until ${dt}`);
						}}
							style={{ flex: 1, background: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
							💤 Snooze
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const AIFleetManager: FC = () => {
	const [priorityFilter, setPriorityFilter] = useState('ALL');
	const [agentFilter, setAgentFilter] = useState('ALL');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		return ALL_ALERTS.filter(a => {
			const matchPriority = priorityFilter === 'ALL' || a.criticality === priorityFilter;
			const matchAgent = agentFilter === 'ALL' || a.agentId === agentFilter;
			const matchSearch = search === '' || a.description.toLowerCase().includes(search.toLowerCase()) || a.entity.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
			return matchPriority && matchAgent && matchSearch;
		});
	}, [priorityFilter, agentFilter, search]);

	const counts = {
		CRITICAL: ALL_ALERTS.filter(a => a.criticality === 'CRITICAL').length,
		HIGH: ALL_ALERTS.filter(a => a.criticality === 'HIGH').length,
		MEDIUM: ALL_ALERTS.filter(a => a.criticality === 'MEDIUM').length,
	};

	const totalImpact = '$1.2M+';

	return (
		<PageWrapper isProtected title='AI Fleet Manager'>
			{selectedAlert && <DetailPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}

			<SubHeader>
				<SubHeaderLeft>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<span style={{ fontSize: 20, fontWeight: 700, color: '#1f1e1e' }}>AI Fleet Manager</span>
						<span style={{ background: 'linear-gradient(135deg,#f00d69,#ff3399)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '3px 12px' }}>AI POWERED</span>
					</div>
				</SubHeaderLeft>
				<SubHeaderRight>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						{/* View toggle */}
						<div style={{ display: 'flex', background: '#f0f0f0', borderRadius: 8, padding: 3, gap: 2 }}>
							{(['grid', 'list'] as const).map(v => (
								<button key={v} onClick={() => setViewMode(v)}
									style={{ padding: '6px 14px', background: viewMode === v ? '#fff' : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: viewMode === v ? '#f00d69' : '#888', boxShadow: viewMode === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
									{v === 'grid' ? '⊞ Card' : '☰ List'}
								</button>
							))}
						</div>
						<button onClick={() => window.alert('Exporting AI insights...')}
							style={{ background: '#1f1e1e', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
							⬇ Export
						</button>
					</div>
				</SubHeaderRight>
			</SubHeader>

			<Page>
				{/* Summary KPI cards */}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
					{[
						{ label: 'Total Alerts', value: ALL_ALERTS.length, color: '#1f1e1e', icon: 'Notifications' },
						{ label: 'Critical', value: counts.CRITICAL, color: '#f44336', icon: 'Error' },
						{ label: 'High Priority', value: counts.HIGH, color: '#ff9800', icon: 'Warning' },
						{ label: 'Financial Impact', value: totalImpact, color: '#f00d69', icon: 'AttachMoney' },
					].map(kpi => (
						<div key={kpi.label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
								<Icon icon={kpi.icon as any} size='md' />
								<span style={{ fontSize: 12, color: '#888' }}>{kpi.label}</span>
							</div>
							<div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
						</div>
					))}
				</div>

				{/* Filters */}
				<div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
					{/* Search */}
					<div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
						<span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 14 }}>🔍</span>
						<input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search alerts...'
							style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e0e0e0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
					</div>

					{/* Priority filter pills */}
					<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
						{PRIORITY_FILTERS.map(f => {
							const cfg = f.id !== 'ALL' ? CRITICALITY_CONFIG[f.id] : null;
							const isActive = priorityFilter === f.id;
							const count = f.id === 'ALL' ? ALL_ALERTS.length : counts[f.id as keyof typeof counts];
							return (
								<button key={f.id} onClick={() => setPriorityFilter(f.id)}
									style={{ background: isActive ? (cfg?.color || '#f00d69') : '#f5f5f5', color: isActive ? '#fff' : '#555', border: `1px solid ${isActive ? (cfg?.color || '#f00d69') : '#e0e0e0'}`, borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
									{f.label}
									<span style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', borderRadius: 8, padding: '1px 6px', fontSize: 11 }}>{count}</span>
								</button>
							);
						})}
					</div>

					{/* Agent filter */}
					<select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
						style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, padding: '7px 12px', fontSize: 13, cursor: 'pointer', color: '#555', outline: 'none' }}>
						<option value='ALL'>All Agents</option>
						{Object.entries(AGENTS).map(([id, agent]) => (
							<option key={id} value={id}>{agent.name}</option>
						))}
					</select>

					<span style={{ color: '#aaa', fontSize: 12 }}>{filtered.length} results</span>
				</div>

				{/* Alert cards / list */}
				{viewMode === 'grid' ? (
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
						{filtered.map(alert => {
							const cfg = CRITICALITY_CONFIG[alert.criticality];
							const agent = AGENTS[alert.agentId];
							return (
								<div key={alert.id} onClick={() => setSelectedAlert(alert)}
									style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '18px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.15s, border-color 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
									onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(240,13,105,0.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f00d69'; }}
									onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8e8'; }}>
									{/* Left border accent */}
									<div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: cfg.color, borderRadius: '10px 0 0 10px' }} />

									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#1f1e1e' }}>{alert.id}</span>
											<span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 8px' }}>{cfg.label}</span>
										</div>
										<span style={{ fontSize: 11, color: '#aaa' }}>{alert.date}</span>
									</div>

									<div style={{ color: '#f00d69', fontSize: 11, fontWeight: 600, marginBottom: 6 }}><Icon icon={agent?.icon as any} size='sm' /> {agent?.name}</div>

									<p style={{ color: '#333', fontSize: 13, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
										{alert.description}
									</p>

									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 14, borderTop: '1px solid #f0f0f0', marginBottom: 14 }}>
										{[['🎯 Entity', alert.entity], ['💰 Impact', alert.financialImpact]].map(([label, value]) => (
											<div key={label as string} style={{ fontSize: 12 }}>
												<span style={{ color: '#888888' }}>{label as string}: </span>
												<span style={{ fontWeight: 600, color: '#333' }}>{value as string}</span>
											</div>
										))}
									</div>

									<div style={{ display: 'flex', gap: 8 }}>
										<button onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }}
											style={{ flex: 1, background: '#f00d69', border: 'none', color: '#fff', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
											View Details →
										</button>
										<button onClick={e => { e.stopPropagation(); window.alert(`Alert ${alert.id} marked resolved`); }}
											style={{ background: '#fff', border: '1px solid #ddd', color: '#555', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 12 }}>
											✓ Resolve
										</button>
									</div>
								</div>
							);
						})}
						{filtered.length === 0 && (
							<div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#aaa' }}>
								<div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
								<p style={{ fontWeight: 600, color: '#555' }}>No alerts match current filters</p>
							</div>
						)}
					</div>
				) : (
					<div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead style={{ background: '#f5f5f5' }}>
								<tr>
									{['ID', 'Priority', 'Agent', 'Description', 'Entity', 'Impact', 'Action'].map(h => (
										<th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filtered.map((alert, i) => {
									const cfg = CRITICALITY_CONFIG[alert.criticality];
									const agent = AGENTS[alert.agentId];
									return (
										<tr key={alert.id} onClick={() => setSelectedAlert(alert)} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
											onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fff5f8'}
											onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
											<td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#1f1e1e' }}>{alert.id}</td>
											<td style={{ padding: '12px 14px' }}>
												<span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '3px 10px' }}>{cfg.label}</span>
											</td>
											<td style={{ padding: '12px 14px', fontSize: 12, color: '#f00d69', fontWeight: 600 }}><Icon icon={agent?.icon as any} size='sm' /> {agent?.domain}</td>
											<td style={{ padding: '12px 14px', fontSize: 12, color: '#333', maxWidth: 280 }}>
												<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</div>
											</td>
											<td style={{ padding: '12px 14px', fontSize: 12, color: '#555' }}>{alert.entity}</td>
											<td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#f44336' }}>{alert.financialImpact}</td>
											<td style={{ padding: '12px 14px' }}>
												<button onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }}
													style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>View →</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{filtered.length === 0 && (
							<div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>No alerts match current filters</div>
						)}
					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default AIFleetManager;
