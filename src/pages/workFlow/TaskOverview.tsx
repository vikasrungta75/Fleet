// import React, { FC, useContext, useEffect, useState } from 'react';
// import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// import { dashboardMenu } from '../../menu';
// import { useTranslation } from 'react-i18next';
// import Page from '../../layout/Page/Page';
// import { useNavigate } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
// import ThemeContext from '../../contexts/themeContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, store } from '../../store/store';
// import { PER_COUNT } from '../../components/PaginationButtons';
// import VinSelect from '../common/filters/VinSelect';
// import DatePicker from '../../components/DatePicker';
// import { IDateRangeFilter } from '../../type/history-type';
// import {
// 	convertDatesToTimestamp,
// 	getDefaultDateRangeFilter,
// 	getDefaultFleetFilter,
// } from '../../helpers/helpers';
// import ChartCard from '../overview/components/ChartCard';
// import Header from '../workFlow/components/Header/Header'

// interface IMaintenanceDashboard { }

// const TaskOverview: FC<IMaintenanceDashboard> = () => {
// 	const { t, i18n } = useTranslation(['vehicles']);
// 	const navigate = useNavigate();
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const params = useParams();
// 	const { id } = params;

// 	const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);

// 	const [sortorder, setSortOrder] = useState<{ [key: string]: number }>({
// 		poi_name: 1,
// 		status: 1,
// 	});
// 	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

// 	const {
// 		user: {
// 			user: { userName },
// 		},
// 	} = store.getState().auth;

// 	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
// 		getDefaultDateRangeFilter(preferedTimeZone),
// 	);

// 	const dispatch = useDispatch();
// 	useEffect(() => {
// 		dispatch.tasks.getTasksAsync({
// 			Name: sortorder.poi_name,
// 			status: sortorder.status,
// 		});
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [sortorder]);
// 	const tasks = useSelector((state: RootState) => state.tasks.tasks);

// 	const [perPage, setPerPage] = useState(PER_COUNT['5']);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [vinFilter, setVinFilter] = useState<string>('All Vins');
// 	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
// 	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());
// 	const [vehivuleOrDriver, setvehivuleOrDriver] = useState('Vehicule');

// 	// Handle change
// 	const handleChange = (event: any) => {
// 		setvehivuleOrDriver(event.target.value);
// 	};

// 	const Payload = {
// 		startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
// 		enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
// 		driver_name: driverFilter,
// 	};

// 	const { temperature } = useSelector((state: RootState) => state.overview);
// 	const nbTrips = [
// 		{
// 			data: [
// 				{ x: 'MBHCZC63SJA102218', y: 83 },
// 				{ x: 'MA3NYFJ1SLB635537', y: 64 },
// 				{ x: 'MA3EUA61S00E08950', y: 39 },
// 				{ x: 'MA3CZF03SHC100322', y: 61 },
// 				{ x: 'MA3NYFJ1SLC641713', y: 76 },
// 				{ x: 'MBHEWB22SMK783757', y: 188 },
// 				{ x: 'MA3NYFF1SLB638348', y: 61 },
// 				{ x: 'MBHEWB22SKA232607', y: 17 },
// 				{ x: 'MA3RFL41SKK108723', y: 50 },
// 				{ x: 'MA3CZF63SHF132239', y: 111 },
// 				{ x: 'MA3NYFF1SLG657789', y: 60 },
// 				{ x: 'MA3EXGL1S00353072', y: 115 },
// 				{ x: 'MATAJPCY8J7A0225802', y: 30 },
// 				{ x: 'MBHCZC63SJA105819', y: 101 },
// 				{ x: 'MA3JMT81SKA102617', y: 117 },
// 			],
// 			name: 'Maximum and minimum delay per task',
// 		},
// 	];
// 	const yAxisConfig = {
// 		labels: {
// 			formatter: function (value: number) {
// 				const hours = Math.floor(value / 60);
// 				const minutes = value % 60; // remainder

// 				if (hours > 0) {
// 					return `${hours}h ${minutes}min`;
// 				}
// 				return `${minutes}min`;
// 			},
// 		},
// 		min: 0,
// 	};

// 	function convertDelayTimeData(apiData: any[]) {
// 		return apiData.map((task) => ({
// 			name: task.name,
// 			data: task.data.map((d: { x: any; y: any }) => ({
// 				x: d.x,
// 				y: parseTimeToMinutes(d.y),
// 			})),
// 		}));
// 	}

// 	function parseTimeToMinutes(timeStr: string) {
// 		if (!timeStr) return 0;
// 		const hourMatch = timeStr.match(/(\d+)\s*hour(s)?/i);
// 		const minMatch = timeStr.match(/([\d.]+)\s*min(s)?/i);

// 		const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
// 		const minutes = minMatch ? Math.round(parseFloat(minMatch[1])) : 0;

// 		return hours * 60 + minutes;
// 	}

// 	function parseDelayToMinutes(delay: string): number {
// 		if (!delay) return 0;

// 		const hourMatch = delay.match(/(\d+)\s*hour/i);
// 		const minMatch = delay.match(/(\d+)\s*min/i);
// 		const secMatch = delay.match(/(\d+)\s*sec/i);

// 		const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
// 		const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
// 		const secs = secMatch ? parseInt(secMatch[1], 10) : 0;

// 		return hours * 60 + mins + secs / 60; // minutes with decimals
// 	}

// 	var data2 = [
// 		{
// 			name: 'Series A',
// 			data: [
// 				{ x: 'Category 1', y: 30 },
// 				{ x: 'Category 2', y: 40 },
// 				{ x: 'Category 3', y: 45 },
// 				{ x: 'Category 4', y: 50 },
// 				{ x: 'Category 5', y: 49 },
// 				{ x: 'Category 6', y: 60 },
// 				{ x: 'Category 7', y: 52 },
// 				{ x: 'Category 8', y: 52 },
// 			],
// 			color: '#008FFB',
// 		},
// 		{
// 			name: 'Series B',
// 			data: [
// 				{ x: 'Category 1', y: 25 },
// 				{ x: 'Category 2', y: 32 },
// 				{ x: 'Category 3', y: 36 },
// 				{ x: 'Category 4', y: 40 },
// 				{ x: 'Category 5', y: 39 },
// 				{ x: 'Category 6', y: 52 },
// 				{ x: 'Category 7', y: 52 },
// 				{ x: 'Category 8', y: 52 },
// 			],
// 			color: '#00E396',
// 		},
// 		{
// 			name: 'Series C',
// 			data: [
// 				{ x: 'Category 1', y: 20 },
// 				{ x: 'Category 2', y: 29 },
// 				{ x: 'Category 3', y: 33 },
// 				{ x: 'Category 4', y: 38 },
// 				{ x: 'Category 5', y: 37 },
// 				{ x: 'Category 6', y: 44 },
// 				{ x: 'Category 7', y: 52 },
// 				{ x: 'Category 8', y: 52 },
// 			],
// 			color: '#FEB019',
// 		},
// 	];
// 	useEffect(() => {
// 		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
// 		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;

