/**
 * DashcamTab.tsx  →  src/pages/myFleet/components/Card/DashcamTab.tsx
 *
 * Uses the exact same LiveStreamModal exported from LiveStreaming.tsx
 * so the MyFleet popup is 100% identical to the Live Monitor popup.
 */

import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  fetchDevices,
  fetchChannelCount,
  startLiveVideo,
  stopLiveVideo,
  resolveStreamUrls,
  type IotDevice,
} from '../../../../services/dashcamService';

// ── Import the shared modal, types, and capture store from LiveStreaming ───────
// Importing types from the single source of truth prevents TS2719 ("two different
// types with this name exist but are unrelated").
import {
  LiveStreamModal,
  capturedMediaStore,
  type StreamChannel,
  type DeviceWithChannels,
} from '../../../liveStreaming/LiveStreaming';

// ─── Props ────────────────────────────────────────────────────────────────────
interface DashcamTabProps {
  preselectedImei?: string;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: '#f8f9fa', card: '#ffffff', border: '#e8e8e8',
  textPrimary: '#1a1a2e', textSecondary: '#555', textMuted: '#888',
  pink: '#f00d69', purple: '#6c5dd3',
  green: '#2da44e', red: '#d0021b', blue: '#1565c0', blueBg: '#e3f2fd',
};

const CHANNEL_LABELS = [
  'Front Camera', 'Cabin Camera', 'Left Camera',
  'Right Camera', 'Rear Camera', 'External Cam',
];

