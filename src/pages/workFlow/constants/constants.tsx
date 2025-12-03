export const columns = [
	{ name: 'Geofence name', key: 'geofence_name', sortable: true, width: '15%' },
	{ name: 'Vehicle', key: 'vin', sortable: true, width: '20%' },
	{ name: 'Group', key: 'fleet_name', sortable: true, width: '15%' },
	{ name: 'Type', key: 'type', sortable: true, width: '10%' },
];

export const geofenceOptions = {
	strokeColor: '#FFB400',
	strokeOpacity: 0.8,
	strokeWeight: 2,
	fillColor: '#FFB400',
	fillOpacity: 0.35,
	clickable: true,
	// draggable: true,
	editable: false,
	visible: true,
	zIndex: 1,
};

export const radioButtonChoice = [
	{ id: 'in', value: 'In' },
	{ id: 'out', value: 'Out' },
	{ id: 'both', value: 'Both' },
];

export const optionsmapFleetTraject = {
	// strokeColor: '#FF0000',
	strokeOpacity: 0.8,
	strokeWeight: 2,
	fillColor: '#0000FF',
	fillOpacity: 0.35,
	clickable: true,
	draggable: false,
	editable: false,
	visible: true,
	radius: 30000,
	zIndex: 1,
};
