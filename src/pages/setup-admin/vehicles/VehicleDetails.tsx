// import React, { FC, useContext, useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
// import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
// import GoBack from '../../../components/GoBack';
// import Page from '../../../layout/Page/Page';
// import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import { dashboardMenu, vehiclesPages } from '../../../menu';
// import vehicleDetailFields from '../../../common/data/vehicles/vehiculeDetailFields.json';
// import placeholderVehicle from '../../../assets/vehicle-placeholder.png';
// import ThemeContext from '../../../contexts/themeContext';
// import { useTranslation } from 'react-i18next';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, store } from '../../../store/store';
// import Spinner from '../../../components/bootstrap/Spinner';
// import showNotification from '../../../components/extras/showNotification';

// const VehicleDetails: FC = () => {
// 	const { t } = useTranslation(['vehicles']);
// 	const { id } = useParams();
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const dispatch = useDispatch();
// 	const navigate = useNavigate();
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [noDataFound, setNoDataFound] = useState(false);

// 	const vehicleSpecifications: { [key: string]: string | string[] | undefined } = useSelector(
// 		(state: RootState) => state.vehicles.vehicleSpecifications || {} // Default to empty object
// 	);

// 	const series: any = vehicleSpecifications?.series || [];

// 	const { vehicleSpecification, deviceSpecification, mnoSpecification } = vehicleDetailFields;

// 	useEffect(() => {
// 		if (id) {
// 			setNoDataFound(false);
// 			// get all specification of vehicle id present in URL
// 			dispatch.vehicles.getVehicleSpecificationAsync(id).then(() => {
// 				const { message, success } = store.getState().vehicles;
// 				if (!success) {
// 					showNotification(t('Server Error'), message, 'danger');
// 				}
// 				setIsLoading(false);
// 			});
// 		}
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [dispatch.vehicles, id]);

// 	return (
// 		<PageWrapper className='vehicle-details' isProtected={true}>
// 			<Page className='mw-100 px-0'>
// 				<div className='d-flex pb-3 mb-4 w-100'>
// 					<h1 className='fs-2 pb-3 fw-semibold content-heading'>
// 						{t(`${vehiclesPages.vehicleDetail.text}`)}
// 					</h1>
// 				</div>

// 				<div className='row'>
// 					<div className='col-lg-12'>
// 						<Card className='overall-card' style={{ minHeight: 450 }}>
// 							{isLoading ? (
// 								<div className='d-flex justify-content-center'>
// 									<Spinner className='spinner-center' color='secondary' size='5rem' />
// 								</div>
// 							) : noDataFound ? (
// 								<div className='text-center'>
// 									<h4>{t('No vehicle details available for the selected vehicle ID.')}</h4>
// 								</div>
// 							) : (
// 								<>
// 									<CardHeader>
// 										<CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
// 											{t('Vehicle Specification')}
// 										</CardTitle>
// 									</CardHeader>
// 									<CardBody
// 										className={`d-flex flex-wrap ${mobileDesign ? '' : 'vehicle-specification'}`}
// 										style={{ marginTop: '-20px' }}
// 									>
// 										{vehicleSpecification.map(
// 											({ label, value, unitOfMeasure }, index: number) => (
// 												<dl
// 													className={`row ${mobileDesign ? 'w-100' : 'h-100 w-50'}`}
// 													key={index}
// 												>
// 													<dt className='col-sm-6'>{t(`${label}`)} :</dt>
// 													<dd className='col-sm-6 mb-0'>
// 														{value !== 'series' ? (
// 															`${vehicleSpecifications[value as string] || '-'} ${unitOfMeasure &&
// 																vehicleSpecifications[value as string] !== ''
// 																? unitOfMeasure
// 																: ''
// 															}`
// 														) : Array.isArray(series) ? (
// 															series.map((serie: string) => (
// 																<p key={index} className='mb-0'>
// 																	{serie}
// 																</p>
// 															))
// 														) : (
// 															<p>-</p>
// 														)}
// 													</dd>
// 												</dl>
// 											),
// 										)}
// 									</CardBody>
// 								</>
// 							)}
// 						</Card>
// 					</div>
// 				</div>

