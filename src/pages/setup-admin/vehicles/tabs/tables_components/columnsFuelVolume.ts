export const columnsColumnsFuelVolume = [
	{
		name: 'Date',
		key: 'date',
	},
	{
		name: 'Consumption calculated by GPS',
		key: 'consumption_calculated_by_gps',
		width: 250,
		subHeader: [
			{ name: 'Mileage (km)', key: 'gps_mileage' },
			{ name: 'Consumption by calculation (L)', key: 'gps_consumed' },
			{
				name: 'Consumption by calculation (L/100km)',
				key: 'gps_consumed_per100km',
			},
		],
	},
	{
		name: 'Consumption calculated by sensor',
		key: 'consumption_calculated_by_sensor',
		width: 250,
		subHeader: [
			{ name: 'Initial volume (L)', key: 'sensor_intial_volume' },
			{ name: 'Final volume (L)', key: 'sensor_final_volume' },
			{ name: 'Consumed (L)', key: 'sensor_consumed' },
			{ name: 'Consumed (L/h)', key: 'sensor_consumed_lh' },
		],
	},
	{
		name: 'Filing',
		key: 'filing',
		subHeader: [
			{
				name: 'Number',
				key: 'fill_count',
			},
			{
				name: 'Volume (L)',
				key: 'fill_quantity',
			},
		],
	},
	{
		name: 'Emptying',
		key: 'emptying',
		subHeader: [
			{ name: 'Number', key: 'drain_count' },
			{ name: 'Volume', key: 'drain_quantity' },
		],
	},
];

export const monitoringFuelTank = [
	{
		name: 'Date',
		key: 'date',
	},
	{
		name: 'Monitoring Fuel tank',
		key: 'monitoringFuelTank',
	},
	{
		name: 'Volume(L)',
		key: 'volume_l',
	},
	{
		name: 'Starting Volume(L)',
		key: 'starting_volume_l',
	},
	{
		name: 'Endling Volume(L)',
		key: 'endling_volume_l',
	},
	{
		name: 'Since the start(km)',
		key: 'since_start_km',
	},
	{
		name: 'Address',
		key: 'address',
	},
];

export const columnsDetailedFuelReport = [
	{
		name: 'Tracer',
		key: 'tracer ',
	},
	{
		name: 'Filling',
		key: 'filling',
		width: 150,
		subHeader: [
			{ name: 'Numbers', key: 'numbers' },
			{ name: 'Volume(L)', key: 'volume' },
		],
	},
	{
		name: 'Draining',
		key: 'draining',
		width: 150,
		subHeader: [
			{ name: 'Numbers', key: 'numbers' },
			{ name: 'Volume(L)', key: 'volume' },
		],
	},
	{
		name: 'Kilometers(Km)',
		key: 'kilometers',
	},
	{
		name: 'Fuel savings / Fuel costs (l)',
		key: 'fuel_savings',
	},
];

export const orderTotalFuelReportDetailed = [
	'fill_count',
	'fill_quantity',
	'drain_count',
	'drain_quantity',
	'distance',
	'fuel_savings_fuel_coast',
];

export const orderFuelVolume = [
	'gps_mileage',
	'gps_consumed',
	'gps_consumed_per100km',
	'sensor_intial_volume',
	'sensor_final_volume',
	'sensor_consumed',
	'sensor_consumed_lh',
	'fill_count',
	'fill_quantity',
	'drain_count',
	'drain_quantity',
];

export enum VehicleDataKey {
	VehicleType = 'vehicle_type',
	FuelCardNumber = 'fuel_card_no',
	Driver = 'driver_name',
	City = 'city',
	Vehicle = 'vehicle_type',
	MileageDriven = 'mileage',
	FuelConsumedPerHour = 'fuel_consumed_perhr',
	FuelConsumedPer100km = 'fuel_consumed_per100km',
	InitialFuelCardBalance = 'fuel_card_initial_bal',
	FundedAmount = 'funded_anount',
}
export enum VehicleRatioKey {
	City = 'city',
	FuelConsumedLHratioTheo = 'fuel_consumed_LHratio_theo',
	VehicleType = 'vehicle_type',
	ConsumptionLocalCurr = 'consumption_local_curr',
	FuelConsumedLHratio = 'fuel_consumed_LHratio',
	FuelConsumedLper100km = 'fuel_consumed_Lper100km',
	FuelConsumedLper100kmTheo = 'fuel_consumed_Lper100km_theo',
	DriverName = 'driver_name',
	ConsuptionRateLocalCurr = 'consuption_rate_local_curr',
	Vin = 'vin',
	Comment = 'comment',
	CurrentBal = 'current_bal',
	FuelCardNo = 'fuel_card_no',
}

export interface VehicleData {
	name: string;
	key: VehicleDataKey;
}