// 		dispatch.tasks.getTaskNoDeliver({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTaskNoDeliverInTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTaskNoDeliverCanceledDeliveries({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTotalDeliveryTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.gettotalDelayTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTotalOfEachStatus({ startDate, endDate, vinFilter });

// 		dispatch.tasks.getNumberOfDelaysEvent({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getAverageDelayPerTask({ startDate, endDate, vinFilter });

// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [dateRangeFilter, vinFilter, vehivuleOrDriver, driverFilter, id]);

// 	const {
// 		getTaskNoDeliver: isTaskNoDeliverDataLoading,
// 		getTaskNoDeliverInTime: isTaskNoDeliverInTimeDataLoading,
// 		getTaskNoDeliverCanceledDeliveries: isTaskNoDeliveCanceledDataLoading,
// 		getTotalDeliveryTime: isTotalDeliveryTimeDataLoading,
// 		gettotalDelayTime: isTotalDelayTimeDataLoading,
// 		getTotalOfEachStatus: isTotalOfEachStatusDataLoading,
// 		getNumberOfDelaysEvent: isnumberOfDelaysEventDataLoading,
// 		getAverageDelayPerTask: isaverageDelayPerTaskDataLoading,
// 		getTasksAsync: igetTasksAsynckDataLoading,
// 	} = useSelector((state: RootState) => state.loading.effects.tasks);

// 	const {
// 		taskNoDeliver,
// 		taskNoDeliverInTime,
// 		numberOfCanceledDeliveries,
// 		TotalDeliveryTime,
// 		totalDelayTime,
// 		totalOfEachStatus,
// 		numberOfDelaysEvent,
// 		averageDelayPerTask,
// 	} = useSelector((state: RootState) => state.tasks);

// 	// ---------- ONLY CHANGES BELOW (helpers + converters + tooltip) ----------

// 	// Safe date parsing so DD/MM/YYYY also formats nicely
// 	function safeParseDate(raw: any): Date | null {
// 		if (raw == null) return null;

// 		const d1 = new Date(raw as any);
// 		if (!isNaN(d1.getTime())) return d1;

// 		if (typeof raw === 'string') {
// 			const m = raw.match(
// 				/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
// 			);
// 			if (m) {
// 				const day = parseInt(m[1], 10);
// 				const month = parseInt(m[2], 10) - 1;
// 				const year = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
// 				const hh = m[4] ? parseInt(m[4], 10) : 0;
// 				const mm = m[5] ? parseInt(m[5], 10) : 0;
// 				const ss = m[6] ? parseInt(m[6], 10) : 0;
// 				const d2 = new Date(year, month, day, hh, mm, ss);
// 				if (!isNaN(d2.getTime())) return d2;
// 			}
// 		}

// 		if (typeof raw === 'number') {
// 			const d3 = new Date(raw);
// 			if (!isNaN(d3.getTime())) return d3;
// 		}
// 		return null;
// 	}
// 	function shortDayMonth(d: Date | null) {
// 		return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '';
// 	}
// 	function dayMonthYear(d: Date | null) {
// 		return d
// 			? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
// 			: '';
// 	}

// 	const tooltipXWithYear = {
// 		formatter: (_: any, { seriesIndex, dataPointIndex, w }: any) => {
// 			const pt = w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
// 			const raw = pt?.fullDate ?? pt?.x;
// 			const d = safeParseDate(raw);
// 			return d ? dayMonthYear(d) : String(raw ?? '');
// 		},
// 	};

// 	function convertAvgDelayData(api: any[]) {
// 		return (api || []).map((series) => ({
// 			name: series.name,
// 			data: (series.data || []).map((item: any) => {
// 				const d = safeParseDate(item.date);
// 				const label = shortDayMonth(d); // "17 Sep"
// 				const minutes = parseDelayToMinutes(item.avg_delay);
// 				return { x: label, y: Math.round(minutes * 100) / 100, fullDate: item.date };
// 			}),
// 		}));
// 	}

// 	function convertDelaysEventForBar(series: any[]) {
// 		return (series || []).map((s: any) => ({
// 			name: s.name,
// 			data: (s.data || []).map((pt: any) => {
// 				const rawX = Array.isArray(pt) ? pt[0] : pt?.date ?? pt?.x;
// 				const rawY = Array.isArray(pt) ? pt[1] : pt?.value ?? pt?.y;
// 				const d = safeParseDate(rawX);
// 				const label = shortDayMonth(d);
// 				return { x: label, y: Number(rawY ?? 0), fullDate: rawX };
// 			}),
// 		}));
// 	}

// 	// Used for BOTH "Number Of Deliveries" and "Number Of Deliveries In Time"
// 	function convertDeliveriesForBar(series: any[]) {
// 		return (series || []).map((s: any) => ({
// 			name: s.name,
// 			data: (s.data || []).map((pt: any) => {
// 				const rawX = Array.isArray(pt) ? pt[0] : pt?.date ?? pt?.x;
// 				const rawY = Array.isArray(pt) ? pt[1] : pt?.value ?? pt?.y;
// 				const d = safeParseDate(rawX);
// 				const label = shortDayMonth(d); // "17 Sep", "18 Sep"
// 				return { x: label, y: Number(rawY ?? 0), fullDate: rawX };
// 			}),
// 		}));
// 	}

// 	// ---------- END of changes ----------

