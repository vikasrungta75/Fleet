import React, { FC, useState, useRef } from 'react';
import {
  fetchDevices,
  fetchChannelCount,
  startLiveVideo,
  stopLiveVideo,
} from '../../services/dashcamService';

// ─── Types ────────────────────────────────────────────────────────────────────
type LogLevel = 'info' | 'ok' | 'err' | 'warn' | 'step';
interface LogEntry { time: string; tag: string; msg: string; level: LogLevel; }
type StepState = 'idle' | 'active' | 'done' | 'fail';

const STEP_IDS = ['stop','start','urls','cors','flv','hls'] as const;

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0d0d14', card: '#13131e', border: '#1e1e30',
  purple: '#6c5dd3', pink: '#f00d69', green: '#00e676',
  red: '#f44336', yellow: '#ffb300', cyan: '#00bcd4',
  text: '#e0e0e0', muted: '#555',
};

const levelColor: Record<LogLevel,string> = {
  info: C.purple, ok: C.green, err: C.red, warn: C.yellow, step: C.cyan,
};

// ─── StreamDiagnostic ─────────────────────────────────────────────────────────
const StreamDiagnostic: FC = () => {
  const [imei, setImei]       = useState('860112070431939');
  const [channel, setChannel] = useState(1);
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [steps, setSteps]     = useState<Record<string,StepState>>({});
  const [running, setRunning] = useState(false);
  const [flvUrl, setFlvUrl]   = useState('');
  const [hlsUrl, setHlsUrl]   = useState('');
  const [rawFlv, setRawFlv]   = useState('');
  const [rawHls, setRawHls]   = useState('');
  const [playerState, setPlayerState] = useState<'idle'|'flv'|'hls'|'error'>('idle');
  const [playerMsg, setPlayerMsg]     = useState('');

  const vidRef    = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const logRef    = useRef<HTMLDivElement>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const addLog = (tag: string, msg: string, level: LogLevel = 'info') => {
    const time = new Date().toTimeString().slice(0,8);
    setLogs(prev => {
      const next = [...prev, { time, tag, msg, level }];
      setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
      return next;
    });
  };

  const setStep = (id: string, state: StepState) =>
    setSteps(prev => ({ ...prev, [id]: state }));

  const rewrite = (url: string) =>
    url ? url.replace(/^https?:\/\/[^/]+/, 'https://iot.ravity.io:8891') : '';

  const stopPlayer = () => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.loadSource === 'function') playerRef.current.destroy();
        else { playerRef.current.pause?.(); playerRef.current.unload?.(); playerRef.current.detachMediaElement?.(); playerRef.current.destroy?.(); }
      } catch { /* ignore */ }
      playerRef.current = null;
    }
    const v = vidRef.current;
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    setPlayerState('idle');
    setPlayerMsg('');
  };

  const loadCDN = (src: string): Promise<void> => new Promise((res, rej) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('CDN load failed: ' + src));
    document.head.appendChild(s);
  });

  // ── FLV player ──────────────────────────────────────────────────────────────
  const playFLV = async (url: string) => {
    stopPlayer();
    setPlayerMsg('Loading mpegts.js from CDN...');
    addLog('FLV', `Attempting: ${url}`, 'step');

    try {
      await loadCDN('https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.js');
    } catch {
      addLog('FLV', 'CDN load failed — check internet connection', 'err');
      setPlayerState('error'); setPlayerMsg('CDN load failed');
      return;
    }

    const mp = (window as any).mpegts;
    if (!mp?.isSupported()) { addLog('FLV', 'mpegts not supported in this browser', 'err'); return; }

    const vid = vidRef.current!;
    const p = mp.createPlayer(
      { type: 'flv', url, isLive: true, cors: true },
      { enableWorker: true, liveBufferLatencyChasing: true, liveBufferLatencyMaxLatency: 8, liveBufferLatencyMinRemain: 0.5, lazyLoad: false }
    );
    playerRef.current = p;
    p.attachMediaElement(vid);
    p.load();
    setPlayerMsg('Waiting for MEDIA_INFO...');

    p.on(mp.Events.MEDIA_INFO, (info: any) => {
      addLog('FLV', `✓ MEDIA_INFO: ${JSON.stringify(info).slice(0,150)}`, 'ok');
      setPlayerState('flv'); setPlayerMsg('');
      vid.muted = true;
      vid.play().catch(e => addLog('FLV', `play() blocked: ${e.message}`, 'warn'));
    });

    p.on(mp.Events.ERROR, (errType: string, errDetail: string, errInfo: any) => {
      addLog('FLV', `ERROR type=${errType} detail=${errDetail} info=${JSON.stringify(errInfo)}`, 'err');
      setPlayerState('error'); setPlayerMsg(`FLV Error: ${errDetail}`);
    });

    p.on(mp.Events.STATISTICS_INFO, (stats: any) => {
      if (stats.speed > 0) setPlayerMsg(`● LIVE  ${stats.speed.toFixed(1)} KB/s`);
    });
  };

  // ── HLS player ──────────────────────────────────────────────────────────────
  const playHLS = async (url: string) => {
    stopPlayer();
    setPlayerMsg('Loading hls.js from CDN...');
    addLog('HLS', `Attempting: ${url}`, 'step');

    try {
      await loadCDN('https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js');
    } catch {
      addLog('HLS', 'CDN load failed', 'err'); return;
    }

    const Hls = (window as any).Hls;
    if (!Hls?.isSupported()) { addLog('HLS', 'hls.js not supported', 'err'); return; }

    const vid = vidRef.current!;
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true, manifestLoadingMaxRetry: 3, manifestLoadingRetryDelay: 2000 });
    playerRef.current = hls;
    hls.loadSource(url);
    hls.attachMedia(vid);
    setPlayerMsg('Fetching HLS manifest...');

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      addLog('HLS', '✓ Manifest parsed — playing', 'ok');
      setPlayerState('hls'); setPlayerMsg('');
      vid.muted = true;
      vid.play().catch(e => addLog('HLS', `play() blocked: ${e.message}`, 'warn'));
    });

    hls.on(Hls.Events.ERROR, (_: any, data: any) => {
      addLog('HLS', `${data.fatal?'FATAL':'non-fatal'} type=${data.type} details=${data.details}`, data.fatal ? 'err' : 'warn');
      if (data.fatal) { setPlayerState('error'); setPlayerMsg(`HLS Error: ${data.details}`); }
    });
  };

  // ── CORS fetch test ──────────────────────────────────────────────────────────
  const testCORS = async (url: string): Promise<boolean> => {
    addLog('CORS', `HEAD ${url}`, 'step');
    try {
      const r = await fetch(url, { method: 'HEAD', mode: 'cors' });
      addLog('CORS', `HTTP ${r.status} — CORS OK`, 'ok');
      return true;
    } catch (e: any) {
      addLog('CORS', `BLOCKED: ${e.message}`, 'err');
      addLog('CORS', 'Stream server at port 8891 does not send CORS headers', 'warn');
      addLog('CORS', 'BUT video element may still play (different CORS rules)', 'warn');
      return false;
    }
  };

  // ── Full diagnostic run ──────────────────────────────────────────────────────
  const runDiagnostic = async () => {
    setRunning(true);
    setLogs([]);
    setSteps({});
    setFlvUrl(''); setHlsUrl(''); setRawFlv(''); setRawHls('');
    stopPlayer();

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    addLog('DIAG', `=== Starting diagnostic ===`, 'step');
    addLog('DIAG', `IMEI: ${imei} | Channel: ${channel}`, 'info');

    // ── 1. Stop existing stream ────────────────────────────────────────────────
    setStep('stop', 'active');
    addLog('STOP', `POST /video/live/stop channel=${channel}`, 'step');
    try {
      await stopLiveVideo(imei, channel);
      addLog('STOP', 'OK', 'ok');
      setStep('stop', 'done');
    } catch (e: any) {
      addLog('STOP', `Error (non-fatal): ${e?.message}`, 'warn');
      setStep('stop', 'done');
    }
    await wait(1500);

    // ── 2. Start stream ────────────────────────────────────────────────────────
    setStep('start', 'active');
    addLog('START', `POST /video/live/start channel=${channel}`, 'step');
    let streamData: any = null;
    try {
      streamData = await startLiveVideo(imei, channel, 'audio_video', 'main_stream');
      addLog('START', `RAW RESPONSE: ${JSON.stringify(streamData)}`, 'info');
      addLog('START', `resultCode=${streamData?.resultCode} resultMsg=${streamData?.resultMsg}`, 'ok');
      setStep('start', 'done');
    } catch (e: any) {
      addLog('START', `FAILED: ${e?.message}`, 'err');
      addLog('START', `Response: ${JSON.stringify((e as any)?.response?.data)}`, 'err');
      setStep('start', 'fail');
      setRunning(false);
      return;
    }

    // ── 3. Extract URLs ────────────────────────────────────────────────────────
    setStep('urls', 'active');
    const sslUrls = streamData?.streamingSslUrls;
    const plainUrls = streamData?.streamingUrls;
    const rf = sslUrls?.flv || plainUrls?.flv || '';
    const rh = sslUrls?.hls || plainUrls?.hls || '';
    const wf = rewrite(rf);
    const wh = rewrite(rh);

    setRawFlv(rf); setRawHls(rh);
    setFlvUrl(wf); setHlsUrl(wh);

    addLog('URLS', `streamingUrls    = ${JSON.stringify(plainUrls)}`, 'info');
    addLog('URLS', `streamingSslUrls = ${JSON.stringify(sslUrls)}`, 'info');
    addLog('URLS', `Raw FLV:       ${rf || '(empty)'}`, rf ? 'ok' : 'err');
    addLog('URLS', `Rewritten FLV: ${wf || '(empty)'}`, wf ? 'ok' : 'err');
    addLog('URLS', `Raw HLS:       ${rh || '(empty)'}`, rh ? 'ok' : 'err');
    addLog('URLS', `Rewritten HLS: ${wh || '(empty)'}`, wh ? 'ok' : 'err');

    if (!rf) {
      addLog('URLS', 'NO URLS RETURNED — device may not support live streaming or is busy', 'err');
      setStep('urls', 'fail');
      setRunning(false);
      return;
    }
    setStep('urls', 'done');

    // ── 4. CORS test ───────────────────────────────────────────────────────────
    setStep('cors', 'active');
    const corsOk = await testCORS(wf);
    setStep('cors', corsOk ? 'done' : 'fail');

    // ── 5. Try FLV ────────────────────────────────────────────────────────────
    setStep('flv', 'active');
    addLog('FLV', `Waiting 3s for stream server to buffer...`, 'info');
    await wait(3000);
    await playFLV(wf);

    // Wait to see if MEDIA_INFO arrives or error fires
    await wait(7000);
    if (playerState === 'error' || playerRef.current === null) {
      setStep('flv', 'fail');
      addLog('FLV', 'FLV failed — trying HLS fallback...', 'warn');

      // ── 6. Try HLS ──────────────────────────────────────────────────────────
      if (wh) {
        setStep('hls', 'active');
        await playHLS(wh);
        await wait(7000);
        setStep('hls', playerState === 'hls' ? 'done' : 'fail');
      } else {
        addLog('HLS', 'No HLS URL available', 'err');
        setStep('hls', 'fail');
      }
    } else {
      setStep('flv', 'done');
      addLog('FLV', '✓ FLV stream playing', 'ok');
    }

    addLog('DIAG', '=== Diagnostic complete — check log above for issues ===', 'step');
    setRunning(false);
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const stepColor = (s: StepState) => ({ idle: C.muted, active: C.cyan, done: C.green, fail: C.red }[s]);
  const stepLabel = (id: string) => ({ stop:'1·Stop', start:'2·Start', urls:'3·URLs', cors:'4·CORS', flv:'5·FLV', hls:'6·HLS' }[id] || id);

  const S: Record<string,React.CSSProperties> = {
    page:    { background: C.bg, minHeight: '100vh', padding: 20, fontFamily: "'Courier New', monospace", color: C.text },
    card:    { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 14 },
    h2:      { fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: C.purple, marginBottom: 12 },
    row:     { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' as const },
    label:   { fontSize: 11, color: C.muted, width: 70, flexShrink: 0 },
    input:   { flex: 1, minWidth: 200, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: '6px 10px', fontFamily: 'monospace', fontSize: 12 },
    btn:     { background: C.purple, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' as const },
    btnSm:   { background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 },
    btnPink: { background: C.pink, color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' },
    log:     { background: '#07070d', border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, height: 300, overflowY: 'auto' as const, fontSize: 11, lineHeight: 1.7 },
    urlBox:  { background: '#07070d', border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 10px', fontSize: 10, color: C.cyan, wordBreak: 'break-all' as const, marginTop: 4 },
  };

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.purple, fontSize: 18, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>🎥 Stream Diagnostic</div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Uses same proxy &amp; auth as the app — paste IMEI and run</div>
      </div>

      {/* Config */}
      <div style={S.card}>
        <div style={S.h2 as React.CSSProperties}>Configuration</div>
        <div style={S.row}>
          <span style={S.label}>IMEI</span>
          <input style={S.input} value={imei} onChange={e => setImei(e.target.value)} />
        </div>
        <div style={S.row}>
          <span style={S.label}>Channel</span>
          <input style={{ ...S.input, maxWidth: 80 }} type="number" value={channel} onChange={e => setChannel(Number(e.target.value))} />
          <button style={{ ...S.btn, opacity: running ? 0.5 : 1 }} onClick={runDiagnostic} disabled={running}>
            {running ? '⏳ Running...' : '▶ Run Full Diagnostic'}
          </button>
          <button style={S.btnSm} onClick={() => setLogs([])}>Clear Log</button>
        </div>
      </div>

      {/* Step progress */}
      <div style={S.card}>
        <div style={S.h2 as React.CSSProperties}>Steps</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STEP_IDS.map(id => {
            const state = steps[id] || 'idle';
            return (
              <div key={id} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${stepColor(state)}30`, background: `${stepColor(state)}10`, color: stepColor(state), fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                {state === 'active' ? '⏳ ' : state === 'done' ? '✓ ' : state === 'fail' ? '✗ ' : '○ '}{stepLabel(id)}
              </div>
            );
          })}
        </div>
      </div>

      {/* URLs */}
      {(rawFlv || rawHls) && (
        <div style={S.card}>
          <div style={S.h2 as React.CSSProperties}>Stream URLs</div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Raw (from API)</div>
          <div style={S.urlBox}>FLV: {rawFlv || '(empty)'}</div>
          <div style={{ ...S.urlBox, marginTop: 4 }}>HLS: {rawHls || '(empty)'}</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 10, marginBottom: 4 }}>Rewritten (iot.ravity.io:8891)</div>
          <div style={{ ...S.urlBox, color: flvUrl ? C.green : C.red }}>FLV: {flvUrl || '(empty)'}</div>
          <div style={{ ...S.urlBox, color: hlsUrl ? C.green : C.red, marginTop: 4 }}>HLS: {hlsUrl || '(empty)'}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button style={S.btnSm} onClick={() => playFLV(flvUrl)} disabled={!flvUrl}>▶ Retry FLV (rewritten)</button>
            <button style={S.btnSm} onClick={() => playFLV(rawFlv)} disabled={!rawFlv}>▶ Try Raw FLV (no rewrite)</button>
            <button style={S.btnSm} onClick={() => playHLS(hlsUrl)} disabled={!hlsUrl}>▶ Retry HLS</button>
            <button style={S.btnPink} onClick={stopPlayer}>■ Stop</button>
          </div>
        </div>
      )}

      {/* Video */}
      <div style={S.card}>
        <div style={S.h2 as React.CSSProperties}>Video Output</div>
        <div style={{ position: 'relative', background: '#000', borderRadius: 6, overflow: 'hidden', minHeight: 200 }}>
          <video ref={vidRef} autoPlay muted playsInline controls style={{ width: '100%', maxHeight: 300, display: 'block' }} />
          {playerState !== 'flv' && playerState !== 'hls' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', color: playerState === 'error' ? C.red : C.muted, fontSize: 12, gap: 6 }}>
              <span style={{ fontSize: 28 }}>{playerState === 'error' ? '⚠️' : '📡'}</span>
              <span>{playerMsg || (playerState === 'error' ? 'Stream error — see log' : 'Run diagnostic to play')}</span>
            </div>
          )}
          {(playerState === 'flv' || playerState === 'hls') && playerMsg && (
            <div style={{ position: 'absolute', top: 6, left: 8, background: C.pink, color: '#fff', fontSize: 9, fontWeight: 'bold', padding: '2px 6px', borderRadius: 3 }}>{playerMsg}</div>
          )}
        </div>
      </div>

      {/* Log */}
      <div style={S.card}>
        <div style={S.h2 as React.CSSProperties}>Diagnostic Log ({logs.length} entries)</div>
        <div style={S.log} ref={logRef}>
          {logs.length === 0 && <div style={{ color: C.muted }}>Run the diagnostic to see output here...</div>}
          {logs.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#333', flexShrink: 0, width: 60 }}>{l.time}</span>
              <span style={{ color: levelColor[l.level], flexShrink: 0, width: 56, fontWeight: 'bold' }}>[{l.tag}]</span>
              <span style={{ flex: 1, wordBreak: 'break-all', color: levelColor[l.level] === C.muted ? C.text : levelColor[l.level] }}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreamDiagnostic;
