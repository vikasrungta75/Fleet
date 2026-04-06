/**
 * SDCardBrowser.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashcam SD Card File Browser
 *
 * Features:
 *  ┌ Sidebar ──────────────────────────────────────────────────────────────────┐
 *  │ • Device picker  – all dashcam IMEIs via fetchDevices + isDashcam filter  │
 *  │ • Wake button    – per-device wakeupDevice() with colour-coded feedback   │
 *  │ • Date range     – From / To with Today / Yesterday / 7-Day quick pills   │
 *  │ • Summary card   – totals + selected count/size (shown after scan)        │
 *  └───────────────────────────────────────────────────────────────────────────┘
 *  ┌ Main panel ───────────────────────────────────────────────────────────────┐
 *  │ • Toolbar        – filename search, channel tabs, Scan SD Card button     │
 *  │ • File table     – grouped by channel, sortable, per-row & bulk select    │
 *  │ • Bulk download  – upload → poll → blob save, full queue with progress    │
 *  │ • Storage gauge  – server quota indicator (top-right, turns red at 80%)   │
 *  └───────────────────────────────────────────────────────────────────────────┘
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import {
  fetchDevices,
  listVideoFiles,
  startRemoteUpload,
  fetchResources,
  fetchStorageUsage,
  wakeupDevice,
  isDashcam,
  resolveMediaUrl,
  type IotDevice,
  type VideoFile,
  type StorageUsage,
} from '../../services/dashcamService';

// ─── Design tokens (matching Ravity pink / white palette) ─────────────────────
const C = {
  bg:       '#f4f5f8',
  card:     '#ffffff',
  border:   '#e8e8ee',
  pink:     '#f00d69',
  pinkLt:   '#fff0f5',
  pinkBdr:  '#ffd0e5',
  pinkDk:   '#c4005a',
  green:    '#12b76a',
  greenBg:  '#ecfdf3',
  red:      '#f04438',
  redBg:    '#fef3f2',
  blue:     '#1570ef',
  blueBg:   '#eff8ff',
  text:     '#101828',
  sub:      '#475467',
  muted:    '#98a2b3',
  sh:       '0 1px 3px rgba(0,0,0,.08)',
  shMd:     '0 4px 14px rgba(0,0,0,.10)',
} as const;

const CH_LABELS = ['CH 1 – Front', 'CH 2 – Cabin', 'CH 3 – Left', 'CH 4 – Right'];
const MAX_CH = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtBytes = (b: number): string => {
  if (!b || b <= 0) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${u[i]}`;
};
const fmtT = (s: string) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
  catch { return s; }
};
const toMs = (d: string, eod = false) => {
  const dt = new Date(d);
  eod ? dt.setHours(23, 59, 59, 999) : dt.setHours(0, 0, 0, 0);
  return dt.getTime();
};
const today     = () => new Date().toISOString().slice(0, 10);
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
const nDaysAgo  = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const sleep     = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Icons ────────────────────────────────────────────────────────────────────
type SVGProp = { sz?: number; c?: string; spin?: boolean };

const IcSd: FC<SVGProp> = ({ sz = 22, c = C.pink }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="13" height="20" rx="2" /><path d="M9 2v6" /><path d="M12 2v4" /><path d="M6 2v8" />
  </svg>
);
const IcDl: FC<SVGProp> = ({ sz = 14, c = '#fff' }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IcWake: FC<SVGProp> = ({ sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);
const IcScan: FC<SVGProp> = ({ sz = 14, spin = false }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={spin ? { animation: 'sdc-spin .9s linear infinite' } : undefined}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
const IcSearch: FC = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcVid: FC<SVGProp> = ({ sz = 13, c = C.pink }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const IcCheckMark: FC = () => (
  <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Spin: FC<SVGProp> = ({ sz = 18, c = C.pink }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'sdc-spin .9s linear infinite', flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ─── Micro components ─────────────────────────────────────────────────────────
const Bar: FC<{ pct: number; c?: string; h?: number }> = ({ pct, c = C.pink, h = 4 }) => (
  <div style={{ width: '100%', height: h, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: c, borderRadius: 99, transition: 'width .35s ease' }} />
  </div>
);

const Tag: FC<{ label: string; c?: string; bg?: string }> = ({ label, c = C.blue, bg = C.blueBg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, color: c, background: bg, borderRadius: 20, padding: '2px 8px', flexShrink: 0, display: 'inline-block' }}>
    {label}
  </span>
);

const Checkbox: FC<{ checked: boolean; onChange: () => void; indeterminate?: boolean }> = ({ checked, onChange, indeterminate }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer', transition: 'all .12s',
        border: `1.5px solid ${checked || indeterminate ? C.pink : C.border}`,
        background: checked ? C.pink : indeterminate ? C.pinkLt : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {checked && <IcCheckMark />}
      {!checked && indeterminate && <div style={{ width: 8, height: 2, background: C.pink, borderRadius: 1 }} />}
    </div>
  );
};

const SecLabel: FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{text}</div>
);

const Card: FC<{ children: React.ReactNode; p?: number }> = ({ children, p = 16 }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: p, boxShadow: C.sh }}>
    {children}
  </div>
);

const PrimaryBtn: FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, style, ...rest }) => (
  <button {...rest} className="sdc-primary-btn" style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', transition: 'background .15s', ...style }}>
    {children}
  </button>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface FileEntry extends VideoFile { key: string; imei: string; }
type DLS = 'queued' | 'uploading' | 'polling' | 'downloading' | 'done' | 'error';
interface DLJob { key: string; fileName: string; status: DLS; pct: number; err?: string; }

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const SDCardBrowser: FC = () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const [devices,     setDevices]     = useState<IotDevice[]>([]);
  const [selImei,     setSelImei]     = useState('');
  const [devLoading,  setDevLoading]  = useState(true);

  const [wakeSt,  setWakeSt]  = useState<'idle' | 'waking' | 'ok' | 'err'>('idle');
  const [wakeMsg, setWakeMsg] = useState('');

  const [dateFrom, setDateFrom] = useState(yesterday());
  const [dateTo,   setDateTo]   = useState(today());
  const [chFilter, setChFilter] = useState(0);
  const [search,   setSearch]   = useState('');

  const [files,       setFiles]       = useState<FileEntry[]>([]);
  const [scanning,    setScanning]    = useState(false);
  const [scanMsg,     setScanMsg]     = useState('');
  const [scanErr,     setScanErr]     = useState('');

  const [selected,  setSelected]  = useState<Set<string>>(new Set());

  const [jobs,      setJobs]      = useState<DLJob[]>([]);
  const [showQ,     setShowQ]     = useState(false);
  const [storage,   setStorage]   = useState<StorageUsage | null>(null);

  // stable refs so async callbacks see current values without stale closures
  const filesRef    = useRef<FileEntry[]>([]);
  const selRef      = useRef<Set<string>>(new Set());
  const dateFromRef = useRef(dateFrom);
  const dateToRef   = useRef(dateTo);
  filesRef.current    = files;
  selRef.current      = selected;
  dateFromRef.current = dateFrom;
  dateToRef.current   = dateTo;

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const r = await fetchDevices(1, 100);
        const cams = r.data.filter(isDashcam);
        setDevices(cams);
        if (cams.length) setSelImei(cams[0].imei);
      } catch { /* silent on load */ } finally { setDevLoading(false); }
    })();
    fetchStorageUsage().then(setStorage).catch(() => {});
  }, []);

  // ── Wake device ────────────────────────────────────────────────────────────
  const doWake = useCallback(async () => {
    if (!selImei) return;
    setWakeSt('waking'); setWakeMsg('Sending wakeup command…');
    try {
      const r = await wakeupDevice(selImei);
      if (r?.resultCode === '100') { setWakeSt('ok'); setWakeMsg(r.resultMsg || 'Device is awake ✓'); }
      else { setWakeSt('err'); setWakeMsg(r?.resultMsg || 'No response received'); }
    } catch (e: any) {
      setWakeSt('err');
      setWakeMsg(e?.response?.data?.message || e?.message || 'Wake command failed');
    }
    setTimeout(() => { setWakeSt('idle'); setWakeMsg(''); }, 6000);
  }, [selImei]);

  // ── Scan SD card ───────────────────────────────────────────────────────────
  const doScan = useCallback(async () => {
    if (!selImei) return;
    setScanning(true); setScanErr(''); setFiles([]); setSelected(new Set());
    const s = toMs(dateFrom, false);
    const e = toMs(dateTo, true);
    const all: FileEntry[] = [];

    for (let ch = 1; ch <= MAX_CH; ch++) {
      setScanMsg(`Scanning channel ${ch} of ${MAX_CH}…`);
      try {
        const r = await listVideoFiles(selImei, s, e, ch);
        if (r?.files?.length)
          r.files.forEach(f => all.push({ ...f, imei: selImei, key: `${selImei}_${ch}_${f.fileName}` }));
        if (ch < MAX_CH) await sleep(1200);
      } catch (ex: any) {
        // 2011 = device busy, others = channel absent — wait and continue
        if (ex?.response?.data?.code === 2011) await sleep(6000);
      }
    }

    setScanMsg(''); setScanning(false);
    if (!all.length) setScanErr('No video files found. Check the device is online and the date range has recordings.');
    else setFiles(all);
  }, [selImei, dateFrom, dateTo]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleOne = (key: string) =>
    setSelected(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const toggleList = (keys: string[]) =>
    setSelected(p => {
      const allIn = keys.every(k => p.has(k));
      const n = new Set(p);
      allIn ? keys.forEach(k => n.delete(k)) : keys.forEach(k => n.add(k));
      return n;
    });

  // ── Download pipeline ──────────────────────────────────────────────────────
  const doDownload = useCallback(async () => {
    // snapshot refs to avoid stale closure
    const allFiles  = filesRef.current;
    const curSel    = selRef.current;
    const dfrom     = dateFromRef.current;
    const dto       = dateToRef.current;

    const toGet = allFiles.filter(f => curSel.has(f.key));
    if (!toGet.length) return;

    setShowQ(true);
    const incoming: DLJob[] = toGet.map(f => ({ key: f.key, fileName: f.fileName, status: 'queued', pct: 0 }));
    setJobs(p => [...p.filter(j => !incoming.find(ij => ij.key === j.key)), ...incoming]);

    // Group by imei+channel for batching upload calls
    const groups = new Map<string, FileEntry[]>();
    toGet.forEach(f => {
      const g = `${f.imei}_${f.channel}`;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(f);
    });

    for (const [, batch] of groups) {
      const { imei, channel } = batch[0];
      const names = batch.map(f => f.fileName);
      const keys  = batch.map(f => f.key);

      const patchBatch = (p: Partial<DLJob>) =>
        setJobs(prev => prev.map(j => keys.includes(j.key) ? { ...j, ...p } : j));

      // 1 ── Trigger device to upload files to server
      patchBatch({ status: 'uploading', pct: 15 });
      try { await startRemoteUpload(imei, names, channel); }
      catch (ex: any) {
        patchBatch({ status: 'error', pct: 0, err: ex?.response?.data?.message || 'Upload command failed' });
        continue;
      }

      // 2 ── Poll /resource/page until files appear (max 3 min)
      patchBatch({ status: 'polling', pct: 35 });
      const deadline = Date.now() + 180_000;
      const found = new Map<string, string>(); // fileName → storagePath

      while (Date.now() < deadline && found.size < names.length) {
        await sleep(5000);
        try {
          const page = await fetchResources(1, 100, {
            imei, channel, mediaType: 1, eventType: 'historical',
            startTime: toMs(dfrom, false), endTime: toMs(dto, true),
          });
          page.data.forEach(r => {
            if (names.includes(r.fileName) && !found.has(r.fileName))
              found.set(r.fileName, r.storagePath);
          });
          patchBatch({ pct: 35 + Math.round((found.size / names.length) * 45) });
        } catch { /* retry on next tick */ }
      }

      // 3 ── Fetch each file as a blob and trigger browser download
      for (const f of batch) {
        const sp = found.get(f.fileName);
        if (!sp) {
          setJobs(p => p.map(j => j.key === f.key ? { ...j, status: 'error', pct: 0, err: 'File not ready after 3 min — retry later' } : j));
          continue;
        }
        setJobs(p => p.map(j => j.key === f.key ? { ...j, status: 'downloading', pct: 82 } : j));
        try {
          const url  = resolveMediaUrl(sp);
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const blob = await resp.blob();
          const a    = document.createElement('a');
          a.href     = URL.createObjectURL(blob);
          a.download = f.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(a.href), 8000);
          setJobs(p => p.map(j => j.key === f.key ? { ...j, status: 'done', pct: 100 } : j));
        } catch (ex: any) {
          setJobs(p => p.map(j => j.key === f.key ? { ...j, status: 'error', pct: 0, err: ex?.message || 'Download failed' } : j));
        }
      }
    }

    fetchStorageUsage().then(setStorage).catch(() => {});
  }, []); // stable — uses refs internally

  // ── Derived ────────────────────────────────────────────────────────────────
  const visible = files.filter(f =>
    (chFilter === 0 || f.channel === chFilter) &&
    (!search || f.fileName.toLowerCase().includes(search.toLowerCase()))
  );
  const byChannel: Record<number, FileEntry[]> = {};
  visible.forEach(f => { if (!byChannel[f.channel]) byChannel[f.channel] = []; byChannel[f.channel].push(f); });

  const selVisible = visible.filter(f => selected.has(f.key));
  const selCount   = selVisible.length;
  const selBytes   = selVisible.reduce((s, f) => s + (f.fileSize || 0), 0);
  const allVisSelCount = visible.filter(f => selected.has(f.key)).length;
  const allVisSel  = visible.length > 0 && allVisSelCount === visible.length;
  const someVisSel = allVisSelCount > 0 && !allVisSel;
  const activeJobs = jobs.filter(j => j.status !== 'done' && j.status !== 'error').length;

  const jColor = (s: DLS): string =>
    ({ done: C.green, error: C.red, queued: C.muted, uploading: C.pink, polling: C.pink, downloading: C.pink })[s];
  const jLabel = (s: DLS): string =>
    ({ done: 'Done ✓', error: 'Error', queued: 'Queued', uploading: 'Uploading…', polling: 'Processing…', downloading: 'Saving…' })[s];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper isProtected title="SD Card Browser">
      {/* ── global styles ── */}
      <style>{`
        @keyframes sdc-spin { to { transform: rotate(360deg); } }
        @keyframes sdc-in   { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
        .sdc-row            { transition: background .1s; cursor: pointer; }
        .sdc-row:hover      { background: ${C.pinkLt} !important; }
        .sdc-row.sel        { background: ${C.pinkLt} !important; }
        .sdc-dev            { transition: border-color .15s, background .15s; width: 100%;
                              border: 1.5px solid ${C.border}; border-radius: 9px;
                              background: ${C.card}; cursor: pointer; text-align: left; }
        .sdc-dev:hover      { border-color: ${C.pink}; }
        .sdc-dev.sel        { background: ${C.pink} !important; color: #fff !important; border-color: ${C.pink} !important; }
        .sdc-ch             { cursor: pointer; padding: 6px 12px; border-radius: 8px; font-size: 12px;
                              font-weight: 600; border: 1.5px solid ${C.border}; background: #fff;
                              color: ${C.sub}; transition: border-color .15s, background .15s; }
        .sdc-ch:hover       { border-color: ${C.pink}; }
        .sdc-ch.sel         { background: ${C.pink} !important; color: #fff !important; border-color: ${C.pink} !important; }
        .sdc-primary-btn:hover:not(:disabled) { background: ${C.pinkDk} !important; }
        .sdc-primary-btn:disabled { opacity: .6; cursor: not-allowed; }
        .sdc-ghost          { border: 1.5px solid ${C.border}; border-radius: 8px; background: #fff;
                              cursor: pointer; transition: border-color .15s, color .15s; }
        .sdc-ghost:hover    { border-color: ${C.pink}; color: ${C.pink}; }
        .sdc-inp:focus      { outline: none; border-color: ${C.pink} !important; box-shadow: 0 0 0 3px ${C.pinkLt}; }
        .sdc-job            { animation: sdc-in .2s ease both; }
        .sdc-date-quick:hover { border-color: ${C.pink} !important; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: .5; cursor: pointer; }
      `}</style>

      <Page container="fluid">
        {/* ═══ PAGE HEADER ════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: C.pinkLt, border: `1.5px solid ${C.pinkBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcSd />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>SD Card Browser</h1>
              <p style={{ margin: 0, fontSize: 13, color: C.sub, marginTop: 1 }}>Browse and download video recordings from device SD cards</p>
            </div>
          </div>

          {/* storage gauge */}
          {storage && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', minWidth: 210, boxShadow: C.sh }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>Server Storage</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: storage.usagePercentage > 80 ? C.red : C.text }}>{storage.usagePercentage}%</span>
              </div>
              <Bar pct={storage.usagePercentage} c={storage.usagePercentage > 80 ? C.red : C.pink} h={5} />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                {fmtBytes(Number(storage.usedSpace))} of {storage.totalSpace} GB used
              </div>
            </div>
          )}
        </div>

        {/* ═══ LAYOUT: sidebar + main ══════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '284px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Device list */}
            <Card>
              <SecLabel text="Camera / Device" />
              {devLoading
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13 }}><Spin sz={15} /> Discovering cameras…</div>
                : devices.length === 0
                  ? <div style={{ fontSize: 13, color: C.muted }}>No dashcam devices found in this account.</div>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {devices.map(d => {
                        const isSel  = selImei === d.imei;
                        const online = d.onlineStatus === 1;
                        return (
                          <button key={d.imei} className={`sdc-dev${isSel ? ' sel' : ''}`}
                            onClick={() => { setSelImei(d.imei); setFiles([]); setSelected(new Set()); setScanErr(''); setWakeSt('idle'); setWakeMsg(''); }}
                            style={{ padding: '10px 12px', color: isSel ? '#fff' : C.text }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{d.deviceName}</div>
                            <div style={{ fontSize: 10, opacity: .72, marginTop: 1, fontFamily: 'monospace' }}>{d.imei}</div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 7px', background: isSel ? 'rgba(255,255,255,.22)' : C.blueBg, color: isSel ? '#fff' : C.blue }}>{d.model}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 7px', background: online ? (isSel ? 'rgba(255,255,255,.22)' : C.greenBg) : 'rgba(0,0,0,.07)', color: online ? (isSel ? '#fff' : C.green) : C.muted }}>
                                {online ? '● Online' : '○ Offline'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
              }
            </Card>

            {/* Wake */}
            <Card>
              <SecLabel text="Device Control" />
              <PrimaryBtn onClick={doWake} disabled={!selImei || wakeSt === 'waking'} style={{ width: '100%', justifyContent: 'center' }}>
                {wakeSt === 'waking' ? <Spin sz={13} c="#fff" /> : <IcWake sz={13} />}
                {wakeSt === 'waking' ? 'Sending wakeup…' : 'Wake Device'}
              </PrimaryBtn>
              {wakeMsg && (
                <div style={{ marginTop: 9, fontSize: 12, fontWeight: 500, padding: '8px 10px', borderRadius: 6, lineHeight: 1.4, background: wakeSt === 'ok' ? C.greenBg : wakeSt === 'err' ? C.redBg : C.blueBg, color: wakeSt === 'ok' ? C.green : wakeSt === 'err' ? C.red : C.blue }}>
                  {wakeMsg}
                </div>
              )}
              <p style={{ fontSize: 11, color: C.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
                Wake the device before scanning if it appears offline or returns no files.
              </p>
            </Card>

            {/* Date range */}
            <Card>
              <SecLabel text="Date Range" />
              {([['From', dateFrom, setDateFrom, undefined, dateTo], ['To', dateTo, setDateTo, dateFrom, today()]] as const).map(([lbl, val, set, mn, mx]) => (
                <div key={lbl} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 4 }}>{lbl}</label>
                  <input type="date" className="sdc-inp" value={val} min={mn} max={mx}
                    onChange={e => (set as (v: string) => void)(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: '#fff', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { l: 'Today',     f: today(),      t: today() },
                  { l: 'Yesterday', f: yesterday(),   t: yesterday() },
                  { l: '7 Days',    f: nDaysAgo(7),  t: today() },
                ].map(p => (
                  <button key={p.l} className="sdc-date-quick"
                    onClick={() => { setDateFrom(p.f); setDateTo(p.t); }}
                    style={{ flex: 1, padding: '5px 0', border: `1.5px solid ${C.border}`, borderRadius: 6, background: '#fff', fontSize: 11, fontWeight: 600, color: C.sub, cursor: 'pointer', transition: 'border-color .15s' }}>
                    {p.l}
                  </button>
                ))}
              </div>
            </Card>

            {/* Summary — only visible when files are loaded */}
            {files.length > 0 && (
              <Card>
                <SecLabel text="Summary" />
                {[
                  { l: 'Total files', v: `${files.length}`,                                          c: C.text },
                  { l: 'Total size',  v: fmtBytes(files.reduce((s, f) => s + (f.fileSize || 0), 0)), c: C.text },
                  { l: 'Channels',    v: `${Object.keys(byChannel).length}`,                          c: C.text },
                  { l: 'Selected',    v: `${selCount} (${fmtBytes(selBytes)})`,                        c: C.pink },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.sub }}>{r.l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.v}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>{/* end sidebar */}

          {/* ── MAIN ────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Toolbar */}
            <Card p={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                  <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><IcSearch /></div>
                  <input className="sdc-inp" placeholder="Search filename…" value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: 34, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: '#fff', boxSizing: 'border-box' }} />
                </div>
                {/* channel tabs */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[{ ch: 0, l: 'All' }, ...Array.from({ length: MAX_CH }, (_, i) => ({ ch: i + 1, l: `CH ${i + 1}` }))].map(({ ch, l }) => (
                    <button key={ch} className={`sdc-ch${chFilter === ch ? ' sel' : ''}`} onClick={() => setChFilter(ch)}>{l}</button>
                  ))}
                </div>
                {/* scan */}
                <PrimaryBtn onClick={doScan} disabled={!selImei || scanning} style={{ whiteSpace: 'nowrap' }}>
                  <IcScan sz={13} spin={scanning} />
                  {scanning ? (scanMsg || 'Scanning…') : 'Scan SD Card'}
                </PrimaryBtn>
              </div>
            </Card>

            {/* ── Scanning ── */}
            {scanning && (
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 24px' }}>
                  <Spin sz={42} />
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{scanMsg || 'Scanning SD card…'}</div>
                  <div style={{ fontSize: 13, color: C.muted, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
                    Querying each camera channel. This can take 10–30 seconds per channel.
                  </div>
                </div>
              </Card>
            )}

            {/* ── Error ── */}
            {!scanning && scanErr && (
              <div style={{ background: C.redBg, border: '1px solid #fecdd3', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.red, fontSize: 14, marginBottom: 4 }}>SD Card Query Failed</div>
                  <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{scanErr}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Tip: use the Wake Device button, wait 5 seconds, then scan again.</div>
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!scanning && !scanErr && files.length === 0 && (
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '68px 32px' }}>
                  <IcSd sz={54} c="#dee0e5" />
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.sub }}>No files loaded yet</div>
                  <div style={{ fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 290, lineHeight: 1.6 }}>
                    Select a device and date range from the sidebar, then click <strong style={{ color: C.pink }}>Scan SD Card</strong>.
                  </div>
                </div>
              </Card>
            )}

            {/* ── Bulk action bar ── */}
            {!scanning && visible.length > 0 && (
              <Card p={12}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Checkbox checked={allVisSel} indeterminate={someVisSel} onChange={() => toggleList(visible.map(f => f.key))} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      Select all <span style={{ color: C.muted, fontWeight: 400 }}>({visible.length})</span>
                    </span>
                    {selCount > 0 && (
                      <span style={{ fontSize: 13, color: C.sub }}>
                        — <strong style={{ color: C.pink }}>{selCount} selected</strong> ({fmtBytes(selBytes)})
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {jobs.length > 0 && (
                      <button className="sdc-ghost" onClick={() => setShowQ(!showQ)}
                        style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, color: C.sub, display: 'flex', alignItems: 'center', gap: 6 }}>
                        📥 Queue
                        {activeJobs > 0 && <Tag label={`${activeJobs}`} c="#fff" bg={C.pink} />}
                      </button>
                    )}
                    <PrimaryBtn onClick={doDownload} disabled={selCount === 0} style={{ padding: '8px 20px' }}>
                      <IcDl sz={13} />
                      Download {selCount > 0 ? `${selCount} File${selCount > 1 ? 's' : ''}` : 'Selected'}
                    </PrimaryBtn>
                  </div>
                </div>
              </Card>
            )}

            {/* ── File groups by channel ── */}
            {!scanning && Object.entries(byChannel).sort(([a], [b]) => Number(a) - Number(b)).map(([chStr, chFiles]) => {
              const ch       = Number(chStr);
              const chLabel  = CH_LABELS[ch - 1] || `Channel ${ch}`;
              const chSel    = chFiles.filter(f => selected.has(f.key)).length;
              const chAllSel = chFiles.length > 0 && chFiles.every(f => selected.has(f.key));
              const chAnySel = chSel > 0 && !chAllSel;

              return (
                <div key={ch} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: C.sh }}>

                  {/* channel header */}
                  <div style={{ padding: '11px 16px', background: `linear-gradient(90deg, ${C.pinkLt} 0%, #fff 100%)`, borderBottom: `1px solid ${C.pinkBdr}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Checkbox checked={chAllSel} indeterminate={chAnySel} onChange={() => toggleList(chFiles.map(f => f.key))} />
                    <IcVid />
                    <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{chLabel}</span>
                    <Tag label={`${chFiles.length} files`} />
                    <Tag label={fmtBytes(chFiles.reduce((s, f) => s + (f.fileSize || 0), 0))} c={C.sub} bg="#f2f4f7" />
                    {chSel > 0 && <Tag label={`${chSel} selected`} c={C.pink} bg={C.pinkLt} />}
                  </div>

                  {/* column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 118px 108px 84px 64px', padding: '6px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f9fafb', borderBottom: `1px solid ${C.border}` }}>
                    <div /><div>File name</div><div>Start</div><div>End</div><div>Size</div><div>Stream</div>
                  </div>

                  {/* rows */}
                  {chFiles.map((f, idx) => {
                    const isSel = selected.has(f.key);
                    return (
                      <div key={f.key} className={`sdc-row${isSel ? ' sel' : ''}`}
                        onClick={() => toggleOne(f.key)}
                        style={{ display: 'grid', gridTemplateColumns: '36px 1fr 118px 108px 84px 64px', padding: '9px 16px', alignItems: 'center', borderBottom: idx < chFiles.length - 1 ? `1px solid ${C.border}` : 'none', background: isSel ? C.pinkLt : idx % 2 === 0 ? '#fff' : '#fafcff' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox checked={isSel} onChange={() => toggleOne(f.key)} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.fileName}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{f.storageType === 0 ? 'Main storage' : 'Backup storage'}</div>
                        </div>
                        <div style={{ fontSize: 12, color: C.sub, fontFamily: 'monospace' }}>{fmtT(f.startTime)}</div>
                        <div style={{ fontSize: 12, color: C.sub, fontFamily: 'monospace' }}>{fmtT(f.endTime)}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{fmtBytes(f.fileSize)}</div>
                        <div><span style={{ fontSize: 10, fontWeight: 700, color: C.blue, background: C.blueBg, padding: '2px 7px', borderRadius: 5 }}>{f.dataType === 0 ? 'Main' : 'Sub'}</span></div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* ── Download queue panel ── */}
            {showQ && jobs.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: C.shMd }}>
                <div style={{ padding: '12px 16px', background: '#f9fafb', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📥 Download Queue</span>
                    {activeJobs > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: C.pink, color: '#fff', borderRadius: 20, padding: '2px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Spin sz={10} c="#fff" /> {activeJobs} active
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="sdc-ghost" onClick={() => setJobs([])} style={{ padding: '4px 10px', fontSize: 12, color: C.sub }}>Clear all</button>
                    <button className="sdc-ghost" onClick={() => setShowQ(false)} style={{ padding: '4px 10px', fontSize: 12, color: C.sub }}>Hide</button>
                  </div>
                </div>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {jobs.map((j, idx) => (
                    <div key={j.key} className="sdc-job" style={{ padding: '11px 16px', borderBottom: idx < jobs.length - 1 ? `1px solid ${C.border}` : 'none', background: idx % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: (j.status !== 'queued' && j.status !== 'done' && j.status !== 'error') ? 7 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          {(j.status === 'uploading' || j.status === 'polling' || j.status === 'downloading') && <Spin sz={13} c={C.pink} />}
                          {j.status === 'done'   && <span style={{ color: C.green, fontSize: 14 }}>✓</span>}
                          {j.status === 'error'  && <span style={{ color: C.red,   fontSize: 14 }}>✗</span>}
                          {j.status === 'queued' && <span style={{ color: C.muted, fontSize: 12 }}>⏳</span>}
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {j.fileName}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: jColor(j.status), background: `${jColor(j.status)}1a`, padding: '2px 9px', borderRadius: 10, flexShrink: 0 }}>
                          {jLabel(j.status)}
                        </span>
                      </div>
                      {(j.status === 'uploading' || j.status === 'polling' || j.status === 'downloading') && <Bar pct={j.pct} />}
                      {j.status === 'done'  && <Bar pct={100} c={C.green} />}
                      {j.err && <div style={{ fontSize: 11, color: C.red, marginTop: 5 }}>{j.err}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* end main */}
        </div>{/* end grid */}
      </Page>
    </PageWrapper>
  );
};

export default SDCardBrowser;
