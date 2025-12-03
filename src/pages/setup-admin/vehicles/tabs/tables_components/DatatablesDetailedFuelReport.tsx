import React, { FC } from 'react';
import { calculateTotal } from '../../../../../helpers/helpers';
import { orderTotalFuelReportDetailed } from './columnsFuelVolume';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import Alert from '../../../../../components/bootstrap/Alert';
import Icon from '../../../../../components/icon/Icon';

interface DatatableDetailedFuelReportProps {
	columns: Array<{
		name: string;
		key: string;
		width?: number;
		subHeader?: Array<{ name: string; key: string }>;
	}>;
	data: any[];
}

const DatatableDetailedFuelReport: FC<DatatableDetailedFuelReportProps> = ({ columns, data }) => {
	const { t } = useTranslation(['vehicles']);
	const totals: { [key: string]: string } = {};
	for (const key in data && data[0]) {
		// Exclude 'date' field from calculation
		if (key !== 'date') {
			totals[key] = calculateTotal(data && data, key);
		}
	}

	return data?.length > 0 ? (
		<div style={{ maxHeight: '500px', overflowY: 'auto',border:"1px solid #D9D9D9",boxShadow: "0px 0px 25px 0px #5E5C9A1A",}}>
			<table className={'table table-modern '}>
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
									borderBottomLeftRadius: 0,
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
							borderBottomRightRadius: 0,
							borderBottomLeftRadius: 0,
							borderTopRightRadius: 0,
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
											borderTopRightRadius: 0,
											borderBottomRightRadius: 0,
											borderBottomLeftRadius: 0,
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
										borderTopRightRadius: 0,
										borderTopLeftRadius: 0,
										borderBottomRightRadius: 0,
										borderBottomLeftRadius: 0,
									}}
								/>
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
										{element.fill_count}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.fill_quantity}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.drain_count}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.drain_quantity}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.distance}
									</td>
									<td style={{ borderLeft: '1px solid #B3B3B3' }}>
										{element.fuel_savings_fuel_cost}
									</td>
								</tr>
							);
						})}
					<tr
						style={{
							backgroundColor: '#EBEBEB',
							zIndex: 5,
							borderStartEndRadius: 0,
							borderStartStartRadius: 0,
							fontWeight: 800,

							//	textAlign: 'center',
						}}>
						<td style={{ borderTopLeftRadius: 0 }}>
							<div style={{ borderLeft: 'none', textAlign: 'start' }}>
								{t('Total')}
							</div>
						</td>
						{orderTotalFuelReportDetailed.map((key) => (
							<td style={{ borderTopRightRadius: 0 }} key={key}>
								{totals[key]}
							</td>
						))}
					</tr>
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

export default DatatableDetailedFuelReport;

