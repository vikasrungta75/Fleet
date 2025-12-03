import React, { useState, useEffect, useContext } from 'react';
import { GoogleMap, GoogleMapProps, useLoadScript } from '@react-google-maps/api';
import DetailTripCard from '../DetailTripCard';
import {
	exitFullScreenImg,
	fullScreenImg,
	options,
} from '../../../../myFleet/components/map/constants/mapConstants';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../../../contexts/themeContext';
import MapButton from '../../../../myFleet/components/map/components/MapButton';
import stylesDisableCountryFrontline from '../../../../../common/other/StyleToDisabelCountryMap';

const defaultCenter = { lat: 28.612734, lng: 77.231178 };

export type MapType = Parameters<NonNullable<GoogleMapProps['onLoad']>>[0];

type MapProps = React.PropsWithChildren<{
	setMap: (map: MapType) => void | Promise<void>;
}>;

const MapDetailTrip = (props: MapProps) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { setMap, children } = props;
	const { t } = useTranslation(['vehicles']);
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPP_API ?? '', // ,
		// ...otherOptions
	});
	const [IsFullScreen, setIsFullScreen] = useState<boolean>(false);
	useEffect(() => {
		const buttonFullScreen = document.getElementById('FullScreenButton');
		if (buttonFullScreen) {
			if (IsFullScreen) {
				buttonFullScreen.innerHTML = `<img width="30px" src=${exitFullScreenImg} /> Exit Fullscreen`;
			} else {
				buttonFullScreen.innerHTML = `<img width="30px" src=${fullScreenImg} /> Fullscreen`;
			}
		}
	}, [IsFullScreen]);

	const handleFunctionSetting = () => {
		setIsFullScreen(!IsFullScreen);
	};

	const renderMap = () => {
		const loadHandler = (map: MapType) => {
			setMap(map);
			// createMapComponent(map, GoogleMapControlPosition.TOP_RIGHT, mapBtnSettings);

			// To set Full Screen button
		};

		return (
			<div className='row'>
				<div
					className={`${IsFullScreen ? 'd-none' : 'col-sm-4'}`}
					style={{ maxHeight: '86.5vh', overflowX: 'hidden', overflowY: 'auto' }}>
					<DetailTripCard />
				</div>
				<div
					className='position-absolute'
					style={{ height: 50, width: 53, right: 80, zIndex: 80 }}>
					<MapButton
						key={1}
						id='SettingButton'
						icon={fullScreenImg}
						text={t('Fullscreen')}
						title={t('Click to fill the screen')}
						onClick={handleFunctionSetting}
						tooltipRight={t('Settings')}
					/>
				</div>
				<div
					className={mobileDesign ? 'mapContainer' : ''}
					style={{ flex: '1', display: 'flex' }}>
					<GoogleMap
						id='circle-example'
						mapContainerStyle={{
							height:'100vh',
							width: '110%',
						}}
						zoom={10}
						center={defaultCenter}
						options={{
							styles: stylesDisableCountryFrontline,
							...options,
						}}
						onLoad={loadHandler}>
						{children}
					</GoogleMap>
				</div>
			</div>
		);
	};

	if (loadError) {
		return <div>Map cannot be loaded right now, sorry.</div>;
	}

	return isLoaded ? renderMap() : <div>Loading...</div>;
};

export default MapDetailTrip;