// 				<div className='row justify-content-end'>
// 					<div className='col-lg-6'>
// 						<Card className={`${mobileDesign ? '' : 'h-100'}`} style={{ borderRadius: '8px' }}>
// 							{isLoading ? (
// 								<div className='d-flex justify-content-center'>
// 									<Spinner className='spinner-center' color='secondary' size='5rem' />
// 								</div>
// 							) : noDataFound ? (
// 								<div />
// 							) : (
// 								<>
// 									<CardHeader>
// 										<CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
// 											{t('Device Specification')}
// 										</CardTitle>
// 									</CardHeader>
// 									<CardBody style={{ marginTop: '-20px' }}>
// 										{deviceSpecification.map(({ label, value }, index: number) => (
// 											<dl className='row' key={index}>
// 												<dt className='col-sm-6'>{t(`${label}`)} :</dt>
// 												<dd className='col-sm-6 mb-0'>
// 													{vehicleSpecifications[value as string] || '-'}
// 												</dd>
// 											</dl>
// 										))}
// 									</CardBody>
// 								</>
// 							)}
// 						</Card>
// 					</div>
// 					<div className='col-lg-6'>
// 						<Card
// 							className={`${mobileDesign ? '' : 'h-100'}`}
// 							style={{ minHeight: 200, borderRadius: '8px' }}
// 						>
// 							{isLoading ? (
// 								<div className='d-flex justify-content-center'>
// 									<Spinner className='spinner-center' color='secondary' size='5rem' />
// 								</div>
// 							) : noDataFound ? (
// 								<div />
// 							) : (
// 								<>
// 									<CardHeader>
// 										<CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
// 											{t('MNO Specification')}
// 										</CardTitle>
// 									</CardHeader>
// 									<CardBody style={{ marginTop: '-20px' }}>
// 										{mnoSpecification.map(({ label, value }, index: number) => (
// 											<dl className='row' key={index}>
// 												<dt className='col-sm-6'>{t(`${label}`)} :</dt>
// 												<dd className='col-sm-6 mb-0'>
// 													{vehicleSpecifications[value as string] || '-'}
// 												</dd>
// 											</dl>
// 										))}
// 									</CardBody>
// 								</>
// 							)}
// 						</Card>
// 					</div>
// 				</div>
// 			</Page>
// 		</PageWrapper>
// 	);
// };

// export default VehicleDetails;



import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import GoBack from '../../../components/GoBack';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { dashboardMenu, vehiclesPages } from '../../../menu';
import vehicleDetailFields from '../../../common/data/vehicles/vehiculeDetailFields.json';
import placeholderVehicle from '../../../assets/vehicle-placeholder.png';
import ThemeContext from '../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../../store/store';
import Spinner from '../../../components/bootstrap/Spinner';
import showNotification from '../../../components/extras/showNotification';

