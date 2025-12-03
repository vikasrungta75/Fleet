export const TabsVehicle = [
    { key: 'Vehicles', value: 'Vehicles', id: '1' },
    { key: 'Daily driver usage', value: 'Daily driver usage', id: '2' },
    { key: 'Fuel performance', value: 'Fuel performance', id: '3' },
    { key: 'Daily vehicle usage', value: 'Daily vehicle usage', id: '4' },
    { key: 'Vehicle Record', value: 'Vehicle Record', id: '5' },
    { key: 'Vehicle Stopped', value: 'Vehicle Stopped', id: '6' },
    { key: 'Trip Reports', value: 'Trip Reports', id: '7' },
    { key: 'Trip Shift Reports', value: 'Trip Shift Reports', id: '8' },
    // {key:  'Temperature level statistics',value:'Temperature level statistics',id:'18'},
    { key: 'Geofences Visits', value: 'Geofences Visits', id: '9' },
    { key: 'Engine Hours', value: 'Engine Hours', id: '10' },
    { key: 'Tracker Detach', value: 'Tracker Detach', id: '11' },
    { key: 'Fuel Volume', value: 'Fuel Volume', id: '12' },
    { key: 'Working Hours', value: 'Working Hours', id: '13' },
    { key: 'Device On / OFF', value: 'Device On / OFF', id: '14' },
    { key: 'Connection Lost', value: 'Connection Lost', id: '15' },
    { key: 'Eco Drive', value: 'Eco Drive', id: '16' },
    { key: 'Speed Violations', value: 'Speed Violations', id: '17' },
];
export const columnsDailyDriveUsage = [
    { name: 'VIN', key: '_id', sortable: false, width: '' },
    { name: 'Time', key: 'time', sortable: true, width: '' },
    { name: 'Distance', key: 'distance', sortable: true, width: '' },
    { name: 'overspeeding', key: 'overspeeding', sortable: true, width: '', unit: 'time' },
    { name: 'Harsh acc', key: 'harsh_acc', sortable: true, width: '', unit: 'time' },
    { name: 'Harsh dec', key: 'harsh_dec', sortable: true, width: '', unit: 'time' },
    { name: 'POI violations', key: 'poi_violations', sortable: true, width: '', unit: 'time' },
    { name: 'drive score', key: 'drive_score', sortable: true, width: '' },
];
 
export const columnsFuelPerformance = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Fuel Usage', key: 'fuel_usage', sortable: true, width: '' },
    { name: 'avg fuel usage', key: 'avg_fuel_usage', sortable: true, width: '' },
    { name: 'Mileage', key: 'mileage', sortable: true, width: '' },
];
 
export const columnsDailyVehicleUsage = [
    { name: 'VIN', key: '_id', sortable: false, width: '' },
    { name: 'Distance', key: 'distance', sortable: true, width: '' },
    { name: 'start address', key: 'start_address', sortable: true, width: '' },
    { name: 'end address', key: 'end_address', sortable: true, width: '' },
    { name: 'Idle time', key: 'idle_time', sortable: true, width: '' },
    { name: 'maximum speed', key: 'maximum_speed', sortable: true, width: '' },
    { name: 'average speed', key: 'average_speed', sortable: true, width: '' },
    { name: 'running time', key: 'running_time', sortable: true, width: '' },
];
 
export const columnsVehicleRaprts = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Odometer', key: 'odometer', sortable: true, width: '' },
    { name: 'fuel', key: 'fuel', sortable: true, width: '' },
];
export const columnsVehicleStopped = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '120px' },
 
    {
        name: 'Start time of stop',
        key: 'start_time_of_stop',
        sortable: true,
        width: '',
        format_date: true,
    },
    {
        name: 'Stop time of stop',
        key: 'stop_time_of_stop',
        sortable: true,
        width: '',
        format_date: true,
    },
    { name: 'Stop Address', key: 'stop_address', sortable: true, width: '' },
    { name: 'Stop Duration', key: 'stop_duration', sortable: true, width: '' },
    { name: 'Stop Idle Hours', key: 'stop_idle_hours', sortable: true, width: '' },
    { name: 'Stop Cordinates', key: 'stop_cordinates', sortable: true, width: '' },
    // { name: 'Stop latitude cordinate', key: 'stop_lat_cordinate', sortable: true, width: '' },
    // { name: 'Stop Longititude', key: 'stop_long_cordinate', sortable: true, width: '' },
];
 
