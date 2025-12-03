import React, { FC, useState, useEffect, useContext } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Page from '../../layout/Page/Page';
import AssistanceButton from '../common/assitance-button/AssistanceButton';
import Card, { CardBody } from '../../components/bootstrap/Card';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Header from './components/header/Header';
import CardDriverComponent from './components/driver-leaderboard/CardDriver';
import { IDateRangeFilter } from '../../type/history-type';
import { getDefaultDateRangeFilter } from '../../helpers/helpers';
import LeastFiveDriverComponent from './components/driver-leaderboard/LeastFiveDriver';
import { ILeastFiveDriver } from '../../type/driver-types';
import DataTableOtherDriverComponent from './components/driver-leaderboard/DatatableOtherDriver';
import Spinner from '../../components/bootstrap/Spinner';
import {
    useGetBehaviourScoreService,
    useGetDriverSummaryService,
    useGetLeastFiveDriverScoresService,
    useGetOtherDriverScoreService,
    // useGetTopFiveDriverScoresService,
    useGetDriverBehaviourSummaryService,
} from '../../services/ecoDrivingService';
import GoBack from '../../components/GoBack';
import ThemeContext from '../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { dashboardMenu } from '../../menu';
import Alert from '../../components/bootstrap/Alert';
import Icon from '../../components/icon/Icon';
import { useParams } from 'react-router-dom';
 
interface DriverLeaderbordProps { }
 
