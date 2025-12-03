// import React, { FC, useContext, useTransition, useState, useEffect } from 'react';
// import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// // import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
// import Breadcrumb from '../../components/bootstrap/Breadcrumb';
// import Page from '../../layout/Page/Page';
// import AssistanceButton from '../common/assitance-button/AssistanceButton';
// import Card, { CardBody, CardHeader } from '../../components/bootstrap/Card';
// import { useParams } from 'react-router-dom';
// import { useGetDriverDetail } from '../../services/driver';
// import GoBack from '../../components/GoBack';
// import DetailCardComponent from './components/driver-leaderboard/DetailCardComponent';
// import ThemeContext from '../../contexts/themeContext';
// import { useTranslation } from 'react-i18next';
// import Header from './components/header/Header';
// import { IDateRangeFilter } from '../../type/history-type';
// import { getDefaultDateRangeFilter } from '../../helpers/helpers';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import { useGetBehaviourScoreService, useGetDriverSummaryService } from '../../services/ecoDrivingService';

// interface DriverProfilProps { }

// const DriverProfil: FC<DriverProfilProps> = () => {
// 	const { t } = useTranslation(['driverLeaderboard']);
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const params = useParams();
// 	const { id } = params;
// 	//
// 	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
// 	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
// 	const { filterPayload } = useSelector((state: RootState) => state.filters);
// 	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
// 		getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
// 	);

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


// 	const { data: driverProfileData, isSuccess: isSuccessProfileDriver } = useGetDriverDetail(
// 		id ?? '',
// 	);

// 	const DriverDetails = {
// 		Personal_Info: [
// 			{
// 				label: 'Driver Name',
// 				value: isSuccessProfileDriver && driverProfileData[0].driver_name,
// 			},
// 			{ label: 'VIN', value: isSuccessProfileDriver && driverProfileData[0].vin },
// 			{ label: 'Date Of Birth', value: isSuccessProfileDriver && driverProfileData[0].dob },
// 			{
// 				label: 'Mobile Number',
// 				value: isSuccessProfileDriver && driverProfileData[0].mobile_no,
// 			},
// 			{ label: 'Place Of Number', value: isSuccessProfileDriver && driverProfileData[0].pob },
// 			{
// 				label: 'Experience',
// 				value: isSuccessProfileDriver && driverProfileData[0].experience,
// 			},
// 			{ label: 'Gender', value: isSuccessProfileDriver && driverProfileData[0].gender },
// 			{
// 				label: 'Health Issues',
// 				value: isSuccessProfileDriver && driverProfileData[0].health_issue,
// 			},
// 			{
// 				label: 'Residential Address',
// 				value: isSuccessProfileDriver && driverProfileData[0].residential_address,
// 			},
// 		],
// 		Licence_Info: [
// 			{
// 				label: 'Licence Number',
// 				value: isSuccessProfileDriver && driverProfileData[0].license_no,
// 			},
// 			{
// 				label: 'Licence Issue Date',
// 				value: isSuccessProfileDriver && driverProfileData[0].license_issue_date,
// 			},
// 			{
// 				label: 'License Expire Date',
// 				value: isSuccessProfileDriver && driverProfileData[0].license_expire_date,
// 			},
// 			{
// 				label: 'License Type',
// 				value: isSuccessProfileDriver && driverProfileData[0].license_type,
// 			},
// 			{
// 				label: 'License Issuing Authority',
// 				value: isSuccessProfileDriver && driverProfileData[0].license_issuing_authority,
// 			},
// 		],
// 		Emergence_Contact_Info: [
// 			{ label: 'Name', value: isSuccessProfileDriver && driverProfileData[0].emergency_name },
// 			{
// 				label: 'Mobile Number',
// 				value: isSuccessProfileDriver && driverProfileData[0].emergency_number,
// 			},
// 		],
// 	};



// 	return (
// 		<PageWrapper isProtected={true}>
// 			{/* <SubHeader>
// 				<SubHeaderLeft>
// 					<Breadcrumb
// 						list={[
// 							{
// 								title: t('Driver Profile'),
// 								to: `../driverleadbord`,
// 							},
// 						]}
// 					/>
// 				</SubHeaderLeft>
// 			</SubHeader> */}
// 			<Page className='mw-100 px-0'>
// 				<div className='d-flex'>
// 					<div className=' d-flex pb-3 mb-4 w-100'>
// 						{/* <GoBack /> */}
// 						<p className='content-heading mt-0'>
// 							{t('Driver Profile')}
// 						</p>
// 					</div>
// 					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary align-self-stretch ml-auto'>
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


