/**
 * dashcamService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All IoT calls go through the local dev proxy at /iot-api/*
 * The proxy (src/setupProxy.js) rewrites this to:
 *   https://iot.ravity.io/api/v3/*
 * and injects the Authorization header server-side (no CORS issues).
 *
 * Built from TurboHive API spec (56 endpoints, 15 tags):
 *   Authentication, Token, Gateway, Device, Alert, Alert Settings,
 *   Resource, OBD, Tag, Playback Tracks, Vendor, Model, Command,
 *   Command History, Video
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────

// Call iot.ravity.io directly — token from .env (no proxy needed)
export const IOT_BASE = 'https://iot.ravity.io';
const API_BASE = `${IOT_BASE}/api/v3`;
const TOKEN = process.env.REACT_APP_IOT_TOKEN || '';

const api = () =>
  axios.create({
    baseURL: API_BASE,
    timeout: 30_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });

// ─── API Response wrapper (code 1000 = success) ───────────────────────────────

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// ─── Shared pagination result ─────────────────────────────────────────────────

export interface PagedData<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
}

// Parse the two response shapes used across TurboHive endpoints:
//   Shape A (devices, alerts, resources): { data:[...], page, size, total, totalPages }
//   Shape B (gateways):                  { pageResult:{ data:[...], ...}, stats:{...} }
const parsePaged = <T>(raw: any, size: number): PagedData<T> => {
  const d = raw?.pageResult ?? raw;
  return {
    data: d?.data ?? d?.records ?? d?.list ?? [],
    total: d?.total ?? 0,
    totalPages: d?.totalPages ?? d?.pages ?? Math.ceil((d?.total ?? 0) / size),
    page: d?.page ?? 1,
    size,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a relative media storagePath to a full URL.
 * e.g. "/media/2025/12/file.mp4" -> "https://iot.ravity.io/media/2025/12/file.mp4"
 */
