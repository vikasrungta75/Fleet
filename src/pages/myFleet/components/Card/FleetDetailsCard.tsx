import React, { FC, useState } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import { svg } from '../../../../assets/index';

import { useGetVehicleLocationv1 } from '../../../../services/vehiclesService';
import HorizontalStackedBarChart from '../../../../components/HorizontalStackedBarChart ';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useTranslation } from 'react-i18next';

export interface Itimeline {
	startTime: number;
	endTime: number;
	timelineObj: { [key: string]: number };
}

export const createVehicleTimeLineArray = (vehicleStatusObj: any): Itimeline => {
	if (vehicleStatusObj) {
		const status: Array<string> = vehicleStatusObj.status;
		const startTime: Array<any> = vehicleStatusObj.start_time;
		const endTime: Array<any> = vehicleStatusObj.end_time;
		let vehicleTimeLineArray = [];
		let timelineObj = {};
		let startDate;
		let endDate;
		let durationInHours;
		for (let i = 0; i < status.length; i++) {
			startDate = new Date(startTime[i].$date);
			endDate = new Date(endTime[i].$date);
			durationInHours = Math.abs(
				Math.round(
					parseFloat(
						endDate.getHours() +
							'.' +
							endDate.getMinutes() +
							Math.round(endDate.getSeconds() / 60),
					) -
						parseFloat(
							startDate.getHours() +
								'.' +
								startDate.getMinutes() +
								Math.round(startDate.getSeconds() / 60),
						),
				),
			);

			Object.assign(timelineObj, {
				[`${status[i].toLowerCase()}_${i}`]: durationInHours > 0 ? durationInHours : 0.01,
			});
			vehicleTimeLineArray.push({
				startTime: parseFloat(
					startDate.getHours() +
						'.' +
						startDate.getMinutes() +
						Math.round(startDate.getSeconds() / 60),
				),
				endTime: parseFloat(
					endDate.getHours() +
						'.' +
						endDate.getMinutes() +
						Math.round(endDate.getSeconds() / 60),
				),
			});
		}

		return {
			startTime: Math.round(Math.min(...vehicleTimeLineArray.map((item) => item.startTime))),
			endTime: Math.round(Math.max(...vehicleTimeLineArray.map((item) => item.startTime))),
			timelineObj,
		};
	}
	return { startTime: 1, endTime: 23, timelineObj: {} };
};

interface IFleetDetailsCardProps {
	creteria: { vins: []; date: {} };
}

const FleetDetailsCard: FC<IFleetDetailsCardProps> = ({ creteria }): JSX.Element => {
	const { data: vehicleLocationv1, isLoading } = useGetVehicleLocationv1();

	const filteredVehicles =
		vehicleLocationv1?.filter((vehicle: any) =>
			creteria.vins.toString().includes(vehicle.vin),
		) || [];

	const [toggleTabs, setToggleTabs] = useState<boolean[]>(
		Array(filteredVehicles.length).fill(false),
	);

	const { t } = useTranslation(['vehicles']);

	return (
		<>
			{filteredVehicles.map((vehicle: any, index: number) => {
				const { vin, status, last_seen_location: lastSeenLocation } = vehicle;
				return (
					<Card key={index} className='cardDetails'>
						<div className='cardDetailsHeader p-4'>
							<span>{vin}</span>
							<div
								className='d-flex justify-content-between align-items-center'
								style={{ width: 60 }}>
								<img
									src={svg[status.toLowerCase() as keyof typeof svg]}
									alt={svg[status.toLowerCase() as keyof typeof svg]}
									width={15}
									height={15}
								/>
								<img
									src={toggleTabs[index] ? svg.chartBar : svg.list}
									alt={toggleTabs[index] ? 'chartBar' : 'list'}
									width={toggleTabs[index] ? 15 : 10}
									height={toggleTabs[index] ? 15 : 10}
									className='cursor-pointer'
									onClick={() => {
										setToggleTabs((prevState) => {
											const newToggleTabs = [...prevState];
											newToggleTabs[index] = !newToggleTabs[index];
											return newToggleTabs;
										});
									}}
								/>
							</div>
						</div>
						<CardBody className='cardDetailsBody'>
							{toggleTabs[index] ? (
								<HorizontalStackedBarChart vin={vin} />
							) : (
								<div className='location'>
									<div className='lastLocation'>
										<span className='title'>
											{t('Last location')} :<br />
										</span>
										<span className='info'>{lastSeenLocation || '-'}</span>
									</div>
									{/*<div>
                            <span className='title me-3'>Current distance : </span>
                            <span className='info'>{'-'}</span>
                        </div>*/}
								</div>
							)}
						</CardBody>
					</Card>
				);
			})}

			{isLoading && (
				<Card className='cardDetails'>
					<CardBody className='cardDetailsBody'>
						<div className='d-flex justify-content-center  align-items-center my-2'>
							<Spinner className='spinner-center' color='secondary' size='5rem' />
						</div>
					</CardBody>
				</Card>
			)}
		</>
	);
};

export default FleetDetailsCard;