// 				<div className='w-100 mb-4'>
// 					<div>
// 						<div style={{ alignSelf: 'center' }}>
// 							<div className='d-flex justify-content-center'>
// 								<img style={{cursor: 'pointer',alignItems: 'center',width: '145px',height: '145px',gap: '0px',borderTop: '1px solid #000000',border: '1px solid #000000'}}
// 									onClick={() => { }}
// 									className='rounded-circle'
// 									src='driverProfile.png'
// 									width={145}
// 									height={145}
// 									alt='vehicles status'
// 								/>
// 							</div>
// 						</div>
// 						<CardBody>
// 							<div
// 								className={`${mobileDesign
// 									? 'd-flex flex-column bd-highlight mb-3'
// 									: 'd-flex flex-row bd-highlight mb-3'
// 									}`} >
// 								<div className='p-2 bd-highlight w-100' >
// 									<DetailCardComponent
// 										title={t('Personal Info')}
// 										details={DriverDetails.Personal_Info}
// 									/>
// 								</div>
// 								<div className='p-2 bd-highlight w-100'>
// 									<DetailCardComponent
// 										title={t('License Info')}
// 										details={DriverDetails.Licence_Info}
// 									/>
// 								</div>
// 								<div className='p-2 bd-highlight w-100'>
// 									<DetailCardComponent
// 										title={t('Emergency Contact Info')}
// 										details={DriverDetails.Emergence_Contact_Info}
// 									/>
// 								</div>
// 							</div>
// 						</CardBody>
// 					</div>
// 				</div>
// 			</Page>
// 		</PageWrapper>
// 	);
// };

// export default DriverProfil;



/////2   working*****
import React, { FC, useContext, useState, useEffect } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import AssistanceButton from '../common/assitance-button/AssistanceButton';
import Card, { CardBody } from '../../components/bootstrap/Card';
import { useParams } from 'react-router-dom';
import { useGetDriverDetail } from '../../services/driver';
import DetailCardComponent from './components/driver-leaderboard/DetailCardComponent';
import ThemeContext from '../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import Header from './components/header/Header';
import { IDateRangeFilter } from '../../type/history-type';
import { getDefaultDateRangeFilter } from '../../helpers/helpers';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useGetBehaviourScoreService, useGetDriverSummaryService, useGetDriverBehaviourSummaryService } from '../../services/ecoDrivingService';
import TripSummary from './components/trip-summary/TripSummary';
import DriverScores from './components/driver-scores/DriverScores';
import DriverBehaviourSummary from './components/driverBehaviour-summary/DriverBehaviourSummary';