export const columnsWorkingHours = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
 
    {
        name: 'Date',
        key: 'date',
        sortable: true,
        width: '',
        format_date_only: true,
    },
 
    {
        name: 'Operation Time',
        key: 'operation_time',
        sortable: true,
        width: '',
        format_time: false,
    },
 
    {
        name: 'Engine Start Time',
        key: 'engine_start_time',
        sortable: true,
        width: '',
        format_time: true,
    },
    {
        name: 'Engine Stop Time',
        key: 'engine_stop_time',
        sortable: true,
        width: '',
        format_time: true,
    },
 
    {
        name: 'Idle Time',
        key: 'idle_time',
        sortable: true,
        width: '',
    },
 
    {
        name: 'Inmovement Per',
        key: 'inmovement_per',
        sortable: true,
        width: '',
    },
    {
        name: 'Inmovement Time',
        key: 'inmovement_time',
        sortable: true,
        width: '',
    },
 
    {
        name: 'Last Location',
        key: 'lastlocation',
        sortable: true,
        width: '',
    },
 
    {
        name: 'Mileage',
        key: 'mileage',
        sortable: true,
        width: '',
    },
    {
        name: 'Operation Duration',
        key: 'operation_duration',
        sortable: true,
        width: '',
    },
    {
        name: 'Start Location',
        key: 'startlocation',
        sortable: true,
        width: '',
    },
];
 
export const columnsConnectionLost = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
 
    {
        name: 'Address',
        key: 'address',
        sortable: true,
        width: '',
    },
    {
        name: 'Duration',
        key: 'duration',
        sortable: true,
        width: '',
    },
 
    {
        name: 'Time At Connection Lost',
        key: 'time_at_connection_lost',
        sortable: true,
        width: '',
        format_date: true,
    },
    {
        name: 'Time At Connection Recover',
        key: 'time_at_connection_recover',
        sortable: true,
        width: '',
        format_date: true,
    },
];
 
export const columnsSpeedViolations = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
    {
        name: 'Address',
        key: 'address',
        sortable: true,
        width: '',
    },
    {
        name: 'AVG Speed',
        key: 'avg_speed',
        sortable: true,
        width: '',
    },
    {
        name: 'Duration',
        key: 'duration',
        sortable: true,
        width: '',
    },
    {
        name: 'Speed Limit',
        key: 'speed_limit',
        sortable: true,
        width: '',
    },
    {
        name: 'Speed At Violation',
        key: 'speed_at_violation',
        sortable: true,
        width: '',
    },
    {
        name: 'Time',
        key: 'time',
        sortable: true,
        width: '',
        format_time: true,
    },
];
 
export const columnsTripVehicles = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Trip ID', key: '_id', sortable: false, width: '' },
    { name: 'Distance', key: 'distance', sortable: false, width: '' },
    { name: 'Duration', key: 'duration', sortable: false, width: '' },
    {
        name: 'Trip start',
        key: 'trip_start',
        sortable: false,
        width: '',
        dateFormatterwithHoursValue: false,
    },
    { name: 'Avg Speed', key: 'avg_speed', sortable: false, width: '' },
    { name: 'Max Speed', key: 'max_speed', sortable: false, width: '' },
    { name: 'Start Address', key: 'start_address', sortable: false, width: '' },
    { name: 'End Address', key: 'end_address', sortable: false, width: '' },
    { name: 'Fuel consumption can', key: 'fuel_consumption_can', sortable: false, width: '' },
    { name: 'Fuel consumption theory', key: 'fuel_consumption_theory', sortable: false, width: '' },
    { name: 'Inactivity time', key: 'inactivity_time', sortable: false, width: '' },
    { name: 'Fuel Cost per Trip', key: 'fuel_costs_per_trip', sortable: false, width: '' },
    { name: 'Start Cordinates', key: 'start_coordinates', sortable: false, width: '' },
    { name: 'End Coordinates', key: 'end_coordinates', sortable: false, width: '' },
];
export const columnsTripShiftVehicles = [
    { name: 'VIN', key: 'vin', sortable: false, width: '' },
    { name: 'Trip ID', key: '_id', sortable: false, width: '' },
    { name: 'Distance', key: 'distance', sortable: false, width: '' },
    { name: 'Duration', key: 'duration', sortable: false, width: '' },
    { name: 'Avg Speed', key: 'avg_speed', sortable: false, width: '' },
    { name: 'Max Speed', key: 'max_speed', sortable: false, width: '' },
    { name: 'Start Address', key: 'start_address', sortable: false, width: '' },
    { name: 'End Address', key: 'end_address', sortable: false, width: '' },
    { name: 'Fuel consumption can', key: 'fuel_consumption_can', sortable: false, width: '' },
    { name: 'Fuel consumption theory', key: 'fuel_consumption_theory', sortable: false, width: '' },
    { name: 'Inactivity time', key: 'inactivity_time', sortable: false, width: '' },
    { name: 'Fuel Cost per Trip', key: 'fuel_costs_per_trip', sortable: false, width: '' },
    { name: 'Start Cordinates', key: 'start_coordinates', sortable: false, width: '' },
    { name: 'End Coordinates', key: 'end_coordinates', sortable: false, width: '' },
];
 
