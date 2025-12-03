import React, { FC } from 'react';
import { CardBody } from '../../../../components/bootstrap/Card';
import { ILeastFiveDriver } from '../../../../type/driver-types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProfileArrow from '../../../../components/icon/svg-icons/ProfileArrow';
interface LeastFiveDriverComponentProps {
	argDataLeastDriver: ILeastFiveDriver;
}

const LeastFiveDriverComponent: FC<LeastFiveDriverComponentProps> = ({ argDataLeastDriver }) => {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation(['driverLeaderboard']);

	return (
		<CardBody style={{ padding: '0',width:"235px" }}>
			<div className='d-flex bd-highlight' >
				<div className='p-2 flex-shrink-1 bd-highlight' style={{ flex: '1' }}>
					<div className='p-2 bd-highlight text-center'>
						<img
							style={{ cursor: 'pointer' }}
							onClick={() => {
								navigate(
									`../detaildriver/profil/${argDataLeastDriver.driver_name}`,
								);
							}}
							className='rounded-circle'
							src='driverProfile.png'
							width={80}
							height={80}
							alt='...'
						/>
						<div className='d-flex justify-content-center mt-2 fw-bold'>
							{argDataLeastDriver.driver_name}
						</div>
					</div>
				</div>
				<div className='vr'></div>

				<div
					className='p-0 w-100 bd-highlight'
					style={{
						padding: '0',
						display: 'flex',
						flexDirection: 'column',
						flex: '2',
					}}>
					<div
						className='d-flex bd-highlight '
						style={{
							flex: '1',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<div>
							<h5>{t('Score')}</h5>
							<h5><span className='ms-3 fw-bold'>{argDataLeastDriver.score}</span></h5>
						</div>
					</div>
					<div className='d-flex mt-n1'>
						<div className=' flex-fill'>
							<div
								// className='p-3 w-100 bg-info bg-opacity-10 border border-start-0 border-end border-bottom-0'
								className={` p-3 w-100 bg-opacity-10 ${i18n.language !== 'ar-AR' ??
									'border-start-0 border-end border-bottom-0'
									}`}>
								<div
									style={{ cursor: 'pointer',marginTop:"-40px" }}
									onClick={() => {
										navigate(
											`../detaildriver/profil/${argDataLeastDriver.driver_name}`,
										);
									}}
									className='d-flex justify-content-center fw-bold viewProfile'>
									{t('View Profile')} <ProfileArrow />
								</div>
							</div>
						</div>
						{/* <div className=' flex-fill bd-highlight'>
							<div className='p-3 w-100 bg-info bg-opacity-10 border border-start border-end-0 border-bottom-0'>
								<div
									style={{ cursor: 'pointer' }}
									onClick={() =>
										navigate(
											`../detaildriver/${argDataLeastDriver.driver_name}`,
										)
									}
									className='d-flex justify-content-center fw-bold'>
									{t('Insights')}
								</div>
							</div>
						</div> */}
					</div>
				</div>
			</div>
		</CardBody>
	);
};

export default LeastFiveDriverComponent;





