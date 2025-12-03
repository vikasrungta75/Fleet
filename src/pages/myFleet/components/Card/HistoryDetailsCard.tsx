import React, { FC, useEffect, useRef, useState } from 'react';
import Card, { CardBody, CardFooter, CardHeader } from '../../../../components/bootstrap/Card';
import { svg } from '../../../../assets/index';
import TrajectoryCard from './TrajectoryCard';
import DatePicker from '../../../../components/DatePicker';
import { IDateRangeFilter } from '../../../../type/history-type';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
    colorsOptionMap,
    dateFormatter,
    dateFormatterwithHours,
    getDefaultDateRangeFilter,
    transformArray,
    updateMarkerPosition,
} from '../../../../helpers/helpers';
import DatePickerPerso from '../../../../components/DatePickerPerso';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useGetTripInfoV1, useGetTripWithDTCv1 } from '../../../../services/vehiclesService';
import NoData from '../../../../components/NoData';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import Icon from '../../../../components/icon/Icon';
import dataHistory from '../../../../assets/datehistory.png';
import Button from '../../../../components/bootstrap/Button';
import OffCanvas, {
    OffCanvasBody,
    OffCanvasHeader,
} from '../../../../components/bootstrap/OffCanvas';
// import { t } from 'i18next';
import arrowback from '../../../../assets/img/ArrowBack.png';