const VehicleDetails: FC = () => {
    const { t } = useTranslation(['vehicles']);
    const { id } = useParams();
    const { mobileDesign } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [noDataFound, setNoDataFound] = useState(false); // State for no data scenario

    const vehicleSpecifications: { [key: string]: string | string[] | undefined } = useSelector(
        (state: RootState) => state.vehicles.vehicleSpecifications || {} // Default to empty object
    );

    const series: any = vehicleSpecifications?.series || [];

    const { vehicleSpecification, deviceSpecification, mnoSpecification } = vehicleDetailFields;

    useEffect(() => {
        if (id) {
            setNoDataFound(false); // Reset no data found flag when a new vehicle is selected
            // Get all specification of the vehicle ID present in URL
            dispatch.vehicles.getVehicleSpecificationAsync(id).then(() => {
                const { message, success } = store.getState().vehicles;
                if (!success) {
                    showNotification(t('Server Error'), message, 'danger');
                    setNoDataFound(true); // If no data, set noDataFound flag to true
                }
                setIsLoading(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch.vehicles, id]);

    return (
        <PageWrapper className='vehicle-details' isProtected={true}>
            <Page className='mw-100 px-0'>
                <div className='d-flex pb-3 mb-4 w-100'>
                    <h1 className='fs-2 pb-3 fw-semibold content-heading'>
                        {t(`${vehiclesPages.vehicleDetail.text}`)}
                    </h1>
                </div>

                <div className='row'>
                    <div className='col-lg-12'>
                        <Card className='overall-card' style={{ minHeight: 450 }}>
                            {isLoading ? (
                                <div className='d-flex justify-content-center'>
                                    <Spinner className='spinner-center' color='secondary' size='5rem' />
                                </div>
                            ) : noDataFound ? (
                                <div className='text-center mt-5'>
                                    <h4>{t('No vehicle details available for the selected vehicle ID.')}</h4>
                                </div>
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
                                            {t('Vehicle Specification')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody
                                        className={`d-flex flex-wrap ${mobileDesign ? '' : 'vehicle-specification'}`}
                                        style={{ marginTop: '-20px' }}
                                    >
                                        {vehicleSpecification.map(
                                            ({ label, value, unitOfMeasure }, index: number) => (
                                                <dl
                                                    className={`row ${mobileDesign ? 'w-100' : 'h-100 w-50'}`}
                                                    key={index}
                                                >
                                                    <dt className='col-sm-6'>{t(`${label}`)} :</dt>
                                                    <dd className='col-sm-6 mb-0'>
                                                        {value !== 'series' ? (
                                                            `${vehicleSpecifications[value as string] || '-'} ${unitOfMeasure &&
                                                                vehicleSpecifications[value as string] !== ''
                                                                ? unitOfMeasure
                                                                : ''
                                                            }`
                                                        ) : Array.isArray(series) ? (
                                                            series.map((serie: string) => (
                                                                <p key={index} className='mb-0'>
                                                                    {serie}
                                                                </p>
                                                            ))
                                                        ) : (
                                                            <p>-</p>
                                                        )}
                                                    </dd>
                                                </dl>
                                            ),
                                        )}
                                    </CardBody>
                                </>
                            )}
                        </Card>
                    </div>
                </div>

                <div className='row justify-content-end'>
                    <div className='col-lg-6'>
                        <Card className={`${mobileDesign ? '' : 'h-100'}`} style={{ borderRadius: '8px' }}>
                            {isLoading ? (
                                <div className='d-flex justify-content-center'>
                                    <Spinner className='spinner-center' color='secondary' size='5rem' />
                                </div>
                            ) : noDataFound ? (
                                <div />
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
                                            {t('Device Specification')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody style={{ marginTop: '-20px' }}>
                                        {deviceSpecification.map(({ label, value }, index: number) => (
                                            <dl className='row' key={index}>
                                                <dt className='col-sm-6'>{t(`${label}`)} :</dt>
                                                <dd className='col-sm-6 mb-0'>
                                                    {vehicleSpecifications[value as string] || '-'}
                                                </dd>
                                            </dl>
                                        ))}
                                    </CardBody>
                                </>
                            )}
                        </Card>
                    </div>
                    <div className='col-lg-6'>
                        <Card
                            className={`${mobileDesign ? '' : 'h-100'}`}
                            style={{ minHeight: 200, borderRadius: '8px' }}
                        >
                            {isLoading ? (
                                <div className='d-flex justify-content-center'>
                                    <Spinner className='spinner-center' color='secondary' size='5rem' />
                                </div>
                            ) : noDataFound ? (
                                <div />
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className='fs-4 pb-0 mt-1 fw-semibold'>
                                            {t('MNO Specification')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardBody style={{ marginTop: '-20px' }}>
                                        {mnoSpecification.map(({ label, value }, index: number) => (
                                            <dl className='row' key={index}>
                                                <dt className='col-sm-6'>{t(`${label}`)} :</dt>
                                                <dd className='col-sm-6 mb-0'>
                                                    {vehicleSpecifications[value as string] || '-'}
                                                </dd>
                                            </dl>
                                        ))}
                                    </CardBody>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </Page>
        </PageWrapper>
    );
};

export default VehicleDetails;
