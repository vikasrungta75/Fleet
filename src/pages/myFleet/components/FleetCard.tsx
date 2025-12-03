import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '../../../components/bootstrap/Badge';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import Collapse from '../../../components/bootstrap/Collapse';
import Icon from '../../../components/icon/Icon';
import { IvehicleLocation } from '../../../type/vehicles-type';
import { statusInformations } from './map/constants/mapConstants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { MapType } from './map/type/type/mapType';

interface IFleetCardProps {
	vehicleDetails: IvehicleLocation;
	map: MapType | null;
	vehicleSelectedCard: IvehicleLocation | undefined;
	setvehicleSelectedCard: (vehicleSelectedCard: IvehicleLocation) => void;
	setButtonFilterClicked: (ButtonFilterClicked: boolean) => void;
}
const FleetCard: FC<IFleetCardProps> = ({
	vehicleDetails,
	map,
	vehicleSelectedCard,
	setvehicleSelectedCard,
	setButtonFilterClicked,
}) => {
	const { t } = useTranslation(['vehicles']);
	const [showMore, setShowMore] = useState(false);
	const {
		fuel,
		last_seen_location: lastSeenLocation,
		lat,
		lng,
		make,
		model,
		odometer,
		oem,
		registration_no: regNo,
		speed,
		status,
		vin,
	} = vehicleDetails;
	const dispatch = useDispatch();
	const { showAllVehiclesMap } = useSelector((state: RootState) => state.vehicles);

	const detailsFields = {
		header: [
			{ label: 'Reg no', value: regNo, toBeShown: true },
			{ label: 'Current heading', value: lat ? `${lat} - ${lng}` : '', toBeShown: true },
			{ label: 'Last seen location', value: lastSeenLocation, toBeShown: true },
		],
		footer: [
			{ label: 'Speed', value: speed, unitOfMeasure: 'Km/h' },
			{ label: 'Odometer', value: odometer, unitOfMeasure: 'mileage' },
			{ label: 'Fuel Remaining', value: fuel, unitOfMeasure: '%' },
		],
	};

	const handleFocus = React.useCallback(() => {
		if (map) {
			map.setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
			map.setZoom(19);
			setvehicleSelectedCard(vehicleDetails);
			dispatch.vehicles.changeShowAllVehicle(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lat, lng, map, setvehicleSelectedCard, showAllVehiclesMap, vehicleDetails]);

	return (
		// <></>
		<Card className='fleet-card'>
			<div
				className='cursor-pointer'
				onClick={() => {
					handleFocus();
					setButtonFilterClicked(false);
				}}>
				<CardBody
					className={`bg-${showMore && statusInformations[status]?.opacity} top-card`}>
					<div className='col-12 pe-0 d-flex justify-content-end'>
						<Badge className='py-2 px-4' color={statusInformations[status]?.color}>
							{t(`${status}`)}
						</Badge>
					</div>

					{detailsFields.header.map(({ label, value, toBeShown }) => {
						return toBeShown ? (
							<dl className='row col-12' key={label}>
								<dt className='col-4 pe-0'>{t(`${label}`)} :</dt>
								<dd className='mb-0 col-7'>{value}</dd>
							</dl>
						) : (
							<Collapse isOpen={showMore} key={label}>
								<dl className='row col-12 '>
									<dt className='col-4 pe-0'>{t(`${label}`)} :</dt>
									<dd className='mb-0 col-7'>{value}</dd>
								</dl>
							</Collapse>
						);
					})}
				</CardBody>

				<Collapse isOpen={showMore}>
					<CardBody className='col-12 d-flex align-items-center justify-content-between'>
						{detailsFields.footer.map(({ label, value, unitOfMeasure }) => {
							return (
								<dl className='mb-0' key={label}>
									<dt className='me-1'>{t(`${label}`)} : </dt>
									<dd className='mb-0'>
										{unitOfMeasure ? `${value} ${t(unitOfMeasure)}` : value}
									</dd>
								</dl>
							);
						})}
					</CardBody>
				</Collapse>
			</div>
			<CardFooter
				className={`py-1 fleet-footer ${showMore ? 'black-footer' : ''}`}
				onClick={() => setShowMore(!showMore)}>
				{!showMore ? (
					<Button
						icon='Add'
						className={`${
							!showMore ? 'text-secondary' : 'text-light'
						} m-auto d-flex flex-row-reverse align-items-center justify-content-around`}>
						{t('Show more')}
					</Button>
				) : (
					<Icon
						icon='ChevronRight'
						color={!showMore ? 'secondary' : 'light'}
						size='2x'
						className='m-auto rotated'
					/>
				)}
			</CardFooter>
		</Card>
	);
};

export default FleetCard;
