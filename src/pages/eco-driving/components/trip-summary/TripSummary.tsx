import React, { FC, useContext } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import { ISummaryDriver } from '../../../../type/driver-types';
import { IconTripSummary } from '../../ConstantsEcoDriver';
import { transformString } from '../../../../helpers/helpers';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';

interface ITripSummary {
	dataDriverSummary: ISummaryDriver[];
}

const TripSummary: FC<ITripSummary> = ({ dataDriverSummary }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['driverLeaderboard']);

	return (
		<>
			<Card style={{borderRadius:"8px"}}>
				<CardHeader>
					<p className='scoresHeading mb-0'> {t('Trip Summary')} </p>
				</CardHeader>
				{dataDriverSummary.length > 0 && (
					<CardBody>
						<div
							className={`${mobileDesign
									? 'd-flex flex-column '
									: 'd-flex flex-row justify-content-between'
								}`}>
							{Object.keys(dataDriverSummary[0]).map((arg, i: any) => {
								return (
									<div
										key={i}
										className={`d-flex flex-column justify-content-between align-items-center border border-1 shadow-boxTrip  ${mobileDesign ? 'w-100 ' : ''
											}`}
										style={{
											backgroundColor: ' #FFFFFF ',
											padding: 20,
											borderRadius: 8,
											width: 190,
											marginTop: "-20px"
										}}>
										<div>
											<Icon
												// className='icon-background'
												style={{ color: '#E41F3F', backgroundColor: '#E41F3F33',borderRadius:"20px",padding:"10px"}}
												icon={IconTripSummary[arg]}
												size='3x'
											/>
										</div>
										<p 
											style={{
												marginTop: 12,
												color: '#2F2F2F',
												fontSize: 14,
												fontFamily: 'Open Sans',
												fontWeight: 400,
												lineHeight: 'normal',
											}}>
											{dataDriverSummary[0][arg as keyof ISummaryDriver]}
										</p>
										<p
											style={{
												color: '#2F2F2F',
												fontSize: 14,
												fontStyle: 'normal',
												fontWeight: 700,
												lineHeight: 'normal',
												marginBottom: 0,
											}}>
											{t(transformString(arg))}
										</p>
									</div>
								);
							})}
						</div>
					</CardBody>
				)}
			</Card>
		</>
	);
};

export default TripSummary;



