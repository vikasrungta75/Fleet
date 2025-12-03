import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import Alert from '../../../../../components/bootstrap/Alert';
import Icon from '../../../../../components/icon/Icon';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';

interface MonitoringFuelTankProps {
	columns: Array<{
		name: string;
		key: string;
		width?: number;
		subHeader?: Array<{ name: string; key: string }>;
	}>;
	data: any[];
}

const MonitoringFuelTank: FC<MonitoringFuelTankProps> = ({ columns, data }) => {
	const { t } = useTranslation(['vehicles']);
	const { dir } = useSelector((state: RootState) => state.appStore);

	return data?.length > 1 ? (
		<div style={{ maxHeight: '500px', overflowY: 'auto' }}>
			<table
				className={`table   ${
					dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'
				}`}>
				<thead>
					<tr style={{ textAlign: 'center' }}>
						{columns.map(({ name, width, subHeader }, index) => (
							<th
								key={index}
								colSpan={subHeader ? subHeader.length : 1} // Remove +1 for colSpan for subheaders
								style={{
									borderRight:
										columns.length - 1 !== index ? '1px solid #B3B3B3' : 0,
									width: width,
									paddingTop: 0,
									paddingBottom: 0,
									borderEndEndRadius: 0,
									borderEndStartRadius: 0,
								}}>
								<div
									style={{
										padding: '10px',
										cursor: 'pointer',
									}}
									className='d-flex justify-content-center'>
									<div className='d-flex align-items-center' onClick={() => {}}>
										{t(`${name}`)}
									</div>
								</div>
							</th>
						))}
					</tr>

					<tr
						style={{
							backgroundColor: '#EBEBEB',
							zIndex: 5,
							borderStartEndRadius: 0,
							borderStartStartRadius: 0,
							//	textAlign: 'center',
						}}>
						{columns.map(({ subHeader }, index) =>
							subHeader ? (
								subHeader?.map((el: any, i: number) => (
									<th
										style={{
											borderLeft: '1px solid #B3B3B3',
											fontFamily: 'Open Sans',
											fontSize: '12px',
											borderStartEndRadius: 0,
											borderStartStartRadius: 0,
											textAlign: 'center',
										}}
										key={i}>
										{t(el.name)}
									</th>
								))
							) : (
								<th
									key={index}
									style={{
										borderStartEndRadius: 0,
										borderStartStartRadius: 0,
									}}></th>
							),
						)}
					</tr>
				</thead>
				<tbody className='tbody-fuel-volume-reports'>
					{data &&
						data.map((element, index) => {
						
							return (
								<tr
									key={index}
									style={{
										zIndex: '1',
										cursor: 'auto',
									}}>
									<td>
										<div className='d-flex align-items-center'>
											{element.date}
										</div>
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.monitoring_fuel_tank}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.volume}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.starting_volume}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.ending_volume}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.since_the_start}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.address}
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</div>
	) : (
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
	);
};

export default MonitoringFuelTank;

