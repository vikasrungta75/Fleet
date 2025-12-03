import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../components/icon/Icon';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { stringWithUnderscore } from '../../../../helpers/helpers';

interface CardReportProps {
	item: { name: string; description: string };
	setindexReportSelected: (val: string) => void;
}

const CardReport: FC<CardReportProps> = ({ item, setindexReportSelected }) => {
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { t } = useTranslation(['reports']);

	return (
		<div
			onClick={() => setindexReportSelected(stringWithUnderscore(item.name))}
			style={{ cursor: 'pointer', height: '100%' }}
			className='repport-card'>
			<div className='d-flex align-items-center mb-2'>
				<p className='repport-card-title mb-0'> {t(item.name)} </p>
				{/* <Icon
					icon={dir === 'rtl' ? 'ArrowBackIos' : 'ArrowForwardIos'}
					className='ms-3'
					size='md'
				/> */}
			</div>
			<p className='repport-card-description'>{t(item.description)}</p>
		</div>
	);
};

export default CardReport;
