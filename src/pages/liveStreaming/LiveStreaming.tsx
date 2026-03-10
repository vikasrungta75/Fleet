import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import {
  fetchDevices,
  fetchChannelCount,
  startLiveVideo,
  stopLiveVideo,
  resolveStreamUrls,
  isDashcam,
  type IotDevice,
} from '../../services/dashcamService';

// Channel label defaults (matches JC-series dashcam physical channels)
const CHANNEL_LABELS = ['Front Camera', 'Cabin Camera', 'Left Camera', 'Right Camera', 'Rear Camera', 'External Cam'];

export const capturedMediaStore: Array<{
  id: string; imei: string; channel: number; channelLabel: string;
  dataUrl: string; timestamp: string; type: 'capture';
}> = [];

// ── Theme ──────────────────────────────────────────────────────────────────────
const T = {
  bg: '#f8f9fa', card: '#ffffff', border: '#e8e8e8',
  textPrimary: '#1a1a2e', textSecondary: '#555', textMuted: '#888',
  pink: '#f00d69', green: '#2da44e', red: '#d0021b', blue: '#1565c0', blueBg: '#e3f2fd',
};

const MAX_RETRIES = 5;
const RETRY_DELAYS = [2000, 4000, 6000, 8000, 12000];

// ── Exported shared types ─────────────────────────────────────────────────────
export interface StreamChannel {
  ch: number;
  label: string;
  flvUrl: string;
  hlsUrl: string;
  rtmpUrl: string;
  active: boolean;
}

export interface DeviceWithChannels extends IotDevice {
  _channels: StreamChannel[];
}

type StreamStatus = 'idle' | 'connecting' | 'retrying' | 'streaming' | 'error' | 'stopped';

// ── StreamPlayer ──────────────────────────────────────────────────────────────
interface StreamPlayerProps {
  flvUrl: string;
  hlsUrl?: string;
  muted: boolean;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
  autoStart?: boolean;
}

async function safePlay(video: HTMLVideoElement): Promise<void> {
  try {
    await video.play();
  } catch (e: any) {
    if (e.name === 'AbortError') {
      await new Promise(r => setTimeout(r, 300));
      try { await video.play(); } catch { /* handled by caller */ }
    } else {
      throw e;
    }
  }
}

