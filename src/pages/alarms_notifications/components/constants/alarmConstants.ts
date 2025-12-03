import { CSSProperties } from 'react';
import { BorderBottom } from '../../../../components/icon/material-icons';
export const columnsAlarmTypeDataTableWithout = [
	{ name: 'Location', key: 'location', sortable: false, width: '' },
	{ name: 'Model', key: 'model', sortable: true, width: '' },
	{ name: 'Fuel Type', key: 'fuel_type', sortable: true, width: '' },
	{ name: 'Start Time', key: 'start_time', sortable: true, width: '' },
	{ name: 'End Time', key: 'end_time', sortable: true, width: '' },
	{ name: 'Alarm Type', key: 'alarm_detail', sortable: false, width: '' },
];
export const columnsAlarmTypeDataTableWith = [
	{ name: 'Location', key: 'location', sortable: false, width: '' },
	{ name: 'Model', key: 'model', sortable: true, width: '' },
	{ name: 'Fuel Type', key: 'fuel_type', sortable: true, width: '' },
	{ name: 'Time', key: 'time', sortable: true, width: '' },
	{ name: 'Alarm Type', key: 'alarm_detail', sortable: false, width: '' },
];

export const columnsAlarmDataTable = [
	{ name: 'Vehicle', key: 'vin', sortable: true, width: '40%' },
	{ name: 'Alarm', key: 'alarm', sortable: true, width: '40%' },
];

export const columnsAlarmSettingTable = [
	{ name: 'Notify me', key: 'notify_me', sortable: false, width: '15%' },
	{ name: 'Group', key: 'group', sortable: true, width: '' },
	{ name: 'Alert', key: 'alarm', sortable: true, width: '20%' },
	{ name: 'Limit', key: 'sign', sortable: true, width: '' },
	{ name: 'Enabled', key: 'enabled', sortable: false, width: '' },
	{ name: 'Edit', key: '', sortable: false, width: '' },
	{ name: 'Delete', key: '', sortable: false, width: '' },
];

export const TableStyle: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
};

export const thStyle: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
	borderRadius:'2px',
	backgroundColor: '#D8D8D8',
	borderBottom: '1px solid #E0E6ED',
	padding:"55px"
};
export const thArabisStyle: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
};

export const trStyleTable: CSSProperties = {
	zIndex: '1',
	cursor: 'pointer',
};

export const CursorStyleNav: CSSProperties = {
	cursor: 'pointer',
};

export const columnsReportsData = [
	{ name: 'VIN', key: 'vin', sortable: true, width: '20%' },
	{ name: 'DTC Code', key: 'dtc_code', sortable: true, width: '20%' },
	{ name: 'DTC Description', key: 'dtc_description', sortable: true, width: '30%' },
	{ name: 'Recurrence', key: 'recurrence', sortable: true, width: '10%' },
	{ name: 'Reporting Date', key: 'reporting_date', sortable: true, width: '40%' },
];

export const Tabs = [
	{ key: 'Alerts', value: 'Alerts', id: '1' },
	{ key: 'DTC', value: 'DTC', id: '2' },
];


export const activityLogs =[
	{name:'User ID', sortable:true, key:'commited_by'},
	{name:'User name', sortable:true, key:'user_name'},
	{name:'IP Adress', sortable:true, key:'ip_address'},
	{name:'Action', sortable:true, key:'action_type'},
	{name:'Updated date', sortable:true, key:'datetime'},
]