const DriverProfil: FC = () => {
	const { t } = useTranslation(['driverLeaderboard']);
	const { mobileDesign } = useContext(ThemeContext);
	const params = useParams();
	const { id } = params;

	const [activeTab, setActiveTab] = useState<string>('profile');
	const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { filterPayload } = useSelector((state: RootState) => state.filters);
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
	);

	const Payload = {
		startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
		enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
		driver_name: driverFilter,
	};

	const {
		data: dataDriverSummary,
		isSuccess: isSuccessDriverSummary,
		refetch: refetchDriverSummary,
	} = useGetDriverSummaryService(Payload);
	const {
		data: dataBahviourScore,
		isSuccess: isSuccessBahviourScore,
		refetch: refetchBahviourScore,
	} = useGetBehaviourScoreService(Payload);
	const {
		data: dataDriverBahviourSummary,
		isSuccess: isSuccessDriverBahviourSummary,
		refetch: refetchDriverBahviourSummary,
	} = useGetDriverBehaviourSummaryService(Payload);

	useEffect(() => {
		refetchBahviourScore();
		refetchDriverSummary();
		refetchDriverBahviourSummary();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRangeFilter, driverFilter, id]);

	const { data: driverProfileData, isSuccess: isSuccessProfileDriver } = useGetDriverDetail(
		id ?? '',
	);

	const DriverDetails = {
		Personal_Info: [
			{
				label: 'Driver Name',
				value: isSuccessProfileDriver && driverProfileData[0].driver_name,
			},
			{ label: 'VIN', value: isSuccessProfileDriver && driverProfileData[0].vin },
			{ label: 'Date Of Birth', value: isSuccessProfileDriver && driverProfileData[0].dob },
			{
				label: 'Mobile Number',
				value: isSuccessProfileDriver && driverProfileData[0].mobile_no,
			},
			{ label: 'Place Of Birth', value: isSuccessProfileDriver && driverProfileData[0].pob },
			{
				label: 'Experience',
				value: isSuccessProfileDriver && driverProfileData[0].experience,
			},
			{ label: 'Gender', value: isSuccessProfileDriver && driverProfileData[0].gender },
			{
				label: 'Health Issues',
				value: isSuccessProfileDriver && driverProfileData[0].health_issues,
			},
			{
				label: 'Residential Address',
				value: isSuccessProfileDriver && driverProfileData[0].residential_address,
			},
		],
		License_Info: [
			{
				label: 'Licence Number',
				value: isSuccessProfileDriver && driverProfileData[0].license_no,
			},
			{
				label: 'Licence Issue Date',
				value: isSuccessProfileDriver && driverProfileData[0].license_issue_date,
			},
			{
				label: 'License Expire Date',
				value: isSuccessProfileDriver && driverProfileData[0].license_expire_date,
			},
			{
				label: 'License Type',
				value: isSuccessProfileDriver && driverProfileData[0].license_type,
			},
			{
				label: 'License Issuing Authority',
				value: isSuccessProfileDriver && driverProfileData[0].license_issuing_authority,
			},
		],
		Emergence_Contact_Info: [
			{ label: 'Name', value: isSuccessProfileDriver && driverProfileData[0].emergency_name },
			{
				label: 'Mobile Number',
				value: isSuccessProfileDriver && driverProfileData[0].emergency_number,
			},
		],
	};

	return (
		<PageWrapper isProtected={true}>
			<Page className="mw-100 px-0">
				<div className="d-flex justify-content-between align-items-center mt-n4 mb-3">
					{/* <div className="d-flex border-bottom">
						<div
							className={`px-1 py-2 ${activeTab === 'profile' ? 'text-danger border-bottom border-danger' : 'text-dark'}`}
							style={{ cursor: 'pointer' }}
							onClick={() => setActiveTab('profile')}
						>
							<p className="content-heading mt-0">{t('Driver Profile')}</p>
						</div>
						<div
							className={`px-3 py-2 ${activeTab === 'analysis' ? 'text-danger border-bottom border-danger' : 'text-dark'}`}
							style={{ cursor: 'pointer' }}
							onClick={() => setActiveTab('analysis')}
						>
							<p className="content-heading mt-0">{t('Driver Analysis')}</p>
						</div>
					</div> */}
					<div className="d-flex border-bottom">
						<div
							className={`px-3 py-2 ${activeTab === 'profile' ? 'text-blue border-bottom' : 'text-dark border-bottom border-black'}`}
							style={{ cursor: 'pointer' }}
							onClick={() => setActiveTab('profile')}
						>
							<p className="content-heading1 mt-0">{t('Driver Profile')}</p>
						</div>
						<div
							className={`px-3 py-2 ${activeTab === 'analysis' ? 'text-blue border-bottom' : 'text-dark border-bottom border-black'}`}
							style={{ cursor: 'pointer' }}
							onClick={() => setActiveTab('analysis')}
						>
							<p className="content-heading1 mt-0">{t('Driver Analysis')}</p>
						</div>
					</div>

					<div className="fs-2 pb-3 mb-4 fw-semibold text-secondary">
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
					{/* Conditional rendering for the Header (Driver Filter and Date Range) only in the "analysis" tab */}
					{activeTab === 'analysis' && (
						<div className="d-flex align-items-center" style={{ marginRight: "53px" }}>
							<Header
								style={{}}
								driverFilter={driverFilter}
								setDriverFilter={setDriverFilter}
								driverUrlName={id}
								withDriverSelect={true}
								setDateRangeFilter={setDateRangeFilter}
								dateRangeFilter={dateRangeFilter}
							/>
						</div>
					)}
				</div>

				{/* <Header
					style={{}}
					driverFilter={driverFilter}
					setDriverFilter={setDriverFilter}
					driverUrlName={id}
					withDriverSelect={true}
					setDateRangeFilter={setDateRangeFilter}
					dateRangeFilter={dateRangeFilter}
				/> */}

				{/* Driver Profile Tab */}
				{activeTab === 'profile' && (
					<div>
						<div className="d-flex justify-content-center m-0">
							<img
								className="rounded-circle"
								src="/driverProfile.png"
								alt="Driver"
								width={145}
								height={145}
							/>
						</div>
						<CardBody>
							<div className="d-flex flex-column flex-md-row mt-n5">
								<div className="p-2 col-4">
									<DetailCardComponent title={t('Personal Info')} details={DriverDetails.Personal_Info} />
								</div>
								<div className="p-2 col-4">
									<DetailCardComponent title={t('License Info')} details={DriverDetails.License_Info} />
								</div>
								<div className="p-2 col-4">
									<DetailCardComponent title={t('Emergency Contact Info')} details={DriverDetails.Emergence_Contact_Info} />
								</div>
							</div>
						</CardBody>
					</div>
				)}

				{/* Driver Analysis Tab */}
				{activeTab === 'analysis' && (
					<div>
						{isSuccessDriverSummary && dataDriverSummary && (
							<TripSummary dataDriverSummary={dataDriverSummary} />
						)}
						{/* {isSuccessBahviourScore && dataBahviourScore && (
							<DriverScores BehaviourScoreData={dataBahviourScore} />
						)}
						{isSuccessDriverBahviourSummary && dataDriverBahviourSummary && (
							<DriverBehaviourSummary DriverBehaviourSummaryData={dataDriverBahviourSummary} />
						)} */}
						<div className="d-flex flex-row justify-content-between" style={{gap:"10px"}}>
							{isSuccessBahviourScore && dataBahviourScore && (
								<DriverScores BehaviourScoreData={dataBahviourScore} />
							)}
							{isSuccessDriverBahviourSummary && dataDriverBahviourSummary && (
								<DriverBehaviourSummary DriverBehaviourSummaryData={dataDriverBahviourSummary} />
							)}
						</div>

					</div>
				)}
			</Page>
		</PageWrapper>
	);
};

export default DriverProfil;

