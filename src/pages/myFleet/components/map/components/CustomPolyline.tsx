import React, { FC, useEffect, useState } from 'react';
// import { Polyline } from '@react-google-maps/api';
import { Polyline, useMap } from 'react-leaflet';
import { RootState } from '../../../../../store/store';
import { useSelector } from 'react-redux';

interface CustomPolylineProps {
	path: any[];
	speedData: any[];
	options: any;
	setArrowHovered: (value: any) => void;
	selectedTrajectHistory: any;
}

const TrafficPolyline: FC<CustomPolylineProps> = ({
	path,
	speedData,
	options,
	setArrowHovered,
	selectedTrajectHistory,
}) => {
	// const { selectedTrajectHistory: TrajectHistory } = useSelector(
	// 	(state: RootState) => state.appStoreNoPersist,
	// );
	const [minSpeedState, setminSpeedState] = useState(0);
	const [maxSpeedState, setmaxSpeedState] = useState(0);
	useEffect(() => {
		// Calculate min and max speed values
		const minSpeed = Math.min(...speedData.map((speed) => extractSpeed(speed)));
		const maxSpeed = Math.max(...speedData.map((speed) => extractSpeed(speed)));
		setminSpeedState(minSpeed);
		setmaxSpeedState(maxSpeed);

		// Now you can use minSpeed and maxSpeed for your calculations
	
	}, [speedData]);
	const extractSpeed = (speed: any) => {
		// Extract numeric part from speed value
		return parseFloat(speed.replace(/\D/g, ''));
	};
	const interpolateColor = (color1: string, color2: string, ratio: number) => {
		const hex = (x: number) => {
			const hexValue = Math.round(x).toString(16);
			return hexValue.length === 1 ? '0' + hexValue : hexValue;
		};

		const r1 = parseInt(color1.substring(1, 3), 16);
		const g1 = parseInt(color1.substring(3, 5), 16);
		const b1 = parseInt(color1.substring(5, 7), 16);

		const r2 = parseInt(color2.substring(1, 3), 16);
		const g2 = parseInt(color2.substring(3, 5), 16);
		const b2 = parseInt(color2.substring(5, 7), 16);

		const interpolatedR = r1 + (r2 - r1) * ratio;
		const interpolatedG = g1 + (g2 - g1) * ratio;
		const interpolatedB = b1 + (b2 - b1) * ratio;

		return `#${hex(interpolatedR)}${hex(interpolatedG)}${hex(interpolatedB)}`;
	};

	const getGradientColor = (speedValue: number) => {
		// Normalize the speed value to a range between 0 and 1
		const normalizedSpeed = (speedValue - minSpeedState) / (maxSpeedState - minSpeedState);

		// Interpolate between blue (0) and red (1) based on the normalized speed value
		const interpolatedColor = interpolateColor('#0000FF', '#FF0000', normalizedSpeed);

		return interpolatedColor;
	};

	const createTrafficPolyline = () => {
		const polylines = [];
		for (let i = 0; i < path.length - 1; i++) {
			const segmentPath = path.slice(i, i + 2);
			const speedValue = extractSpeed(speedData[i]); // Replace with your actual speed data

			const polyline = (
				<Polyline
					key={i}
					// onMouseOver={(e) => {
					// 	if (e.latLng) {
					// 		setArrowHovered({
					// 			lat: e.latLng?.lat(),
					// 			lng: e.latLng?.lng(),
					// 			item: selectedTrajectHistory,
					// 			isOpen: true,
					// 		});
					// 	}
					// }}
					positions={segmentPath}
					pathOptions={{
						color: getGradientColor(speedValue),
						weight: options?.strokeWeight || 5,
						opacity: 1,
					}}
					eventHandlers={{
						// eslint-disable-next-line no-loop-func
						mouseover: (e: L.LeafletMouseEvent) => {
							setArrowHovered({
								lat: e.latlng.lat,
								lng: e.latlng.lng,
								item: selectedTrajectHistory,
								isOpen: true,
							});
						},
					}}
					// path={segmentPath}
					// options={{
					// 	...options,
					// 	strokeColor: getGradientColor(speedValue),
					// 	strokeOpacity: 1,
					// 	icons: [
					// 		{
					// 			icon: {
					// 				path: window.google
					// 					? google.maps.SymbolPath.FORWARD_CLOSED_ARROW
					// 					: undefined,
					// 				strokeColor: 'black',
					// 				strokeOpacity: '0.8',
					// 				scale: 1.5,
					// 			},
					// 			offset: '1000%',
					// 			repeat: '100px',
					// 		},
					// 	],
					// }}
				/>
			);

			polylines.push(polyline);
		}
		return polylines;
	};

	return <>{createTrafficPolyline()}</>;
};

export default TrafficPolyline;
