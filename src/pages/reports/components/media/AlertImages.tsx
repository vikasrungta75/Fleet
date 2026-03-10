import React, { FC, useState } from 'react';

const ALERT_TYPES = ['All Alert Types', 'Overspeed', 'Harsh Brake', 'Harsh Acceleration', 'Fatigue Detection', 'Phone Use', 'Lane Departure', 'Collision Warning'];
const VEHICLES = ['All Vehicles', '11329-D-8', '12027-T-1', '15442-E-1', '16625-E-1'];

const ALERT_COLORS: Record<string, string> = {
  'Overspeed': '#f00d69', 'Harsh Brake': '#ff6b35', 'Harsh Acceleration': '#ff9500',
  'Fatigue Detection': '#9b59b6', 'Phone Use': '#e74c3c', 'Lane Departure': '#3498db',
  'Collision Warning': '#e74c3c',
};

const MOCK_IMAGES = [
  { id: '1', vin: '11329-D-8', channel: 1, recorded_at: '2026-02-13T13:50:40', file_size_kb: 147.5, file_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alert_type: 'Overspeed', imei: '860112070431939', gps: 'N 12.903772 E 77.650208', speed: '78 km/h' },
  { id: '2', vin: '11329-D-8', channel: 2, recorded_at: '2026-02-13T13:51:15', file_size_kb: 132.2, file_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', alert_type: 'Harsh Brake', imei: '860112070431939', gps: 'N 12.904100 E 77.651020', speed: '0 km/h' },
  { id: '3', vin: '15442-E-1', channel: 1, recorded_at: '2026-02-12T14:04:12', file_size_kb: 155.0, file_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', alert_type: 'Harsh Acceleration', imei: '860112070455710', gps: 'N 12.901500 E 77.648300', speed: '45 km/h' },
  { id: '4', vin: '15442-E-1', channel: 2, recorded_at: '2026-02-12T14:37:20', file_size_kb: 128.8, file_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', alert_type: 'Fatigue Detection', imei: '860112070455710', gps: 'N 12.899200 E 77.652100', speed: '30 km/h' },
  { id: '5', vin: '16625-E-1', channel: 1, recorded_at: '2026-02-12T14:31:21', file_size_kb: 141.3, file_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', alert_type: 'Phone Use', imei: '860112070466123', gps: 'N 12.905600 E 77.647800', speed: '55 km/h' },
  { id: '6', vin: '12027-T-1', channel: 1, recorded_at: '2026-02-12T15:10:00', file_size_kb: 160.1, file_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', alert_type: 'Lane Departure', imei: '860112070422841', gps: 'N 12.907200 E 77.649400', speed: '62 km/h' },
  { id: '7', vin: '11329-D-8', channel: 1, recorded_at: '2026-02-11T09:22:00', file_size_kb: 119.9, file_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', alert_type: 'Collision Warning', imei: '860112070431939', gps: 'N 12.902800 E 77.651500', speed: '38 km/h' },
  { id: '8', vin: '15442-E-1', channel: 2, recorded_at: '2026-02-11T10:45:00', file_size_kb: 138.7, file_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', alert_type: 'Overspeed', imei: '860112070455710', gps: 'N 12.900100 E 77.650700', speed: '85 km/h' },
];

// Share Popup
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e1e2e', border: '1px solid #333', borderRadius: 10, padding: 28, width: 440, maxWidth: '92vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>🔗 Share Image Link</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input readOnly value={url} style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: 6, color: '#0af', padding: '8px 10px', fontSize: 11, fontFamily: 'monospace' }} />
          <button onClick={handleCopy} style={{ background: copied ? '#2da44e' : '#f00d69', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {['Email', 'WhatsApp', 'Teams'].map(s => (
            <button key={s} onClick={() => alert(`Share via ${s}`)}
              style={{ background: '#222', border: '1px solid #333', color: '#aaa', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>Share via {s}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Image Detail Modal
const ImageModal: FC<{ image: any; onClose: () => void }> = ({ image, onClose }) => {
  const [showShare, setShowShare] = useState(false);
  const handleDownload = () => {
    const a = document.createElement('a'); a.href = image.file_url;
    a.download = `${image.imei}_${image.vin}_ch${image.channel}_${image.recorded_at.replace(/[:.]/g, '')}.jpg`; a.click();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {showShare && <SharePopup url={image.file_url} onClose={() => setShowShare(false)} />}
      <div style={{ background: '#12121f', borderRadius: 10, width: 900, maxWidth: '97vw', overflow: 'hidden', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: '#0d0d1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #222', flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Image Detail</span>
          <span style={{ background: '#1a1a2e', color: '#0af', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>CH {image.channel}</span>
          <span style={{ background: ALERT_COLORS[image.alert_type] || '#555', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>{image.alert_type}</span>
          <span style={{ color: '#555', fontSize: 11 }}>{new Date(image.recorded_at).toLocaleString()}</span>
          <span style={{ color: '#555', fontSize: 11 }}>{image.file_size_kb} KB</span>
          <span style={{ background: '#1a1a2e', color: '#aaa', fontSize: 10, borderRadius: 3, padding: '1px 7px', fontFamily: 'monospace' }}>{image.imei}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
        </div>

        {/* Image */}
        <div style={{ flex: 1, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={image.file_url} alt='alert' style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block' }} />
        </div>

        {/* Footer */}
        <div style={{ background: '#0d0d1a', padding: '10px 16px', borderTop: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#444', fontSize: 10, fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {image.imei}_{image.vin}_ch{image.channel}_{image.recorded_at.slice(0, 10)}.jpg
          </span>
          <span style={{ color: '#555', fontSize: 11 }}>
            📍 <a href={`https://maps.google.com/?q=${image.gps.replace('N ', '').replace(' E ', ',')}`} target='_blank' rel='noreferrer'
              style={{ color: '#0af', textDecoration: 'none' }}>{image.gps}</a>
          </span>
          <span style={{ color: '#555', fontSize: 11 }}>🚗 {image.speed}</span>
          <span style={{ color: '#f00d69', fontWeight: 700, fontSize: 12 }}>{image.vin}</span>
          <button onClick={() => setShowShare(true)} style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>🔗 Share</button>
          <button onClick={handleDownload} style={{ background: '#f00d69', border: 'none', color: '#fff', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>⬇ Download</button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AlertImages: FC = () => {
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [alertFilter, setAlertFilter] = useState('All Alert Types');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const filtered = MOCK_IMAGES.filter(img => {
    const matchVehicle = vehicleFilter === 'All Vehicles' || img.vin === vehicleFilter;
    const matchAlert = alertFilter === 'All Alert Types' || img.alert_type === alertFilter;
    const matchSearch = search === '' || img.vin.toLowerCase().includes(search.toLowerCase()) || img.imei.includes(search) || img.alert_type.toLowerCase().includes(search.toLowerCase());
    return matchVehicle && matchAlert && matchSearch;
  });

  return (
    <div style={{ background: '#0d0d1a', minHeight: '60vh', borderRadius: 8, padding: 20 }}>
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 6, padding: '0 10px' }}>
          <span style={{ color: '#555', fontSize: 13 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search vehicle, IMEI, alert type...'
            style={{ background: 'transparent', border: 'none', color: '#aaa', padding: '8px 6px', fontSize: 13, outline: 'none', width: 220 }} />
        </div>
        <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}
          style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#aaa', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
          {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={alertFilter} onChange={e => setAlertFilter(e.target.value)}
          style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#aaa', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
          {ALERT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto' }}>Alert Images — {filtered.length} / {MOCK_IMAGES.length}</span>
      </div>

      {/* Image Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {filtered.map(img => (
          <div key={img.id} onClick={() => setSelectedImage(img)}
            style={{ background: '#12121f', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '1px solid #1a1a2e', transition: 'transform 0.15s, border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f00d69'; (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a2e'; (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}>
            <div style={{ position: 'relative', height: 130 }}>
              <img src={img.file_url} alt='alert' style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
              <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 4 }}>
                <span style={{ background: ALERT_COLORS[img.alert_type] || '#555', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 3, padding: '1px 5px' }}>ALERT</span>
                <span style={{ background: '#1a1a2e', color: '#0af', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>CH {img.channel}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 4, left: 6, right: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: 'rgba(0,0,0,0.7)', color: '#aaa', fontSize: 8, borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace' }}>{img.gps}</span>
              </div>
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ color: '#ddd', fontWeight: 700, fontSize: 12 }}>{img.vin}</span>
                <span style={{ background: ALERT_COLORS[img.alert_type] || '#555', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 3, padding: '1px 5px' }}>{img.alert_type}</span>
              </div>
              <div style={{ color: '#555', fontSize: 10, fontFamily: 'monospace' }}>{img.imei}</div>
              <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>{new Date(img.recorded_at).toLocaleString()}</div>
              <div style={{ color: '#555', fontSize: 10, marginTop: 1 }}>🚗 {img.speed} · {img.file_size_kb} KB</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#333' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
            <p style={{ color: '#555' }}>No images match the current filters</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: '#1a1200', border: '1px solid #332200', borderRadius: 6, padding: '6px 14px', fontSize: 10, color: '#aa8800', display: 'flex', gap: 6 }}>
        🧪 <strong>Mock mode</strong> — Using sample images. Connect to GET /api/media/images to load real alert images.
      </div>
    </div>
  );
};

export default AlertImages;