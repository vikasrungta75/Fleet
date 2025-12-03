import { SVGProps } from 'react';

import { GoogleMapControlPosition } from '../type/enum/mapEnum';
import { MapType } from '../type/type/mapType';

/**
 *
 * @param data[]
 * @returns mapProps
 */
const createMapAutoComplete = (
	mapProps: MapType,
	id: string,
	position: GoogleMapControlPosition,
	setState: Function,
	className: string = 'mapAutoComplet',
) => {
	const controlDiv = document.createElement('div');
	controlDiv.className = 'containerMapAutoComplete';

	const customControlAutoComplet = document.createElement('select');
	customControlAutoComplet.className = className;
	customControlAutoComplet.id = id;
	customControlAutoComplet.addEventListener('change', () => setState());

    const customControlAutoCompletOptions = document.createElement('option');
    customControlAutoCompletOptions.value = "test"

    customControlAutoComplet.appendChild(customControlAutoCompletOptions);
	controlDiv.appendChild(customControlAutoComplet);

	mapProps.controls[google.maps.ControlPosition[position]].push(controlDiv);
	return mapProps;
};

export default createMapAutoComplete;