export const signTripShiftReports = [{ name: 'minus' }, { name: 'plus' }, { name: 'asterisk' }];
export const shiftTrip = ['day', 'night'];
export const TimeTripOptions = [
    { name: '500' },
    { name: '1000' },
    { name: '1500' },
    { name: '2000' },
];
export const columnsGeofencesVisitsSummary = [
    { name: 'Name of the zone', key: 'geofence_name', sortable: false, width: '' },
    { name: 'Trip Id', key: 'trip_id', sortable: false, width: '' },
    { name: 'Number of visits', key: 'no_of_visit', sortable: false, width: '' },
    {
        name: 'Total duration of visits',
        key: 'total_duration_of_visits',
        sortable: false,
        width: '',
    },
    {
        name: 'Average duration time of visits',
        key: 'average_duration_of_visits',
        sortable: false,
        width: '',
    },
    {
        name: 'Mileage (odometer) of vehicule',
        key: 'mileage',
        sortable: false,
        width: '',
    },
];
export const columnsGeofencesVisitsDetails = [
    { name: 'Geozone Name', key: 'geozone_name', sortable: false, width: '150px' },
    { name: 'Entry (Time)', key: 'entry_time', sortable: false, width: '150px', format_date: true },
    { name: 'Entry (Adress)', key: 'entry_address', sortable: false, width: '' },
    { name: 'Exit (Time)', key: 'exit_time', sortable: false, width: '150px', format_date: true },
    { name: 'Exit (Adress)', key: 'exit_address', sortable: false, width: '' },
    { name: 'Duration', key: 'duration', sortable: true, width: '' },
    { name: 'Mileage', key: 'mileage', sortable: false, width: '' },
];
 
export const columnsEngineHours = [
    { name: 'VIN', key: 'vin', sortable: true, width: '150px' },
    { name: 'Mileage', key: 'mileage', sortable: true, width: '' },
    { name: 'Intervals', key: 'intervals', sortable: false, width: '' },
    { name: 'Avg Speed', key: 'avg_speed', sortable: true, width: '' },
    { name: 'Idle Percentage', key: 'idle_percentage', sortable: true, width: '' },
    { name: 'Movement Percentage', key: 'movement_percentage', sortable: true, width: '' },
    { name: 'Stop Percentage', key: 'stop_percentage', sortable: true, width: '' },
    { name: 'Idle Duration', key: 'idle_duration', sortable: true, width: '' },
    { name: 'Movement Duration', key: 'movement_duration', sortable: true, width: '' },
    { name: 'Stop Duration', key: 'stop_duration', sortable: true, width: '' },
];
 
export const columnsTrackerDetach = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    // { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
    { name: 'Number Of Deplug Events', key: 'no_of_deplug_events', sortable: true, width: '' },
    {
        name: 'Time Of Detach',
        key: 'time_of_detach',
        sortable: true,
        width: '',
        format_date: true,
    },
    { name: 'Lat.', key: 'latitude', sortable: true, width: '' },
    { name: 'Long.', key: 'longitude', sortable: true, width: '' },
    { name: 'Address', key: 'address', sortable: false, width: '' },
];
 
