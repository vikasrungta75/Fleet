// / import React, { FC, useState, useContext } from 'react';
// import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
// import { IBehaviourScore } from '../../../../type/driver-types';
// import Chart, { IChartOptions } from '../../../../components/extras/Chart';
// import { ApexOptions } from 'apexcharts';
// import { colorsChartOption, shuffleArray } from '../../ConstantsEcoDriver';
// import { transformString } from '../../../../helpers/helpers';
// import ThemeContext from '../../../../contexts/themeContext';
// import { useTranslation } from 'react-i18next';

// interface IDriverScores {
// 	BehaviourScoreData: IBehaviourScore[];
// }

// const DriverScores: FC<IDriverScores> = ({ BehaviourScoreData }) => {
// 	const { t } = useTranslation(['driverLeaderboard']);

// 	const { mobileDesign } = useContext(ThemeContext);
// 	const [state] = useState<IChartOptions>({
// 		series: [70],
// 		options: {
// 			colors: [
// 				'#1f77b4',
// 				'#ff7f0e',
// 				'#2ca02c',
// 				'#d62728',
// 				'#9467bd',
// 				'#8c564b',
// 				'#e377c2',
// 				'#7f7f7f',
// 				'#bcbd22',
// 				'#17becf',
// 				'#aec7e8',
// 				'#ffbb78',
// 				'#98df8a',
// 				'#ff9896',
// 				'#c5b0d5',
// 				'#c49c94',
// 			],
// 			chart: {
// 				height: 220,
// 				type: 'radialBar',
// 			},
// 			plotOptions: {
// 				radialBar: {
// 					dataLabels: {
// 						name: {
// 							show: false,
// 							fontSize: '20px',
// 						},
// 						value: {
// 							fontSize: '30px',
// 						},
// 					},

// 					hollow: {
// 						size: '80%',
// 					},
// 				},
// 			},
// 			stroke: {
// 				lineCap: 'round',
// 				width: 3,
// 			},
// 		},
// 	});

// 	return (
// 		<>
// 			<Card style={{borderRadius: "8px"}}>
// 				<CardHeader>
// 					<h5 className='fw-semibold mb-0'> {t('Driver Scores')} </h5>
// 				</CardHeader>
// 				{BehaviourScoreData.length > 0 && (
// 					<CardBody
// 						className={`${
// 							mobileDesign
// 								? 'd-flex flex-column justify-content-around my-4'
// 								: 'd-flex flex-row justify-content-around my-4'
// 						}`}>
// 						{Object.keys(BehaviourScoreData[0]).map((key, i) => {
// 							const randomizedArray = shuffleArray(colorsChartOption);
// 							let OptionsChart: ApexOptions = {
// 								colors: randomizedArray,
// 								chart: {
// 									height: 300,
// 									type: 'radialBar',
// 								},
// 								plotOptions: {
// 									radialBar: {
// 										dataLabels: {
// 											name: {
// 												show: false,
// 												fontSize: '20px',
// 											},
// 											value: {
// 												fontSize: '30px',
// 											},
// 										},

// 										hollow: {
// 											size: '60%',
// 										},
// 									},
// 								},
// 								stroke: {
// 									lineCap: 'round',
// 								},
// 							};
// 							return (
// 								<div
// 									key={i}
// 									className='d-flex flex-column justify-content-center align-items-center mb-2'
// 									style={{
// 										width: mobileDesign ? undefined : 160,
// 										height: mobileDesign ? undefined : 160,
// 									}}>
// 									<div
// 										className='d-flex align-items-center  py-2 mb-2'
// 										style={{
// 											backgroundColor: ' #FFF ',
// 											border: '1px solid  #afafaf',
// 											borderRadius: 10,
// 											width: 220,
// 											height: 200,
// 										}}>
// 										<Chart
// 											series={[
// 												Number(
// 													BehaviourScoreData[0][
// 														key as keyof IBehaviourScore
// 													],
// 												),
// 											]}
// 											options={OptionsChart}
// 											type={state.options.chart?.type}
// 											height={state.options.chart?.height}
// 										/>
// 									</div>
// 									<p
// 										style={{
// 											color: '#2F2F2F',
// 											fontSize: 14,
// 											fontStyle: 'normal',
// 											fontWeight: 700,
// 											lineHeight: 'normal',
// 										}}>
// 										{t(transformString(key))}
// 									</p>
// 								</div>
// 							);
// 						})}
// 					</CardBody>
// 				)}
// 			</Card>
// 		</>
// 	);
// };

// export default DriverScores;



// working
import React, { FC, useContext } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import { IBehaviourScore } from '../../../../type/driver-types';
import Chart from 'react-apexcharts';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';

interface IDriverScores {
	BehaviourScoreData: IBehaviourScore[];
}

const DriverScores: FC<IDriverScores> = ({ BehaviourScoreData }) => {
	const { t } = useTranslation(['driverLeaderboard']);
	const { mobileDesign } = useContext(ThemeContext);

	// Prepare data for the bar chart
	const categories = BehaviourScoreData.length > 0 ? Object.keys(BehaviourScoreData[0]) : [];
	const dataValues = BehaviourScoreData.length > 0 ? Object.values(BehaviourScoreData[0]) : [];

	const chartOptions = {
		chart: {
			type: 'bar' as const,
			height: 550,
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '35px',
				endingShape: 'rounded',
			},
		},
		dataLabels: {
			enabled: true,
		},
		xaxis: {
			categories: categories.map((key) => t(key)),
		},
		colors: ['#FFBB44'], // Use the color for the bars
		fill: {
			type: 'gradient',
			gradient: {
				type: 'linear',
				gradientToColors: ['#FFBB44'],
				stops: [0, 100],
			},
		},
		yaxis: {
			title: {
				text: t('Counts'),
			},
		},
	};

	const chartSeries = [
		{
			name: t('Scores'),
			data: dataValues.map((value) => Number(value)),
		},
	];

	return (
		<Card style={{borderRadius: '8px',gap: '10px',border: '1px solid #D9D9D9',backgroundColor: '#FFFFFF', boxShadow: '0px 2px 4px 0px #00000040'}} className='col-6'>
			<CardHeader>
				<p className='scoresHeading mb-0'>{t('Driver Scores')}</p>
			</CardHeader>
			{BehaviourScoreData.length > 0 && (
				<CardBody
					className={`${mobileDesign
							? 'd-flex flex-column justify-content-around'
							: 'd-flex flex-row justify-content-around'
						}`}>
					<div style={{ width: '100%',marginTop:"-27px" }}>
						<Chart
							options={chartOptions}
							series={chartSeries}
							type='bar'
							height={350}
						/>
					</div>
				</CardBody>
			)}
		</Card>
	);
};

export default DriverScores;



