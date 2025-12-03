import React, { FC } from 'react';
import { IEditLocationMapButton } from '../type/interfaces/IMap';

const EditLocationMapButton: FC<IEditLocationMapButton> = ({
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
					{icon}
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

export default EditLocationMapButton;
