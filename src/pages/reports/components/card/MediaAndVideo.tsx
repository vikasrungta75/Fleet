/**
 * MediaAndVideo.tsx  →  src/pages/reports/components/media/MediaAndVideo.tsx
 *
 * Mirrors the Lovable AlertsPage structure exactly:
 *   - Same alert field access: alertName || alarmType || eventType
 *   - Same severity logic: SOS/Collision/Fatigue = critical, Alarm/Warning/Hard/Speed = warning
 *   - Same pagination pattern: fetchAlerts(page, 20) → res.data[], res.totalPages, res.total
 *   - Media URLs: resolveMediaUrl(storagePath) to convert relative → absolute
 *   - alertHasVideo(alert) to detect video attachments
 *   - CSV export matching Lovable's handleExportCSV
 *   - Three tabs: All Alerts | Media (Video) | Images
 */

import React, { FC, useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchAlerts,
  resolveMediaUrl,
  alertHasVideo,
  alertHasMedia,
  type IotAlert,
  type IotAttachment,
} from '../../../../services/dashcamService';

// ─── Theme (light, matches Ravity design system) ─────────────────────────────
const T = {
  bg: '#f8f9fa', card: '#ffffff', border: '#e8e8e8',
  textPrimary: '#1a1a2e', textSecondary: '#555', textMuted: '#888',
  pink: '#f00d69', purple: '#6c5dd3',
  green: '#2da44e', red: '#d0021b', orange: '#e65100', blue: '#1565c0',
  blueBg: '#e3f2fd',
};

// ─── Severity helpers (mirrors Lovable getSeverityBadge) ─────────────────────
type Severity = 'critical' | 'warning' | 'info';

const getSeverity = (alert: IotAlert): Severity => {
  const name = (alert.alertName || alert.alarmType || alert.eventType || '').toLowerCase();
  if (name.includes('sos') || name.includes('collision') || name.includes('fatigue')) return 'critical';
  if (name.includes('alarm') || name.includes('warning') || name.includes('hard') || name.includes('speed')) return 'warning';
  return 'info';
};

