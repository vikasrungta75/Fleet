import ReactDOMServer from 'react-dom/server';
import { MapType } from '../type/type/mapType';
import { GoogleMapControlPosition } from '../type/enum/mapEnum';


/**
 *
 * @param mapProps
 * @param position position on the map
 * @param component component 
 * @returns mapProps
 */
const createMapComponent = (
  mapProps: MapType,
  position: GoogleMapControlPosition,
  component: React.ReactElement | Array<React.ReactElement>,
) => {
  if(!Array.isArray(component)) component = [component];

  const mapComponentContainer = document.createElement('div');
  mapComponentContainer.className = "d-block"
  component.map((it:React.ReactElement, index: number )=>{
    const controlDiv = document.createElement('div');
    const componentString = ReactDOMServer.renderToString(it);
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = componentString;
    while (tempContainer.firstChild) {
      controlDiv.appendChild(tempContainer.firstChild);
    }
    mapComponentContainer.appendChild(controlDiv);

  })
  mapProps.controls[google.maps.ControlPosition[position]].push(mapComponentContainer);
  return mapProps;
};

export default createMapComponent;
