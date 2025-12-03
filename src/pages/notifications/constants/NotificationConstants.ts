import { CSSProperties } from 'react';
export const columnNotificationsTable = [
	{ name: '', key: 'read', sortable: false, width: '3%' },
	{ name: 'Date', key: 'time', sortable: true, width: '' },
	{ name: 'Vehicle', key: 'vin', sortable: true, width: '' },
	{ name: 'Group', key: 'group', sortable: true, width: '' },
	{ name: 'Alert Detail', key: 'alarm_type', sortable: true, width: '' },
	{ name: 'Location', key: 'location', sortable: true, width: '35%' },
	/* 	when tickets will be reintegrated => { name: 'Create ticket', key: 'Enabled', sortable: false, width: '' }, */
];

export const thStyle: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
};

export const trStyleTable: CSSProperties = {
	position: 'sticky',
	top: 0,
	zIndex: 5,
	// backgroundColor: '#f5f5f5',
};