const StreamPlayer: FC<StreamPlayerProps> = ({ flvUrl, hlsUrl, muted, style, videoRef: extRef }) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const vidRef = extRef || internalRef;
  const playerRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const cleanupPlayer = useCallback(() => {
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.loadSource === 'function') {
          playerRef.current.destroy();
        } else {
          playerRef.current.pause?.();
          playerRef.current.unload?.();
          playerRef.current.detachMediaElement?.();
          playerRef.current.destroy?.();
        }
      } catch { /* ignore */ }
      playerRef.current = null;
    }
    const vid = vidRef.current;
    if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
  }, [vidRef]);

  const loadFLV = useCallback(async (url: string): Promise<boolean> => {
    const vid = vidRef.current;
    if (!vid) return false;
    try {
      // Load mpegts.js via dynamic import (preferred) or CDN fallback
      let mpegts: any;
      try {
        mpegts = await import('mpegts.js');
        mpegts = mpegts.default ?? mpegts;
      } catch {
        // CDN fallback if not bundled
        if (typeof (window as any).mpegts === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('mpegts.js CDN load failed'));
            document.head.appendChild(s);
          });
        }
        mpegts = (window as any).mpegts;
      }

      if (!mpegts?.isSupported()) { console.warn('[FLV] mpegts not supported'); return false; }

      const player = mpegts.createPlayer(
        { type: 'flv', url, isLive: true },
        {
          enableWorker: true,
          liveBufferLatencyChasing: true,
          liveBufferLatencyMaxLatency: 8,
          liveBufferLatencyMinRemain: 0.5,
          lazyLoad: false,
          autoCleanupSourceBuffer: true,
          autoCleanupMaxBackwardDuration: 10,
          autoCleanupMinBackwardDuration: 5,
        }
      );
      playerRef.current = player;
      player.attachMediaElement(vid);
      player.load();

      // Wait for MEDIA_INFO OR a fatal error — whichever comes first
      const result = await new Promise<boolean>(resolve => {
        let done = false;
        player.on(mpegts.Events.MEDIA_INFO, () => {
          if (!done) { done = true; console.log('[FLV] MEDIA_INFO received'); resolve(true); }
        });
        player.on(mpegts.Events.ERROR, (errType: string, errDetail: string, errInfo: any) => {
          if (!done) {
            done = true;
            console.error('[FLV] Player error:', errType, errDetail, errInfo);
            resolve(false);
          }
        });
        // Fallback: try play after 6s regardless
        setTimeout(() => {
          if (!done) { done = true; console.warn('[FLV] No MEDIA_INFO after 6s — attempting play anyway'); resolve(true); }
        }, 6000);
      });

      if (!result) return false;
      if (vid && !abortRef.current) { vid.muted = muted; await safePlay(vid); }
      return true;
    } catch (e: any) {
      if (e.name === 'AbortError') return true;
      console.error('[FLV] Exception:', e);
      return false;
    }
  }, [vidRef, muted]);

  const loadHLS = useCallback(async (url: string): Promise<boolean> => {
    const vid = vidRef.current;
    if (!vid) return false;
    try {
      let Hls: any;
      try {
        const mod = await import('hls.js');
        Hls = mod.default ?? mod;
      } catch {
        if (typeof (window as any).Hls === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('hls.js CDN load failed'));
            document.head.appendChild(s);
          });
        }
        Hls = (window as any).Hls;
      }

      if (Hls.isSupported()) {
        return await new Promise<boolean>(resolve => {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 3000,
            levelLoadingMaxRetry: 5,
            fragLoadingMaxRetry: 5,
            maxBufferLength: 10,
            liveSyncDurationCount: 3,
          });
          playerRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(vid!);
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            if (vid) { vid.muted = muted; await safePlay(vid); }
            resolve(true);
          });
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { hls.startLoad(); return; }
              hls.destroy(); playerRef.current = null; resolve(false);
            }
          });
          setTimeout(() => {
            if (playerRef.current === hls) { hls.destroy(); playerRef.current = null; resolve(false); }
          }, 20000);
        });
      } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
        vid.src = url; vid.muted = muted; await safePlay(vid); return true;
      }
      return false;
    } catch (e: any) {
      if (e.name === 'AbortError') return true;
      return false;
    }
  }, [vidRef, muted]);

  const attemptPlay = useCallback(async (fUrl: string, hUrl: string): Promise<void> => {
    if (abortRef.current) return;
    cleanupPlayer();
    const isRetry = retryCountRef.current > 0;
    setStatus(isRetry ? 'retrying' : 'connecting');
    setStatusMsg(isRetry ? `Retrying… (${retryCountRef.current}/${MAX_RETRIES})` : 'Connecting to stream…');

    if (!fUrl && !hUrl) { setStatus('error'); setStatusMsg('No stream URL returned by device'); return; }

    console.log(`[Stream] attemptPlay FLV: ${fUrl}`);
    console.log(`[Stream] attemptPlay HLS: ${hUrl}`);

    // Brief pause to let the stream server begin buffering data before the player connects.
    // 1s is enough for most JC-series dashcams; the retry logic handles slow devices.
    await new Promise(r => setTimeout(r, 1000));
    if (abortRef.current) return;

    let started = false;
    if (fUrl) {
      console.log('[Stream] Trying FLV…');
      started = await loadFLV(fUrl);
      console.log('[Stream] FLV result:', started);
    }
    if (!started && hUrl && !abortRef.current) {
      console.log('[Stream] FLV failed, trying HLS…');
      cleanupPlayer();
      await new Promise(r => setTimeout(r, 2000));
      started = await loadHLS(hUrl);
      console.log('[Stream] HLS result:', started);
    }

    if (abortRef.current) return;

    if (started) {
      setStatus('streaming');
      setStatusMsg('');
      retryCountRef.current = 0;
    } else if (retryCountRef.current < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCountRef.current] || 12000;
      retryCountRef.current++;
      setStatus('retrying');
      setStatusMsg(`Both FLV and HLS failed. Retrying in ${delay / 1000}s… (${retryCountRef.current}/${MAX_RETRIES})`);
      retryTimerRef.current = setTimeout(() => {
        if (!abortRef.current) attemptPlay(fUrl, hUrl);
      }, delay);
    } else {
      setStatus('error');
      setStatusMsg('Stream failed after all retries. Check browser console for details.');
    }
  }, [cleanupPlayer, loadFLV, loadHLS]);

  useEffect(() => {
    if (!flvUrl && !hlsUrl) { setStatus('error'); setStatusMsg('No stream URL'); return; }
    abortRef.current = false;
    retryCountRef.current = 0;
    attemptPlay(flvUrl, hlsUrl || '');
    return () => {
      abortRef.current = true;
      cleanupPlayer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flvUrl, hlsUrl]);

  useEffect(() => {
    if (vidRef.current) vidRef.current.muted = muted;
  }, [muted, vidRef]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', ...style }}>
      {(status === 'error') && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
          <span style={{ fontSize: 32 }}>📡</span>
          <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Stream Error</span>
          <span style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '0 16px', maxWidth: 260 }}>{statusMsg}</span>
        </div>
      )}
      {(status === 'connecting' || status === 'retrying') && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
          <span style={{ fontSize: 32 }}>⏳</span>
          <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>{status === 'retrying' ? 'Device busy…' : 'Connecting…'}</span>
          <span style={{ fontSize: 11, color: '#aaa', textAlign: 'center', padding: '0 16px', maxWidth: 260 }}>{statusMsg}</span>
        </div>
      )}
      {status === 'idle' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
          <span style={{ fontSize: 32 }}>📷</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>Initialising…</span>
        </div>
      )}
      <video
        ref={vidRef}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', opacity: status === 'streaming' ? 1 : 0, transition: 'opacity 0.4s' }}
      />
    </div>
  );
};

