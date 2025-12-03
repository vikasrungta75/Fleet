import React, { FC } from 'react';
import { Close } from '../../../components/icon/material-icons';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface HeaderComponentPointOfInterestProps {
	setIsPOIVisible: (value: boolean) => void;
	isPOIVisible: boolean;
	title: string;
}

const HeaderComponentPointOfInterest: FC<HeaderComponentPointOfInterestProps> = ({
	setIsPOIVisible,
	isPOIVisible,
	title,
}) => {
	const { t } = useTranslation(['vehicles']);
	const dispatch = useDispatch();
	return (
		<>
			<div className='d-flex'>
				<div className='p-2 w-100'>
					<span style={{ fontWeight: '700', fontSize: '12', color: '#6D6D6D' }}>
						{t(title)}
					</span>
				</div>
				<div className='p-2 flex-shrink-1'>
					<Close
						fontSize={'large'}
						color='black'
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setIsPOIVisible(!isPOIVisible);
							dispatch.appStoreNoPersist.handleStateMapPointInterest(!isPOIVisible);
							
						}}
					/>
				</div>
			</div>
			<hr
				style={{
					margin: '0px 0px',
					border: '1px solid #E4E4E4',
				}}
			/>
		</>
	);
};

export default HeaderComponentPointOfInterest;