// ─── Main DashcamTab ──────────────────────────────────────────────────────────
const DashcamTab: FC<DashcamTabProps> = ({ preselectedImei }) => {
  const [allDevices, setAllDevices] = useState<DeviceWithChannels[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithChannels | null>(null);
  const [startingStream, setStartingStream] = useState<string | null>(null);

  const buildChannels = async (imei: string): Promise<StreamChannel[]> => {
    // Stop any existing stream first to avoid "device busy".
    // Channel 0 is invalid — stop channels 1 and 2 explicitly.
    try { await stopLiveVideo(imei, 1); } catch { /* ignore */ }
    try { await stopLiveVideo(imei, 2); } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 1000));

    let channelCount = 1;
    try {
      const countResult = await fetchChannelCount(imei);
      console.log(`[DashcamTab] channelCount API result:`, countResult);
      channelCount = countResult?.channelCount || 2; // default 2 if API returns 0/null
    } catch (err) {
      console.warn(`[DashcamTab] fetchChannelCount failed, defaulting to 2:`, err);
      channelCount = 2;
    }

    // Rewrite internal HTTP URLs to public HTTPS endpoint
    const results = await Promise.all(
      Array.from({ length: channelCount }, async (_, i) => {
        const ch = i + 1;
        try {
          const session = await startLiveVideo(imei, ch, 'audio_video', 'main_stream');
          // resolveStreamUrls prefers streamingSslUrls (public HTTPS) over
          // streamingUrls (internal HTTP IPs unreachable from the browser).
          const { flvUrl, hlsUrl, rtmpUrl } = resolveStreamUrls(session);
          console.log(`[DashcamTab] CH${ch} → FLV: ${flvUrl} | HLS: ${hlsUrl}`);
          return {
            ch,
            label: CHANNEL_LABELS[i] || `Camera ${ch}`,
            flvUrl, hlsUrl, rtmpUrl,
            active: true,
          };
        } catch (err) {
          console.error(`[DashcamTab] CH${ch} startLiveVideo error:`, err);
          return { ch, label: CHANNEL_LABELS[i] || `Camera ${ch}`, flvUrl: '', hlsUrl: '', rtmpUrl: '', active: true };
        }
      }),
    );
    return results;
  };

  // ── Load device list ─────────────────────────────────────────────────────────
  const loadDevices = useCallback(async () => {
    try {
      const res = await fetchDevices(1, 100);
      const withChannels: DeviceWithChannels[] = res.data.map(d => ({
        ...d,
        _channels: [{ ch: 1, label: 'Front Camera', flvUrl: '', hlsUrl: '', rtmpUrl: '', active: false }],
      }));
      setAllDevices(withChannels);
      setApiError(null);
      return withChannels;
    } catch (err: any) {
      const msg = err?.response
        ? `HTTP ${err.response.status} — ${JSON.stringify(err.response.data).slice(0, 100)}`
        : err?.message || 'Network error';
      setApiError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices().then(devices => {
      // Auto-open if a specific IMEI was pre-selected (e.g. from alert click)
      if (preselectedImei) {
        const match = devices.find(d => d.imei === preselectedImei);
        if (match) handleSelectDevice(match);
      }
    });
    const interval = setInterval(loadDevices, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDevices]);

  // ── Select device → start streaming all channels ─────────────────────────────
  const handleSelectDevice = async (device: DeviceWithChannels) => {
    // Offline devices: open modal showing "offline" state
    if (device.onlineStatus !== 1) {
      setSelectedDevice({
        ...device,
        _channels: [{ ch: 1, label: 'Front Camera', flvUrl: '', hlsUrl: '', rtmpUrl: '', active: false }],
      });
      return;
    }

    setStartingStream(device.imei);
    try {
      const channels = await buildChannels(device.imei);
      setSelectedDevice({ ...device, _channels: channels });
    } catch {
      setSelectedDevice({
        ...device,
        _channels: [{ ch: 1, label: 'Front Camera', flvUrl: '', hlsUrl: '', rtmpUrl: '', active: false }],
      });
    } finally {
      setStartingStream(null);
    }
  };

  const onlineCount = allDevices.filter(d => d.onlineStatus === 1).length;

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: T.textMuted }}>
        <span style={{ fontSize: 13 }}>Loading dashcams…</span>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (apiError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, color: T.textMuted, gap: 8 }}>
        <span style={{ fontSize: 26 }}>⚠️</span>
        <span style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>Could not load dashcams</span>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: T.textMuted, textAlign: 'center', maxWidth: 260, wordBreak: 'break-all' }}>{apiError}</span>
        <button onClick={loadDevices} style={{ marginTop: 8, background: T.pink, border: 'none', color: '#fff', borderRadius: 5, padding: '6px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Retry</button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (allDevices.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: T.textMuted, gap: 8 }}>
        <span style={{ fontSize: 28 }}>📷</span>
        <span style={{ fontSize: 13 }}>No devices found</span>
        <span style={{ fontSize: 11, textAlign: 'center', maxWidth: 220 }}>
          Dashcams appear when devices have deviceType=Dashcam or a model starting with JC
        </span>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* LiveStreamModal is the EXACT same component used in Live Monitor page */}
      {selectedDevice && (
        <LiveStreamModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}

      <div style={{ background: T.bg, borderRadius: 8, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${T.border}`, background: T.card,
        }}>
          <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>
            DASHCAMS
            <span style={{ color: T.textMuted, fontWeight: 400, marginLeft: 8 }}>
              {onlineCount}/{allDevices.length} online
            </span>
          </span>
        </div>

        {/* Device list */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {allDevices.map(device => {
            const isOnline = device.onlineStatus === 1;
            const isSelected = selectedDevice?.imei === device.imei;
            const isStarting = startingStream === device.imei;

            return (
              <div
                key={device.imei}
                onClick={() => handleSelectDevice(device)}
                style={{
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: isStarting ? 'wait' : 'pointer',
                  background: isSelected ? '#fff0f5' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${T.pink}` : '3px solid transparent',
                  borderBottom: `1px solid ${T.border}`,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bg; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>

                <div style={{
                  width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                  background: isOnline ? '#fff0f5' : '#f5f5f5',
                  border: `1px solid ${isOnline ? '#ffcdd2' : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>
                  {isStarting ? '⏳' : '📷'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
                    <span style={{
                      color: T.textPrimary, fontWeight: 600, fontSize: 11,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {device.deviceName}
                    </span>
                    <span style={{
                      background: T.blueBg, color: T.blue, fontSize: 8,
                      borderRadius: 3, padding: '1px 4px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {device.model}
                    </span>
                  </div>
                  <div style={{ color: T.textMuted, fontSize: 9, fontFamily: 'monospace' }}>{device.imei}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOnline ? T.green : T.red, display: 'inline-block' }} />
                    <span style={{ color: isOnline ? T.green : T.red, fontSize: 9, fontWeight: 600 }}>
                      {isStarting ? 'Starting all channels…' : isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {isOnline && !isStarting && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: T.pink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, marginLeft: 2 }}>▶</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status footer */}
        <div style={{ padding: '5px 14px', background: '#e8f5e9', fontSize: 10, color: '#2e7d32' }}>
          ✅ Live · {allDevices.length} device(s) · Captures saved to Media &amp; Video
        </div>
      </div>
    </>
  );
};

export default DashcamTab;
