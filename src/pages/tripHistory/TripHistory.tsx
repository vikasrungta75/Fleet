import React, { FC, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { IvehicleLocation } from '../../type/vehicles-type';
import Spinner from '../../components/bootstrap/Spinner';

const primary      = '#6c5dd3';
const primaryLight = '#f0eeff';
const border       = '#e8e8e8';
const bg           = '#f8f9fa';
const textPrimary  = '#1a1a2e';
const textMuted    = '#888';
const success      = '#2da44e';
const warning      = '#f57c00';
const errorClr     = '#d32f2f';
const infoClr      = '#1565c0';
const greyClr      = '#6b7280';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    Running:      { bg: '#eafbf0', color: success },
    Idle:         { bg: '#fff8f0', color: warning },
    Stopped:      { bg: '#f3f4f6', color: greyClr },
    Parked:       { bg: '#f0f4ff', color: infoClr },
    Disconnected: { bg: '#fff5f5', color: errorClr },
};

interface TripEntry {
    _id: string;
    trip_start?: { $date: string };
    trip_end?: { $date: string };
    start_address?: string;
    end_address?: string;
    distance?: string;
    duration?: string;
    status?: string;
}

const fmtDateTime = (iso: string) => {
    try {
        const d = new Date(iso);
        return (
            d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
            ' · ' +
            d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        );
    } catch { return '—'; }
};

const shortAddr = (a?: string) => a ? a.split(',').slice(0, 3).join(', ') : '—';

