import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/bootstrap/Button';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import { statusInformations } from './map/constants/mapConstants';

interface IInformationDrawerProps {
	setIsModalOpen: (val: boolean) => void;
	isModalOpen: boolean;
}

const InformationDrawer: FC<IInformationDrawerProps> = ({ setIsModalOpen, isModalOpen }) => {
	const { t } = useTranslation(['vehicles']);

	return (
		<OffCanvas
			style={{ width: 350 }}
			id='show-fleet-details'
			titleId='fleet details'
			placement='end'
			isOpen={isModalOpen}
			setOpen={setIsModalOpen}
			isBackdrop={false}
			isBodyScroll>
			<OffCanvasHeader className='border-1 border-bottom border-secondary'>
				<div className='fs-3 fw-semibold text-secondary w-100'>{t(`Legend`)}</div>
				<Button
					aria-label='Toggle Close'
					className='mobile-header-toggle'
					size='lg'
					color='dark'
					isLight
					icon='Close'
					onClick={() => setIsModalOpen(!isModalOpen)}
				/>
			</OffCanvasHeader>

			<OffCanvasBody className='ps-4 pe-0 legend-fleet'>
				<div className='fw-semibold my-3'>{t('status')} :</div>
				{Object.keys(statusInformations).map((status: string) => (
					<div key={status} className='d-flex align-items-center mb-3'>
						<img src={statusInformations[status].url} alt={status} className='me-3' />
						<span>{status}</span>
					</div>
				))}
			</OffCanvasBody>
		</OffCanvas>
	);
};

export default InformationDrawer;
