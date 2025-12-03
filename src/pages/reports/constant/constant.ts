import {
	columnsConnectionLost,
	columnsDailyDriveUsage,
	columnsDailyVehicleUsage,
	columnsDeviceOfOff,
	columnsDriverBehaviour,
	columnsDriverChangeRotation,
	columnsEcoDrive,
	columnsEngineHours,
	columnsFuelPerformance,
	columnsPOI,
	columnsSpeedViolations,
	columnsTrackerDetach,
	columnsTripShiftVehicles,
	columnsTripVehicles,
	columnsVehicleRaprts,
	columnsVehicleStopped,
	columnsWorkingHours,
} from '../../setup-admin/vehicles/constants/VehicleConstants';
import {
	useConnectionLost,
	useDailyDriveUsage,
	useDailyVehicleUsage,
	useDeviceOnOff,
	useDriverChangeRotation,
	useEcoDrive,
	useEngineHours,
	useFuelPerformance,
	usePOIReport,
	useSpeedViolations,
	useStoppedVehicle,
	useTrackerDetach,
	useTripReports,
	useTripShiftReports,
	useVehicleRecords,
	useWorkingHours,
} from '../../../services/vehiclesService';
import { IFields } from '../../../type/vehicles-type';

export const REPORT: any = {
	fuel_performance: {
		fileName: 'Fuel performance',
		useCustomUsage: useFuelPerformance,
		columns: columnsFuelPerformance,
		withDatePicker: true,
		withVinSelect: true,
		withFleetSelect: true,
	},

	daily_vehicle_usage: {
		fileName: 'Daily vehicle usage',
		useCustomUsage: useDailyVehicleUsage,
		columns: columnsDailyVehicleUsage,
		withFleetSelect: true,
	},
	daily_driver_usage: {
		fileName: 'Daily driver usage',
		useCustomUsage: useDailyDriveUsage,
		columns: columnsDailyDriveUsage,
		withFleetSelect: true,
	},

	vehicle_record: {
		fileName: 'Vehicle Record',
		useCustomUsage: useVehicleRecords,
		columns: columnsVehicleRaprts,
		withFleetSelect: true,
		withDatePicker: true,
	},

	vehicle_stopped: {
		fileName: 'Vehicle Stopped',
		useCustomUsage: useStoppedVehicle,
		columns: columnsVehicleStopped,
		withVinSelect: true,
		withDatePicker: true,
	},
	trip_reports: {
		fileName: 'Trip Reports',
		useCustomUsage: useTripReports,
		columns: columnsTripVehicles,
		withVinSelect: true,
		withDatePicker: true,
	},
	trip_shift_reports: {
		fileName: 'Trip Shift Reports',
		useCustomUsage: useTripShiftReports,
		columns: columnsTripShiftVehicles,
		withVinSelect: true,
		withDatePicker: true,
		withShift: true,
	},
	engine_hours: {
		fileName: 'Engine Hours',
		useCustomUsage: useEngineHours,
		columns: columnsEngineHours,
		withVinSelect: true,
		withDatePicker: true,
	},
	tracker_detach: {
		fileName: 'Tracker Detach',
		useCustomUsage: useTrackerDetach,
		columns: columnsTrackerDetach,
		withVinSelect: true,
		withDatePicker: true,
	},
	working_hours: {
		fileName: 'Working Hours',
		useCustomUsage: useWorkingHours,
		columns: columnsWorkingHours,
		withVinSelect: true,
		withDatePicker: true,
	},
	'device_on/_off': {
		fileName: 'Device On / OFF',
		useCustomUsage: useDeviceOnOff,
		columns: columnsDeviceOfOff,
		withVinSelect: true,
		withDatePicker: true,
	},
	connection_lost: {
		fileName: 'Connection Lost',
		useCustomUsage: useConnectionLost,
		columns: columnsConnectionLost,
		withVinSelect: true,
		withDatePicker: true,
	},
	eco_drive: {
		fileName: 'Eco Drive',
		useCustomUsage: useEcoDrive,
		columns: columnsEcoDrive,
		withVinSelect: true,
		withDatePicker: true,
	},
	speed_violations: {
		fileName: 'Speed Violations',
		useCustomUsage: useSpeedViolations,
		columns: columnsSpeedViolations,
		withVinSelect: true,
		withDatePicker: true,
	},
	poi_visits: {
		fileName: 'POI Visits',
		useCustomUsage: usePOIReport,
		columns: columnsPOI,
		withVinSelect: false,
		withDatePicker: false,
	},
	driver_change_rotation: {
		fileName: 'Driver Change Rotation',
		useCustomUsage: useDriverChangeRotation,
		columns: columnsDriverChangeRotation,
		withVinSelect: true,
		withDatePicker: true,
	},
	driver_behaviour: {
		fileName: 'Driver Behaviour',
		useCustomUsage: useEcoDrive,
		columns: columnsDriverBehaviour,
		withVinSelect: true,
		withDatePicker: true,
	},
};

export const scheduledReportsColumns = [
	{ name: 'Report type', key: 'report_type', sortable: true, width: '20%' },
	{ name: 'Vin', key: 'vin', sortable: true, width: '' },
	{ name: 'Frequency', key: 'frequency', sortable: true, width: '' },
	{ name: 'Receive on', key: 'choosenDay', sortable: true, width: '' },
	{ name: 'At', key: 'time', sortable: true, noTranslation: true, width: '' },
	{ name: 'Created date', key: 'created_time', format_date: true, sortable: true, width: '' },
];

export const scheduledReportFields: IFields[] = [
	{
		label: 'Report type',
		id: 'report_type',
		options: 'reports',
		input: 'editable-select',
		placeholder: 'Select one or more reports',
		col: '12',
		mandatory: false,
		multiSelect: true,
	},
	{ label: 'Vin', id: 'vin', input: 'vin', col: '12', mandatory: false },
	{
		label: 'Frequency',
		id: 'frequency',
		options: 'frequencies',
		input: 'select',
		placeholder: 'Pick a frequency from the list',
		col: '12',
		mandatory: false,
	},
	{
		label: 'Parameters',
		id: 'parameters',
		input: 'custom',
		col: '12',
		mandatory: false,
	},
];

function generateArrayDayCount(): number[] {
	const array: number[] = [];
	for (let i = 1; i <= 31; i++) {
		array.push(i);
	}
	return array;
}

export const options = {
	reports: [],
	frequencies: [
		'Pick a frequency from the list',
		'Once a week',
		'Everyday',
		'Once a month',
		'Personnalize',
	],

	days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	overFrequencies: ['day', 'week', 'month', 'year'],
	daysCount: generateArrayDayCount(),
};
