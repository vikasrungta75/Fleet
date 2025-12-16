import React, { FC, useState } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import { useGetVehicleLocationv1 } from '../../../../services/vehiclesService';
import HorizontalStackedBarChart from '../../../../components/HorizontalStackedBarChart ';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useTranslation } from 'react-i18next';

export interface Itimeline {
	startTime: number;
	endTime: number;
	timelineObj: { [key: string]: number };
	totals: { running: number; idle: number; stopped: number; parked: number };
}

interface IDateCriteria {
	startDate?: string;
	endDate?: string;
	startTime?: string;
	endTime?: string;
}

export const createVehicleTimeLineArray = (vehicleStatusObj: any): Itimeline => {
	if (!vehicleStatusObj) {
		return {
			startTime: 0,
			endTime: 23,
			timelineObj: {},
			totals: { running: 0, idle: 0, stopped: 0, parked: 0 },
		};
	}

	const statusList = vehicleStatusObj.status;
	const startTimes = vehicleStatusObj.start_time;
	const endTimes = vehicleStatusObj.end_time;

	let hourMap: { [hour: number]: string[] } = {};

	for (let i = 0; i < statusList.length; i++) {
		const status = statusList[i].toLowerCase();
		const startDate = new Date(startTimes[i].$date);
		const endDate = new Date(endTimes[i].$date);

		let startHour = startDate.getHours();
		let endHour = endDate.getHours();

		for (let h = startHour; h <= endHour; h++) {
			if (!hourMap[h]) hourMap[h] = [];
			hourMap[h].push(status);
		}
	}

	let timelineObj: any = {};
	let totals = { running: 0, idle: 0, stopped: 0, parked: 0 };
	let allHours: number[] = [];

	Object.keys(hourMap).forEach((h) => {
		const hour = Number(h);
		allHours.push(hour);

		const statuses = hourMap[hour];
		const freq: any = {};

		statuses.forEach((s) => {
			freq[s] = (freq[s] || 0) + 1;
		});

		const finalStatus = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));

		timelineObj[`${finalStatus}_${hour}`] = 1;

		// FIXED TYPE ERROR HERE
		const key = finalStatus as keyof typeof totals;
		totals[key] += 1;
	});

	return {
		startTime: Math.min(...allHours),
		endTime: Math.max(...allHours),
		timelineObj,
		totals,
	};
};

interface IFleetDetailsCardProps {
	creteria: { vins: string[]; date: IDateCriteria };
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
				const { vin, last_seen_location: lastSeenLocation } = vehicle;
				return (
					<Card key={index} className='cardDetails'>
						<CardBody className='cardDetailsBody'>
							<HorizontalStackedBarChart
								vin={vin}
								startdate={
									creteria.date.startDate && creteria.date.startTime
										? `${creteria.date.startDate} ${creteria.date.startTime}`
										: undefined
								}
								enddate={
									creteria.date.endDate && creteria.date.endTime
										? `${creteria.date.endDate} ${creteria.date.endTime}`
										: undefined
								}
							/>
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