export const columnsFuelVolume = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
    {
        name: 'Minimum Fuel Level',
        key: 'minimum_fuel_level',
        sortable: true,
        width: '',
    },
    { name: 'Maximum fuel level', key: 'maximum_fuel_level', sortable: true, width: '' },
    { name: 'Average fuel level', key: 'average_fuel_level', sortable: true, width: '' },
];
export const columnsFuelVolumeAnalysis = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
 
    {
        name: 'Date',
        key: 'date',
        sortable: true,
        width: '',
        format_date: true,
    },
    { name: 'Fill Count', key: 'fill_count', sortable: true, width: '' },
    { name: 'Drain Count', key: 'drain_count', sortable: true, width: '' },
    { name: 'Can Mileage', key: 'can_mileage', sortable: true, width: '' },
    { name: 'GPS Mileage', key: 'gps_mileage', sortable: true, width: '' },
    { name: 'GPS Consumed Per 100km', key: 'gps_consumed_per100km', sortable: true, width: '' },
    { name: 'Can Consumed Per 100km', key: 'can_consumed_per100km', sortable: true, width: '' },
    { name: 'Can Initial', key: 'can_initial', sortable: true, width: '' },
    { name: 'GPS Consumed', key: 'gps_consumed', sortable: true, width: '' },
    { name: 'Can Final', key: 'can_final', sortable: true, width: '' },
    { name: 'Can Consumed', key: 'can_consumed', sortable: true, width: '' },
];
export const columnsFuelTank = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
    {
        name: 'Time',
        key: 'time',
        sortable: true,
        width: '',
        // format_time: true,
    },
    { name: 'Last Lat.', key: 'last_lat', sortable: true, width: '' },
    { name: 'Last Long.', key: 'last_long', sortable: true, width: '' },
    { name: 'Mileage', key: 'mileage', sortable: true, width: '' },
    { name: 'Volume Change', key: 'volume_change', sortable: true, width: '' },
    { name: 'Last Location', key: 'lastlocation', sortable: true, width: '' },
    { name: 'Volume Before Operation', key: 'volume_before_operation', sortable: true, width: '' },
    { name: 'Volume After Operation', key: 'volume_after_operation', sortable: true, width: '' },
    { name: 'Operation', key: 'operation', sortable: true, width: '' },
];
 
export const columnsDeviceOfOff = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
 
    { name: 'Address', key: 'address', sortable: false, width: '' },
    {
        name: 'Time Event Off',
        key: 'date_time_event_off',
        sortable: true,
        width: '',
        format_date: false,
    },
    {
        name: 'Time Event On',
        key: 'date_time_event_on',
        sortable: true,
        width: '',
        format_date: false,
    },
    { name: 'Last Device Voltage', key: 'last_device_voltage', sortable: true, width: '' },
];
 
export const columnsEcoDrive = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
 
    { name: 'Safety Score', key: 'safety_score', sortable: true, width: '' },
    {
        name: 'Safety Maneuvers Frequency',
        key: 'safety_maneuvers_frequency',
        sortable: true,
        width: '',
    },
    { name: 'Energy', key: 'energy', sortable: true, width: '' },
    { name: 'Eco Score', key: 'eco_score', unit: '%', sortable: true, width: '' },
    { name: 'Global Score', key: 'global_score', unit: '%', sortable: true, width: '' },
    { name: 'Total Distance', key: 'total_distance', sortable: true, width: '' },
    { name: 'Total Consumption', key: 'total_consumption', sortable: true, width: '' },
    { name: 'Average Distance', key: 'average_distance', sortable: true, width: '' },
    { name: 'Average Consumption', key: 'average_consumption', sortable: true, width: '' },
    {
        name: 'Harsh Acceleration Count',
        key: 'harsh_acceleration_count',
        sortable: true,
        width: '',
    },
    { name: 'Harsh Braking Count', key: 'harsh_braking_count', sortable: true, width: '' },
    { name: 'Harsh Turn Count', key: 'harsh_turn_count', sortable: true, width: '' },
    { name: 'Total CO2 Emission', key: 'total_co2_emission', sortable: true, width: '' },
    { name: 'Average CO2 Emission', key: 'average_co2_emission', sortable: true, width: '' },
    { name: 'Total Duration', key: 'total_duration', sortable: true, width: '' },
    { name: 'Average Duration', key: 'average_duration', sortable: true, width: '' },
    { name: 'Idle Time', key: 'idle_time', sortable: true, width: '' },
    { name: 'Standby Average', key: 'standby_average', sortable: true, width: '' },
];
 
