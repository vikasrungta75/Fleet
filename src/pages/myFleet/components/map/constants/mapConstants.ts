import { CSSProperties } from 'react';
import { svg } from '../../../../../assets/index';
import { TColor } from '../../../../../type/color-type';

export const ilStyle = {
	cursor: 'pointer',
};

export const options = {
	disableDefaultUI: false,
	scaleControl: false,
	labels: false,
	fullscreenControl: false, // Hide the FullScreenButton
	streetViewControl: false,
	mapTypeControl: false,
	mapTypeControlOptions: {},
};

export const defaultCenter = { lat: 32.9267316, lng: -6.929636599999999 };

export const statusInformations: {
	[key: string]: { url: string; color: TColor | string; opacity: string };
} = {
	Running: {
		url: svg.active,
		color: 'custom-green',
		opacity: 'custom-green-opacity',
	},
	Idle: {
		url: svg.idle,
		color: 'custom-orange',
		opacity: 'custom-orange-opacity',
	},
	Parked: {
		url: svg.parked,
		color: 'custom-blue',
		opacity: 'custom-blue-opacity',
	},
	Stopped: {
		url: svg.stopped,
		color: 'danger',
		opacity: 'custom-red-opacity',
	},
	Disconnected: {
		url: svg.disconnected,
		color: 'custom-grey',
		opacity: 'custom-grey-opacity',
	},
	Trouble: {
		url: svg.trouble,
		color: 'dark',
		opacity: 'custom-grey-opacity',
	},
};

export const statusFilters = [
	{ label: 'Total', value: 'total_vehicles', filteredGroup: 'Total', color: '#ffcd02' },
	{
		label: 'Active',
		value: 'active_vehicles',
		filteredGroup: 'Running',
		color: '#58ca22',
	},
	{
		label: 'Idle',
		value: 'idle_vehicles',
		filteredGroup: 'Idle',
		color: '#ff9900',
	},
	{
		label: 'Parked',
		value: 'parked_vehicles',
		filteredGroup: 'Parked',
		color: '#0bb4f1',
	},
	{
		label: 'Stopped',
		value: 'stopped_vehicles',
		filteredGroup: 'Stopped',
		color: '#ff0000',
	},
	{
		label: 'Disconnected',
		value: 'disconnected_vehicles',
		filteredGroup: 'Disconnected',
		color: '#8b8b8b',
	},
	{
		label: 'Trouble',
		value: 'trouble_vehicles',
		filteredGroup: 'Trouble',
		color: '#19191a',
	},
];

export const statusArray = [
	{ Running: 'active_vehicles' },
	{ Idle: 'idle_vehicles' },
	{ Parked: 'parked_vehicles' },
	{ Stopped: 'stopped_vehicles' },
	{ Disconnected: 'disconnected_vehicles' },
	{ Trouble: 'trouble_vehicles' },
];

export const rtlStyleSortFilter: CSSProperties = {
	position: 'absolute',
	left: '370px',
};

export const showAllImg = svg.car;
export const fullScreenImg = svg.fullscreen;
export const exitFullScreenImg = svg.exitFullscreen;
export const trafficLightImg = svg.traffic;
export const settingImg = svg.setting;
export const searchImg = svg.search;
export const listImg = svg.list;
export const polygone = svg.polygone;
export const polygoneColored = svg.polygoneColored;
export const cercle = svg.brightness_1;
export const cercleColored = svg.brightness_1_colored;
export const polyline = svg.polyline;
export const homePin = svg.home_pin;