// ── VideoPanel (multi-view cell) ───────────────────────────────────────────────
const VideoPanel: FC<{ device: DeviceWithChannels; channelIdx: number; onCapture: (url: string, ch: StreamChannel) => void }> = ({ device, channelIdx, onCapture }) => {
  const ch = device._channels[channelIdx];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flash, setFlash] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(id); }, []);

  const capture = () => {
    const vid = videoRef.current; if (!vid) return;
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth || 1280; canvas.height = vid.videoHeight || 720;
    canvas.getContext('2d')?.drawImage(vid, 0, 0);
    const url = canvas.toDataURL('image/png');
    onCapture(url, ch);
    setFlash(true); setTimeout(() => setFlash(false), 250);
    const a = document.createElement('a'); a.href = url;
    a.download = `capture_${device.imei}_ch${ch.ch}_${Date.now()}.png`; a.click();
  };

  return (
    <div style={{ position: 'relative', background: '#000', borderRadius: 4, overflow: 'hidden', border: '1px solid #222' }}>
      {flash && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', zIndex: 20, pointerEvents: 'none' }} />}
      <div style={{ width: '100%', height: '100%', minHeight: 110 }}>
        <StreamPlayer flvUrl={ch.flvUrl} hlsUrl={ch.hlsUrl} muted={muted} videoRef={videoRef} />
      </div>
      <div style={{ position: 'absolute', top: 4, left: 6, display: 'flex', gap: 4, zIndex: 5 }}>
        <span style={{ background: T.pink, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 3, padding: '1px 4px' }}>● LIVE</span>
        <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 8, fontWeight: 700, borderRadius: 3, padding: '1px 4px' }}>CH {ch?.ch}</span>
      </div>
      <div style={{ position: 'absolute', top: 4, right: 6, color: 'rgba(255,255,255,0.5)', fontSize: 8, fontFamily: 'monospace', zIndex: 5 }}>{liveTime.toTimeString().slice(0, 8)}</div>
      <div style={{ position: 'absolute', bottom: 4, left: 6, color: 'rgba(255,255,255,0.7)', fontSize: 9, zIndex: 5 }}>{ch?.label}</div>
      <div style={{ position: 'absolute', bottom: 3, right: 3, display: 'flex', gap: 2, zIndex: 5 }}>
        <button onClick={() => setMuted(m => !m)}
          style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 2, padding: '1px 5px', cursor: 'pointer', fontSize: 10 }}>{muted ? '🔇' : '🔊'}</button>
        <button onClick={capture}
          style={{ background: 'rgba(240,13,105,0.85)', border: 'none', color: '#fff', borderRadius: 2, padding: '1px 5px', cursor: 'pointer', fontSize: 10 }}>📸</button>
      </div>
    </div>
  );
};

