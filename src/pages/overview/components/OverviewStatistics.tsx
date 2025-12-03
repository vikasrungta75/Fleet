import React, { useContext } from 'react';
import Spinner from '../../../components/bootstrap/Spinner';
import { IStatistics } from '../../../type/overview-types';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../contexts/themeContext';

type StatisticsProps = React.PropsWithChildren<{
	statistics: IStatistics[];
	isLoading: boolean;
}>;

const OverviewStatistics = (props: StatisticsProps) => {
	const { statistics, isLoading } = props;
	const { t } = useTranslation(['overview', 'history']);
	const { mobileDesign } = useContext(ThemeContext);

	return (
		<div className='row mb-4 rounded-2' id='card_body_statistics'>
			{statistics.map(({ header, data }, index) => {
				return (
					<div
						key={index + 1}
						className={mobileDesign ? 'border rounded border-1 mb-3 p-3' : 'border rounded border-1 col mx-3 p-3'}>
						<div>
							<h5 className='text-secondary fw-semibold '>{t(`${header}`)}</h5>
						</div>
						<div className='d-flex'>
							{data.map(({ name, value }, indexData) => {
								return (
									<div
										key={indexData}
										className='d-flex'
										style={{ color: '#ACACAC' }}>
										<div className='d-flex align-items-center'>
											{t(`${name}`)} :{' '}
											{isLoading ? (
												<Spinner
													className='spinner-center ms-2'
													color='secondary'
													size='1rem'
													isSmall
													isGrow
												/>
											) : (
												<span className='fs-5 ms-3 fw-semibold text-dark'>
													{value}
												</span>
											)}
										</div>
										{indexData !== data.length - 1 && (
											<hr
												style={{
													margin: '0 10px',
													height: 'auto',
													borderLeft: '1px solid #ACACAC',
												}}
											/>
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default OverviewStatistics;
