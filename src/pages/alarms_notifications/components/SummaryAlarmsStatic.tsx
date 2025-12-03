import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import Icon from '../../../components/icon/Icon';
import { RootState } from '../../../store/store';

interface AlarmDetail {
	start_location: string;
	alarm_detail: string;
	model: string;
	fuel_type: string;
	vin: string;
	location: string;
	start_time: string;
	end_time: string;
}

const SummaryAlarmStatics = (): JSX.Element => {
	const { t } = useTranslation(['vehicles']);
	const { totalCountOfAlarms, totalOfEachAlarms, alarmDetail } = useSelector(
		(state: RootState) => state.alertsNotifications,
	);

	// Instead of checking only totalCountOfAlarms
	if (
		(!totalCountOfAlarms || totalCountOfAlarms.length === 0) &&
		(!totalOfEachAlarms || totalOfEachAlarms.length === 0)
	) {
		return (
			<div className='col-12 text-center'>
				<p>No data available.</p>
			</div>
		);
	}

	const cardsToDisplay = [];

	if (totalCountOfAlarms.length > 0) {
		cardsToDisplay.push({
			name: 'Total',
			count: totalCountOfAlarms[0]?.total_alarm_count || 0,
			toBeDisplayed: true,
		});
	}

	const newCards: any = totalOfEachAlarms.map((alarm) => {
		return { name: alarm.alarms, count: alarm.count, toBeDisplayed: true };
	});

	cardsToDisplay.push(...newCards);

	return (
		<div>
			<div className='align-items-start col-12 p-0'>
				<div className='row mb-n3'>
					{cardsToDisplay.length > 0 &&
					cardsToDisplay.some(({ toBeDisplayed }) => toBeDisplayed) ? (
						cardsToDisplay.map(({ name, count, toBeDisplayed }, index) =>
							toBeDisplayed ? (
								<div key={index} className='col-6'>
									<div
										className='card'
										style={{
											width: '160px',
											height: '40px',
											borderRadius: '6px',
										}}>
										<div className='card-body p-3'>
											<h6 className='card-title'>
												{name}: {count}
											</h6>
										</div>
									</div>
								</div>
							) : null,
						)
					) : (
						<div className='col-12 text-center'>
							<p>No data available.</p>
						</div>
					)}
				</div>
				{alarmDetail && Array.isArray(alarmDetail) && alarmDetail.length > 0 && (
					<div className='col-12 mt-3'>
						{alarmDetail.map((alarm: AlarmDetail, index: number) => {
							const startTime = alarm.start_time ? new Date(alarm.start_time) : null;
							const endTime = alarm.end_time ? new Date(alarm.end_time) : null;

							let durationText = 'N/A';
							if (startTime && endTime) {
								const diffMs = Math.abs(endTime.getTime() - startTime.getTime());
								const totalSeconds = Math.floor(diffMs / 1000);
								const hours = Math.floor(totalSeconds / 3600);
								const minutes = Math.floor((totalSeconds % 3600) / 60);
								const seconds = totalSeconds % 60;

								if (totalSeconds === 0) durationText = '0s';
								else
									durationText = `${hours > 0 ? `${hours}h ` : ''}${
										minutes > 0 ? `${minutes}m ` : ''
									}${seconds}s`;
							}
							return (
								<div
									key={index}
									className='card mb-2'
									style={{
										width: '335px',
										height: 'auto',
										borderRadius: '6px',
									}}>
									<div className='card-body' style={{ padding: '15px' }}>
										<span
											style={{
												fontSize: '12px',
												color: '#57D08C',
												marginTop: '5px',
												display: 'block',
											}}>
											&#8226;
											<span
												style={{
													color: 'black',
													fontFamily: 'Open Sans',
													fontWeight: 'bold',
													fontSize: '14px',
												}}>
												Start Location
											</span>
										</span>
										<p style={{ wordWrap: 'break-word' }}>
											{alarm.start_time || 'N/A'}
										</p>
										{/* Duration aligned to right corner */}
										<div
											style={{
												position: 'absolute',
												top: '15px',
												right: '20px',
												textAlign: 'right',
											}}>
											<span
												style={{
													fontSize: '12px',
													display: 'block',
												}}>
												Total Duration: {durationText}
											</span>
										
										</div>

										<p style={{ wordWrap: 'break-word' }}>
											{alarm.location || 'N/A'}
										</p>

										{/* End Location */}
										<div>
											<span
												style={{
													fontSize: '12px',
													color: '#E41F3F',
													marginTop: '5px',
													display: 'block',
												}}>
												&#8226;
												<span
													style={{
														color: 'black',
														fontFamily: 'Open Sans',
														fontWeight: 'bold',
														fontSize: '14px',
													}}>
													End Location
												</span>
											</span>

											{/* Conditional rendering for End Location */}
											<p style={{ wordWrap: 'break-word' }}>
												{alarm.end_time || 'N/A'}
											</p>
											<p style={{ wordWrap: 'break-word' }}>
												{alarm.location || 'N/A'}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* {alarmDetail && Array.isArray(alarmDetail) && alarmDetail.length > 0 && (
					<div className='col-12 mt-3'>
						{alarmDetail.map(
							(
								alarm: AlarmDetail,
								index: number, // ✅ Explicitly define type
							) => (
								<div
									key={index}
									className='card mb-2'
									style={{ width: '335px', borderRadius: '6px' }}>
									<div
										className='card-body'
										style={{
											padding: '15px',
											maxHeight: '200px',
											overflow: 'hidden',
										}}>
										<span
											style={{
												fontSize: '12px',
												color: '#57D08C',
												marginTop: '5px',
												display: 'block',
											}}>
											&#8226;
											<span
												style={{
													color: 'black',
													fontFamily: 'Open Sans',
													fontWeight: 'bold',
													fontSize: '14px',
												}}>
												Start Location
											</span>
										</span>
										<p style={{ wordWrap: 'break-word' }}>
											{alarm.start_time || 'N/A'}
										</p>
										<p style={{ wordWrap: 'break-word' }}>
											{alarm.location || 'N/A'}
										</p>
										<div>
											<span
												style={{
													fontSize: '12px',
													color: '#E41F3F',
													marginTop: '5px',
													display: 'block',
												}}>
												&#8226;
												<span
													style={{
														color: 'black',
														fontFamily: 'Open Sans',
														fontWeight: 'bold',
														fontSize: '14px',
													}}>
													End Location
												</span>
											</span>
											<p style={{ wordWrap: 'break-word' }}>
												{alarm.end_time || 'N/A'}
											</p>
											<p style={{ wordWrap: 'break-word' }}>
												{alarm.location || 'N/A'}
											</p>
										</div>
									</div>
								</div>
							),
						)}
					</div>
				)} */}
			</div>
		</div>
	);
};
export default SummaryAlarmStatics;
