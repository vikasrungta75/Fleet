import React, { useState } from 'react';
import axios from 'axios';
import L from 'leaflet';

interface SearchInputProps {
	mapRef: React.RefObject<L.Map>;
	setMarkerPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>;
	setIsMapInteractive: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchInput: React.FC<SearchInputProps> = ({
	mapRef,
	setMarkerPosition,
	setIsMapInteractive,
}) => {
	const [input, setInput] = useState('');

	const handleFocus = () => {
		setIsMapInteractive(false);
	};

	const handleBlur = () => {
		setIsMapInteractive(true);
	};

	const handleSearch = () => {
		// Simulate a search operation
		setIsMapInteractive(false);

		// Example: after 2 seconds, re-enable the map
		setTimeout(() => {
			setIsMapInteractive(true);
		}, 2000);
	};

	const handleSearch1 = async () => {
		if (!input) return;

		let lat: number | null = null;
		let lng: number | null = null;

		// Check lat,lng first
		const latLngMatch = input.match(/^\s*([-+]?\d*\.\d+|\d+),\s*([-+]?\d*\.\d+|\d+)\s*$/);
		if (latLngMatch) {
			lat = parseFloat(latLngMatch[1]);
			lng = parseFloat(latLngMatch[2]);
		} else {
			// Text address
			try {
				let query = input;
				// fallback: if query too long, shorten to key parts
				if (query.length > 100) {
					// extract main locality + city
					const parts = query.split(',');
					query = parts.slice(-3).join(','); // last 3 parts: locality, area, city
				}

				const response = await axios.get(
					`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
						query,
					)}`,
				);

				if (response.data.length > 0) {
					lat = parseFloat(response.data[0].lat);
					lng = parseFloat(response.data[0].lon);
				} else {
					alert('Location not found. Try a shorter address like "JP Nagar, Bangalore"');
					return;
				}
			} catch (error) {
				console.error(error);
				alert('Error fetching location');
				return;
			}
		}

		// Move map + set marker
		if (mapRef.current && lat !== null && lng !== null) {
			mapRef.current.setView([lat, lng], 16);
			setMarkerPosition([lat, lng]);
		}
	};

	return (
		<div style={{ position: 'absolute', top: 10, left: 500, zIndex: 1000 }}>
			<input
				type='text'
				placeholder='Search address or lat,lng'
				value={input}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onChange={(e) => setInput(e.target.value)}
				style={{
					padding: '6px 10px',
					borderRadius: 4,
					border: '1px solid #ccc',
					width: 250,
				}}
			/>
			<button
				onClick={handleSearch1}
				onMouseDown={handleFocus}
				onMouseUp={handleSearch}
				style={{ marginLeft: 5, padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}>
				Go
			</button>
		</div>
	);
};

export default SearchInput;
