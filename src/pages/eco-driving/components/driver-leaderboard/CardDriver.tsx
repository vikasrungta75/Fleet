import React, { FC } from 'react';
import Card, { CardBody, CardFooter } from '../../../../components/bootstrap/Card';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProfileArrow from '../../../../components/icon/svg-icons/ProfileArrow';

interface CardDriverComponentProps {
	argDriver: {
		driver_name: string;
		score: string;
	};
	startdate: any;
	enddate: any;
}

const CardDriverComponent: FC<CardDriverComponentProps> = ({ argDriver, startdate, enddate }) => {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation(['driverLeaderboard']);
	const dispatch = useDispatch();

	return (
		
		<Card style={{ flex: 1, width: '240px', height: '134px', gap: '10px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #D9D9D9', boxShadow: '0px 0px 25px 0px rgba(94, 92, 154, 0.1)', }}>
			<CardBody style={{ paddingBottom: '0' }} className='d-flex'>
				<div className='d-flex bd-highlight ' style={{ flex: '1' }}>
				
					<div
						style={{
							flex: '1',
							borderRight:
								i18n.language !== 'ar-AR' ? '0.25px solid #D9D9D9' : 'unset',
							borderLeft:
								i18n.language === 'ar-AR' ? '0.25px solid #D9D9D9' : 'unset',
						}}
						className='d-flex flex-column bd-highlight  p-2 bd-highlight align-items-center'>
						<div style={{ textAlign: 'center', height: '55px', width: '55px' }}>
							<img
								style={{ cursor: 'pointer', borderRadius: '50%', width: '100%' }}
								onClick={() => {
									navigate(`../detaildriver/profil/${argDriver.driver_name}`);
								}}
								// src='driverProfile.png'
								src='https://w7.pngwing.com/pngs/184/113/png-transparent-user-profile-computer-icons-profile-heroes-black-silhouette-thumbnail.png'
								alt='vehicles status'
							/>
						</div>

						<div style={{ height: '21px', fontFamily: 'Open Sans', fontSize: '16px', fontWeight: 700, lineHeight: '21.82px', textAlign: 'left', textUnderlinePosition: 'from-font', textDecorationSkipInk: 'none', color: '#0E1726', }} className="p-2 pl-0 bd-highlight">
							{argDriver.driver_name}
						</div>
					</div>
					<div
						style={{
							flex: '1',
							borderLeft:
								i18n.language !== 'ar-AR' ? '0.25px solid #cccccc' : 'unset',
						}}
						className='p-2 bd-highlight d-flex flex-column'>
						<div className='p-2 fw-medium'>{t('Score')}</div>
						<div className='p-2 fw-bold'>{argDriver.score}</div>
						<div style={{ flex: '1' }} className='w-100 bg-info bg-opacity-10 '>
							<div
								style={{ cursor: 'pointer' }}
								onClick={() => {
									navigate(`../detaildriver/profil/${argDriver.driver_name}`);
								}}
								className='d-flex viewProfile'>
								{t('View Profile')} <ProfileArrow/>
							</div>
						</div>
					</div>
				</div>
			</CardBody>
			{/* <CardFooter className='border border-bottom-0 border-left-0 pt-0 pb-0 d-flex'>
				<div style={{ flex: '1' }} className='w-100 bg-info bg-opacity-10 '>
					<div
						style={{ cursor: 'pointer' }}
						onClick={() => {
							navigate(`../detaildriver/profil/${argDriver.driver_name}`);
						}}
						className='d-flex justify-content-center fw-bold'>
						{t('Profile')}
					</div>
				</div>
				<div className='vr'></div>
				<div style={{ flex: '1' }} className='w-100 bg-info bg-opacity-10 '>
					<div
						style={{ cursor: 'pointer' }}
						onClick={() => {
							dispatch.filters.filtersStore({
								startDate: startdate,
								endDate: enddate,
							});
							navigate(`../detaildriver/${argDriver.driver_name}`);
						}}
						className='d-flex justify-content-center fw-bold'>
						{t('Insights')}
					</div>
				</div>
			</CardFooter> */}
		</Card>
	);
};

export default CardDriverComponent;