export const columnsTemperatureReports = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Time', key: 'generated_time', sortable: true, width: '' },
    { name: '°C', key: 'temperature', sortable: true, width: '' },
    { name: 'Coordinates', key: 'coordinates', sortable: false, width: '' },
    { name: 'Address', key: 'address', sortable: false, width: '' },
    // { name: 'Fleet', key: 'fleet_name', sortable: true, width: '' },
    // { name: 'Date', key: 'time_stamp', timestamps: true, sortable: true, width: '' },
];
export const columnsTemperatureMnReports = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Min °C', key: 'min_temp', sortable: true, width: '10%' },
    { name: 'Start address', key: 'start_address', sortable: false, width: '30%' },
    { name: 'Start coordinates', key: 'start_coordinates', sortable: false, width: '' },
    { name: 'Max °C', key: 'max_temp', sortable: true, width: '10%' },
    { name: 'End address', key: 'end_address', sortable: false, width: '30%' },
    { name: 'End coordinates', key: 'end_coordinates', sortable: false, width: '' },
];
export const columnsPOI = [
    { name: 'Name Of POI', key: 'name_of_poi', sortable: true, width: '10%' },
    { name: 'Date', key: 'time_and_date', sortable: true, width: '' },
    { name: 'Time of event', key: 'type_of_event', sortable: false, width: '15%' },
    { name: 'Vin', key: 'vin', sortable: false, width: '' },
    { name: 'Location of event', key: 'location_of_event', sortable: false, width: '' },
    { name: 'Time spent', key: 'time_spent', sortable: false, width: '10%' },
];
 
export const columnsDriverChangeRotation = [
    { name: 'Driver', key: 'driver_name', sortable: true, width: '' },
    { name: 'Date', key: 'date', sortable: true, width: '' },
    { name: 'Vin', key: 'vin', sortable: false, width: '' },
    { name: 'Location of event', key: 'location_of_event', sortable: false, width: '' },
    { name: 'Time spent per vehicle', key: 'Time_spent_per_vehicle', sortable: false, width: '' },
];
 
export const columnsDriverBehaviour = [
    { name: 'VIN', key: 'vin', sortable: true, width: '' },
    { name: 'Trip ID', key: 'trip_id', sortable: false, width: '' },
 
    { name: 'Safety Score', key: 'safety_score', sortable: true, width: '' },
    {
        name: 'Safety Maneuvers Frequency',
        key: 'safety_maneuvers_frequency',
        sortable: true,
        width: '',
    },
    { name: 'Energy', key: 'energy', sortable: true, width: '' },
    { name: 'Eco Score', key: 'eco_score', unit: '%', sortable: true, width: '' },
    { name: 'Global Score', key: 'global_score', unit: '%', sortable: true, width: '' },
    { name: 'Total Distance', key: 'total_distance', sortable: true, width: '' },
    { name: 'Total Consumption', key: 'total_consumption', sortable: true, width: '' },
    { name: 'Average Distance', key: 'average_distance', sortable: true, width: '' },
    { name: 'Average Consumption', key: 'average_consumption', sortable: true, width: '' },
    {
        name: 'Harsh Acceleration Count',
        key: 'harsh_acceleration_count',
        sortable: true,
        width: '',
    },
    { name: 'Harsh Braking Count', key: 'harsh_braking_count', sortable: true, width: '' },
    { name: 'Harsh Turn Count', key: 'harsh_turn_count', sortable: true, width: '' },
    { name: 'Total CO2 Emission', key: 'total_co2_emission', sortable: true, width: '' },
    { name: 'Average CO2 Emission', key: 'average_co2_emission', sortable: true, width: '' },
    { name: 'Total Duration', key: 'total_duration', sortable: true, width: '' },
    { name: 'Average Duration', key: 'average_duration', sortable: true, width: '' },
    { name: 'Idle Time', key: 'idle_time', sortable: true, width: '' },
    { name: 'Standby Average', key: 'standby_average', sortable: true, width: '' },
    { name: 'Driver Name', key: 'driver_name', sortable: true, width: '' },
];