// 	return (
// 		<PageWrapper isProtected={true} title={dashboardMenu.Workflow.text}>
// 			<Page className='mw-100 px-1'>
// 				<div className='mw-100 mb-3'>
// 					<div
// 						className={
// 							!mobileDesign
// 								? 'd-flex justify-content-between align-items-center col-12'
// 								: ''
// 						}>
// 						<div className='d-flex'></div>
// 					</div>
// 				</div>
// 				<div className='mw-100 d-flex justify-content-between align-items-center mt-n3'>
// 					<div
// 						className={
// 							!mobileDesign
// 								? 'd-flex justify-content-between align-items-center col-12'
// 								: ''
// 						}>
// 						<div id='vehicle_usage'>
// 							<div className='d-flex align-items-center bd-highlight mb-3'>
// 								<div className='flex-fill bd-highlight fs-4 fw-semibold content-heading'>
// 									{t('Task overview')}
// 								</div>
// 							</div>
// 						</div>
// 						<div className={`row ${!mobileDesign ? 'justify-content-end' : ''}`}>
// 							<DatePicker
// 								className={`position-relative ${mobileDesign ? 'col-12 mb-3' : 'col-4 me-3 mb-3'
// 									}`}
// 								setDateRangeFilter={setDateRangeFilter}
// 								dateRangeFilter={dateRangeFilter}
// 								withHours={false}
// 								position={i18n.language === 'ar-AR' ? 'start' : 'end'}
// 								isLoading={isTaskNoDeliverDataLoading}
// 							/>
// 							{/* <VinSelect
// 								style={{ marginLeft: '42px' }}
// 								className={`${mobileDesign ? 'col-12 mb-3' : 'col-4'}`}
// 								fleetNameFilter={fleetNameFilter}
// 								setVinFilter={setVinFilter}
// 								vinFilter={vinFilter}
// 							/>
// 							<Header
// 								style={{}}
// 								driverFilter={driverFilter}
// 								setDriverFilter={setDriverFilter}
// 								driverUrlName={id}
// 								withDriverSelect={true}
// 								setDateRangeFilter={setDateRangeFilter}
// 								dateRangeFilter={dateRangeFilter}
// 							/> */}
// 							{vehivuleOrDriver === 'Vehicule' ? (
// 								<VinSelect
// 									style={{ marginLeft: '42px' }}
// 									className={`${mobileDesign ? 'col-12 mb-3' : 'col-4'}`}
// 									fleetNameFilter={fleetNameFilter}
// 									setVinFilter={setVinFilter}
// 									vinFilter={vinFilter}
// 								/>
// 							) : (
// 								<div style={{ position: 'relative' }}>
// 									<Header
// 										style={{ marginLeft: '42px', width: '38%' }}
// 										driverFilter={driverFilter}
// 										setDriverFilter={setDriverFilter}
// 										driverUrlName={id}
// 										withDriverSelect={true}
// 										setDateRangeFilter={setDateRangeFilter}
// 										dateRangeFilter={dateRangeFilter}
// 									/>
// 								</div>

// 							)}
// 							<div
// 								className={`d-flex align-items-center ${mobileDesign ? 'col-12 mb-3' : 'col-3 mb-3'
// 									}`}>
// 								<div className='d-flex align-items-center gap-2 me-4'>
// 									<div>
// 										<input
// 											style={{ accentColor: '#F00D69' }}
// 											id='Vehicule'
// 											type='radio'
// 											name='vehivuleordriver'
// 											value='Vehicule'
// 											checked={vehivuleOrDriver === 'Vehicule'}
// 											onChange={handleChange}
// 										/>
// 									</div>
// 									<div>
// 										<label htmlFor='Vehicule' style={{ marginRight: '5px' }}>
// 											{t('Vehicle')}
// 										</label>
// 									</div>
// 								</div>
// 								<div className='d-flex align-items-center gap-2 me-4'>
// 									<div>
// 										{' '}
// 										<input
// 											style={{ accentColor: '#F00D69' }}
// 											id='Driver'
// 											type='radio'
// 											name='vehivuleordriver'
// 											value='Driver'
// 											checked={vehivuleOrDriver === 'Driver'}
// 											onChange={handleChange}
// 										/>
// 										<div></div>
// 									</div>
// 									<div>
// 										<label htmlFor='Driver' style={{ marginRight: '5px' }}>
// 											{t('Driver')}
// 										</label>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 				<div className='mt-4 row'>
// 					<div style={{ width: '33.33333333%' }}>
// 						<ChartCard
// 							col='w-100'
// 							series={totalOfEachStatus}
// 							chartHeight={300}
// 							chartType='pie'
// 							timestamps
// 							color={['#000']}
// 							isLoading={isTotalOfEachStatusDataLoading}
// 							secondary
// 						/>
// 					</div>

// 					<div style={{ width: '66.66666667%' }}>
// 						<ChartCard
// 							lineColors={['#BEE5FB']}
// 							col='w-100'
// 							secondary
// 							marker={4}
// 							markerColor={['#0F9FF0']}
// 							series={convertDelayTimeData(totalDelayTime)}
// 							chartType='bar'
// 							chartHeight={300}
// 							yAxisConfig={{
// 								labels: {
// 									formatter: (value: number) => {
// 										const hours = Math.floor(value / 60);
// 										const minutes = Math.round(value % 60);
// 										return hours > 0
// 											? `${hours}h ${minutes}min`
// 											: `${minutes}min`;
// 									},
// 								},
// 							}}
// 							tooltipConfig={{
// 								y: {
// 									formatter: (value: number) => {
// 										const hours = Math.floor(value / 60);
// 										const minutes = Math.round(value % 60);
// 										return hours > 0
// 											? `${hours}h ${minutes}min`
// 											: `${minutes}min`;
// 									},
// 								},
// 								x: { show: false },
// 							}}
// 							isLoading={false}
// 						/>
// 					</div>