const DriverLeaderbord: FC<DriverLeaderbordProps> = () => {
    const { t } = useTranslation(['driverLeaderboard', 'vehicles']);
    const { filterPayload } = useSelector((state: RootState) => state.filters);
 
    const { mobileDesign } = useContext(ThemeContext);
    const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
 
    const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
        getDefaultDateRangeFilter(preferedTimeZone, filterPayload),
    );
 
    const [allVinsCombinedArray, setallVinsCombinedArray] = useState<String[]>([]);
 
    const PayloadLeastDriver = {
        startdate: `${dateRangeFilter.startDate} ${dateRangeFilter.startTime}`,
        enddate: `${dateRangeFilter.endDate} ${dateRangeFilter.endTime}`,
        vin: allVinsCombinedArray.toString(),
    };
    const {
        data: dataDLeastFiveDriver,
        isSuccess: isSuccessLeastFiveDriver,
        refetch: refetchLeastFiveDriver,
    } = useGetLeastFiveDriverScoresService(PayloadLeastDriver);
    // const {
    //  data: dataTopFiveDriver,
    //  isSuccess: isSuccessTopFiveDriver,
    //  refetch: refetchTopFiveDriver,
    // } = useGetTopFiveDriverScoresService(PayloadLeastDriver);
    const {
        data: dataOtherDriverScore,
        refetch: refetchOtherDriverScore,
        isLoading: isLoadingOtherDriverScore,
        isSuccess: isSuccessOtherDriverScore,
    } = useGetOtherDriverScoreService(PayloadLeastDriver);
 
    const dataLength =
        dataDLeastFiveDriver &&
        dataDLeastFiveDriver?.length === 0 &&
        // dataTopFiveDriver &&
        // dataTopFiveDriver?.length === 0 &&
        dataOtherDriverScore &&
        dataOtherDriverScore?.length === 0;
 
    // const { data: dataDriverNameFilter, isSuccess } = useGetTopFiveDriverScoresService(PayloadLeastDriver);
 
    // const slicedDriverNameFilter = dataTopFiveDriver && dataTopFiveDriver.slice(0, 5);
    //
    const params = useParams();
    const { id } = params;
    const [driverFilter, setDriverFilter] = useState<string>(id || 'All Drivers');
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
 
 
    useEffect(() => {
        refetchLeastFiveDriver();
        // refetchTopFiveDriver();
 
        return () => { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRangeFilter]);
 
    useEffect(() => {
        // if (isSuccessTopFiveDriver && isSuccessLeastFiveDriver) {
            if (isSuccessLeastFiveDriver) {
            const allVINs = [
                // ...dataTopFiveDriver.map((driver: any) => driver.vin),
                ...dataDLeastFiveDriver.map((driver: any) => driver.vin),
            ].filter((vin, index, array) => array.indexOf(vin) === index);
            setallVinsCombinedArray(allVINs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // dataTopFiveDriver,
        dataDLeastFiveDriver,
        dateRangeFilter,
        // isSuccessTopFiveDriver,
        isSuccessLeastFiveDriver,
    ]);
 
    useEffect(() => {
        refetchOtherDriverScore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allVinsCombinedArray]);
 
    return (
        <PageWrapper isProtected={true}>
            {/* <SubHeader>
                <SubHeaderLeft>
                    <Breadcrumb
                        list={[
                            {
                                title: t(`${dashboardMenu.driverleaderbord.text}`),
                                to: `../${dashboardMenu.driverleaderbord.path}`,
                            },
                        ]}
                    />
                </SubHeaderLeft>
            </SubHeader> */}
            <Page className='mw-100 px-0'>
                <div className='d-flex' style={{marginTop:"-12px"}}>
                    <div className=' d-flex pb-0 mb-4 w-100 justify-content-between'>
                        {/* <GoBack /> */}
                        <p className='content-heading mt-2'>
                            {t('Least Five Driver Performance')}
                        </p>
                        <Header
                            style={{}}
                            withDriverSelect={false}
                            setDateRangeFilter={setDateRangeFilter}
                            dateRangeFilter={dateRangeFilter}
                        />
                    </div>
                    <div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
                        <AssistanceButton locationPathname={window.location.pathname} />
                    </div>
                </div>
                {/* <Header
                    style={{}}
                    withDriverSelect={false}
                    setDateRangeFilter={setDateRangeFilter}
                    dateRangeFilter={dateRangeFilter}
                /> */}
                {/* <Header
                    driverFilter={driverFilter}
                    setDriverFilter={setDriverFilter}
                    driverUrlName={id}
                    withDriverSelect={true}
                    setDateRangeFilter={setDateRangeFilter}
                    dateRangeFilter={dateRangeFilter}
                /> */}
                {dataLength ? (
                    <>
                        <Card>
                            <CardBody>
                                <Alert color='info' className='flex-column w-100 align-items-start'>
                                    <p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
                                        <Icon icon='Info' size='2x' className='me-2' />{' '}
                                        {t('No Data available for the selected filters.')}
                                    </p>
                                </Alert>
                            </CardBody>
                        </Card>
                    </>
                ) : (
                    <>
                        <div className='w-100 mb-4'>
                            {/* <div
                                className={`${mobileDesign
                                        ? 'd-flex flex-column bd-highlight mb-3'
                                        : 'd-flex flex-row bd-highlight mb-3'
                                    }`}>
                                {isSuccessTopFiveDriver &&
                                    slicedDriverNameFilter.map((arg: any, ind: number) => {
                                        return (
                                            <div
                                                style={{ flexGrow: '0' }}
                                                className='flex-fill ms-4 d-flex'
                                                key={ind}>
                                                <CardDriverComponent
                                                    argDriver={arg}
                                                    startdate={dateRangeFilter.startDate}
                                                    enddate={dateRangeFilter.endDate}
                                                />
                                            </div>
                                        );
                                    })}
                            </div> */}
                            <div className={`${mobileDesign ? 'col-12' : 'col-12'}`}>
                                {/* <Card style={{ height: '200px' }} className="overflow-auto"> */}
                                <CardBody style={{padding:"0px"}}>
                                    {isSuccessLeastFiveDriver && (
                                        <div
                                            className="d-flex flex-wrap"
                                            style={{
                                                justifyContent: 'space-between',
                                                gap: '0px', // Space between cards
                                            }}
                                        >
                                            {dataDLeastFiveDriver.map((arg: ILeastFiveDriver, index: any) => {
                                                return (
                                                    <Card shadow={'sm'} key={index} style={{
                                                        justifyContent: 'space-between',
                                                        width: '235px',
                                                        height: '145px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #D9D9D9',
                                                        background: '#FFFFFF',
                                                        boxShadow: '0px 0px 25px 0px #5E5C9A1A'
                                                    }}
                                                    >
                                                        <LeastFiveDriverComponent argDataLeastDriver={arg} />
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardBody>
                                {/* </Card> */}
                            </div>
 
                            <div className='row'>
                                <div className={`${mobileDesign ? 'col-12' : 'col-12'}`}>
                                    {isSuccessOtherDriverScore && !isLoadingOtherDriverScore ? (
                                        <DataTableOtherDriverComponent
                                            dataOtherDriverScore={dataOtherDriverScore}
                                        />
                                    ) : (
                                        <div className='d-flex justify-content-center h-100 align-items-center'>
                                            <Spinner
                                                className='spinner-center'
                                                color='secondary'
                                                size='5rem'
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* <div className={`${mobileDesign ? 'col-12' : 'col-12'}`}>
                                    <Card style={{ height: '500px' }} className='overflow-auto'>
                                        <CardBody>
                                            <h3>{t('Least Five Drivers Performance')}</h3>
                                            {isSuccessLeastFiveDriver &&
                                           
                                                dataDLeastFiveDriver.map(
                                                    (arg: ILeastFiveDriver, index: any) => {
                                                        return (
                                                            <Card shadow={'sm'} key={index} style={{width:"200px",display:"flex"}}>
                                                                <LeastFiveDriverComponent
                                                                    argDataLeastDriver={arg}
                                                                />
                                                            </Card>
                                                        );
                                                    },
                                                )}
                                        </CardBody>
                                    </Card>
                                </div> */}
 
                                <div
                                    className={`${mobileDesign
                                        ? 'd-flex flex-column bd-highlight mb-3'
                                        : 'd-flex flex-row bd-highlight mb-3'
                                        }`}>
{/*
                                    {isSuccessTopFiveDriver &&
                                        slicedDriverNameFilter.map((arg: any, ind: number) => {
                                            return (
                                                <div
                                                    style={{ flexGrow: '0' }}
                                                    className='flex-fill d-flex'
                                                    key={ind}>
                                                    <CardDriverComponent
                                                        argDriver={arg}
                                                        startdate={dateRangeFilter.startDate}
                                                        enddate={dateRangeFilter.endDate}
                                                    />
                                                </div>
                                            );
                                        })} */}
                                </div>
 
                            </div>
                        </div>
                    </>
                )}
            </Page>
        </PageWrapper>
    );
};
 
export default DriverLeaderbord; 