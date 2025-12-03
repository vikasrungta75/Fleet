import React, { useContext, useEffect, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../../components/extras/Chart';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../contexts/themeContext';
import Spinner from '../../../components/bootstrap/Spinner';
import Icon from '../../../components/icon/Icon';
import { fr, ar, hn, en } from '../../../common/data/chart';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

type ChartCardProps = React.PropsWithChildren<{
	series: any;
	chartType:
		| 'line'
		| 'area'
		| 'bar'
		| 'histogram'
		| 'pie'
		| 'donut'
		| 'radialBar'
		| 'scatter'
		| 'bubble'
		| 'heatmap'
		| 'candlestick'
		| 'boxPlot'
		| 'radar'
		| 'polarArea'
		| 'rangeBar'
		| 'rangeArea'
		| 'treemap'
		| undefined;
	chartHeight: number;
	timestamps?: boolean;
	secondary?: boolean;
	color?: string[];
	isLoading: boolean;
	showXAxisTicks?: boolean;
	lineColors?: string[];
	lengthSeries?: any;
	col?: string;
	xAxisConfig?: any;
	tooltipConfig?: any;
	marker?: any;
	markerColor?: any;
	yAxisConfig?: any;
	stacked?: boolean;
	distributed?: boolean;
	showLegend?: boolean;
	header?: any;
	titleOptions?: any;
	infoText?: string;
	title?: any;
	unit?: string;
	cardClassName?: string;
	Title?: boolean;
	legendLabels?: {
		label: string;
		color: string;
	}[];
	customColors?: any;
	useColorRanges?: boolean;
	barOptions?: any;
	tooltipUnit?: string;
}>;

const ChartCard = (props: ChartCardProps) => {
	const { t, i18n } = useTranslation(['overview']);
	const { permissions } = useSelector((state: RootState) => state.auth);

	const {
		chartType,
		chartHeight,
		series,
		timestamps,
		secondary,
		color,
		isLoading,
		showXAxisTicks = true,
		lineColors,
		lengthSeries,
		xAxisConfig,
		tooltipConfig,
		col = 'col-6',
		marker = false,
		markerColor,
		yAxisConfig,
		stacked = false,
		distributed = true,
		showLegend = false,
		header,
		titleOptions,
		infoText,
		title,
		unit,
		cardClassName,
		Title = true,
		legendLabels,
		customColors,
		useColorRanges = false,
		barOptions,
		tooltipUnit,
	} = props;

	const { mobileDesign } = useContext(ThemeContext);

	const colorPalette = [
		'#FE85D5',
		'#FEC487',
		'#E4C3FD',
		'#7EF7BD',
		'#FCE07C',
		'#86C4FF',
		'#FE8686',
		'#E5E2F2',
		'#DBA18F',
		'#CED0CF',
	];
	const translateLegendLabel = (label: string) => {
		return t(label); // Use fallback to original label if translation is not available
	};

	const [state, setState] = React.useState<IChartOptions>({
		series:
			chartType === 'pie' || chartType === 'radialBar'
				? series?.[0]?.data?.[0]?.series || []
				: Array.isArray(series)
				? series
				: [],
		options: {
			yaxis: {
				...(yAxisConfig || {}),
				labels: {
					...(yAxisConfig?.labels || {}),
					...(yAxisConfig?.labels?.formatter
						? { formatter: yAxisConfig.labels.formatter }
						: {}),
				},
			},

			labels:
				chartType === 'pie' || chartType === 'radialBar'
					? series?.[0]?.data?.[0]?.labels || []
					: [],
			chart: {
				stacked: stacked,
				height: chartHeight,
				id: chartType,
				toolbar: {
					show: false,
				},
				locales: i18n.language.includes('fr-FR')
					? [fr]
					: i18n.language.includes('ar-AR')
					? [ar]
					: i18n.language.includes('hn-HN')
					? [hn]
					: [en],
				defaultLocale: i18n.language.includes('fr-FR')
					? 'fr'
					: i18n.language.includes('ar-AR')
					? 'ar'
					: i18n.language.includes('hn-HN')
					? 'hn'
					: 'en',
			},

			title: {
				text: titleOptions && titleOptions,
				align: 'left',
				margin: 10,
				offsetX: 0,
				offsetY: 0,
				floating: false,
				style: {
					fontSize: '14px',
					fontWeight: 'bold',
					fontFamily: undefined,
					color: '#263238',
				},
			},
			colors: useColorRanges ? undefined : color ? color : colorPalette,
			plotOptions: {
				bar: barOptions || {
					horizontal: false,
					columnWidth: '40%',
					distributed: distributed,
					borderRadius: 0,
				},
				radialBar: {
					startAngle: -90,
					endAngle: 90,
					hollow: {
						margin: 15,
						size: '70%',
					},
					track: {
						background: '#e7e7e7',
						strokeWidth: '100%',
						margin: 5,
					},
					dataLabels: {
						name: {
							show: false,
						},
						value: {
							show: true,
							fontSize: '30.41px',
							fontFamily: 'Manrope',
							fontWeight: 700,
							offsetY: 0,
							formatter: function (val) {
								return val + ' ' + unit;
							},
						},
					},
				},
				pie: {
					donut: {
						size: '65%',
					},
					expandOnClick: false,
					dataLabels: {
						offset: 0,
						minAngleToShowLabel: 10,
					},
				},
			},
			fill: {
				colors: color || colorPalette,
			},
			dataLabels: {
				enabled: chartType === 'pie',
				formatter: function (val, opts) {
					return opts.w.globals.series[opts.seriesIndex];
				},
				style: {
					fontSize: '14px',
					fontFamily: 'Manrope',
					fontWeight: 'bold',
				},
				dropShadow: {
					enabled: false,
				},
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent'],
			},
			xaxis: {
				...(xAxisConfig || {}),
				labels: {
					show: showXAxisTicks,
					...(xAxisConfig?.labels || {}),
				},
				type: timestamps ? 'datetime' : 'category',
			},
			legend: {
				show: showLegend || !!legendLabels,
				position: 'bottom',
				fontSize: '14px',
				fontFamily: 'Manrope',
				horizontalAlign: 'center',
				labels: {
					colors: '#000000',
				},
				markers: {
					width: 12,
					height: 12,
					radius: 1,
					fillColors: legendLabels?.map((item) => item.color) || [],
				},
				itemMargin: {
					horizontal: 10,
					vertical: 5,
				},
				customLegendItems: legendLabels?.map((item) => item.label) || [],
			},
			markers: {
				size: marker ? marker : 0,
				strokeColors: markerColor ? markerColor : [],
				shape: 'circle',
				colors: ['#fff'],
			},

			tooltip: {
				enabled: true,
				...tooltipConfig,
				x: {
					show: true,
					format: 'dd MMM',
					formatter: (value: any) => {
						// Check if value is a timestamp (usually a large number)
						if (timestamps) {
							// Assuming it's a 13-digit timestamp
							const date = new Date(value);
							return date.toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short',
								year: 'numeric',
							}); // Format timestamp to 'dd MMM yyyy'
						}
						// If not a timestamp, return value as is
						return value;
					},
				},
				y: {
					formatter: (value: any) => t(value), // Apply translation to y-axis values
					title: {
						formatter: (seriesName) => t(seriesName),
					},
				},

				z: {
					formatter: (value: any) => t(value), // Apply translation to z-axis values
					title: 'Size: ', // Static text for z-axis title, can be translated if needed
				},
			},
		},
	});

	useEffect(() => {
		// Update state after 3 seconds
		const timer = setTimeout(() => {
			setState({
				series:
					chartType === 'pie' || chartType === 'radialBar'
						? series?.[0]?.data?.[0]?.series || []
						: Array.isArray(series)
						? series
						: [],

				options: {
					labels:
						chartType === 'pie' || chartType === 'radialBar'
							? series?.[0]?.data?.[0]?.labels || []
							: [],
					chart: {
						id: chartType,
						toolbar: {
							show: false,
						},
						locales: i18n.language.includes('fr-FR')
							? [fr]
							: i18n.language.includes('ar-AR')
							? [ar]
							: i18n.language.includes('hn-HN')
							? [hn]
							: [en],
						defaultLocale: i18n.language.includes('fr-FR')
							? 'fr'
							: i18n.language.includes('ar-AR')
							? 'ar'
							: i18n.language.includes('hn-HN')
							? 'hn'
							: 'en',
					},
					// colors: color ? color : colorPalette,
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: '20%',
							distributed: true,
						},
						radialBar: {
							hollow: {
								margin: 15,
								size: '70%',
							},
						},
					},
					dataLabels: {
						enabled: series?.[0]?.name?.includes('Temperature') ? true : false,
					},
					stroke: {
						// colors: lineColors ? lineColors : colorPalette,
						show: true,
						width: 2,
						lineCap: 'square',
					},
					xaxis: {
						labels: {
							show: showXAxisTicks, // Dynamic setting based on showXAxisTicks prop
						},
						type: timestamps ? 'datetime' : 'category',
					},
					legend: {
						show:
							series?.[0]?.name?.includes('Temperature') || chartType === 'pie'
								? true
								: false,
						position: chartType === 'pie' ? 'right' : 'top',
						formatter: function (val) {
							return translateLegendLabel(val); // Translate label
						},
					},
					markers: {
						//  size: series?.[0]?.data?.length <= 1 ? 5 : (marker ? marker : 2),
						size: marker ? marker : 1,
						strokeColors: markerColor ? markerColor : [],
						shape: 'circle',
						colors: ['#fff'],
						hover: { size: 7 },
					},
					tooltip: {
						enabled: true,
						intersect: false,
						...(tooltipConfig || {}),
						x:
							tooltipConfig?.x !== undefined
								? tooltipConfig.x
								: {
										show: true,
										format: 'dd MMM',
										formatter: (value: any) => {
											if (timestamps) {
												const date = new Date(value);
												return date.toLocaleDateString('en-GB', {
													day: '2-digit',
													month: 'short',
													year: 'numeric',
												});
											}
											return value;
										},
								  },

						y: {
							...(tooltipConfig?.y || {}),
							formatter: tooltipConfig?.y?.formatter
								? tooltipConfig.y.formatter
								: (value: any) => t(value),
							title: {
								formatter: (seriesName) => t(seriesName),
							},
						},
						z: {
							formatter: (value: any) => t(value), // Apply translation to z-axis values
							title: 'Size: ', // Static text for z-axis title, can be translated if needed
						},
					},
				},
			});
		}, 3000);

		// Cleanup function
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isSingleValue =
		series?.[0]?.data?.length === 1 &&
		Array.isArray(series?.[0]?.data?.[0]) &&
		chartType !== 'radialBar' &&
		chartType !== 'pie';

	useEffect(() => {
		setState({
			...state,
			series:
				chartType === 'pie' || chartType === 'radialBar'
					? series?.[0]?.data?.[0]?.series || []
					: Array.isArray(series)
					? series
					: [],

			options: {
				...state.options,
				labels:
					chartType === 'pie' || chartType === 'radialBar'
						? series?.[0]?.data?.[0]?.labels || []
						: [],
			},
			yaxis: series?.map((serie: any) => {
				return {
					seriesName: serie.name,
				};
			}),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [series]);
	const [translationsReady, setTranslationsReady] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setTranslationsReady(true);
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!translationsReady) return;

		if (isLoading) {
			setState((prevState) => ({
				...prevState,
				options: {
					...prevState.options,
					noData: { text: '' },
				},
			}));
		} else if (
			!isLoading &&
			(!series ||
				!Array.isArray(series) ||
				series.length === 0 ||
				!series[0]?.data ||
				series[0].data.length === 0 ||
				((chartType === 'pie' || chartType === 'radialBar') &&
					(!series[0].data[0]?.series || series[0].data[0].series.length === 0)))
		) {
			setState((prevState) => ({
				...prevState,
				options: {
					...prevState.options,
					noData: {
						text: t('No data for the selected date'),
						align: 'center',
						verticalAlign: 'middle',
					},
				},
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [series, isLoading, translationsReady]);

	function getUnit(name: any) {
		switch (name) {
			case 'Temperature':
				return 'Temperature (°C)';
			case 'Mileage Driven':
				return 'Mileage Driven (km)';
			case 'Total of refuel':
				return 'Total of Refuel (L)';
			case 'Drainage':
				return 'Total of Drainage (L)';
			case 'Average Fuel':
				return 'Average Fuel (L)';
			case 'Total Fuel Consumed by Fleet':
				return 'Total Fuel Consumed By Fleet (L)';
			case 'Fuel Average Consumption':
				return 'Average Consumption (L)';
			case 'Total Idling Time':
				return 'Total Idling Time (Min)';
			case 'Total idling time':
				return 'Total Idling Time (Min)';
			case 'Average Idling Time':
				return 'Average Idling Time (Min)';
			case 'Total number of fillings':
				return 'Total count Of Fillings';
			case 'Average Fuel Level Of The Fleet':
				return 'Average Fuel Level Of The Fleet (L)';
			case 'Average consumption':
				return 'Average Consumption (L)';
			case 'Total Number Of Drainge':
				return 'Total count Of Drainge';
			case 'Vehicles usage':
				return 'Vehicle Usage';
			case 'Eco Drive Total Score':
				return 'Eco Drive Average Score';
			// Add more cases as needed for other types
			default:
				return name; // Default translation if no match
		}
	}

	const isPie = chartType === 'pie' || chartType === 'radialBar';

	let chartSeries = state.series;
	let chartOptions = state.options;

	if (isPie && series?.[0]?.data?.length > 0) {
		chartSeries = series?.[0]?.data?.[0] || [];
		chartOptions = {
			...state.options,
			labels: series?.[0]?.data?.[1] || [],
		};
	}

	return true ? (
		<>
			{i18n.isInitialized && (
				<Card className='rounded-2'>
					<div className='table-titles'>
						{t(
							getUnit(
								series?.[0]?.name?.includes('Temperature')
									? 'Temperature'
									: series?.[0]?.name,
							),
						)}
					</div>
					<CardBody>
						<div className={mobileDesign ? 'col' : 'row'}>
							<div className='col position-relative'>
								{isLoading ? (
									<div
										className='d-flex flex-column align-items-center justify-content-center'
										style={{ minHeight: chartHeight }}>
										<Spinner
											size='30px'
											className='position-absolute top-50 end-50'
											color='secondary'
										/>
									</div>
								) : (chartType === 'pie' || chartType === 'radialBar') &&
								  (!series?.[0]?.data || series?.[0]?.data?.length === 0) ? (
									<div
										className='d-flex flex-column align-items-center justify-content-center'
										style={{ minHeight: chartHeight + 15 }}>
										<Icon icon='WebAssetOff' size='10x' color='light' />
										{t('No data for the selected date')}
									</div>
								) : (
									<div
										className='col position-relative'
										style={{ overflowX: 'auto', overflowY: 'hidden' }}>
										<div
											style={{
												width: lengthSeries
													? `${series[0].data?.length * 150}px`
													: 'auto',
												minWidth: '100%',
											}}>
											<Chart
												series={chartSeries}
												options={chartOptions}
												type={isSingleValue ? 'scatter' : chartType}
												height={chartHeight}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</CardBody>
				</Card>
			)}
		</>
	) : null;
};

export default ChartCard;