// 					<div style={{ width: '50%' }}>
// 						<ChartCard
// 							header='Average delay per task'
// 							col='w-100'
// 							series={convertAvgDelayData(averageDelayPerTask)}
// 							chartType='bar'
// 							chartHeight={300}
// 							secondary
// 							yAxisConfig={{
// 								labels: {
// 									formatter: (value: number) => {
// 										const hours = Math.floor(value / 60);
// 										const minutes = Math.floor(value % 60);
// 										return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
// 									},
// 								},
// 							}}
// 							tooltipConfig={{
// 								x: tooltipXWithYear,
// 								y: {
// 									formatter: (value: number) => {
// 										const hours = Math.floor(value / 60);
// 										const minutes = Math.floor(value % 60);
// 										const secs = Math.round((value * 60) % 60);
// 										return hours > 0
// 											? `${hours}h ${minutes}m ${secs}s`
// 											: `${minutes}m ${secs}s`;
// 									},
// 								},
// 							}}
// 							isLoading={isaverageDelayPerTaskDataLoading}
// 						/>
// 					</div>

// 					<div style={{ width: '50%' }}>
// 						<ChartCard
// 							header={'Number of delays event'}
// 							color={['#BEE5FB', '#D9FBBE', '#E4E4E4', '#FEDCDC']}
// 							lineColors={['#BEE5FB', '#D9FBBE', '#E4E4E4', '#FEDCDC']}
// 							col='col-6'
// 							secondary
// 							marker={4}
// 							markerColor={['#0F9FF0']}
// 							series={convertDelaysEventForBar(numberOfDelaysEvent)}
// 							chartHeight={300}
// 							chartType='bar'
// 							tooltipConfig={{ x: tooltipXWithYear }}
// 							// timestamps
// 							isLoading={isnumberOfDelaysEventDataLoading}
// 							lengthSeries={temperature?.length}
// 							showLegend
// 						/>
// 					</div>

// 					<div style={{ width: '33.33333333%' }}>
// 						<ChartCard
// 							color={['#8174d9']}
// 							lineColors={['#8174d9']}
// 							col='col-4'
// 							secondary
// 							series={convertDatesToTimestamp(TotalDeliveryTime)}
// 							chartHeight={300}
// 							chartType='line'
// 							timestamps
// 							isLoading={isTotalDeliveryTimeDataLoading}
// 							lengthSeries={temperature?.length}
// 						/>
// 					</div>

// 					{/* Number Of Deliveries */}
// 					<div style={{ width: '33.33333333%' }}>
// 						<ChartCard
// 							color={['#8174d9']}
// 							lineColors={['#8174d9']}
// 							col='col-4'
// 							secondary
// 							series={convertDeliveriesForBar(taskNoDeliver)}
// 							chartHeight={300}
// 							chartType='bar'
// 							tooltipConfig={{ x: tooltipXWithYear }}
// 							// timestamps
// 							isLoading={isaverageDelayPerTaskDataLoading}
// 							lengthSeries={temperature?.length}
// 						/>
// 					</div>

// 					{/* Number Of Deliveries In Time */}
// 					<div style={{ width: '33.33333333%' }}>
// 						<ChartCard
// 							color={['#8174d9']}
// 							lineColors={['#8174d9']}
// 							col='col-4'
// 							secondary
// 							series={convertDeliveriesForBar(taskNoDeliverInTime)}
// 							chartHeight={300}
// 							chartType='bar'
// 							tooltipConfig={{ x: tooltipXWithYear }}
// 							// timestamps
// 							isLoading={isTaskNoDeliverInTimeDataLoading}
// 							lengthSeries={temperature?.length}
// 						/>
// 					</div>

// 					<div style={{ width: '33.33333333%' }}>
// 						<ChartCard
// 							color={['#8174d9']}
// 							lineColors={['#8174d9']}
// 							col='col-4'
// 							secondary
// 							series={convertDatesToTimestamp(numberOfCanceledDeliveries)}
// 							chartHeight={300}
// 							chartType='line'
// 							timestamps
// 							isLoading={isTaskNoDeliveCanceledDataLoading}
// 							lengthSeries={temperature?.length}
// 						/>
// 					</div>
// 				</div>
// 			</Page>
// 		</PageWrapper>
// 	);
// };

// export default TaskOverview;



// import React, { FC, useContext, useEffect, useState } from 'react';
// import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// import { dashboardMenu } from '../../menu';
// import { useTranslation } from 'react-i18next';
// import Page from '../../layout/Page/Page';
// import { useNavigate, useParams } from 'react-router-dom';
// import ThemeContext from '../../contexts/themeContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, store } from '../../store/store';
// import { PER_COUNT } from '../../components/PaginationButtons';
// import VinSelect from '../common/filters/VinSelect';
// import DatePicker from '../../components/DatePicker';
// import { IDateRangeFilter } from '../../type/history-type';
// import {
// 	convertDatesToTimestamp,
// 	getDefaultDateRangeFilter,
// 	getDefaultFleetFilter,
// } from '../../helpers/helpers';
// import ChartCard from '../overview/components/ChartCard';
// import Header from '../workFlow/components/Header/Header';

// interface IMaintenanceDashboard { }

// const TaskOverview: FC<IMaintenanceDashboard> = () => {
// 	const { t, i18n } = useTranslation(['vehicles']);
// 	const navigate = useNavigate();
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const params = useParams();
// 	const { id } = params;

// 	const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);

// 	const [sortorder, setSortOrder] = useState<{ [key: string]: number }>({
// 		poi_name: 1,
// 		status: 1,
// 	});
// 	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

// 	const {
// 		user: {
// 			user: { userName },
// 		},
// 	} = store.getState().auth;

// 	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
// 		getDefaultDateRangeFilter(preferedTimeZone),
// 	);

// 	const dispatch = useDispatch();
// 	useEffect(() => {
// 		dispatch.tasks.getTasksAsync({
// 			Name: sortorder.poi_name,
// 			status: sortorder.status,
// 		});
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [sortorder]);

// 	const [perPage, setPerPage] = useState(PER_COUNT['5']);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [vinFilter, setVinFilter] = useState<string>('All Vins');
// 	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
// 	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());
// 	const [vehivuleOrDriver, setvehivuleOrDriver] = useState('Vehicule');

// 	const handleChange = (event: any) => {
// 		setvehivuleOrDriver(event.target.value);
// 	};

// 	const Payload = {
// 		startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
// 		enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
// 		driver_name: driverFilter,
// 	};

// 	const { temperature } = useSelector((state: RootState) => state.overview);
// 	const tasks = useSelector((state: RootState) => state.tasks.tasks);

