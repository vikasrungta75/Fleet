// import React, { FC, useState, useEffect } from 'react';
// import Header from './components/header/Header';
// import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// import Page from '../../layout/Page/Page';
// import TripSummary from './components/trip-summary/TripSummary';
// import DriverScores from './components/driver-scores/DriverScores';
// import { getDefaultDateRangeFilter } from '../../helpers/helpers';
// import { IDateRangeFilter } from '../../type/history-type';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import {
// 	useGetBehaviourScoreService,
// 	useGetDriverSummaryService,
// } from '../../services/ecoDrivingService';
// import { useParams } from 'react-router-dom';
// import GoBack from '../../components/GoBack';
// import AssistanceButton from '../common/assitance-button/AssistanceButton';
// import { useTranslation } from 'react-i18next';

// interface DriverDetailProps {}

// const DriverDetail: FC<DriverDetailProps> = () => {
// 	const { t } = useTranslation(['driverLeaderboard']);

// 	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
// 	const { filterPayload } = useSelector((state: RootState) => state.filters);

// 	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
// 		getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
// 	);
// 	const params = useParams();
// 	const { id } = params;
// 	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');

// 	const Payload = {
// 		startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
// 		enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
// 		driver_name: driverFilter,
// 	};

// 	const {
// 		data: dataDriverSummary,
// 		isSuccess: isSuccessDriverSummary,
// 		refetch: refetchDriverSummary,
// 	} = useGetDriverSummaryService(Payload);
// 	const {
// 		data: dataBahviourScore,
// 		isSuccess: isSuccessBahviourScore,
// 		refetch: refetchBahviourScore,
// 	} = useGetBehaviourScoreService(Payload);

// 	useEffect(() => {
// 		refetchBahviourScore();
// 		refetchDriverSummary();
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [dateRangeFilter, driverFilter, id]);

// 	return (
// 		<PageWrapper isProtected={true}>
// 			<Page className='mw-100 px-0'>
// 				<div className='d-flex'>
// 					<div className=' d-flex pb-3 mb-4 w-100'>
// 						{/* <GoBack /> */}
// 						<p className='content-heading mt-0'>
// 							{t('Driver Analysis')}
// 						</p>
// 					</div>
// 					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
// 						<AssistanceButton locationPathname={window.location.pathname} />
// 					</div>
// 				</div>
// 				<Header
// 					style={{}}
// 					driverFilter={driverFilter}
// 					setDriverFilter={setDriverFilter}
// 					driverUrlName={id}
// 					withDriverSelect={true}
// 					setDateRangeFilter={setDateRangeFilter}
// 					dateRangeFilter={dateRangeFilter}
// 				/>
// 				{isSuccessDriverSummary && dataDriverSummary && (
// 					<TripSummary dataDriverSummary={dataDriverSummary} />
// 				)}
// 				{isSuccessBahviourScore && dataBahviourScore && (
// 					<DriverScores BehaviourScoreData={dataBahviourScore} />
// 				)}
// 			</Page>
// 		</PageWrapper>
// 	);
// };

// export default DriverDetail;
export{}