// ── Share Popup ────────────────────────────────────────────────────────────────
const SharePopup: FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, maxWidth: '92vw', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🔗 Share Stream Link</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={url} style={{ flex: 1, background: '#f8f9ff', border: `1px solid ${T.border}`, borderRadius: 6, color: T.blue, padding: '8px 10px', fontSize: 11, fontFamily: 'monospace' }} />
          <button onClick={() => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: copied ? T.green : T.pink, border: 'none', color: '#fff', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── LiveStreamModal ────────────────────────────────────────────────────────────
export const LiveStreamModal: FC<{ device: DeviceWithChannels; onClose: () => void }> = ({ device, onClose }) => {
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [capturedThumbs, setCapturedThumbs] = useState<string[]>([]);
  const [muted, setMuted] = useState(true);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { clearInterval(id); window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const handleCapture = () => {
    const vid = videoRef.current; if (!vid) return;
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth || 1280; canvas.height = vid.videoHeight || 720;
    canvas.getContext('2d')?.drawImage(vid, 0, 0);
    const url = canvas.toDataURL('image/png');
    setCapturedThumbs(t => [url, ...t].slice(0, 5));
    setFlash(true); setTimeout(() => setFlash(false), 250);
    const ch = device._channels[activeChannelIdx];
    capturedMediaStore.unshift({
      id: `cap_${Date.now()}`, imei: device.imei,
      channel: ch.ch, channelLabel: ch.label,
      dataUrl: url, timestamp: new Date().toISOString(), type: 'capture',
    });
    const a = document.createElement('a'); a.href = url;
    a.download = `capture_${device.imei}_ch${ch.ch}_${Date.now()}.png`; a.click();
  };

  const ch = device._channels[activeChannelIdx] || device._channels[0];
  const shareUrl = ch?.flvUrl || ch?.hlsUrl || `stream://${device.imei}/ch${(activeChannelIdx + 1)}`;
  const isOnline = device.onlineStatus === 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {showShare && <SharePopup url={shareUrl} onClose={() => setShowShare(false)} />}
      <div style={{ background: '#fff', borderRadius: 12, width: 960, maxWidth: '97vw', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>

        {/* HEADER */}
        <div style={{ background: '#f8f9fa', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
          <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>Live Monitor</span>
          {isOnline
            ? <span style={{ background: 'rgba(240,13,105,0.1)', color: T.pink, fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px', border: `1px solid rgba(240,13,105,0.3)` }}>● LIVE</span>
            : <span style={{ background: '#fff0f0', color: T.red, fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px', border: '1px solid #ffcdd2' }}>OFFLINE</span>
          }

          <select value={activeChannelIdx} onChange={e => { setActiveChannelIdx(Number(e.target.value)); setViewMode('single'); }}
            style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.blue, borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', marginLeft: 4 }}>
            {device._channels.map((c, i) => (
              <option key={i} value={i}>CH {c.ch} — {c.label}</option>
            ))}
          </select>

          {device._channels.length > 1 && (
            <button onClick={() => setViewMode(v => v === 'multi' ? 'single' : 'multi')}
              style={{ background: viewMode === 'multi' ? T.pink : '#fff', color: viewMode === 'multi' ? '#fff' : T.textSecondary, border: `1px solid ${viewMode === 'multi' ? T.pink : T.border}`, borderRadius: 5, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              ⊞ Multi-View ({device._channels.length} cams)
            </button>
          )}

          <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 'auto' }}>{liveTime.toLocaleString()}</span>
          <span style={{ background: T.blueBg, color: T.blue, fontSize: 10, borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{device.imei}</span>
          <span style={{ color: T.pink, fontWeight: 700, fontSize: 13 }}>{device.deviceName}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* VIDEO AREA */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#000', minHeight: 320 }}>
          {flash && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)', zIndex: 20, pointerEvents: 'none' }} />}

          {viewMode === 'single' ? (
            <div style={{ position: 'relative', height: '55vh' }}>
              <StreamPlayer
                key={`${device.imei}-ch${ch?.ch}`}
                flvUrl={ch?.flvUrl || ''}
                hlsUrl={ch?.hlsUrl}
                muted={muted}
                videoRef={videoRef}
                style={{ height: '55vh' }}
              />
              <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6, zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ background: T.pink, color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 3, padding: '2px 7px' }}>● LIVE</span>
                <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 3, padding: '2px 7px' }}>CH {ch?.ch}</span>
                <span style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)', fontSize: 10, borderRadius: 3, padding: '2px 7px', fontFamily: 'monospace' }}>{liveTime.toTimeString().slice(0, 8)}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 12, color: 'rgba(255,255,255,0.6)', fontSize: 10, zIndex: 10, pointerEvents: 'none' }}>{ch?.label}</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: device._channels.length <= 2 ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: 3, padding: 3, background: '#000', height: '55vh'
            }}>
              {device._channels.map((_, idx) => (
                <VideoPanel
                  key={idx}
                  device={device}
                  channelIdx={idx}
                  onCapture={(url, channel) => {
                    setCapturedThumbs(t => [url, ...t].slice(0, 5));
                    capturedMediaStore.unshift({ id: `cap_${Date.now()}`, imei: device.imei, channel: channel.ch, channelLabel: channel.label, dataUrl: url, timestamp: new Date().toISOString(), type: 'capture' });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ background: '#fff', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {capturedThumbs.map((thumb, i) => (
              <img key={i} src={thumb} alt='capture' style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4, border: `2px solid ${T.pink}` }} />
            ))}
          </div>
          <span style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {device.imei}_ch{ch?.ch ?? 1}_{liveTime.toISOString().slice(0, 10)}
          </span>
          {viewMode === 'single' && (
            <>
              <button onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                style={{ background: '#f5f5f5', border: `1px solid ${T.border}`, color: muted ? T.textMuted : T.blue, borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>
                {muted ? '🔇' : '🔊'}
              </button>
              <button onClick={() => { if (videoRef.current) { if (!document.fullscreenElement) videoRef.current.requestFullscreen?.(); else document.exitFullscreen?.(); } }}
                style={{ background: '#f5f5f5', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>⛶</button>
            </>
          )}
          <button onClick={() => setShowShare(true)}
            style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.textSecondary, borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
            🔗 Share
          </button>
          {viewMode === 'single' && (
            <button onClick={handleCapture}
              style={{ background: T.pink, border: 'none', color: '#fff', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 10px rgba(240,13,105,0.3)' }}>
              📸 Capture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const LiveStreaming: FC = () => {
  const [allDevices, setAllDevices] = useState<IotDevice[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithChannels | null>(null);
  const [viewFilter, setViewFilter] = useState<'All' | 'Online' | 'Offline'>('All');
  const [search, setSearch] = useState('');
  const [showAllDevices, setShowAllDevices] = useState(true);
  const [startingStream, setStartingStream] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState('');

  const loadDevices = useCallback(async () => {
    try {
      const res = await fetchDevices(1, 100);
      setAllDevices(res.data);
      setApiError(null);
    } catch (err: any) {
      const msg = err?.response
        ? `HTTP ${err.response.status} — ${JSON.stringify(err.response.data).slice(0, 120)}`
        : err?.message || 'Network error';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 30_000);
    return () => clearInterval(interval);
  }, [loadDevices]);

  const devices = showAllDevices ? allDevices : allDevices.filter(isDashcam);
  const onlineCount = devices.filter(d => d.onlineStatus === 1).length;

  const filtered = devices.filter(d => {
    const name = d.deviceName || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (d.imei || '').includes(search) ||
      (d.model || '').toLowerCase().includes(search.toLowerCase());
    const isOnline = d.onlineStatus === 1;
    return matchSearch && (
      viewFilter === 'All' ||
      (viewFilter === 'Online' && isOnline) ||
      (viewFilter === 'Offline' && !isOnline)
    );
  });

  const handleSelectDevice = async (device: IotDevice) => {
    if (device.onlineStatus !== 1) {
      setSelectedDevice({
        ...device,
        _channels: [{ ch: 1, label: 'Front Camera', flvUrl: '', hlsUrl: '', rtmpUrl: '', active: false }],
      });
      return;
    }

    setStartingStream(device.imei);

    try {
      // Step 1: Stop any existing stream — avoids "device busy" errors.
      // Channel 0 is not a valid channel; stop channels 1 and 2 explicitly.
      setStreamProgress('Stopping previous stream…');
      try { await stopLiveVideo(device.imei, 1); } catch { /* ignore */ }
      try { await stopLiveVideo(device.imei, 2); } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, 1000));

      // Step 2: Get real channel count
      let channelCount = 1;
      setStreamProgress('Detecting cameras…');
      try {
        const countResult = await fetchChannelCount(device.imei);
        channelCount = countResult?.channelCount || 1;
      } catch {
        channelCount = 2; // probe both channels as fallback
      }

      // Step 3: Start streams for all channels
      setStreamProgress(`Starting ${channelCount} camera${channelCount > 1 ? 's' : ''}…`);
      const channelPromises = Array.from({ length: channelCount }, async (_, i) => {
        const ch = i + 1;
        try {
          const session = await startLiveVideo(device.imei, ch, 'audio_video', 'main_stream');

          // ─── KEY FIX ───────────────────────────────────────────────────────
          // Use resolveStreamUrls() which prefers streamingSslUrls (HTTPS, public)
          // over streamingUrls (HTTP internal IPs that are unreachable from browser)
          const { flvUrl, hlsUrl, rtmpUrl } = resolveStreamUrls(session);
          // ──────────────────────────────────────────────────────────────────

          console.log(`[LiveStream] CH${ch} → FLV: ${flvUrl} | HLS: ${hlsUrl}`);

          return {
            ch,
            label: CHANNEL_LABELS[i] || `Camera ${ch}`,
            flvUrl,
            hlsUrl,
            rtmpUrl,
            active: true,
          };
        } catch (err) {
          console.error(`[LiveStream] CH${ch} startLiveVideo error:`, err);
          return { ch, label: CHANNEL_LABELS[i] || `Camera ${ch}`, flvUrl: '', hlsUrl: '', rtmpUrl: '', active: true };
        }
      });

      const channels = await Promise.all(channelPromises);

      const hasAnyActive = channels.some(c => c.active);
      if (!hasAnyActive && channels.length > 0) {
        channels[0].active = true;
      }

      setSelectedDevice({ ...device, _channels: channels });

    } catch (err: any) {
      setSelectedDevice({
        ...device,
        _channels: [{ ch: 1, label: 'Front Camera', flvUrl: '', hlsUrl: '', rtmpUrl: '', active: false }],
      });
    } finally {
      setStartingStream(null);
      setStreamProgress('');
    }
  };

  const bannerBg    = apiError ? '#fff0f0' : '#e8f5e9';
  const bannerBdr   = apiError ? '#ffb3b3' : '#c8e6c9';
  const bannerColor = apiError ? '#c00'    : '#2e7d32';
  const bannerText  = apiError
    ? `❌ API error: ${apiError}`
    : `✅ Live from iot.ravity.io · ${allDevices.length} devices · ${allDevices.filter(isDashcam).length} dashcams`;

  return (
    <PageWrapper isProtected title='Live Monitor'>
      <Page className='mw-100 px-0 h-100'>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, minHeight: 'calc(100vh - 60px)' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 16 }}>Live Monitor</span>
              {loading
                ? <span style={{ color: T.textMuted, fontSize: 12 }}>Loading…</span>
                : <span style={{ color: T.textMuted, fontSize: 12 }}>{onlineCount} / {devices.length} online</span>
              }
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['All', 'Online', 'Offline'] as const).map(f => (
                <button key={f} onClick={() => setViewFilter(f)}
                  style={{ background: viewFilter === f ? T.pink : '#fff', color: viewFilter === f ? '#fff' : T.textSecondary, border: `1px solid ${viewFilter === f ? T.pink : T.border}`, borderRadius: 6, padding: '5px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Sidebar */}
            <div style={{ width: 280, borderRight: `1px solid ${T.border}`, background: T.card, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: 14, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12, letterSpacing: 0.8 }}>DASHCAMS</span>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{onlineCount}/{devices.length}</span>
                </div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 12 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search name, IMEI, model…'
                    style={{ width: '100%', background: '#f8f9fa', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, padding: '7px 10px 7px 28px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: T.textSecondary, fontSize: 11 }}>Show all devices</span>
                  <div onClick={() => setShowAllDevices(s => !s)}
                    style={{ width: 34, height: 18, background: showAllDevices ? T.pink : '#ddd', borderRadius: 9, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: showAllDevices ? 16 : 2, width: 14, height: 14, background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading && <div style={{ padding: 20, color: T.textMuted, fontSize: 12, textAlign: 'center' }}>Loading devices…</div>}
                {!loading && apiError && (
                  <div style={{ padding: 20, textAlign: 'center' }}>
                    <p style={{ color: T.red, fontSize: 12, margin: '0 0 8px' }}>⚠️ Could not load devices</p>
                    <p style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace', margin: '0 0 10px', wordBreak: 'break-all' }}>{apiError}</p>
                    <button onClick={loadDevices} style={{ background: T.pink, border: 'none', color: '#fff', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Retry</button>
                  </div>
                )}
                {!loading && !apiError && filtered.length === 0 && (
                  <div style={{ padding: 20, color: T.textMuted, fontSize: 12, textAlign: 'center' }}>
                    {allDevices.length === 0 ? 'No devices registered' : 'No devices match filter'}
                  </div>
                )}
                {filtered.map((device) => {
                  const isOnline = device.onlineStatus === 1;
                  const isSelected = selectedDevice?.imei === device.imei;
                  const isStarting = startingStream === device.imei;
                  return (
                    <div key={device.imei} onClick={() => !isStarting && handleSelectDevice(device)}
                      style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`, cursor: isStarting ? 'wait' : 'pointer', background: isSelected ? '#fff0f5' : 'transparent', borderLeft: isSelected ? `3px solid ${T.pink}` : '3px solid transparent' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bg; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: isOnline ? '#fff0f5' : '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: `1px solid ${isOnline ? '#ffcdd2' : T.border}` }}>
                          {isStarting ? '⏳' : '📷'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                            <span style={{ color: T.textPrimary, fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.deviceName}</span>
                            <span style={{ background: T.blueBg, color: T.blue, fontSize: 9, borderRadius: 3, padding: '1px 5px', fontWeight: 700, flexShrink: 0 }}>
                              {isDashcam(device) ? 'Dashcam' : device.deviceType || 'Device'}
                            </span>
                          </div>
                          <div style={{ color: T.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{device.imei}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? T.green : T.red, display: 'inline-block' }} />
                            <span style={{ color: isOnline ? T.green : T.red, fontSize: 10 }}>{isOnline ? 'Online' : 'Offline'}</span>
                            {isStarting && <span style={{ color: T.textMuted, fontSize: 10 }}>· {streamProgress}</span>}
                            {!isStarting && <span style={{ color: T.textMuted, fontSize: 10 }}>· {device.model}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main content — empty state */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.textMuted, background: T.bg }}>
              <div style={{ textAlign: 'center', gap: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 72, height: 72, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>📡</div>
                <p style={{ margin: 0, fontSize: 17, color: T.textSecondary, fontWeight: 600 }}>No Device Selected</p>
                <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Select a dashcam from the sidebar to start live streaming</p>
                <p style={{ margin: 0, fontSize: 11, color: T.textMuted, fontFamily: 'monospace' }}>Streams via FLV · {allDevices.length} devices loaded</p>
              </div>
            </div>
          </div>

          {/* Status banner */}
          <div style={{ background: bannerBg, borderTop: `1px solid ${bannerBdr}`, padding: '5px 16px', fontSize: 11, color: bannerColor }}>
            {bannerText}
          </div>
        </div>

        {selectedDevice && <LiveStreamModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />}
      </Page>
    </PageWrapper>
  );
};

export default LiveStreaming;