export const TitleInfo = ({ title, info, className, titleStyle }: any) => {
    return (
        <div className='title-info'>
            <p className='info-label m-0 text-start'>
                <span className={titleStyle}>{title}</span>{' '}
                <span className={className}>{info} </span>
            </p>
        </div>
    );
};
interface IHistorydetails {
    TripInfoIsSuccess: boolean;
    // TripDTCIsSuccess: boolean;
    TripInfoData: any;
    // TripDTCData: any;
    creteria: { vins: []; date: any };
    tripRoute: any[];
    vinObj: any;
    setIsLoading: any;
}
const Historydetails: FC<IHistorydetails> = ({
    TripInfoIsSuccess,
    // TripDTCIsSuccess,
    TripInfoData,
    // TripDTCData,
    creteria,
    tripRoute,
    vinObj,
    setIsLoading,
}) => {
    const startPoint = { x: 50, y: 0 };
    const endPoint = { x: 300, y: 300 };
    const startIconSrc = svg.startPoint;
    const endIconSrc = svg.endPoint;
    const cardRef = useRef<any>(null);
    const [height, setHeight] = useState(0);
    const { t } = useTranslation(['vehicles']);

    useEffect(() => {
        const updateHeight = () => {
            if (cardRef.current) {
                const cardHeight = cardRef.current.offsetHeight;
                setHeight(cardHeight);
            }
        };

        updateHeight();

        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    });

    useEffect(() => {
        const cardHeight = cardRef.current?.offsetHeight;

        setHeight(cardHeight);
    }, []);

    const dispatch = useDispatch();

    const { selectedTrajectHistory } = useSelector((state: RootState) => state.appStoreNoPersist);

    const [checked, setchecked] = useState<any>([]);
    const formik = useFormik({
        initialValues: {
            coordinates: [],
        },
        onSubmit: (values) => { },
    });

    const handleChange = async (e: any, arg: any, i: number, vinName: string) => {
        const isChecked = e.target.checked;
        let updatedList = [...selectedTrajectHistory];

        if (isChecked) {
            setIsLoading(true);

            await dispatch.vehicles
                .getTripRoadRouteV2_2Async({ trip_id: arg._id })
                .then((res: any) => {
                    let markerPositionState = updateMarkerPosition(res[0].values[0].coordinates);
                    let RoadTripReformed = transformArray(res[0].values[0].coordinates);

                    const newObj: any = {
                        type: 'road',
                        vin: vinName.toString(),
                        markerPositionState,
                        RoadTripReformed,
                        index: i,
                        _id: arg._id,
                        start_address: arg.start_address,
                        end_address: arg.end_address,
                        speed: res[0].values[0].speed,
                        fuel_level: res[0].values[0].fuel_level,
                        temperature: res[0].values[0].temperature,
                        datetime: res[0].values[0].datetime,
                    };
                    updatedList.push(newObj);
                    setIsLoading(false);
                })
                .catch((error: any) => {
                    console.error(error);
                });
        } else {
            updatedList = updatedList.filter((obj) => String(obj._id) !== String(arg._id));
        }
        setchecked(updatedList);
        // Dispatch or perform any other operations with newArray
        /*[
               
        ]*/
        dispatch.appStoreNoPersist.changeSelectedTrajectHistory(updatedList);
        dispatch.vehicles.changeShowAllVehicle(false);
    };
    const handleClickParkedVehicle = (
        Mapped_latitude: number,
        Mapped_longitude: number,
        status: string,
        _id: string,
    ) => {
        const existingIndex = checked.findIndex((item: any) => item._id === _id);
        let updatedList = [...selectedTrajectHistory];
        if (existingIndex !== -1) {
            // Item exists, remove it
            updatedList.splice(existingIndex, 1);
            setchecked(updatedList);
        } else {
            let mappedObj = {
                Mapped_latitude: Mapped_latitude,
                Mapped_longitude: Mapped_longitude,
            };
            let markerPositionState = updateMarkerPosition([mappedObj]);
            let RoadTripReformed = transformArray([mappedObj]);

            // Item doesn't exist, add it
            const newObj: any = {
                type: 'parked',
                status,
                _id,
                markerPositionState,
                RoadTripReformed,
                parkedPosition: {
                    lat: Mapped_latitude,
                    lng: Mapped_longitude,
                },
            };
            updatedList.push(newObj);
            setchecked(updatedList);
        }

        dispatch.appStoreNoPersist.changeSelectedTrajectHistory(updatedList);
        dispatch.vehicles.changeShowAllVehicle(false);
    };

    const isChecked = (item: any) => selectedTrajectHistory.includes(item.value);
    const statusToSvgMap = {
        parked: svg.parked,
        stopped: svg.stopped, // Replace this with the correct SVG source for 'stopped' status
        // Add more status-SVG mappings as needed
    };
    const { accordianIndex } = useSelector((state: RootState) => state.appStoreNoPersist);

    return (
        <>
            {tripRoute.length > 0 ? (
                tripRoute.map((arg: any, i: any) => {
                    return (
                        <div
                            key={i}
                            className='details-header'
                            style={{
                                width: '110%',
                                marginTop: '-18px',
                                marginLeft: '-4%',
                                marginRight: '0',
                            }}>
                            <div
                                className='d-flex justify-content-between mb-2 p-2 details-header'
                                onClick={
                                    () =>
                                        dispatch.appStoreNoPersist.setAccordianIndex(
                                            accordianIndex === i ? null : i,
                                        )
                                    // setActiveAccordion(activeAccordion === i ? null : i)
                                }>
                                <TitleInfo
                                    title={t('VIN ID:')}
                                    info={arg.vin}
                                    className='fw-bold info-details'
                                />
                                <TitleInfo
                                    title={t('Total Trip')}
                                    info={
                                        arg.values.filter(
                                            (v: any) =>
                                                v.status !== 'Parked' && v.status !== 'Stopped',
                                        ).length
                                    }
                                    className='fw-bold info-details'
                                />
                                <Icon
                                    icon={
                                        accordianIndex === i
                                            ? 'KeyboardArrowUp'
                                            : 'KeyboardArrowDown'
                                    }
                                    size='lg'
                                    color='dark'
                                />
                            </div>

                            {accordianIndex === i && (
                                <>
                                    {arg?.values.length > 0 ? (
                                        <>
                                            {arg.values.map((item: any, index: number) => {
                                                return (
                                                    <div className='border-bottom' key={index}>
                                                        {item && !item?.status ? (
                                                            <div className='details-body   card-border'>
                                                                <div className='filter-option'>
                                                                    <label
                                                                        htmlFor='coordinates'
                                                                        className='d-flex align-items-center justify-content-between w-100'>
                                                                        <div className='d-flex justify-content-start flex-row'>
                                                                            <input
                                                                                type='checkbox'
                                                                                id='coordinates'
                                                                                name='coordinates'
                                                                                checked={selectedTrajectHistory.some(
                                                                                    (value: any) =>
                                                                                        value._id ===
                                                                                        item._id,
                                                                                )}
                                                                                value={item._id}
                                                                                onChange={(e) =>
                                                                                    handleChange(
                                                                                        e,
                                                                                        item,
                                                                                        i,
                                                                                        arg.vin,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <TitleInfo
                                                                            title={t('Distance')}
                                                                            info={item.distance}
                                                                            className='fw-bold info-details'
                                                                        />
                                                                        <TitleInfo
                                                                            title={t('Duration')}
                                                                            info={item.duration}
                                                                            className='fw-bold info-details'
                                                                        />
                                                                        <img
                                                                            alt=''
                                                                            src={svg.active}
                                                                            width={15}
                                                                            height={15}
                                                                            style={{
                                                                                marginRight: 5,
                                                                                cursor: 'pointer',
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start align-items-start'>
                                                                    {height > 0 && (
                                                                        <TrajectoryCard
                                                                            startPoint={startPoint}
                                                                            endPoint={endPoint}
                                                                            startIconSrc={
                                                                                startIconSrc
                                                                            }
                                                                            endIconSrc={endIconSrc}
                                                                            color={
                                                                                colorsOptionMap[i]
                                                                            }
                                                                            // color={colorsOptionMap[i]}
                                                                            height={height + 12}
                                                                        />
                                                                    )}
                                                                    <div className='d-flex justify-content-start flex-column align-items-start'>
                                                                        <div
                                                                            ref={cardRef}
                                                                            className=''>
                                                                            <div className='date-time d-flex align-items-center'>
                                                                                <p className='mb-0 me-2'>
                                                                                    Start Location
                                                                                </p>
                                                                                {dateFormatterwithHours(
                                                                                    item.trip_start,
                                                                                )}
                                                                            </div>
                                                                            <div className='address-info'>
                                                                                <p>
                                                                                    {
                                                                                        item.start_address
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className='mt-0'>
                                                                            <div className='date-time d-flex align-items-center'>
                                                                                <p className='mb-0 me-2'>
                                                                                    End Location
                                                                                </p>
                                                                                {dateFormatterwithHours(
                                                                                    item.trip_end,
                                                                                )}
                                                                            </div>
                                                                            <div className='address-info'>
                                                                                <p>
                                                                                    {
                                                                                        item.end_address
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                // style={{ marginLeft: '24px' }}
                                                                className='details-body   card-border mt-2 mb-2'>
                                                                <div className='filter-option'>
                                                                    <div className=''>
                                                                        <input
                                                                            type='checkbox'
                                                                            id='statusVehicle'
                                                                            name='statusVehicle'
                                                                            checked={selectedTrajectHistory.some(
                                                                                (value: any) =>
                                                                                    value._id ===
                                                                                    item._id,
                                                                            )}
                                                                            value={item?._id}
                                                                            onChange={(e) =>
                                                                                handleClickParkedVehicle(
                                                                                    item
                                                                                        ?.coordinates
                                                                                        .Mapped_latitude,
                                                                                    item
                                                                                        ?.coordinates
                                                                                        .Mapped_longitude,
                                                                                    item?.status,
                                                                                    item?._id,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '10px',
                                                                        }}
                                                                        className='mt-0'>
                                                                        <div className='date-time'>
                                                                            Check Current Location
                                                                        </div>
                                                                        <div className='address-info'>
                                                                            <p>
                                                                                {item.stop_address}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <img
                                                                        alt=''
                                                                        src={
                                                                            statusToSvgMap[
                                                                            item?.status?.toLowerCase() as keyof typeof statusToSvgMap
                                                                            ]
                                                                        }
                                                                        width={15}
                                                                        height={15}
                                                                        style={{
                                                                            marginRight: 5,
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    />
                                                                </div>
                                                                <TitleInfo
                                                                    title={t('Duration')}
                                                                    info={item.duration ?? ''}
                                                                    className='fw-bold info-details'
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <NoData text={t('details not found')} withCard={false} />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })
            ) : (
                <NoData text={t('roadHistoryNotFound')} withCard={false} />
            )}
        </>
    );
};

interface IHistoryDetailsCard {
    creteria: { vins: []; date: any };
    setIsModalOpen: (val: boolean) => void;
    isModalOpen: boolean;
}

const HistoryDetailsCard: FC<IHistoryDetailsCard> = ({ creteria, setIsModalOpen, isModalOpen, }) => {
    const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

    const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
        getDefaultDateRangeFilter(preferedTimeZone),
    );

    const [showDatePicker, setShowDatePicker] = useState(true);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { tripRouteV1_1 } = useSelector((state: RootState) => state.vehicles);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const { getTripRoadRouteV1_1Async } = useSelector(
    //  (state: RootState) => state.loading.effects.vehicles,
    // );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { getTripRoadRouteV2_1Async } = useSelector(
        (state: RootState) => state.loading.effects.vehicles,
    );
    const dispatch = useDispatch();
    const [vinObj, setvinObj] = useState<any>({});



    const Payload = {
        vin: creteria.vins.toString(),
        token: localStorage.getItem('token'),
        startdate: `${creteria.date.startDate} ${creteria.date.startTime}`,
        enddate: `${creteria.date.endDate} ${creteria.date.endTime}`,
    };



    const { vin, startdate, enddate } = Payload;

    useEffect(() => {
        if (vin && startdate && enddate) {
            const getTripRoute = async () => {
                await dispatch.vehicles.getTripRoadRouteV2_1Async({ vin, startdate, enddate });
            };
            getTripRoute();
        }
    }, [vin, startdate, enddate, dispatch]);


    const { getTripRoadRouteV2_1Async: isGetTripRoadRouteV21AsyncLoading } = useSelector(
        (state: RootState) => state.loading.effects.vehicles,
    );

    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <OffCanvas
                style={{ width: 350 }}
                id='show-fleet-details'
                titleId='fleet details'
                placement='end'
                isOpen={isModalOpen}
                setOpen={setIsModalOpen}
                isBackdrop={false}
                isBodyScroll
            >
                <OffCanvasHeader className='border-1 border-bottom' style={{ height: '100px' }}>
                    <div>
                        <Button
                            style={{
                                position: 'relative',
                                padding: '0',
                                background: 'none',
                                border: 'none',
                            }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            <img
                                src={arrowback}
                                alt='backButton'
                                style={{ width: '30px', height: '30px', position: 'relative', top: '-5px' }}
                            />
                        </Button>
                        <p className='summaryOne' style={{color:"#F00D69"}}>History</p>
                    </div>
                </OffCanvasHeader>

                <OffCanvasBody className='ps-4 pe-0'>
                    {isLoading ? (
                        <div className='d-flex justify-content-center h-100 align-items-center'>
                            <Spinner className='spinner-center' color='secondary' size='5rem' />
                        </div>
                    ) : (
                        <>
                            {!getTripRoadRouteV2_1Async ? (
                                <Historydetails
                                    TripInfoIsSuccess={isGetTripRoadRouteV21AsyncLoading}
                                    // TripDTCIsSuccess={TripDTCIsSuccess}
                                    TripInfoData={[]}
                                    // TripDTCData={TripDTCData}
                                    creteria={creteria}
                                    tripRoute={tripRouteV1_1}
                                    vinObj={vinObj}
                                    setIsLoading={setIsLoading}
                                />
                            ) : (
                                <div className='d-flex justify-content-center h-100 align-items-center'>
                                    <Spinner className='spinner-center' color='secondary' size='5rem' />
                                </div>
                            )}
                        </>
                    )}
                </OffCanvasBody>
            </OffCanvas>
        </>

    );
};
export default HistoryDetailsCard;