export const columnsFuelConsumptionData = [
	{
		name: 'Data',
		key: 'data',
		width: '100%',
		subHeader: [
			{ name: 'Vehicle type', key: VehicleDataKey.VehicleType },
			{ name: 'Fuel Card Number', key: VehicleDataKey.FuelCardNumber },
			{ name: 'Driver', key: VehicleDataKey.Driver },
			{ name: 'City', key: VehicleDataKey.City },
			{ name: 'Vehicle', key: VehicleDataKey.Vehicle },
			{ name: 'Mileage Driven', key: VehicleDataKey.MileageDriven },
			{ name: 'Fuel Consumed (per hour)', key: VehicleDataKey.FuelConsumedPerHour },
			{ name: 'Fuel Consumed (per 100km)', key: VehicleDataKey.FuelConsumedPer100km },
			{ name: 'Initial fuel card balance', key: VehicleDataKey.InitialFuelCardBalance },
			{ name: 'Funded amount', key: VehicleDataKey.FundedAmount },
		],
	},
];
export const columnsFuelConsumptionRatio = [
	{
		name: 'Ratios',
		key: 'ratio',
		width: '80%',
		subHeader: [
			{ name: 'Vehicle type', key: VehicleRatioKey.VehicleType },
			{ name: 'Fuel Card Number', key: VehicleRatioKey.FuelCardNo },
			{ name: 'Driver', key: VehicleRatioKey.DriverName },
			{ name: 'City', key: VehicleRatioKey.City },
			{ name: 'Vehicle', key: VehicleRatioKey.Vin },
			{
				name: 'Fuel Consumed L/h ration (CAN based or Sensor based )',
				key: VehicleRatioKey.FuelConsumedLHratio,
			},
			{
				name: 'Fuel Consumed L/h ration (theorical )',
				key: VehicleRatioKey.FuelConsumedLHratioTheo,
			},
			{
				name: 'Fuel Consumed L/100km (CAN based or Sensor based)',
				key: VehicleRatioKey.FuelConsumedLper100km,
			},
			{
				name: 'Fuel Consumed L/100Km (theorical)',
				key: VehicleRatioKey.FuelConsumedLper100kmTheo,
			},
			{
				name: 'Consumption( in local currency)',
				key: VehicleRatioKey.ConsuptionRateLocalCurr,
			},
			{ name: 'Current balance', key: VehicleRatioKey.CurrentBal },
			{ name: 'Consumption rate (in local currency)', key: VehicleRatioKey.CurrentBal },
		],
	},
	{
		name: 'Analysis',
		key: 'analysis',
		width: '20%',
		subHeader: [{ name: 'Comment', key: VehicleRatioKey.Comment }],
	},
];

export const totalFuelConsumptionData = [
	'fuel_card_no',
	'driver_name',
	'city',
	'vehicle_type',
	'mileage',
	'fuel_consumed_perhr',
	'fuel_consumed_per100km',
	'fuel_card_initial_bal',
	'funded_anount',
];

export const totalFuelConsumptionRatio = [
	// VehicleRatioKey.VehicleType,
	VehicleRatioKey.FuelCardNo,
	VehicleRatioKey.DriverName,
	VehicleRatioKey.City,
	VehicleRatioKey.Vin,
	VehicleRatioKey.FuelConsumedLHratio,
	VehicleRatioKey.FuelConsumedLHratioTheo,
	VehicleRatioKey.FuelConsumedLper100km,
	VehicleRatioKey.FuelConsumedLper100kmTheo,
	VehicleRatioKey.ConsumptionLocalCurr,
	VehicleRatioKey.CurrentBal,
	VehicleRatioKey.ConsuptionRateLocalCurr,
	VehicleRatioKey.Comment,
];

export enum DriverMetricsReportColumnKeys {
	Client = 'client',
	Branch = 'branch',
	DriverRFIDTag = 'driver_rfid_tag',
	Distance = 'distance',
	MovingTime = 'moving_time',
	IdlingTime = 'idling_time',
	StoppedTime = 'stopped_time',
	FirstContactON = 'first_contact_on',
	LastContactOFF = 'last_contact_off',
	AvgSpeed = 'avg_speed',
	MaxSpeed = 'max_speed',
	Alerts = 'alerts',
	NumberOfTrips = 'number_of_trips',
}

export const driverMetricsReportColumns = [
	{ name: 'Client', key: 'client' },
	{ name: 'Branch', key: 'branch' },
	{ name: 'Driver RFID Tag', key: 'driver_rfid_tag' },
	{ name: 'Distance', key: 'distance' },
	{ name: 'Moving time', key: 'moving_time' },
	{ name: 'Idling time', key: 'idling_time' },
	{ name: 'Stopped time', key: 'stopped_time' },
	{ name: 'First contact ON', key: 'first_contact_on' },
	{ name: 'Last contact OFF', key: 'last_contact_off' },
	{ name: 'Avg Speed', key: 'avg_speed' },
	{ name: 'Max Speed', key: 'max_speed' },
	{ name: 'Alerts', key: 'alerts' },
	{ name: 'Number of trips', key: 'number_of_trips' },
];

export const totalDriverMetricsReports = [
	{ name: DriverMetricsReportColumnKeys.Branch, isTime: false },
	{ name: DriverMetricsReportColumnKeys.DriverRFIDTag, isTime: false },
	{ name: DriverMetricsReportColumnKeys.Distance, isTime: false },
	{ name: DriverMetricsReportColumnKeys.MovingTime, isTime: true },
	{ name: DriverMetricsReportColumnKeys.IdlingTime, isTime: true },
	{ name: DriverMetricsReportColumnKeys.StoppedTime, isTime: true },
	{ name: DriverMetricsReportColumnKeys.FirstContactON, isTime: false },
	{ name: DriverMetricsReportColumnKeys.LastContactOFF, isTime: false },
	{ name: DriverMetricsReportColumnKeys.AvgSpeed, isTime: false },
	{ name: DriverMetricsReportColumnKeys.MaxSpeed, isTime: false },
	{ name: DriverMetricsReportColumnKeys.Alerts, isTime: false },
	{ name: DriverMetricsReportColumnKeys.NumberOfTrips, isTime: false },
];
