import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import Spinner from '../../../../../components/bootstrap/Spinner';
import { convertFromUTCtoTZ } from '../../../../../helpers/helpers';
import { RootState } from '../../../../../store/store';
import { OverViewDataType } from '../../../../../type/alert-types';
import Loader from '../../../../../components/Loader';

const OverviewTabs = () => {
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { t } = useTranslation(['alertNotification']);
	const dispatch = useDispatch();
	const isLoadingTripDetail = useSelector(
		(state: RootState) => state.loading.effects.alertsNotifications.getAlarmTripDetail,
	);
	let params = useParams();
	const { datetime, vin } = params;
	const payloadTripDetail = {
		datetime,
		vin,
	};
	// const { alarmDetailTrip } = useSelector((state: RootState) => state.alertsNotifications);
	const { alarmRoadTrip } :any= useSelector((state: RootState) => state.alertsNotifications);


	useEffect(() => {
		const getTripRouteDetail = async () => {
			await dispatch.alertsNotifications.getAlarmTripDetail(payloadTripDetail);
		};

		getTripRouteDetail();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [TripInfoDataState, setTripInfoDataState] = useState<OverViewDataType[]>();

	useEffect(() => {
		if (!isLoadingTripDetail && alarmRoadTrip.length > 0) {
			const OverviewData = [
				// { key: 'Distance', value: alarmRoadTrip[0].distance ?? '' },
				// { key: 'Time', value: alarmRoadTrip[0].duration ?? '' },
				{
					key: 'Vin',
					value: vin ?? '',
				},
				{
					key: 'Start Time',
					value:
						convertFromUTCtoTZ(alarmRoadTrip[0].start_time, preferedTimeZone) ?? '',
				},
				{
					key: 'End Time',
					value: convertFromUTCtoTZ(alarmRoadTrip[0].end_time, preferedTimeZone) ?? '',
				},
				{ key: 'Start Location', value: alarmRoadTrip[0].start_location ?? '' },
				{
					key: 'End Location',
					value: alarmRoadTrip[0].end_location,
				},
			];
			setTripInfoDataState(OverviewData);
		}
	}, [alarmRoadTrip, isLoadingTripDetail, preferedTimeZone,vin]);

	return (
		<div>
			{!isLoadingTripDetail ? (
				<>
					{TripInfoDataState?.map(({ key, value }, index) => {
						return (
							<div className='row px-5 py-3' key={index}>
								<div className='col'>{t(`${key}`)}</div>
								<div className='col text-secondary'>{value}</div>
							</div>
						);
					})}
				</>
			) : (
				<Loader />
			)}
		</div>
	);
};
export default OverviewTabs;
