import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import Alert from '../../../../components/bootstrap/Alert';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import useSortableData from '../../../../hooks/useSortableData';
import { RootState } from '../../../../store/store';
import { IReportDTC } from '../../../../type/alert-types';
import { columnsReportsData, TableStyle, thStyle, trStyleTable } from '../constants/alarmConstants';
import { useTranslation } from 'react-i18next';

interface IReportDTCProps {
	reportsData: IReportDTC[];
}

const ReportDTCDatatable: FC<IReportDTCProps> = ({ reportsData }): JSX.Element => {
	const { t } = useTranslation(['vehicles']);
	const { items, requestSort, getClassNamesFor } = useSortableData(reportsData);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);

	const { dir } = useSelector((state: RootState) => state.appStore);

	return reportsData.length > 0 ? (
		<Card>
			<CardBody>
				<div className='table-responsive pt-0 vehicles-dashboard'>
					{perPage === 50 && (
						<PaginationButtons
							data={items}
							label='items'
							setCurrentPage={setCurrentPage}
							currentPage={currentPage}
							perPage={perPage}
							setPerPage={setPerPage}
						/>
					)}
					<table
						className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
						<thead>
							<tr style={TableStyle}>
								{columnsReportsData.map(({ name, key, sortable, width }, index) => (
									<th
										key={index}
										style={{ ...thStyle, width: width }}
										onClick={() =>
											sortable === true ? requestSort(key) : null
										}
										className={sortable ? 'cursor-pointer' : ''}>
										{t(name)}
										{sortable && (
											<Icon
												size='lg'
												className={`${getClassNamesFor(key)} ms-2`}
												icon='FilterList'
											/>
										)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{dataPagination(items, currentPage, perPage).map(
								(item: IReportDTC, index) => {
									return (
										<tr style={trStyleTable} key={index}>
											<td>{item.vin}</td>
											<td>{item.dtc_code}</td>
											<td>{item.dtc_description}</td>
											<td>{item.recurrence}</td>
											<td>{item.reporting_date}</td>
										</tr>
									);
								},
							)}
						</tbody>
					</table>
					<PaginationButtons
						data={items}
						label='items'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</div>
			</CardBody>
		</Card>
	) : (
		<Card>
			<CardBody>
				<Alert color='info' className='flex-column w-100 align-items-start'>
					<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
						<Icon icon='Info' size='2x' className='me-2' />
						{t('DTC is not available for selected data range')}
					</p>
				</Alert>
			</CardBody>
		</Card>
	);
};

export default ReportDTCDatatable;