const inputStyle: React.CSSProperties = {
    border: `1.5px solid ${border}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 12,
    color: textPrimary,
    outline: 'none',
    background: '#fff',
    fontFamily: 'Manrope, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
};

const TripHistory: FC = () => {
    const { vehicleLocationv1, isVehicleLocationLoading } = useSelector(
        (state: RootState) => state.vehicles,
    );

    const vehicles: IvehicleLocation[] = Array.isArray(vehicleLocationv1)
        ? vehicleLocationv1.filter(v => v.vin && v.vin.trim() !== '')
        : [];

    const [search, setSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<IvehicleLocation | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(monthAgo);
    const [endDate, setEndDate]     = useState(todayStr);

    const [allTrips, setAllTrips]         = useState<TripEntry[]>([]);
    const [tripsLoading, setTripsLoading] = useState(false);
    const [tripsError, setTripsError]     = useState('');

    const filteredVehicles = vehicles.filter(v => {
        const q = search.toLowerCase();
        return (
            !q ||
            (v.registration_no || '').toLowerCase().includes(q) ||
            (v.vin || '').toLowerCase().includes(q) ||
            (v.make || '').toLowerCase().includes(q) ||
            (v.driver_name || '').toLowerCase().includes(q)
        );
    });

    const tripEntries = allTrips.filter(t => t.trip_start && t.trip_end && !t.status).slice(-10);

    const fetchTrips = async (vehicle: IvehicleLocation, from: string, to: string) => {
        setTripsLoading(true);
        setTripsError('');
        setAllTrips([]);
        try {
            const sd = `${from} 00:00:00`;
            const ed = `${to} 23:59:59`;
            const restUrl   = process.env.REACT_APP_REST_URL        || '';
            const clientId  = process.env.REACT_APP_CLIENT_ID       || '';
            const clientSec = process.env.REACT_APP_CLIENT_SECRET   || '';
            const appName   = process.env.REACT_APP_APP_NAME        || '';

            const url = `${restUrl}vc_history_trip_route_adv0?vin=${vehicle.vin}&startdate=${encodeURIComponent(sd)}&enddate=${encodeURIComponent(ed)}`;

            // eslint-disable-next-line no-console
            console.log('[TripHistory] calling:', url);

            const resp = await fetch(url, {
                method: 'GET',
                headers: {
                    'clientid':     clientId,
                    'clientsecret': clientSec,
                    'appname':      appName,
                    'accept':       '*/*',
                },
            });

            // eslint-disable-next-line no-console
            console.log('[TripHistory] status:', resp.status, resp.statusText);

            const text = await resp.text();
            // eslint-disable-next-line no-console
            console.log('[TripHistory] raw text:', text.substring(0, 500));

            const data = JSON.parse(text);
            setAllTrips(Array.isArray(data) ? (data as TripEntry[]) : []);
        } catch (err: any) {
            // eslint-disable-next-line no-console
            console.error('[TripHistory] error:', err);
            setTripsError(`Error: ${err?.message || 'unknown'}`);
        } finally {
            setTripsLoading(false);
        }
    };

    const onSelectVehicle = (v: IvehicleLocation) => {
        setSelectedVehicle(v);
        setAllTrips([]);
        setTripsError('');
        fetchTrips(v, startDate, endDate);
    };

    const onSearch = () => {
        if (selectedVehicle) fetchTrips(selectedVehicle, startDate, endDate);
    };

    return (
        <PageWrapper isProtected={true} className=''>
            <Page className='mw-100 py-0 my-0 px-0' container='fluid'>
                <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: 'Manrope, Nunito Sans, sans-serif', overflow: 'hidden', background: bg }}>

                    {/* ── LEFT: VEHICLES ─────────────────────────────────────────── */}
                    <div style={{ width: '38%', borderRight: `1px solid ${border}`, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: textPrimary, marginBottom: 12 }}>All Vehicles</div>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search plate, VIN, driver...' style={inputStyle} />
                            <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>
                                {isVehicleLocationLoading ? 'Loading...' : `${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? 's' : ''}`}
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {isVehicleLocationLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner color='secondary' size='3rem' /></div>}
                            {!isVehicleLocationLoading && filteredVehicles.length === 0 && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: textMuted }}>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🚗</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>No vehicles found</div>
                                </div>
                            )}
                            {filteredVehicles.map((v, i) => {
                                const isSelected = selectedVehicle?.vin === v.vin;
                                const sc = STATUS_STYLE[v.status] || { bg: '#f3f4f6', color: greyClr };
                                return (
                                    <div key={v.vin || i} onClick={() => onSelectVehicle(v)}
                                        style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, borderLeft: `3px solid ${isSelected ? primary : 'transparent'}`, background: isSelected ? primaryLight : '#fff', cursor: 'pointer' }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f8ff'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? primary : textPrimary }}>{v.registration_no || v.vin}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color, borderRadius: 5, padding: '2px 8px', flexShrink: 0, marginLeft: 8 }}>{v.status}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: textMuted }}>
                                            {[v.make, v.model].filter(Boolean).join(' ')}
                                            {v.driver_name ? ` · 👤 ${v.driver_name}` : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── RIGHT: TRIPS ───────────────────────────────────────────── */}
                    <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {!selectedVehicle ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: textMuted, gap: 12 }}>
                                <div style={{ fontSize: 52 }}>🗺️</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: primary }}>Select a vehicle</div>
                                <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 260, lineHeight: 1.7 }}>
                                    Pick a vehicle to view its last 10 trips
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: '16px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: textPrimary, marginBottom: 2 }}>{selectedVehicle.registration_no || selectedVehicle.vin}</div>
                                    <div style={{ fontSize: 11, color: textMuted, marginBottom: 12 }}>{[selectedVehicle.make, selectedVehicle.model, selectedVehicle.vin].filter(Boolean).join(' · ')}</div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 10, color: textMuted, marginBottom: 3, fontWeight: 600 }}>FROM</div>
                                            <input type='date' value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 10, color: textMuted, marginBottom: 3, fontWeight: 600 }}>TO</div>
                                            <input type='date' value={endDate} min={startDate} max={todayStr} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                                        </div>
                                        <button onClick={onSearch} disabled={tripsLoading}
                                            style={{ background: primary, border: 'none', borderRadius: 8, padding: '7px 20px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: tripsLoading ? 'not-allowed' : 'pointer', height: 34, opacity: tripsLoading ? 0.7 : 1 }}>
                                            {tripsLoading ? '...' : 'Search'}
                                        </button>
                                    </div>
                                    {!tripsLoading && tripEntries.length > 0 && (
                                        <div style={{ fontSize: 11, color: textMuted, marginTop: 10 }}>
                                            Last <strong>{tripEntries.length}</strong> trips · {startDate} → {endDate}
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {tripsLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spinner color='secondary' size='3rem' /></div>}

                                    {!tripsLoading && tripsError && (
                                        <div style={{ padding: '30px 20px', textAlign: 'center', color: errorClr }}>
                                            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                                            <div style={{ fontSize: 13, fontFamily: 'monospace' }}>{tripsError}</div>
                                        </div>
                                    )}

                                    {!tripsLoading && !tripsError && allTrips.length === 0 && (
                                        <div style={{ padding: '50px 20px', textAlign: 'center', color: textMuted }}>
                                            <div style={{ fontSize: 42, marginBottom: 10 }}>🗓️</div>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>No trips found</div>
                                            <div style={{ fontSize: 11, marginTop: 6 }}>Check browser console for details</div>
                                        </div>
                                    )}

                                    {!tripsLoading && !tripsError && allTrips.length > 0 && tripEntries.length === 0 && (
                                        <div style={{ padding: '20px', background: '#fffbe6', borderBottom: `1px solid ${border}` }}>
                                            <div style={{ fontSize: 12, color: '#856404', fontWeight: 600 }}>
                                                ⚠️ API returned {allTrips.length} entries but none matched trip format. Check console for raw data.
                                            </div>
                                        </div>
                                    )}

                                    {!tripsLoading && tripEntries.map((trip, idx) => (
                                        <div key={trip._id} style={{ padding: '16px', borderBottom: `1px solid ${border}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ fontSize: 13, fontWeight: 800, color: primary }}>Trip {idx + 1}</span>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {trip.distance && <span style={{ fontSize: 11, background: primaryLight, color: primary, borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>📏 {trip.distance}</span>}
                                                    {trip.duration && <span style={{ fontSize: 11, background: bg, color: textMuted, borderRadius: 20, padding: '3px 10px', border: `1px solid ${border}`, fontWeight: 600 }}>⏱ {trip.duration}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 6 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: success }} />
                                                    <div style={{ width: 2, height: 28, background: '#ddd', margin: '3px 0' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: success, marginBottom: 2 }}>
                                                        {trip.trip_start?.$date ? fmtDateTime(trip.trip_start.$date) : '—'}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: textMuted, lineHeight: 1.4 }}>{shortAddr(trip.start_address)}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: errorClr, flexShrink: 0, marginTop: 3 }} />
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: errorClr, marginBottom: 2 }}>
                                                        {trip.trip_end?.$date ? fmtDateTime(trip.trip_end.$date) : '—'}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: textMuted, lineHeight: 1.4 }}>{shortAddr(trip.end_address)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </Page>
        </PageWrapper>
    );
};

export default TripHistory;
