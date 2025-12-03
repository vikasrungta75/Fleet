import { ApexOptions } from 'apexcharts';
import { IChartOptions } from '../../components/extras/Chart';

export const columnsAlarmDataTable = [
	{ name: 'Vehicle', key: 'Vehicle', sortable: false, width: '20%' },
	{ name: 'Mileage', key: 'Mileage', sortable: true, width: '20%' },
	{ name: 'icon', key: 'icon', width: '10%' },
];
export const chartOptions: ApexOptions = {
	chart: {
		type: 'donut',
		height: 200,
	},
	states: {
		active: { filter: { type: 'none' } },
	},
	stroke: {
		width: 0,
	},
	dataLabels: {
		enabled: false,
	},
	plotOptions: {
		pie: {
			expandOnClick: false,
			donut: {
				labels: {
					value: {
						show: true,
						fontSize: '16px',
						fontFamily: 'Open Sans',
						fontWeight: 900,
						offsetY: 16,
						formatter(val) {
							return val;
						},
					},
				},
			},
		},
	},
	legend: {
		show: false,
	},
};
export const DUMMY_DATA: { [key: string]: IChartOptions } = {
	DAY: {
		series: [8, 3, 1],
		options: {
			...chartOptions,
		},
	},
	WEEK: {
		series: [42, 18, 9],
		options: {
			...chartOptions,
		},
	},
	MONTH: {
		series: [150, 55, 41, 22, 95, 22, 345, 22, 44],
		options: {
			...chartOptions,
		},
	},
};

export const columnsFuelEfficiency = [
	{ name: 'Rank', sortable: false, width: '15%' },
	{ name: 'Vehicles', sortable: false, width: '35%' },
	{ name: 'Fuel use ( per L )', sortable: true, width: '100%' },
];

export const columnsOverviewVehicleAlerts = [
	{ name: 'Rank', sortable: false, width: '15%' },
	{ name: 'Vehicle', sortable: false, width: '35%' },
	{ name: 'Alerts rate', sortable: true, width: '' },
];

export const overviewTabs = [
	{ value: 'Overall', id: '1' },
	{ value: 'Cost', id: '2' },
	{ value: 'Efficiency', id: '3' },
];

