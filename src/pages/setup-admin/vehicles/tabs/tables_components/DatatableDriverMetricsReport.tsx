
import React, { FC, useState } from 'react';
import useSortableData from '../../../../../hooks/useSortableData';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../../../components/PaginationButtons';
import { calculateTotal, convertToTimeFormat } from '../../../../../helpers/helpers';
import {
	DriverMetricsReportColumnKeys,
	driverMetricsReportColumns,
	totalDriverMetricsReports,
} from './columnsFuelVolume';
import { useTranslation } from 'react-i18next';

interface DatatableDriverMetricsReportProps {
	data: any[];
}

const DatatableDriverMetricsReport: FC<DatatableDriverMetricsReportProps> = ({ data }) => {
	const { t } = useTranslation(['vehicles']);
	const { items, requestSort, getClassNamesFor } = useSortableData(data);
	const [perPage, setPerPage] = useState(PER_COUNT[5]);
	const [currentPage, setCurrentPage] = useState(1);

	const totals: { [key: string]: string } = {};
	for (const key in data && data[0]) {
		// Exclude 'date' field from calculation
		if (key !== 'date' && key !== 'first_contact_on' && key !== 'last_contact_off') {
			totals[key] = calculateTotal(data && data, key);
		}
	}

	return (
		<>
			<table className={'table table-modern '}>
				<thead>
					<tr style={{ textAlign: 'center' }}>
						{driverMetricsReportColumns.map(({ name }, index) => (
							<th
								key={index}
								colSpan={1} // Remove +1 for colSpan for subheaders
								style={{
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
						}}></tr>
				</thead>
				<tbody className='tbody-fuel-volume-reports'>
					{data &&
						totals &&
						dataPagination(items, currentPage, perPage).map((item, index) => {
							return (
								<tr
									key={index}
									style={{
										zIndex: '1',
										cursor: 'auto',
									}}>
									<td>{item[DriverMetricsReportColumnKeys.Client as any]}</td>
									<td>{item[DriverMetricsReportColumnKeys.Branch as any]}</td>
									<td>
										{item[DriverMetricsReportColumnKeys.DriverRFIDTag as any]}
									</td>
									<td>{item[DriverMetricsReportColumnKeys.Distance as any]}</td>
									<td>{item[DriverMetricsReportColumnKeys.MovingTime as any]}</td>
									<td>{item[DriverMetricsReportColumnKeys.IdlingTime as any]}</td>
									<td>
										{item[DriverMetricsReportColumnKeys.StoppedTime as any]}
									</td>
									<td>
										{item[DriverMetricsReportColumnKeys.FirstContactON as any]}
									</td>
									<td>
										{item[DriverMetricsReportColumnKeys.LastContactOFF as any]}
									</td>
									<td>{item[DriverMetricsReportColumnKeys.AvgSpeed as any]}</td>
									<td>{item[DriverMetricsReportColumnKeys.MaxSpeed as any]}</td>
									<td>{item[DriverMetricsReportColumnKeys.Alerts as any]}</td>
									<td>
										{item[DriverMetricsReportColumnKeys.NumberOfTrips as any]}
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
						<td>
							<div style={{ borderLeft: 'none', textAlign: 'start' }}>
								{t('Total')}
							</div>
						</td>
						{totals &&
							totalDriverMetricsReports.map(({ name, isTime }) => (
								<td key={name}>
									{isTime ? (
										<>{convertToTimeFormat(Number(totals[name]), t)}</>
									) : (
										<>{totals[name]}</>
									)}
								</td>
							))}
					</tr>
				</tbody>
			</table>
			{perPage === 5 && (
				<PaginationButtons
					data={items}
					label='items'
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					perPage={perPage}
					setPerPage={setPerPage}
				/>
			)}
		</>
	);
};

export default DatatableDriverMetricsReport;