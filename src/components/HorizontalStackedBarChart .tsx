import React, { FC, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { statusFilters } from '../pages/myFleet/components/map/constants/mapConstants';
import Spinner from './bootstrap/Spinner';
import { useGetTripTimeline } from '../services/vehiclesService';
import {
	Itimeline,
	createVehicleTimeLineArray,
} from '../pages/myFleet/components/Card/FleetDetailsCard';
import NoData from './NoData';
import { useTranslation } from 'react-i18next';
import { dateFormatter } from '../helpers/helpers';

interface IHorizontalStackedBarChart {
	vin?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className='custom-tooltip'>
				<p className='label'>{`${label}h`}</p>
				<p className='value'>{`Value: ${payload[0].value}`}</p>
			</div>
		);
	}

	return null;
};

const HorizontalStackedBarChart: FC<IHorizontalStackedBarChart> = ({ vin }) => {
	const [startdate, setStartDate] = useState<string | null>(null);
	const [enddate, setEndDate] = useState<string | null>(null);

	useEffect(() => {
		const getUserTimeZoneOffset = () => {
			const userTimeZoneOffset = new Date().getTimezoneOffset();
			return userTimeZoneOffset;
		};

		const getUserTimeZoneDate = (date: Date, offset: number) => {
			const userTimeZoneDate = new Date(date.getTime() + offset * 60 * 1000);
			return userTimeZoneDate;
		};

		const calculateStartAndEndDate = () => {
			const today = new Date();
			const userTimeZoneOffset = getUserTimeZoneOffset();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			const startDate = dateFormatter(
				getUserTimeZoneDate(yesterday, userTimeZoneOffset),
				'YYYY-MM-DD HH:mm:ss',
			);
			const endDate = dateFormatter(
				getUserTimeZoneDate(today, userTimeZoneOffset),
				'YYYY-MM-DD HH:mm:ss',
			);
			setStartDate(startDate);
			setEndDate(endDate);
		};

		calculateStartAndEndDate();
	}, []);

	const {
		data,
		isLoading,
		isSuccess: TripTimelineIsSuccess,
		refetch: TripTimelineRefetch,
	} = useGetTripTimeline({ vin: vin, startdate, enddate });

	const [vehicleTimeLineArray, setVehicleTimeLineArray] = useState<Itimeline>({
		timelineObj: {},
		startTime: 1,
		endTime: 23,
	});

	useEffect(() => {
		if (data) {
			setVehicleTimeLineArray(createVehicleTimeLineArray(data[0]));
		}
	}, [data]);

	const { endTime, startTime, timelineObj } = vehicleTimeLineArray;

	const ticks = Array.from({ length: endTime - startTime }, (_, index) => index + 1);

	const { t } = useTranslation(['vehicles']);

	return timelineObj ? (
		Object.keys(timelineObj).length > 0 ? (
			<>
				<ResponsiveContainer height={20} width={'100%'}>
					<BarChart layout='vertical' data={[timelineObj]} margin={{ bottom: 0 }}>
						<XAxis
							type='number'
							hide
							domain={[0, endTime - startTime]}
							ticks={ticks}
							tickFormatter={(value) => `${value}h`}
						/>

						<YAxis hide type='category' stroke='#FFFFFF' fontSize='12' />
						{Object.keys(timelineObj).map((item, index) => {
							return (
								<Bar
									key={index}
									dataKey={item}
									fill={
										statusFilters.filter(
											(el) =>
												el.filteredGroup.toLowerCase() ===
												item.split('_')[0].toLowerCase(),
										)[0].color
									}
									stackId='a'
									barSize={100}></Bar>
							);
						})}
					</BarChart>
				</ResponsiveContainer>
				<div className='w-100 d-flex justify-content-between'>
					{Array.from({ length: endTime - startTime + 1 }, (_, i) => startTime + i).map(
						(item: number, index: number) => {
							return (
								<div
									key={index}
									className='text-end '
									style={{
										fontSize: 9,
										width: `${Math.floor(100 / (endTime - startTime))}%`,
									}}>
									{item}h
								</div>
							);
						},
					)}
				</div>
			</>
		) : (
			<div className='d-flex justify-content-center h-100 align-items-center'>
				<Spinner className='spinner-center' color='secondary' size='5rem' />
			</div>
		)
	) : (
		<NoData text={t('details not found')} withCard={false} />
	);
};
export default HorizontalStackedBarChart;
