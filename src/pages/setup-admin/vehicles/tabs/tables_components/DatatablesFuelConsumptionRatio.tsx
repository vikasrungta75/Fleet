import React, { FC, useState } from 'react';
import useSortableData from '../../../../../hooks/useSortableData';
import PaginationButtons, {
	PER_COUNT,
	dataPagination,
} from '../../../../../components/PaginationButtons';
import {
	VehicleRatioKey,
	columnsFuelConsumptionRatio,
	totalFuelConsumptionRatio,
} from './columnsFuelVolume';
import { calculateTotal } from '../../../../../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';

interface DatatableFuelConsumptionRatioProps {
	data: any[];
}

const DatatableFuelConsumptionRatio: FC<DatatableFuelConsumptionRatioProps> = ({ data }) => {
	const { items, requestSort, getClassNamesFor } = useSortableData(data);
	const [perPage, setPerPage] = useState(PER_COUNT[5]);
	const [currentPage, setCurrentPage] = useState(1);

	const totals: { [key: string]: string } = {};
	for (const key in data && data[0]) {

		// Exclude 'date' field from calculation
		if (key !== 'date') {
			totals[key] = calculateTotal(data && data, key);
		}
	}


	const { t } = useTranslation(['vehicles']);
	const { dir } = useSelector((state: RootState) => state.appStore);

	return (
		<>
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
				className={`table   ${
					dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'
				}`}>
				<thead>
					<tr style={{ textAlign: 'center' }}>
						{columnsFuelConsumptionRatio.map(({ name, width, subHeader }, index) => (
							<th
								key={index}
								colSpan={subHeader ? subHeader.length : 1} // Remove +1 for colSpan for subheaders
								style={{
									borderRight:
										columnsFuelConsumptionRatio.length - 1 !== index
											? '1px solid #B3B3B3'
											: 0,
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
						{columnsFuelConsumptionRatio.map(({ subHeader }, index) =>
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
										{t(`${el.name}`)}
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
					{totals &&
						data &&
						dataPagination(items, currentPage, perPage).map((item, index) => {
							return (
								<tr
									key={index}
									style={{
										zIndex: '1',
										cursor: 'auto',
									}}>
									<td>{item[VehicleRatioKey.VehicleType as any]}</td>
									<td>{item[VehicleRatioKey.FuelCardNo as any]}</td>
									<td>{item[VehicleRatioKey.DriverName as any]}</td>
									<td>{item[VehicleRatioKey.City as any]}</td>
									<td>{item[VehicleRatioKey.Vin as any]}</td>
									<td>{item[VehicleRatioKey.FuelConsumedLHratio as any]}</td>
									<td>{item[VehicleRatioKey.FuelConsumedLHratioTheo as any]}</td>
									<td>{item[VehicleRatioKey.FuelConsumedLper100km as any]}</td>
									<td>
										{item[VehicleRatioKey.FuelConsumedLper100kmTheo as any]}
									</td>
									<td>{item[VehicleRatioKey.ConsumptionLocalCurr as any]}</td>
									<td>{item[VehicleRatioKey.CurrentBal as any]}</td>
									<td>{item[VehicleRatioKey.ConsuptionRateLocalCurr as any]}</td>
									<td>{item[VehicleRatioKey.Comment as any]}</td>
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
						{Object.keys(totals).length > 0 &&
							totalFuelConsumptionRatio.map((key) => (
								<td key={key}>{totals[key]}</td>
							))}
					</tr>
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
		</>
	);
};

export default DatatableFuelConsumptionRatio;
