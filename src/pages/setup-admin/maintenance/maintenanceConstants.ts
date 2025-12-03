import { CSSProperties } from 'react';
export const sortOptions = [
	{ name: 'Sort by ascending order', value: 1, key: 1, icon: 'North' },
	{ name: 'Sort by descending order', value: -1, key: 2, icon: 'South' },
];

export const styleMaintenanceDataTable: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
	fontFamily: 'Open Sans',
	fontWeight: 700,
	fontSize: 12,
	textAlign: 'center',
};

export const colorStatusBackground = {
	Scheduled: '#F9B0F6',
	Due: '#FAC899',
	Completed: '#99F08B',
	Expired: '#F58181',
};

export const columns = [
	{
		name: 'Vehicle',
		key: 'fleet_id',
		checkbox: true,
		position: 0,
		filterCardOption: true,
	},
	{
		name: 'Maintenance work',
		key: 'task_name',
		width: 180,
		checkbox: false,
		position: 7,
		filterCardOption: true,
	},
	{
		name: 'Date',
		key: 'date',
		width: 110,
		checkbox: false,
		position: 0,
		filterCardOption: false,
	},
	{
		name: 'Status',
		key: 'status',
		checkbox: false,
		position: 26,
		filterCardOption: true,
	},
	{
		name: 'Target value',
		key: 'target_value',
		position: 0,
		filterCardOption: false,
		subHeader: [
			{ name: 'Date', key: 'target' },
			{ name: 'Mileage', key: 'mileage' },
			{ name: 'engine hr', key: 'engine_hr' },
		],
	},
	{
		name: 'Finished value',
		key: 'finished_value',
		position: 0,
		filterCardOption: false,
		subHeader: [
			{ name: 'Date', key: 'date' },
			{ name: 'Mileage', key: 'mileage' },
			{ name: 'engine hr', key: 'engine_hr' },
		],
	},
];