export const resolveMediaUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IOT_BASE}${path}`;
};

// ─── Types: Device ────────────────────────────────────────────────────────────

export interface IotDevice {
  id: number;
  imei: string;
  deviceName: string;
  deviceType: string;    // e.g. "Tracker", "Sensor", "Dashcam"
  manufacturer: string;  // e.g. "Jimi"
  model: string;         // e.g. "JC-VG34"
  gatewayId: number;
  gatewayName: string;
  protocol: string;      // e.g. "Jimi", "JT808", "MQTT"
  status: number;
  importTime: number;
  remark?: string;
  onlineStatus: number;  // 1=online, 0=offline
}

export interface IotChannelCount {
  imei: string;
  channelCount: number;
}

// ─── Types: Gateway ───────────────────────────────────────────────────────────

export interface IotGateway {
  id: number;
  name: string;
  gatewayCode: string;
  protocol: string;
  port: number;
  hostname: string;
  status: string;
  startTime: number;
  connectionCount: number;
  onlineCount: number;
  description?: string;
  uptime?: string;
}

// ─── Types: Alert + Attachment ────────────────────────────────────────────────

export interface IotAttachment {
  id: number;
  imei: string;
  channel: number;
  mediaType: number;   // 0=Image, 1=Video, 2=Audio
  fileName: string;    // required — used for download filename
  fileSize: number;    // required — bytes
  storagePath: string;
  captureTime: number; // required — Unix ms
  duration: number;
  createdAt: number;
  updatedAt: number;
  calc: number;
  storageChannel: number;
}

export interface IotAlert {
  id: number;
  imei: string;
  deviceName?: string;
  alertTypeCode?: string;
  type?: string;         // numeric string e.g. "1401"
  alertName?: string;
  alarmType?: string;
  eventType?: string;
  triggerType?: string;  // "Event" | "manual" | "automatic"
  firingStatus?: string;
  fring_status?: string;
  alertTime: number;
  details?: string;
  latitude?: number;
  longitude?: number;
  location?: string;     // "lat,lng" string
  locationAddress?: string;
  extraInfo?: string;
  status: number;        // 0=active, 1=resolved
  handledBy?: number;
  handledAt?: number;
  handleNote?: string;
  userId?: number;
  createdAt: number;
  updatedAt: number;
  alarmLabel?: string;
  description?: string;
  attachment?: IotAttachment[];
}

// ─── Types: Resource (GET /v3/resource/page) ──────────────────────────────────

export interface IotResource {
  id: number;
  userId?: number;
  imei: string;
  channel: number;
  mediaType: number;   // 0=Image, 1=Video, 2=Audio
  fileName: string;    // required
  fileSize: number;    // required — bytes
  storagePath: string;
  captureTime: number; // required — Unix ms
  duration?: number;
  createdAt: number;
  updatedAt: number;
  eventType?: string;  // "capture" | "alarm" | "historical"
  calc?: number;
  storageChannel?: number;
  deviceName?: string; // joined client-side if needed
}

// ─── Types: Video Streaming ───────────────────────────────────────────────────

export interface StreamingUrls {
  rtmp: string;
  flv: string;
  hls: string;
}

export interface LiveVideoSession {
  resultCode: string;
  resultMsg: string;
  streamingUrls: StreamingUrls;
  streamUrl?: string;  // legacy fallback — prefer streamingUrls.flv
  imei?: string;
  channel?: number;
}

export interface VideoFile {
  fileName: string;
  startTime: string;
  endTime: string;
  fileSize: number;
  channel: number;
  dataType: number;
  storageType: number;
}

export interface PlaybackSession {
  streamingUrls: StreamingUrls;
  fileList: string[];
}

// ─── Types: Command ───────────────────────────────────────────────────────────

export interface CommandResult {
  resultCode: string;
  resultMsg: string;
  imei?: string;
  cmdNo?: string;
  content?: string;
}

export interface CommandHistory {
  id: number;
  imei: string;
  content: string;
  isManual: string;
  sync: boolean;
  status: number;
  response?: string;
  userId?: number;
  sentAt: number;
  responseAt?: number;
  createdAt: number;
  updatedAt?: number;
  cmdNo: string;
}

// ─── Types: Track ─────────────────────────────────────────────────────────────

export interface TrackPoint {
  deviceTime: string;
  latitude: number;
  longitude: number;
  gpsSpeed: number;
  direction: number;
  acc: number;
  satelliteNum: number;
  postMethod: number;
  altitude: number;
  distance: number;
}

export interface TrackData {
  tracks: TrackPoint[];
  currentPageSize: number;
  hasNext: boolean;
  nextPageState: string;
}

// ─── Types: OBD ───────────────────────────────────────────────────────────────

export interface OBDPoint {
  deviceTime: string;
  latitude: number;
  longitude: number;
  accStatus: number;
  vehicleSpeed: number;
  engineSpeed: number;
  fuelLevel: number;
  batteryVoltage: number;
  coolantTemp: number;
  throttle: number;
  odometer: number;
  cumulativeMileage: number;
}

export interface OBDData {
  obdData: OBDPoint[];
  currentPageSize: number;
  hasNext: boolean;
  nextPageState: string;
}

// ─── Types: Storage ───────────────────────────────────────────────────────────

export interface StorageUsage {
  usedSpace: string;    // bytes as string
  totalSpace: number;   // GB
  usagePercentage: number;
}

// =============================================================================
// DEVICE APIs  —  /v3/devices/*
// =============================================================================

/** GET /v3/devices/page — paginated device list with optional filters */
export const fetchDevices = async (
  page = 1,
  size = 50,
  params: {
    keyword?: string;
    deviceType?: string;
    manufacturer?: string;
    model?: string;
    protocol?: string;
    importTimeStart?: number;
    importTimeEnd?: number;
  } = {}
): Promise<PagedData<IotDevice>> => {
  const res = await api().get<ApiResponse<any>>('/devices/page', {
    params: { page, size, ...params },
  });
  return parsePaged<IotDevice>(res.data?.data, size);
};

/** GET /v3/devices/{id} */
export const fetchDeviceById = async (id: number): Promise<IotDevice> => {
  const res = await api().get<ApiResponse<IotDevice>>(`/devices/${id}`);
  return res.data.data;
};

/** GET /v3/devices/channel/{imei} — camera channel count for a device */
export const fetchChannelCount = async (imei: string): Promise<IotChannelCount> => {
  const res = await api().get<ApiResponse<IotChannelCount>>(`/devices/channel/${imei}`);
  return res.data.data;
};

/** PUT /v3/devices — rename a device */
export const updateDevice = async (id: number, deviceName: string): Promise<IotDevice> => {
  const res = await api().put<ApiResponse<IotDevice>>('/devices', { id, deviceName });
  return res.data.data;
};

/** POST /v3/devices/import/single */
export const importDevice = async (payload: {
  manufacturer: string;
  model: string;
  imei: string;
  deviceName?: string;
}): Promise<IotDevice> => {
  const res = await api().post<ApiResponse<IotDevice>>('/devices/import/single', payload);
  return res.data.data;
};

/** POST /v3/devices/bulk — delete multiple devices by IMEI array */
export const deleteDevices = async (imeis: string[]): Promise<void> => {
  await api().post('/devices/bulk', imeis);
};

/** DELETE /v3/devices/{id} */
export const deleteDevice = async (id: number): Promise<void> => {
  await api().delete(`/devices/${id}`);
};

// =============================================================================
// GATEWAY APIs  —  /v3/gateways/*
// =============================================================================

/** GET /v3/gateways/page */
export const fetchGateways = async (page = 1, size = 10): Promise<PagedData<IotGateway>> => {
  const res = await api().get<ApiResponse<any>>('/gateways/page', { params: { page, size } });
  return parsePaged<IotGateway>(res.data?.data, size);
};

/** GET /v3/gateways/list — full list with no pagination */
export const fetchGatewayList = async (): Promise<IotGateway[]> => {
  const res = await api().get<ApiResponse<IotGateway[]>>('/gateways/list');
  return res.data.data ?? [];
};

/** GET /v3/gateways/{id} */
export const fetchGatewayById = async (id: number): Promise<IotGateway> => {
  const res = await api().get<ApiResponse<IotGateway>>(`/gateways/${id}`);
  return res.data.data;
};

// =============================================================================
// ALERT APIs  —  /v3/alerts/*
// =============================================================================

/** GET /v3/alerts/page */
export const fetchAlerts = async (
  page = 1,
  size = 20,
  params: {
    keyword?: string;
    type?: string;      // alert type code e.g. "1401"
    startTime?: number; // Unix ms
    endTime?: number;
  } = {}
): Promise<PagedData<IotAlert>> => {
  const res = await api().get<ApiResponse<any>>('/alerts/page', {
    params: { page, size, ...params },
  });
  return parsePaged<IotAlert>(res.data?.data, size);
};

/** GET /v3/alerts/{id} */
export const fetchAlertById = async (id: number): Promise<IotAlert> => {
  const res = await api().get<ApiResponse<IotAlert>>(`/alerts/${id}`);
  return res.data.data;
};

/** DELETE /v3/alerts/{id} */
export const deleteAlert = async (id: number): Promise<void> => {
  await api().delete(`/alerts/${id}`);
};

/** POST /v3/alert/upload/settings — enable/disable an alert type on a device */
export const saveAlertSetting = async (
  imei: string,
  alertCode: string,
  value: '0' | '1'
): Promise<void> => {
  await api().post('/alert/upload/settings', { imei, alertCode, value });
};

// =============================================================================
// RESOURCE APIs  —  /v3/resource/*
// =============================================================================

/** GET /v3/resource/page — paginated media files */
export const fetchResources = async (
  page = 1,
  size = 20,
  params: {
    imei?: string;
    channel?: number;
    mediaType?: number;  // 0=Image, 1=Video, 2=Audio
    eventType?: string;  // "capture" | "alarm" | "historical"
    keyword?: string;
    startTime?: number;  // Unix ms
    endTime?: number;
  } = {}
): Promise<PagedData<IotResource>> => {
  const res = await api().get<ApiResponse<any>>('/resource/page', {
    params: { page, size, ...params },
  });
  return parsePaged<IotResource>(res.data?.data, size);
};

/** GET /v3/resource/{id} */
export const fetchResourceById = async (id: number): Promise<IotResource> => {
  const res = await api().get<ApiResponse<IotResource>>(`/resource/${id}`);
  return res.data.data;
};

/** DELETE /v3/resource/{id} */
export const deleteResource = async (id: number): Promise<void> => {
  await api().delete(`/resource/${id}`);
};

/** GET /v3/resource/storage/usage */
export const fetchStorageUsage = async (): Promise<StorageUsage> => {
  const res = await api().get<ApiResponse<StorageUsage>>('/resource/storage/usage');
  return res.data.data;
};

// =============================================================================
// VIDEO APIs  —  /v3/video/*
// =============================================================================

/**
 * POST /v3/video/live/start
 * Returns FLV/HLS/RTMP streaming URLs.
 */
export const startLiveVideo = async (
  imei: string,
  channel: number,
  dataType: 'audio_video' | 'video_only' | 'monitor' = 'audio_video',
  streamType: 'main_stream' | 'sub_stream' = 'main_stream',
  cmdNo?: number
): Promise<LiveVideoSession> => {
  const res = await api().post<ApiResponse<LiveVideoSession>>('/video/live/start', {
    imei,
    channel,
    dataType,
    streamType,
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
  return res.data.data;
};

/**
 * POST /v3/video/live/stop
 */
export const stopLiveVideo = async (
  imei: string,
  channel: number,
  cmdNo?: number
): Promise<void> => {
  await api().post('/video/live/stop', {
    imei,
    channel,
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
};

/**
 * POST /v3/video/files/list
 * Step 1 of playback workflow — query files stored on device.
 */
export const listVideoFiles = async (
  imei: string,
  startTime: number,
  endTime: number,
  channel = 1,
  cmdNo?: number
): Promise<{ files: VideoFile[]; totalCount: number }> => {
  const res = await api().post<ApiResponse<{ files: VideoFile[]; totalCount: number }>>(
    '/video/files/list',
    {
      imei,
      channel,
      startTime: String(startTime),
      endTime: String(endTime),
      dataType: 0,
      streamType: 0,
      storageType: 0,
      ...(cmdNo !== undefined ? { cmdNo } : {}),
    }
  );
  return res.data.data;
};

/**
 * POST /v3/video/playback/start
 * Step 2 of playback workflow — pass fileNames from listVideoFiles.
 * Max 8 files per session.
 */
export const startVideoPlayback = async (
  imei: string,
  fileNames: string[],
  cmdNo?: number,
  playMethod = 0
): Promise<PlaybackSession> => {
  const res = await api().post<ApiResponse<PlaybackSession>>('/video/playback/start', {
    imei,
    fileNames,
    playMethod,
    forwardRewind: 1,
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
  return res.data.data;
};

/**
 * POST /v3/video/playback/stop
 */
export const stopVideoPlayback = async (
  imei: string,
  channel = 1,
  cmdNo?: number
): Promise<void> => {
  await api().post('/video/playback/stop', {
    imei,
    channel,
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
};

/**
 * POST /v3/video/playback/control
 * 0=start, 1=pause, 2=end, 3=fast-forward, 4=rewind, 5=seek
 */
export const controlVideoPlayback = async (
  imei: string,
  playCtrl: 0 | 1 | 2 | 3 | 4 | 5,
  channel = 1,
  beginTime?: number,
  cmdNo?: number
): Promise<void> => {
  await api().post('/video/playback/control', {
    imei,
    channel,
    playCtrl,
    forwardRewind: 0,
    ...(beginTime !== undefined ? { beginTime: String(beginTime) } : {}),
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
};

/**
 * POST /v3/video/capture/start
 * type: 1=single snapshot, 2=continuous snapshot, 3=recording
 */
export const startCapture = async (
  imei: string,
  channel = 1,
  type: 1 | 2 | 3 = 1,
  options: { count?: number; duration?: number; photoCount?: number; cmdNo?: number } = {}
): Promise<CommandResult> => {
  const res = await api().post<ApiResponse<CommandResult>>('/video/capture/start', {
    imei,
    channel,
    type,
    count: options.count ?? 1,
    duration: options.duration ?? 5,
    photoCount: options.photoCount ?? 1,
    ...(options.cmdNo !== undefined ? { cmdNo: options.cmdNo } : {}),
  });
  return res.data.data;
};

/**
 * POST /v3/video/upload/start
 * Request device to upload historical files to server.
 */
export const startRemoteUpload = async (
  imei: string,
  fileNames: string[],
  channel = 1,
  cmdNo?: number
): Promise<CommandResult> => {
  const res = await api().post<ApiResponse<CommandResult>>('/video/upload/start', {
    imei,
    channel,
    fileNames,
    dataType: 0,
    streamType: 0,
    storageType: 0,
    ...(cmdNo !== undefined ? { cmdNo } : {}),
  });
  return res.data.data;
};

// =============================================================================
// COMMAND APIs  —  /v3/command/*
// =============================================================================

/** POST /v3/command/send — send a raw protocol command */
export const sendCommand = async (
  imei: string,
  content: string,
  options: {
    msgId?: string;
    sync?: boolean;
    offline?: boolean;
    timeout?: number;
    cmdNo?: number;
  } = {}
): Promise<CommandResult> => {
  const res = await api().post<ApiResponse<CommandResult>>('/command/send', {
    imei,
    content,
    sync: options.sync ?? true,
    offline: options.offline ?? true,
    timeout: options.timeout ?? 30,
    ...(options.msgId ? { msgId: options.msgId } : {}),
    ...(options.cmdNo !== undefined ? { cmdNo: options.cmdNo } : {}),
  });
  return res.data.data;
};

/** POST /v3/command/wakeup */
export const wakeupDevice = async (imei: string): Promise<CommandResult> => {
  const res = await api().post<ApiResponse<CommandResult>>('/command/wakeup', {
    imei, sync: true, offline: true, timeout: 30,
  });
  return res.data.data;
};

/** POST /v3/command/cmdNo — generate a unique command tracking number */
export const getCommandNumber = async (): Promise<number> => {
  const res = await api().post<ApiResponse<{ cmdNo: number }>>('/command/cmdNo');
  return res.data.data.cmdNo;
};

/** GET /v3/command/history/page */
export const fetchCommandHistory = async (
  page = 1,
  size = 20,
  params: { imei?: string; status?: number; isManual?: boolean; startTime?: number; endTime?: number } = {}
): Promise<PagedData<CommandHistory>> => {
  const res = await api().get<ApiResponse<any>>('/command/history/page', {
    params: { page, size, ...params },
  });
  const d = res.data?.data;
  return {
    data: d?.list ?? [],
    total: d?.total ?? 0,
    totalPages: d?.totalPages ?? Math.ceil((d?.total ?? 0) / size),
    page: d?.page ?? 1,
    size,
  };
};

/** GET /v3/command/history/device/{imei} */
export const fetchDeviceCommandHistory = async (
  imei: string,
  limit = 20
): Promise<CommandHistory[]> => {
  const res = await api().get<ApiResponse<CommandHistory[]>>(
    `/command/history/device/${imei}`,
    { params: { limit } }
  );
  return res.data.data ?? [];
};

// =============================================================================
// TRACK APIs  —  /v3/track
// =============================================================================

/**
 * GET /v3/track — GNSS track data.
 * Max 15 days span, max 100 points per page.
 * Use nextPageState from response to page through large ranges.
 */
export const fetchTrack = async (
  imei: string,
  startTime: string,    // ISO-8601 e.g. "2024-11-01T00:00:00Z"
  endTime: string,
  pageSize = 100,
  pagingState?: string
): Promise<TrackData> => {
  const res = await api().get<ApiResponse<TrackData>>('/track', {
    params: { imei, startTime, endTime, pageSize, ...(pagingState ? { pagingState } : {}) },
  });
  return res.data.data;
};

// =============================================================================
// OBD APIs  —  /v3/obd
// =============================================================================

/** GET /v3/obd — OBD data. Max 15 days span. */
export const fetchOBD = async (
  imei: string,
  startTime: string,    // ISO-8601
  endTime: string,
  pageSize = 100,
  pagingState?: string
): Promise<OBDData> => {
  const res = await api().get<ApiResponse<OBDData>>('/obd', {
    params: { imei, startTime, endTime, pageSize, ...(pagingState ? { pagingState } : {}) },
  });
  return res.data.data;
};

// =============================================================================
// VENDOR / MODEL APIs
// =============================================================================

/** GET /v3/vendors */
export const fetchVendors = async () => {
  const res = await api().get<ApiResponse<any[]>>('/vendors');
  return res.data.data ?? [];
};

/** GET /v3/models */
export const fetchModels = async () => {
  const res = await api().get<ApiResponse<any[]>>('/models');
  return res.data.data ?? [];
};

/** GET /v3/models/vendor/{vendorId} */
export const fetchModelsByVendor = async (vendorId: number) => {
  const res = await api().get<ApiResponse<any[]>>(`/models/vendor/${vendorId}`);
  return res.data.data ?? [];
};

// =============================================================================
// UI HELPERS used by components
// =============================================================================

export const alertHasVideo = (alert: IotAlert): boolean =>
  !!alert.attachment?.some(a => a.mediaType === 1);

export const alertHasMedia = (alert: IotAlert): boolean =>
  !!alert.attachment?.some(a => a.mediaType === 0 || a.mediaType === 1);

/** All devices are shown — isDashcam is kept for optional UI labelling only */
export const isDashcam = (device: IotDevice): boolean => {
  const type = (device.deviceType || '').toLowerCase();
  const model = (device.model || '').toUpperCase();
  const name = (device.deviceName || '').toLowerCase();
  return (
    type === 'dashcam' ||
    type.includes('camera') ||
    type.includes('dvr') ||
    type.includes('mdvr') ||
    model.startsWith('JC') ||
    name.includes('cam') ||
    name.includes('dvr')
  );
};
