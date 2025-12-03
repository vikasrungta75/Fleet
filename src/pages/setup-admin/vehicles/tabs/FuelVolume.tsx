import React, { FC, useContext, useState, useEffect } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '../../../../components/bootstrap/Card';
import VinSelect from '../../../common/filters/VinSelect';
import DatePicker from '../../../../components/DatePicker';
import { CSVLink } from 'react-csv';
import Icon from '../../../../components/icon/Icon';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';
import { getDefaultDateRangeFilter } from '../../../../helpers/helpers';
import {
	useDetailedFuelReport,
	useFleetFuelTank,
	useFuelAnalysisPerdayReport,
	useFuelAnalysisReport,
	useFuelTankStatsReport,
	useFuelVolume,
	useFuelVolumeAnalysis,
} from '../../../../services/vehiclesService';
import Datatable from '../components/Datatable';
import Spinner from '../../../../components/bootstrap/Spinner';
import XLSXLink from '../../../common/xlsx-link/XLSXLink';
import Loader from '../../../../components/Loader';
import GoBack from '../../../../components/GoBack';
import {
	columnsFuelTank,
	columnsFuelVolume,
	columnsFuelVolumeAnalysis,
} from '../constants/VehicleConstants';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import FuelVolumesDatatables from './tables_components/DatatablesFuelVolume';
import {
	columnsColumnsFuelVolume,
	columnsDetailedFuelReport,
	monitoringFuelTank,
} from './tables_components/columnsFuelVolume';
import MonitoringFuelTank from './tables_components/FuelVolumeMonitoringTank';
import DatatableDetailedFuelReport from './tables_components/DatatablesDetailedFuelReport';