// 	useEffect(() => {
// 		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
// 		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;

// 		dispatch.tasks.getTaskNoDeliver({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTaskNoDeliverInTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTaskNoDeliverCanceledDeliveries({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTotalDeliveryTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.gettotalDelayTime({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getTotalOfEachStatus({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getNumberOfDelaysEvent({ startDate, endDate, vinFilter });
// 		dispatch.tasks.getAverageDelayPerTask({ startDate, endDate, vinFilter });
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [dateRangeFilter, vinFilter, vehivuleOrDriver, driverFilter, id]);

// 	const {
// 		getTaskNoDeliver: isTaskNoDeliverDataLoading,
// 		getTaskNoDeliverInTime: isTaskNoDeliverInTimeDataLoading,
// 		getTaskNoDeliverCanceledDeliveries: isTaskNoDeliveCanceledDataLoading,
// 		getTotalDeliveryTime: isTotalDeliveryTimeDataLoading,
// 		gettotalDelayTime: isTotalDelayTimeDataLoading,
// 		getTotalOfEachStatus: isTotalOfEachStatusDataLoading,
// 		getNumberOfDelaysEvent: isnumberOfDelaysEventDataLoading,
// 		getAverageDelayPerTask: isaverageDelayPerTaskDataLoading,
// 	} = useSelector((state: RootState) => state.loading.effects.tasks);

// 	const {
// 		taskNoDeliver,
// 		taskNoDeliverInTime,
// 		numberOfCanceledDeliveries,
// 		TotalDeliveryTime,
// 		totalDelayTime,
// 		totalOfEachStatus,
// 		numberOfDelaysEvent,
// 		averageDelayPerTask,
// 	} = useSelector((state: RootState) => state.tasks);

// 	// ----------- UI Starts -----------
// 	return (
// 		<PageWrapper isProtected={true} title={dashboardMenu.Workflow.text}>
// 			<Page className='mw-100 px-1'>
// 				<div className='mw-100 mb-3'>
// 					<div
// 						className={
// 							!mobileDesign
// 								? 'd-flex justify-content-between align-items-center col-12'
// 								: ''
// 						}>
// 						<div className='d-flex'></div>
// 					</div>
// 				</div>

// 				<div className='mw-100 d-flex justify-content-between align-items-center mt-n3'>
// 					<div
// 						className={
// 							!mobileDesign
// 								? 'd-flex justify-content-between align-items-center col-12'
// 								: ''
// 						}>
// 						<div id='vehicle_usage'>
// 							<div className='d-flex align-items-center bd-highlight mb-3'>
// 								<div className='flex-fill bd-highlight fs-4 fw-semibold content-heading'>
// 									{t('Task overview')}
// 								</div>
// 							</div>
// 						</div>

// 						{/* FILTER ROW */}
// 						<div className={`row ${!mobileDesign ? 'justify-content-end align-items-center' : ''}`} style={{ width: '100%' }}>
// 							{/* Common DatePicker */}
// 							<DatePicker
// 								className={`position-relative ${mobileDesign ? 'col-12 mb-3' : 'col-3 me-3 mb-3'}`}
// 								setDateRangeFilter={setDateRangeFilter}
// 								dateRangeFilter={dateRangeFilter}
// 								withHours={false}
// 								position={i18n.language === 'ar-AR' ? 'start' : 'end'}
// 								isLoading={isTaskNoDeliverDataLoading}
// 							/>

// 							{/* Dynamic Filter: Vehicle or Driver */}
// 							{vehivuleOrDriver === 'Vehicule' ? (
// 								<VinSelect
// 									style={{ marginRight: '20px', width: '25%' }}
// 									className={`${mobileDesign ? 'col-12 mb-3' : 'col-3 mb-3'}`}
// 									fleetNameFilter={fleetNameFilter}
// 									setVinFilter={setVinFilter}
// 									vinFilter={vinFilter}
// 								/>
// 							) : (
// 								<div style={{ width: '45%', marginRight: '20px' }}>
// 									<Header
// 										style={{ width: '100%' }}
// 										driverFilter={driverFilter}
// 										setDriverFilter={setDriverFilter}
// 										driverUrlName={id}
// 										withDriverSelect={true}
// 										dateRangeFilter={{
// 											startDate: '',
// 											endDate: '',
// 											startTime: '',
// 											endTime: '',
// 										}}
// 										setDateRangeFilter={() => { }}
// 									/>
// 								</div>

// 							)}

// 							{/* Radio Buttons */}
// 							<div className={`d-flex align-items-center ${mobileDesign ? 'col-12 mb-3' : 'col-3 mb-3'}`}>
// 								<div className='d-flex align-items-center gap-4'>
// 									<div className='d-flex align-items-center gap-2'>
// 										<input
// 											style={{ accentColor: '#F00D69' }}
// 											id='Vehicule'
// 											type='radio'
// 											name='vehivuleordriver'
// 											value='Vehicule'
// 											checked={vehivuleOrDriver === 'Vehicule'}
// 											onChange={handleChange}
// 										/>
// 										<label htmlFor='Vehicule'>{t('Vehicle')}</label>
// 									</div>
// 									<div className='d-flex align-items-center gap-2'>
// 										<input
// 											style={{ accentColor: '#F00D69' }}
// 											id='Driver'
// 											type='radio'
// 											name='vehivuleordriver'
// 											value='Driver'
// 											checked={vehivuleOrDriver === 'Driver'}
// 											onChange={handleChange}
// 										/>
// 										<label htmlFor='Driver'>{t('Driver')}</label>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				{/* Rest of charts remain unchanged */}
// 				{/* ... your existing chart layout code here ... */}
// 			</Page>
// 		</PageWrapper>
// 	);
// };

// export default TaskOverview;



