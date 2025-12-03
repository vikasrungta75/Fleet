import React, { FC } from 'react';
import { IMapbutton } from '../type/interfaces/IMap';

const MapButton: FC<IMapbutton> = ({
	id,
	icon,
	text,
	title,
	className,
	onClick,
	tooltip,
	tooltipRight,
}) => {
	return (
		<div className='tooltipContainer' id={id}>
			<div className='containerMapBtn' onClick={onClick} style={{ cursor: 'pointer' }}>
				<div title={title} className={`mapBtn mapBtnFont ${className}`}>
					<img src={icon as string} alt={icon as string} /> 
					{text}
				</div>
			</div>
			{tooltip && (
				<div className='tooltipContent'>
					<p className='m-0'>{tooltip}</p>
				</div>
			)}
			{tooltipRight && (
				<div className='tooltipContentRight'>
					<p className='m-0'>{tooltipRight}</p>
				</div>
			)}
		</div>
	);
};

export default MapButton;