interface IFuelVolumePops {
	goBack: () => void;
}
const FuelVolume: FC<IFuelVolumePops> = ({ goBack }) => {
	const HeaderNameFuelVolume: string[] = ['Stats Reports', 'Analysis Reports', 'Tank Reports'];

	const { mobileDesign } = useContext(ThemeContext);
	const { t, i18n } = useTranslation(['reports', 'vehicles']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [vinFilter, setVinFilter] = useState<string>('All Vins');

	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	const colorPalette = ['#0f9ff0', '#ff0000', '#ff9900'];
	const [timeChart, settimeChart] = useState([]);
	const [chartData, setChartData] = useState({
		series: [
			{
				name: 'Speed',
				type: 'area',
				data: [],
			},
			{
				name: 'Fuel level',
				type: 'line',
				data: [],
			},
			{
				name: 'Kilometers',
				type: 'line',
				data: [],
			},
		],
		options: {
			chart: {
				height: 350,
				type: 'area',
				stacked: false,
				toolbar: {
					show: false,
					autoSelected: 'pan',
				},
			},
			colors: colorPalette,

			dataLabels: {
				enabled: false,
			},
			stroke: {
				width: [1, 1, 4],
			},
			// title: {
			// 	text: 'XYZ - Stock Analysis (2009 - 2016)',
			// 	align: 'left',
			// 	offsetX: 110,
			// },
			xaxis: {
				categories: timeChart,
				type: 'datetime',
			},
			yaxis: [
				{
					axisTicks: {
						show: true,
					},
					axisBorder: {
						show: true,
						color: '#008FFB',
					},
					labels: {
						style: {
							colors: '#008FFB',
						},
					},
					title: {
						text: 'Speed',
						style: {
							color: '#008FFB',
						},
					},
					tooltip: {
						enabled: true,
					},
				},
				{
					seriesName: 'Fuel level',
					opposite: true,
					colors: '#ff0000',
					axisTicks: {
						show: true,
					},
					axisBorder: {
						show: true,
						color: '#ff0000',
					},
					labels: {
						style: {
							colors: '#ff0000',
						},
					},
					title: {
						text: 'Fuel level / perl',
						style: {
							color: '#ff0000',
						},
					},
				},
				// {
				// 	seriesName: 'Kilometers',
				// 	opposite: true,
				// 	axisTicks: {
				// 		show: true,
				// 	},
				// 	axisBorder: {
				// 		show: true,
				// 		color: '#FEB019',
				// 	},
				// 	labels: {
				// 		style: {
				// 			colors: '#FEB019',
				// 		},
				// 	},
				// 	title: {
				// 		text: 'Kilometers ( km )',
				// 		style: {
				// 			color: '#FEB019',
				// 		},
				// 	},
				// },
			],
			tooltip: {
				fixed: {
					enabled: true,
					position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
					offsetY: 30,
					offsetX: 60,
				},
			},
			legend: {
				position: 'top',
				horizontalAlign: 'center',
				fontSize: '20px',
				fixed: {
					enabled: true,
					position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
					offsetY: 30,
					offsetX: 60,
				},
			},
		},
	});

	const {
		data: dataFuelAnalysisReport,
		isLoading: dataFuelAnalysisReportLoading,
		refetch: dataFuelAnalysisReportRefetch,
		remove: dataFuelAnalysisReportRemove,
	} = useFuelAnalysisReport({ dateRangeFilter, vinFilter });

	const {
		data: dataFuelAnalysisPerDayReport,
		isLoading: dataFuelAnalysisPerDayReportLoading,
		refetch: dataFuelAnalysisPerDayReportRefetch,
		remove: dataFuelAnalysisPerDayReportRemove,
	} = useFuelAnalysisPerdayReport({ dateRangeFilter, vinFilter });

	const {
		data: dataMonitoringFuelTank,
		isLoading: dataMonitoringFuelTankLoading,
		refetch: dataMonitoringFuelTankRefetch,
		remove: dataMonitoringFuelTankRemove,
	} = useFuelTankStatsReport({ dateRangeFilter, vinFilter });
	const {
		data: dataDetailedFuelReport,
		isLoading: dataDetailedFuelReportLoading,
		refetch: dataDetailedFuelReportRefetch,
		remove: dataDetailedFuelReportRemove,
	} = useDetailedFuelReport({ dateRangeFilter, vinFilter });

	useEffect(() => {
		dataFuelAnalysisReportRefetch();
		dataFuelAnalysisPerDayReportRefetch();
		dataMonitoringFuelTankRefetch();
		dataDetailedFuelReportRefetch();

		return () => {
			dataFuelAnalysisPerDayReportRemove();
			dataMonitoringFuelTankRemove();
			dataDetailedFuelReportRemove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, vinFilter]);

	const allIsFine =
		!dataFuelAnalysisReportLoading &&
		dataFuelAnalysisReport &&
		dataFuelAnalysisReport?.length !== 0 &&
		!dataFuelAnalysisPerDayReportLoading &&
		dataFuelAnalysisPerDayReport &&
		dataFuelAnalysisPerDayReport?.length !== 0 &&
		!dataDetailedFuelReportLoading &&
		dataDetailedFuelReport &&
		dataDetailedFuelReport?.length !== 0;

	useEffect(() => {
		const extractValues = (dataArray: any) => {
			const fuels: any = [];
			const times: any = [];
			const speeds: any = [];

			dataArray.forEach((item: any) => {
				fuels.push(item.fuel);
				times.push(item.time);
				speeds.push(item.speed);
			});

			return { fuels, times, speeds };
		};
		if (dataFuelAnalysisReport) {
			const { fuels, times, speeds } = extractValues(dataFuelAnalysisReport);

			const newSeries = [
				{
					name: 'Speed',
					type: 'area',
					data: speeds,
				},

				{
					name: 'Fuel',
					type: 'line',
					data: fuels,
				},
			];

			setChartData((prevState) => ({
				...prevState,
				options: {
					...prevState.options,

					xaxis: {
						...prevState.options.xaxis,
						...prevState.options.xaxis.categories,
						categories: times,
					},
				},
				series: newSeries,
			}));
		}

		return () => { };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataFuelAnalysisReport]);
	const isArrayDetailedFuelReport = Array.isArray(dataDetailedFuelReport);
	const isArrayMonitoringFuelTank = Array.isArray(dataMonitoringFuelTank);
	const isArrayFuelAnalysisPerDayReport = Array.isArray(dataFuelAnalysisPerDayReport);

	// Check if all are arrays
	const allAreArrays =
		isArrayDetailedFuelReport && isArrayMonitoringFuelTank && isArrayFuelAnalysisPerDayReport;
	return (
		<>
			<Card className='mw-100 reportCards-header'>
				<CardBody
					className={
						!mobileDesign
							? 'd-flex justify-content-between align-items-center col-12'
							: ''
					}>
					<div className='d-flex'>
						<GoBack handleClick={goBack} />
						<CardTitle style={{ marginLeft: '20px', marginTop: 6 }}>
							{t('Fuel Volume')}
						</CardTitle>
					</div>
					<div className='d-flex'>
						<VinSelect
							setVinFilter={setVinFilter}
							vinFilter={vinFilter}
							className={`${mobileDesign ? 'mb-3' : 'me-3'}`}
						/>
						<DatePicker
							className={`position-relative ${mobileDesign ? 'col-12' : 'me-3'}`}
							setDateRangeFilter={setDateRangeFilter}
							dateRangeFilter={dateRangeFilter}
							withHours={false}
							position={i18n.language === 'ar-AR' ? 'start' : 'end'}
						/>

						{allIsFine && allAreArrays && (
							<>
								<CSVLink
									style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', }}
									className={`py-0 ${mobileDesign ? 'my-3' : 'me-3'
										}`}
									filename={'Fuel Volume'}
									data={[
										...dataDetailedFuelReport,
										...dataMonitoringFuelTank,
										...dataFuelAnalysisPerDayReport,
									]}>
									<div className='report_buttons pt-2'>
										<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
										<span className='export-buttons'>{t('Export CSV')}</span>
									</div>
								</CSVLink>
								<XLSXLink
									style={{ textDecoration: 'none', minWidth: '124px', height: '39px', padding: '11px 9px', gap: '10px', borderRadius: '4px', border: '1px solid #000000', boxShadow: '0px 4px 4px 0px #00000040', backgroundColor: "#FFFFFF" }}
									className={`py-0 ${mobileDesign ? 'mb-2 m-auto w-100' : 'me-3'
										}`}
									filename={'Fuel Volume'}
									data={[
										...dataDetailedFuelReport,
										...dataMonitoringFuelTank,
										...dataFuelAnalysisPerDayReport,
									]}>
									<div className='report_buttons pt-2'>
										<Icon icon='DownloadIcon' className='me-2' size={'lg'} />
										<span className='export-buttons'>{t('Export XLSX')}</span>
									</div>
								</XLSXLink>
							</>
						)}
					</div>
				</CardBody>
			</Card>
			{dataFuelAnalysisPerDayReportLoading &&
				dataMonitoringFuelTankLoading &&
				dataDetailedFuelReportLoading ? (
				<Loader />
			) : (
				<>
					<div id='chart'>
						<ReactApexChart
							options={chartData.options as ApexOptions}
							series={chartData.series}
							type='line'
							height={450}
						/>
					</div>
					<h1 className='fuel-volume-title-custom'>{t(`Detail by dates`)}</h1>
					<FuelVolumesDatatables
						columns={columnsColumnsFuelVolume}
						data={dataFuelAnalysisPerDayReport}
					/>
					<h1 className='fuel-volume-title-custom'>{t(`Monitoring fuel tank`)}</h1>
					<MonitoringFuelTank
						columns={monitoringFuelTank}
						data={dataMonitoringFuelTank}
					/>
					<h1 className='fuel-volume-title-custom'>{t(`Detailed Fuel Report`)}</h1>
					<DatatableDetailedFuelReport
						columns={columnsDetailedFuelReport}
						data={dataDetailedFuelReport}
					/>
				</>
			)}
		</>
	);
};

export default FuelVolume;