const SEVERITY_STYLE: Record<Severity, React.CSSProperties> = {
  critical: { background: '#fdecea', color: T.red,    border: `1px solid #ffcdd2`, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
  warning:  { background: '#fff3e0', color: T.orange, border: `1px solid #ffe0b2`, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
  info:     { background: '#e8eaf6', color: T.purple, border: `1px solid #c5cae9`, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
};

// ─── formatTimeAgo (from Lovable AlertsPage) ─────────────────────────────────
const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ─── CSV Export (mirrors Lovable handleExportCSV exactly) ─────────────────────
const exportCSV = (alerts: IotAlert[], page: number) => {
  if (alerts.length === 0) return;
  const headers = ['ID', 'Alert Name', 'Device', 'IMEI', 'Time', 'Location', 'Type'];
  const rows = alerts.map(a => [
    a.id,
    a.alertName || a.alarmType || '',
    a.deviceName || '',
    a.imei || '',
    a.alertTime ? new Date(a.alertTime).toLocaleString() : '',
    a.location || '',
    a.triggerType || '',
  ]);
  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alerts_page${page}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Media Lightbox ──────────────────────────────────────────────────────────
const MediaLightbox: FC<{
  attachment: IotAttachment;
  alertName: string;
  onClose: () => void;
}> = ({ attachment, alertName, onClose }) => {
  const url = resolveMediaUrl(attachment.storagePath);
  const isVideo = attachment.mediaType === 1;

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#111', borderRadius: 10, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{alertName}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={url} download={attachment.fileName}
              style={{ background: T.purple, color: '#fff', borderRadius: 5, padding: '4px 12px', fontSize: 11, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>
              ↓ Download
            </a>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        {isVideo ? (
          <video src={url} controls autoPlay style={{ maxWidth: '85vw', maxHeight: '80vh', display: 'block' }} />
        ) : (
          <img src={url} alt={attachment.fileName} style={{ maxWidth: '85vw', maxHeight: '80vh', display: 'block', objectFit: 'contain' }} />
        )}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 10, fontFamily: 'monospace' }}>CH {attachment.channel}</span>
          <span style={{ color: '#888', fontSize: 10 }}>{attachment.fileName}</span>
          {attachment.fileSize > 0 && (
            <span style={{ color: '#666', fontSize: 10 }}>{(attachment.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          )}
          {attachment.duration > 0 && (
            <span style={{ color: '#666', fontSize: 10 }}>{attachment.duration}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Alert Detail Modal ───────────────────────────────────────────────────────
const AlertDetailModal: FC<{ alert: IotAlert; onClose: () => void }> = ({ alert, onClose }) => {
  const [lightboxAttachment, setLightboxAttachment] = useState<IotAttachment | null>(null);
  const severity = getSeverity(alert);
  const name = alert.alertName || alert.alarmType || alert.eventType || 'Unknown Alert';

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <>
      {lightboxAttachment && (
        <MediaLightbox
          attachment={lightboxAttachment}
          alertName={name}
          onClose={() => setLightboxAttachment(null)}
        />
      )}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background: T.card, borderRadius: 12, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>{name}</span>
              <span style={SEVERITY_STYLE[severity]}>{severity.toUpperCase()}</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Details */}
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
              {[
                ['Device', alert.deviceName || '—'],
                ['IMEI', alert.imei || '—'],
                ['Time', alert.alertTime ? new Date(alert.alertTime).toLocaleString() : '—'],
                ['Trigger', alert.triggerType || '—'],
                ['Status', alert.status === 1 ? 'Active' : 'Resolved'],
                ['Location', alert.location || alert.locationAddress || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 2 }}>{label}</div>
                  <div style={{ color: T.textPrimary, fontSize: 12, fontFamily: label === 'IMEI' ? 'monospace' : 'inherit' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Attachments */}
            {alert.attachment && alert.attachment.length > 0 && (
              <div>
                <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 10 }}>
                  MEDIA ({alert.attachment.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                  {alert.attachment.map(att => {
                    const url = resolveMediaUrl(att.storagePath);
                    const isVideo = att.mediaType === 1;
                    return (
                      <div key={att.id} onClick={() => setLightboxAttachment(att)}
                        style={{ position: 'relative', background: '#000', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/9', border: `1px solid ${T.border}` }}>
                        {isVideo ? (
                          <>
                            <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                              <span style={{ fontSize: 22 }}>▶</span>
                            </div>
                          </>
                        ) : (
                          <img src={url} alt={att.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <div style={{ position: 'absolute', bottom: 3, left: 4, right: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: isVideo ? T.pink : T.purple, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 2, padding: '1px 4px' }}>
                            {isVideo ? '▶ VIDEO' : '📷 IMG'}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 8 }}>CH{att.channel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Media Gallery Tab (video attachments across all alerts) ──────────────────
const MediaGalleryTab: FC<{ alerts: IotAlert[] }> = ({ alerts }) => {
  const [lightboxAttachment, setLightboxAttachment] = useState<{ att: IotAttachment; name: string } | null>(null);

  // Collect all video attachments from all alerts
  const videoItems = useMemo(() => {
    const items: Array<{ att: IotAttachment; alert: IotAlert }> = [];
    alerts.forEach(alert => {
      alert.attachment?.filter(a => a.mediaType === 1).forEach(att => {
        items.push({ att, alert });
      });
    });
    return items;
  }, [alerts]);

  if (videoItems.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: T.textMuted }}>
        <span style={{ fontSize: 36, marginBottom: 12 }}>🎬</span>
        <p style={{ margin: 0, fontSize: 14 }}>No video attachments on this page</p>
        <p style={{ margin: '6px 0 0', fontSize: 12 }}>Video clips are attached automatically when an alert fires</p>
      </div>
    );
  }

  return (
    <>
      {lightboxAttachment && (
        <MediaLightbox
          attachment={lightboxAttachment.att}
          alertName={lightboxAttachment.name}
          onClose={() => setLightboxAttachment(null)}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, padding: '16px 0' }}>
        {videoItems.map(({ att, alert }) => {
          const url = resolveMediaUrl(att.storagePath);
          const name = alert.alertName || alert.alarmType || alert.eventType || 'Alert';
          return (
            <div key={att.id} onClick={() => setLightboxAttachment({ att, alert: alert as any, name } as any)}
              style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
              <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
                <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(240,13,105,0.85)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 14, marginLeft: 2 }}>▶</span>
                  </div>
                </div>
                <span style={{ position: 'absolute', top: 6, left: 6, background: T.pink, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '1px 5px' }}>VIDEO</span>
                {att.duration > 0 && (
                  <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>
                    {att.duration}s
                  </span>
                )}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ color: T.textPrimary, fontSize: 11, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{alert.imei}</span>
                  <span style={{ color: T.textMuted, fontSize: 10 }}>CH{att.channel}</span>
                </div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>
                  {alert.alertTime ? formatTimeAgo(alert.alertTime) : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Image Gallery Tab ────────────────────────────────────────────────────────
const ImageGalleryTab: FC<{ alerts: IotAlert[] }> = ({ alerts }) => {
  const [lightboxAttachment, setLightboxAttachment] = useState<{ att: IotAttachment; name: string } | null>(null);

  const imageItems = useMemo(() => {
    const items: Array<{ att: IotAttachment; alert: IotAlert }> = [];
    alerts.forEach(alert => {
      alert.attachment?.filter(a => a.mediaType === 0).forEach(att => {
        items.push({ att, alert });
      });
    });
    return items;
  }, [alerts]);

  if (imageItems.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: T.textMuted }}>
        <span style={{ fontSize: 36, marginBottom: 12 }}>📷</span>
        <p style={{ margin: 0, fontSize: 14 }}>No image attachments on this page</p>
      </div>
    );
  }

  return (
    <>
      {lightboxAttachment && (
        <MediaLightbox
          attachment={lightboxAttachment.att}
          alertName={lightboxAttachment.name}
          onClose={() => setLightboxAttachment(null)}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, padding: '16px 0' }}>
        {imageItems.map(({ att, alert }) => {
          const url = resolveMediaUrl(att.storagePath);
          const name = alert.alertName || alert.alarmType || alert.eventType || 'Alert';
          return (
            <div key={att.id} onClick={() => setLightboxAttachment({ att, name } as any)}
              style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#eee', position: 'relative' }}>
                <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: 6, left: 6, background: T.purple, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '1px 5px' }}>IMG</span>
              </div>
              <div style={{ padding: '6px 10px 8px' }}>
                <div style={{ color: T.textPrimary, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>
                  CH{att.channel} · {alert.alertTime ? formatTimeAgo(alert.alertTime) : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow: FC = () => (
  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} style={{ padding: '10px 12px' }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MediaAndVideo: FC = () => {
  const [alerts, setAlerts] = useState<IotAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'images'>('all');
  const [selectedAlert, setSelectedAlert] = useState<IotAlert | null>(null);

  const PAGE_SIZE = 20;

  // ── Load alerts: mirrors Lovable getAlerts(page, pageSize) ────────────────
  // Our fetchAlerts() returns PagedData (unwrapped from ApiResponse) so:
  //   res.data        = IotAlert[]       (Lovable: data?.data?.data)
  //   res.totalPages  = number            (Lovable: data?.data?.totalPages)
  //   res.total       = number            (Lovable: data?.data?.total)
  const loadAlerts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetchAlerts(p, PAGE_SIZE);
      if (res.data && res.data.length > 0) {
        setAlerts(res.data);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
        setUsingMock(false);
      } else {
        setAlerts(MOCK_ALERTS);
        setTotalPages(1);
        setTotal(MOCK_ALERTS.length);
        setUsingMock(true);
      }
    } catch {
      setAlerts(MOCK_ALERTS);
      setTotalPages(1);
      setTotal(MOCK_ALERTS.length);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(page); }, [page, loadAlerts]);

  // Mirrors Lovable: unique alert types from alertName || alarmType || eventType
  const alertTypes = useMemo(() => {
    const types = new Set(
      alerts.map(a => a.alertName || a.alarmType || a.eventType).filter(Boolean)
    );
    return Array.from(types).sort() as string[];
  }, [alerts]);

  // Mirrors Lovable filteredAlerts useMemo
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch =
        !search ||
        (alert.deviceName || '').toLowerCase().includes(search.toLowerCase()) ||
        (alert.imei || '').toLowerCase().includes(search.toLowerCase()) ||
        (alert.alertName || '').toLowerCase().includes(search.toLowerCase()) ||
        (alert.alarmType || '').toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === 'all' ||
        (alert.alertName || alert.alarmType || alert.eventType) === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [alerts, search, typeFilter]);

  const tabs = [
    { id: 'all' as const,    label: '☰ All Alerts' },
    { id: 'video' as const,  label: '▶ Media / Video' },
    { id: 'images' as const, label: '📷 Images' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${T.border}`, background: T.card, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>🔔 Alerts & Media</span>
          <span style={{ color: T.textMuted, fontSize: 12 }}>{total} total</span>
          {usingMock && (
            <span style={{ background: '#fffbea', color: '#856404', border: '1px solid #ffe58f', borderRadius: 4, fontSize: 10, padding: '2px 7px', fontWeight: 600 }}>Sample data</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => exportCSV(filteredAlerts, page)}
            disabled={filteredAlerts.length === 0}
            style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 6, padding: '6px 14px', cursor: filteredAlerts.length === 0 ? 'default' : 'pointer', fontSize: 12, opacity: filteredAlerts.length === 0 ? 0.5 : 1 }}>
            ↓ Export CSV
          </button>
          <button
            onClick={() => loadAlerts(page)}
            style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background: 'none', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${T.purple}` : '2px solid transparent', color: activeTab === tab.id ? T.purple : T.textMuted, fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', padding: '10px 16px', fontSize: 12, transition: 'all 0.15s', marginBottom: -1 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>

        {activeTab === 'all' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, padding: '14px 0', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 13 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search device, IMEI, alert type…"
                  style={{ width: '100%', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, padding: '7px 10px 7px 30px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, padding: '7px 10px', fontSize: 12, cursor: 'pointer', minWidth: 160 }}>
                <option value="all">All Types</option>
                {alertTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#fafafa' }}>
                      {['Media', 'Severity', 'Type', 'Device', 'IMEI', 'Time', 'Location', ''].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: T.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                      : filteredAlerts.length === 0
                        ? (
                          <tr>
                            <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: T.textMuted }}>
                              <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                              <div style={{ fontSize: 13 }}>No alerts found</div>
                            </td>
                          </tr>
                        )
                        : filteredAlerts.map((alert, i) => {
                          const hasVid = alertHasVideo(alert);
                          const hasMedia = alertHasMedia(alert);
                          const severity = getSeverity(alert);
                          const name = alert.alertName || alert.alarmType || alert.eventType || 'Unknown';
                          // Use first image attachment as thumbnail (mirrors Lovable media lookup)
                          const imgAtt = alert.attachment?.find(a => a.mediaType === 0);
                          const thumbUrl = imgAtt ? resolveMediaUrl(imgAtt.storagePath) : null;

                          return (
                            <tr key={alert.id || i}
                              style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>

                              {/* Media thumbnail — mirrors Lovable's media cell */}
                              <td style={{ padding: '8px 12px' }}>
                                {thumbUrl ? (
                                  <div style={{ width: 48, height: 32, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                                    <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {hasVid && (
                                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#fff', fontSize: 10 }}>▶</span>
                                      </div>
                                    )}
                                  </div>
                                ) : hasVid ? (
                                  <div style={{ width: 48, height: 32, borderRadius: 4, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: T.purple, fontSize: 14 }}>▶</span>
                                  </div>
                                ) : (
                                  <div style={{ width: 48, height: 32, borderRadius: 4, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#ccc', fontSize: 12 }}>📷</span>
                                  </div>
                                )}
                              </td>

                              <td style={{ padding: '8px 12px' }}>
                                <span style={SEVERITY_STYLE[severity]}>{severity.toUpperCase()}</span>
                              </td>

                              <td style={{ padding: '8px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: T.textPrimary, fontSize: 12, fontWeight: 600 }}>{name}</span>
                                  {hasVid && <span style={{ color: T.pink, fontSize: 11 }}>▶</span>}
                                </div>
                              </td>

                              <td style={{ padding: '8px 12px', color: T.textSecondary, fontSize: 12 }}>{alert.deviceName || '—'}</td>

                              <td style={{ padding: '8px 12px', color: T.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{alert.imei || '—'}</td>

                              <td style={{ padding: '8px 12px' }}>
                                <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: 'monospace' }}>
                                  {alert.alertTime ? new Date(alert.alertTime).toLocaleString() : '—'}
                                </div>
                                {alert.alertTime && (
                                  <div style={{ color: T.textMuted, fontSize: 10 }}>{formatTimeAgo(alert.alertTime)}</div>
                                )}
                              </td>

                              <td style={{ padding: '8px 12px', color: T.textMuted, fontSize: 11, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {alert.location || alert.locationAddress || '—'}
                              </td>

                              <td style={{ padding: '8px 12px' }}>
                                <button onClick={() => setSelectedAlert(alert)}
                                  style={{ background: '#f0f0ff', border: 'none', color: T.purple, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination — mirrors Lovable */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
              <span style={{ color: T.textMuted, fontSize: 11, fontFamily: 'monospace' }}>
                Page {page} of {totalPages} · {total} total alerts
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ background: '#fff', border: `1px solid ${T.border}`, color: page <= 1 ? T.textMuted : T.textPrimary, borderRadius: 6, padding: '5px 14px', cursor: page <= 1 ? 'default' : 'pointer', fontSize: 12, opacity: page <= 1 ? 0.5 : 1 }}>
                  ‹ Previous
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  style={{ background: '#fff', border: `1px solid ${T.border}`, color: page >= totalPages ? T.textMuted : T.textPrimary, borderRadius: 6, padding: '5px 14px', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: 12, opacity: page >= totalPages ? 0.5 : 1 }}>
                  Next ›
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'video' && <MediaGalleryTab alerts={filteredAlerts} />}
        {activeTab === 'images' && <ImageGalleryTab alerts={filteredAlerts} />}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}

      {/* API status banner */}
      <div style={{ background: usingMock ? '#fffbea' : '#e8f5e9', borderTop: `1px solid ${usingMock ? '#ffe58f' : '#c8e6c9'}`, padding: '5px 20px', fontSize: 11, color: usingMock ? '#856404' : '#2e7d32' }}>
        {usingMock
          ? '⚠️ Sample data — could not reach iot.ravity.io /v3/alerts/page'
          : `✅ Live from iot.ravity.io · ${total} alerts · GET /v3/alerts/page`}
      </div>
    </div>
  );
};

export default MediaAndVideo;

// ─── Mock alerts (fallback when API unreachable) ──────────────────────────────
const MOCK_ALERTS: IotAlert[] = [
  {
    id: 1001, imei: '860112070431939', deviceName: 'JC181-31939',
    alertName: 'Hard Braking', alarmType: 'HardBraking', triggerType: 'automatic',
    alertTime: Date.now() - 300_000, location: '25.2048,55.2708', status: 1,
    createdAt: Date.now() - 300_000, updatedAt: Date.now() - 300_000,
    attachment: [
      { id: 1, imei: '860112070431939', channel: 1, mediaType: 1, fileName: 'hard_brake.mp4', fileSize: 5_242_880, storagePath: '/media/sample/hard_brake.mp4', captureTime: Date.now() - 300_000, duration: 30, createdAt: Date.now() - 300_000, updatedAt: Date.now() - 300_000, calc: 0, storageChannel: 1 },
    ],
  },
  {
    id: 1002, imei: '860112070422841', deviceName: 'JC400-22841',
    alertName: 'SOS Alert', triggerType: 'manual',
    alertTime: Date.now() - 600_000, location: '25.1972,55.2744', status: 1,
    createdAt: Date.now() - 600_000, updatedAt: Date.now() - 600_000,
    attachment: [
      { id: 2, imei: '860112070422841', channel: 1, mediaType: 0, fileName: 'sos_image.jpg', fileSize: 524_288, storagePath: '/media/sample/sos_image.jpg', captureTime: Date.now() - 600_000, duration: 0, createdAt: Date.now() - 600_000, updatedAt: Date.now() - 600_000, calc: 0, storageChannel: 1 },
    ],
  },
  {
    id: 1003, imei: '860112070455710', deviceName: 'JC181-55710',
    alertName: 'Speed Warning', alarmType: 'Overspeed', triggerType: 'automatic',
    alertTime: Date.now() - 1_800_000, location: '25.2074,55.2633', status: 1,
    createdAt: Date.now() - 1_800_000, updatedAt: Date.now() - 1_800_000,
    attachment: [],
  },
  {
    id: 1004, imei: '860112070466123', deviceName: 'JC400-66123',
    alertName: 'Fatigue Driving', triggerType: 'automatic',
    alertTime: Date.now() - 3_600_000, location: '25.2160,55.2796', status: 0,
    createdAt: Date.now() - 3_600_000, updatedAt: Date.now() - 3_600_000,
    attachment: [
      { id: 3, imei: '860112070466123', channel: 1, mediaType: 1, fileName: 'fatigue.mp4', fileSize: 10_485_760, storagePath: '/media/sample/fatigue.mp4', captureTime: Date.now() - 3_600_000, duration: 60, createdAt: Date.now() - 3_600_000, updatedAt: Date.now() - 3_600_000, calc: 0, storageChannel: 1 },
      { id: 4, imei: '860112070466123', channel: 2, mediaType: 0, fileName: 'fatigue_cabin.jpg', fileSize: 1_048_576, storagePath: '/media/sample/fatigue_cabin.jpg', captureTime: Date.now() - 3_600_000, duration: 0, createdAt: Date.now() - 3_600_000, updatedAt: Date.now() - 3_600_000, calc: 0, storageChannel: 2 },
    ],
  },
];