import React, { FC, useContext, useEffect, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { dashboardMenu } from '../../menu';
import { useTranslation } from 'react-i18next';
import Page from '../../layout/Page/Page';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ThemeContext from '../../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../store/store';
import { PER_COUNT } from '../../components/PaginationButtons';
import VinSelect from '../common/filters/VinSelect';
import DatePicker from '../../components/DatePicker';
import { IDateRangeFilter } from '../../type/history-type';
import {
	convertDatesToTimestamp,
	getDefaultDateRangeFilter,
	getDefaultFleetFilter,
} from '../../helpers/helpers';
import ChartCard from '../overview/components/ChartCard';
import Header from '../workFlow/components/Header/Header';

interface IMaintenanceDashboard { }

const TaskOverview: FC<IMaintenanceDashboard> = () => {
	const { t, i18n } = useTranslation(['vehicles']);
	const navigate = useNavigate();
	const { mobileDesign } = useContext(ThemeContext);
	const params = useParams();
	const { id } = params;

	const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);

	const [sortorder, setSortOrder] = useState<{ [key: string]: number }>({
		poi_name: 1,
		status: 1,
	});
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const {
		user: {
			user: { userName },
		},
	} = store.getState().auth;

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const dispatch = useDispatch();
	useEffect(() => {
		dispatch.tasks.getTasksAsync({
			Name: sortorder.poi_name,
			status: sortorder.status,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortorder]);
	const tasks = useSelector((state: RootState) => state.tasks.tasks);

	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const [currentPage, setCurrentPage] = useState(1);
	const [vinFilter, setVinFilter] = useState<string>('All Vins');
	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
	const [fleetNameFilter, setFleetNameFilter] = useState<string>(getDefaultFleetFilter());
	const [vehivuleOrDriver, setvehivuleOrDriver] = useState('Vehicule');

	// Handle change
	const handleChange = (event: any) => {
		setvehivuleOrDriver(event.target.value);
	};

	const Payload = {
		startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
		enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
		driver_name: driverFilter,
	};

	const { temperature } = useSelector((state: RootState) => state.overview);
	const nbTrips = [
		{
			data: [
				{ x: 'MBHCZC63SJA102218', y: 83 },
				{ x: 'MA3NYFJ1SLB635537', y: 64 },
				{ x: 'MA3EUA61S00E08950', y: 39 },
				{ x: 'MA3CZF03SHC100322', y: 61 },
				{ x: 'MA3NYFJ1SLC641713', y: 76 },
				{ x: 'MBHEWB22SMK783757', y: 188 },
				{ x: 'MA3NYFF1SLB638348', y: 61 },
				{ x: 'MBHEWB22SKA232607', y: 17 },
				{ x: 'MA3RFL41SKK108723', y: 50 },
				{ x: 'MA3CZF63SHF132239', y: 111 },
				{ x: 'MA3NYFF1SLG657789', y: 60 },
				{ x: 'MA3EXGL1S00353072', y: 115 },
				{ x: 'MATAJPCY8J7A0225802', y: 30 },
				{ x: 'MBHCZC63SJA105819', y: 101 },
				{ x: 'MA3JMT81SKA102617', y: 117 },
			],
			name: 'Maximum and minimum delay per task',
		},
	];
	const yAxisConfig = {
		labels: {
			formatter: function (value: number) {
				const hours = Math.floor(value / 60);
				const minutes = value % 60; // remainder

				if (hours > 0) {
					return `${hours}h ${minutes}min`;
				}
				return `${minutes}min`;
			},
		},
		min: 0,
	};

	function convertDelayTimeData(apiData: any[]) {
		return apiData.map((task) => ({
			name: task.name,
			data: task.data.map((d: { x: any; y: any }) => ({
				x: d.x,
				y: parseTimeToMinutes(d.y),
			})),
		}));
	}

	function parseTimeToMinutes(timeStr: string) {
		if (!timeStr) return 0;
		const hourMatch = timeStr.match(/(\d+)\s*hour(s)?/i);
		const minMatch = timeStr.match(/([\d.]+)\s*min(s)?/i);

		const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
		const minutes = minMatch ? Math.round(parseFloat(minMatch[1])) : 0;

		return hours * 60 + minutes;
	}

	function parseDelayToMinutes(delay: string): number {
		if (!delay) return 0;

		const hourMatch = delay.match(/(\d+)\s*hour/i);
		const minMatch = delay.match(/(\d+)\s*min/i);
		const secMatch = delay.match(/(\d+)\s*sec/i);

		const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
		const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
		const secs = secMatch ? parseInt(secMatch[1], 10) : 0;

		return hours * 60 + mins + secs / 60; // minutes with decimals
	}

	var data2 = [
		{
			name: 'Series A',
			data: [
				{ x: 'Category 1', y: 30 },
				{ x: 'Category 2', y: 40 },
				{ x: 'Category 3', y: 45 },
				{ x: 'Category 4', y: 50 },
				{ x: 'Category 5', y: 49 },
				{ x: 'Category 6', y: 60 },
				{ x: 'Category 7', y: 52 },
				{ x: 'Category 8', y: 52 },
			],
			color: '#008FFB',
		},
		{
			name: 'Series B',
			data: [
				{ x: 'Category 1', y: 25 },
				{ x: 'Category 2', y: 32 },
				{ x: 'Category 3', y: 36 },
				{ x: 'Category 4', y: 40 },
				{ x: 'Category 5', y: 39 },
				{ x: 'Category 6', y: 52 },
				{ x: 'Category 7', y: 52 },
				{ x: 'Category 8', y: 52 },
			],
			color: '#00E396',
		},
		{
			name: 'Series C',
			data: [
				{ x: 'Category 1', y: 20 },
				{ x: 'Category 2', y: 29 },
				{ x: 'Category 3', y: 33 },
				{ x: 'Category 4', y: 38 },
				{ x: 'Category 5', y: 37 },
				{ x: 'Category 6', y: 44 },
				{ x: 'Category 7', y: 52 },
				{ x: 'Category 8', y: 52 },
			],
			color: '#FEB019',
		},
	];
	useEffect(() => {
		let startDate = `${dateRangeFilter?.startDate}T${dateRangeFilter?.startTime}`;
		let endDate = `${dateRangeFilter?.endDate}T${dateRangeFilter?.endTime}`;

		dispatch.tasks.getTaskNoDeliver({ startDate, endDate, vinFilter });
		dispatch.tasks.getTaskNoDeliverInTime({ startDate, endDate, vinFilter });
		dispatch.tasks.getTaskNoDeliverCanceledDeliveries({ startDate, endDate, vinFilter });
		dispatch.tasks.getTotalDeliveryTime({ startDate, endDate, vinFilter });
		dispatch.tasks.gettotalDelayTime({ startDate, endDate, vinFilter });
		dispatch.tasks.getTotalOfEachStatus({ startDate, endDate, vinFilter });

		dispatch.tasks.getNumberOfDelaysEvent({ startDate, endDate, vinFilter });
		dispatch.tasks.getAverageDelayPerTask({ startDate, endDate, vinFilter });

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, vinFilter, vehivuleOrDriver, driverFilter, id]);

	const {
		getTaskNoDeliver: isTaskNoDeliverDataLoading,
		getTaskNoDeliverInTime: isTaskNoDeliverInTimeDataLoading,
		getTaskNoDeliverCanceledDeliveries: isTaskNoDeliveCanceledDataLoading,
		getTotalDeliveryTime: isTotalDeliveryTimeDataLoading,
		gettotalDelayTime: isTotalDelayTimeDataLoading,
		getTotalOfEachStatus: isTotalOfEachStatusDataLoading,
		getNumberOfDelaysEvent: isnumberOfDelaysEventDataLoading,
		getAverageDelayPerTask: isaverageDelayPerTaskDataLoading,
		getTasksAsync: igetTasksAsynckDataLoading,
	} = useSelector((state: RootState) => state.loading.effects.tasks);

	const {
		taskNoDeliver,
		taskNoDeliverInTime,
		numberOfCanceledDeliveries,
		TotalDeliveryTime,
		totalDelayTime,
		totalOfEachStatus,
		numberOfDelaysEvent,
		averageDelayPerTask,
	} = useSelector((state: RootState) => state.tasks);

	// ---------- ONLY CHANGES BELOW (helpers + converters + tooltip) ----------

	// Safe date parsing so DD/MM/YYYY also formats nicely
	function safeParseDate(raw: any): Date | null {
		if (raw == null) return null;

		const d1 = new Date(raw as any);
		if (!isNaN(d1.getTime())) return d1;

		if (typeof raw === 'string') {
			const m = raw.match(
				/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
			);
			if (m) {
				const day = parseInt(m[1], 10);
				const month = parseInt(m[2], 10) - 1;
				const year = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
				const hh = m[4] ? parseInt(m[4], 10) : 0;
				const mm = m[5] ? parseInt(m[5], 10) : 0;
				const ss = m[6] ? parseInt(m[6], 10) : 0;
				const d2 = new Date(year, month, day, hh, mm, ss);
				if (!isNaN(d2.getTime())) return d2;
			}
		}

		if (typeof raw === 'number') {
			const d3 = new Date(raw);
			if (!isNaN(d3.getTime())) return d3;
		}
		return null;
	}
	function shortDayMonth(d: Date | null) {
		return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '';
	}
	function dayMonthYear(d: Date | null) {
		return d
			? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
			: '';
	}

	const tooltipXWithYear = {
		formatter: (_: any, { seriesIndex, dataPointIndex, w }: any) => {
			const pt = w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
			const raw = pt?.fullDate ?? pt?.x;
			const d = safeParseDate(raw);
			return d ? dayMonthYear(d) : String(raw ?? '');
		},
	};

	function convertAvgDelayData(api: any[]) {
		return (api || []).map((series) => ({
			name: series.name,
			data: (series.data || []).map((item: any) => {
				const d = safeParseDate(item.date);
				const label = shortDayMonth(d); // "17 Sep"
				const minutes = parseDelayToMinutes(item.avg_delay);
				return { x: label, y: Math.round(minutes * 100) / 100, fullDate: item.date };
			}),
		}));
	}

	function convertDelaysEventForBar(series: any[]) {
		return (series || []).map((s: any) => ({
			name: s.name,
			data: (s.data || []).map((pt: any) => {
				const rawX = Array.isArray(pt) ? pt[0] : pt?.date ?? pt?.x;
				const rawY = Array.isArray(pt) ? pt[1] : pt?.value ?? pt?.y;
				const d = safeParseDate(rawX);
				const label = shortDayMonth(d);
				return { x: label, y: Number(rawY ?? 0), fullDate: rawX };
			}),
		}));
	}

	// Used for BOTH "Number Of Deliveries" and "Number Of Deliveries In Time"
	function convertDeliveriesForBar(series: any[]) {
		return (series || []).map((s: any) => ({
			name: s.name,
			data: (s.data || []).map((pt: any) => {
				const rawX = Array.isArray(pt) ? pt[0] : pt?.date ?? pt?.x;
				const rawY = Array.isArray(pt) ? pt[1] : pt?.value ?? pt?.y;
				const d = safeParseDate(rawX);
				const label = shortDayMonth(d); // "17 Sep", "18 Sep"
				return { x: label, y: Number(rawY ?? 0), fullDate: rawX };
			}),
		}));
	}

	// ---------- END of changes ----------

	return (
		<PageWrapper isProtected={true} title={dashboardMenu.Workflow.text}>
			<Page className='mw-100 px-1'>
				<div className='mw-100 mb-3'>
					<div
						className={
							!mobileDesign
								? 'd-flex justify-content-between align-items-center col-12 flex-wrap'
								: ''
						}>
						<div id='vehicle_usage'>
							<div className='d-flex align-items-center bd-highlight mb-3'>
								<div className='flex-fill bd-highlight fs-4 fw-semibold content-heading'>
									{t('Task overview')}
								</div>
							</div>
						</div>

						<div
							className={`d-flex align-items-center justify-content-end gap-3 flex-wrap ${mobileDesign ? 'flex-column' : ''}`}
							style={{ width: '100%',marginTop:"-42px" }}>

							{/* Date Picker */}
							<DatePicker
								className={`position-relative ${mobileDesign ? 'col-12 mb-3' : ''}`}
								setDateRangeFilter={setDateRangeFilter}
								dateRangeFilter={dateRangeFilter}
								withHours={false}
								position={i18n.language === 'ar-AR' ? 'start' : 'end'}
								isLoading={isTaskNoDeliverDataLoading}
							/>

							{/* VIN or Driver Select */}
							{vehivuleOrDriver === 'Vehicule' ? (
								<VinSelect
									className={`${mobileDesign ? 'col-12 mb-3' : 'col-2'}`}
									fleetNameFilter={fleetNameFilter}
									setVinFilter={setVinFilter}
									vinFilter={vinFilter}
								/>
							) : (
								<div style={{ width: '20%',position:"relative"}}>
									<Header
										style={{ width: '100%', }}
										driverFilter={driverFilter}
										setDriverFilter={setDriverFilter}
										driverUrlName={id}
										withDriverSelect={true}
										setDateRangeFilter={setDateRangeFilter}
										dateRangeFilter={dateRangeFilter}
									/>
								</div>
							)}

							{/* Radio buttons */}
							<div className='d-flex align-items-center gap-4'>
								<div className='d-flex align-items-center gap-2'>
									<input
										style={{ accentColor: '#F00D69' }}
										id='Vehicule'
										type='radio'
										name='vehivuleordriver'
										value='Vehicule'
										checked={vehivuleOrDriver === 'Vehicule'}
										onChange={handleChange}
									/>
									<label htmlFor='Vehicule'>{t('Vehicle')}</label>
								</div>
								<div className='d-flex align-items-center gap-2'>
									<input
										style={{ accentColor: '#F00D69' }}
										id='Driver'
										type='radio'
										name='vehivuleordriver'
										value='Driver'
										checked={vehivuleOrDriver === 'Driver'}
										onChange={handleChange}
									/>
									<label htmlFor='Driver'>{t('Driver')}</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='mt-4 row'>
					<div style={{ width: '33.33333333%' }}>
						<ChartCard
							col='w-100'
							series={totalOfEachStatus}
							chartHeight={300}
							chartType='pie'
							timestamps
							color={['#000']}
							isLoading={isTotalOfEachStatusDataLoading}
							secondary
						/>
					</div>

					<div style={{ width: '66.66666667%' }}>
						<ChartCard
							lineColors={['#BEE5FB']}
							col='w-100'
							secondary
							marker={4}
							markerColor={['#0F9FF0']}
							series={convertDelayTimeData(totalDelayTime)}
							chartType='bar'
							chartHeight={300}
							yAxisConfig={{
								labels: {
									formatter: (value: number) => {
										const hours = Math.floor(value / 60);
										const minutes = Math.round(value % 60);
										return hours > 0
											? `${hours}h ${minutes}min`
											: `${minutes}min`;
									},
								},
							}}
							tooltipConfig={{
								y: {
									formatter: (value: number) => {
										const hours = Math.floor(value / 60);
										const minutes = Math.round(value % 60);
										return hours > 0
											? `${hours}h ${minutes}min`
											: `${minutes}min`;
									},
								},
								x: { show: false },
							}}
							isLoading={false}
						/>
					</div>

					<div style={{ width: '50%' }}>
						<ChartCard
							header='Average delay per task'
							col='w-100'
							series={convertAvgDelayData(averageDelayPerTask)}
							chartType='bar'
							chartHeight={300}
							secondary
							yAxisConfig={{
								labels: {
									formatter: (value: number) => {
										const hours = Math.floor(value / 60);
										const minutes = Math.floor(value % 60);
										return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
									},
								},
							}}
							tooltipConfig={{
								x: tooltipXWithYear,
								y: {
									formatter: (value: number) => {
										const hours = Math.floor(value / 60);
										const minutes = Math.floor(value % 60);
										const secs = Math.round((value * 60) % 60);
										return hours > 0
											? `${hours}h ${minutes}m ${secs}s`
											: `${minutes}m ${secs}s`;
									},
								},
							}}
							isLoading={isaverageDelayPerTaskDataLoading}
						/>
					</div>

					<div style={{ width: '50%' }}>
						<ChartCard
							header={'Number of delays event'}
							color={['#BEE5FB', '#D9FBBE', '#E4E4E4', '#FEDCDC']}
							lineColors={['#BEE5FB', '#D9FBBE', '#E4E4E4', '#FEDCDC']}
							col='col-6'
							secondary
							marker={4}
							markerColor={['#0F9FF0']}
							series={convertDelaysEventForBar(numberOfDelaysEvent)}
							chartHeight={300}
							chartType='bar'
							tooltipConfig={{ x: tooltipXWithYear }}
							// timestamps
							isLoading={isnumberOfDelaysEventDataLoading}
							lengthSeries={temperature?.length}
							showLegend
						/>
					</div>

					<div style={{ width: '33.33333333%' }}>
						<ChartCard
							color={['#8174d9']}
							lineColors={['#8174d9']}
							col='col-4'
							secondary
							series={convertDatesToTimestamp(TotalDeliveryTime)}
							chartHeight={300}
							chartType='line'
							timestamps
							isLoading={isTotalDeliveryTimeDataLoading}
							lengthSeries={temperature?.length}
						/>
					</div>

					{/* Number Of Deliveries */}
					<div style={{ width: '33.33333333%' }}>
						<ChartCard
							color={['#8174d9']}
							lineColors={['#8174d9']}
							col='col-4'
							secondary
							series={convertDeliveriesForBar(taskNoDeliver)}
							chartHeight={300}
							chartType='bar'
							tooltipConfig={{ x: tooltipXWithYear }}
							// timestamps
							isLoading={isaverageDelayPerTaskDataLoading}
							lengthSeries={temperature?.length}
						/>
					</div>

					{/* Number Of Deliveries In Time */}
					<div style={{ width: '33.33333333%' }}>
						<ChartCard
							color={['#8174d9']}
							lineColors={['#8174d9']}
							col='col-4'
							secondary
							series={convertDeliveriesForBar(taskNoDeliverInTime)}
							chartHeight={300}
							chartType='bar'
							tooltipConfig={{ x: tooltipXWithYear }}
							// timestamps
							isLoading={isTaskNoDeliverInTimeDataLoading}
							lengthSeries={temperature?.length}
						/>
					</div>

					<div style={{ width: '33.33333333%' }}>
						<ChartCard
							color={['#8174d9']}
							lineColors={['#8174d9']}
							col='col-4'
							secondary
							series={convertDatesToTimestamp(numberOfCanceledDeliveries)}
							chartHeight={300}
							chartType='line'
							timestamps
							isLoading={isTaskNoDeliveCanceledDataLoading}
							lengthSeries={temperature?.length}
						/>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default TaskOverview;