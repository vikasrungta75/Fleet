import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useTranslation } from 'react-i18next';
import { dataPagination } from '../../../../components/PaginationButtons';
import FilterCard from './FilterCard';
import { columns, styleMaintenanceDataTable } from '../maintenanceConstants';
import FilterStatusComponent from './filterComponents/statusFilter';
import VehicleComponents from './filterComponents/vehicleComponents';
import { svg } from '../../../../assets/index';
import { Status, StatusColor } from '../enum/enum';
import { convertFromUTCtoTZ } from '../../../../helpers/helpers';
import Checks from '../../../../components/bootstrap/forms/Checks';

interface IDataTable {
	items: any;
	handleCheck: any;
	handleCheckAll: any;
	withCheckbox?: boolean;
	values: Array<string>;
	currentPage: any;
	perPage: any;
}

const DataTable: FC<IDataTable> = ({
	// items,
	items = [], 
	handleCheck,
	handleCheckAll,
	values,
	currentPage,
	perPage,
	withCheckbox,
}) => {
	const { t } = useTranslation(['maintenancePage']);
	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);

	const [itemFilterMaintenance, setitemFilterMaintenance] = useState([]);

	const [headerFilterSelected, setheaderFilterSelected] = useState<{
		name: string;
		position: number;
	}>({ name: '', position: 0 });

	const itemFormater = (item: string) => {
		return item && item !== ' ' ? <>{item} </> : <img alt='' src={svg.hideSource} />;
	};

	const isChecked = (item: string) => values.includes(item);


	const { dir } = useSelector((state: RootState) => state.appStore);

	return (
		<>
			<table
				className={`table   ${dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'
					}`}>
				<thead>
					<tr style={{ textAlign: 'center' }}>
						{columns.map(
							(
								{ name, checkbox, width, position, filterCardOption, subHeader },
								index,
							) => (
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
											cursor: filterCardOption ? 'pointer' : 'default',
										}}
										className='d-flex justify-content-center'>
										{checkbox && withCheckbox && (
											<Checks
												checked={values?.length === items?.length}
												onChange={handleCheckAll}
												type='checkbox'
												className='checkbox-nrml '
												style={{ marginBottom: 0, marginRight: 10 }} // Adjust margin for checkbox
											/>
										)}
										<div
											className='d-flex align-items-center'
											onClick={() =>
												filterCardOption &&
												setheaderFilterSelected({ name, position })
											}>
											{t(`${name}`)}
										</div>
									</div>
								</th>
							),
						)}
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
								subHeader?.map((el, i) => (
									<th
										style={{
											borderLeft: '0.5px solid #D1D5DB',
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
				<tbody>
				{/* {dataPagination(items, currentPage, perPage).map((item: any, index) => ( */}
					{dataPagination(items || [], currentPage, perPage).map((item: any, index) => (
						<tr
							style={{
								zIndex: '1',
								cursor: 'auto',
							}}
							key={index}>
							<td>
								<div className='d-flex align-items-center'>
									{withCheckbox && (
										<Checks
											type='checkbox'
											name='checkedList'
											onChange={handleCheck}
											value={JSON.stringify({
												vin: item.vin,
												mst_id: item.mst_id,
											})}
											style={{ marginRight: 10 }}
											checked={isChecked(
												JSON.stringify({
													vin: item.vin,
													mst_id: item.mst_id,
												}),
											)}
											className='checkbox-nrml'
										/>
									)}
									{item.vin}
								</div>
							</td>

							<td style={{ borderLeft: '0.5px solid #D1D5DB' }}>
								{itemFormater(item.work)}
							</td>
							<td style={{ borderLeft: '0.5px solid #D1D5DB' }}>
								{itemFormater(item.date)}
							</td>
							<td style={{ borderLeft: '0.5px solid #D1D5DB' }}>
								<div className='d-flex align-items-center'>
									{itemFormater(t(item.status))}
									<span
										style={{
											backgroundColor: StatusColor[
												item.status as Status
											] as string,
											marginLeft: 10,
											width: '12px',
											height: '12px',
										}}
										className='p-2 flex-shrink-1 bd-highlight dot-status-maintenance '></span>
								</div>
							</td>

							{/* {item.target &&
								item.target.map((el: any, i: number) => (
									<React.Fragment key={i}>
										 <td
											width={120}
											style={{
												textAlign: 'center',
												borderLeft: '0.5px solid #D1D5DB'
											}}>
											{el.date && el.date !== ' '
												? convertFromUTCtoTZ(el.date, preferedTimeZone)
												: itemFormater(el.date)}
										</td> 

										<td width={120} style={{ textAlign: 'center' }}>
											{itemFormater(el.mileage)}
										</td>
										<td width={120} style={{ textAlign: 'center' }}>
											{itemFormater(el.engine_hours)}
										</td>
									</React.Fragment>
								))} */}

							{item.target && item.target.map((el: any, i: number) => (
								<React.Fragment key={i}>
									<td width={120} style={{ textAlign: 'center', borderLeft: '0.5px solid #D1D5DB' }}>
										{el.date && el.date !== ' '
											? convertFromUTCtoTZ(el.date, preferedTimeZone).split(' ')[0]
											: itemFormater(el.date)}
									</td>

									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(el.mileage)}
									</td>

									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(el.engine_hours)}
									</td>
								</React.Fragment>
							))}


							{/* {item?.finished &&
								item?.finished?.date &&
								item?.finished?.date.length > 0 ? (
								<React.Fragment>
									<td
										width={120}
										style={{
											textAlign: 'center',
											borderLeft: '0.5px solid #D1D5DB'
										}}>
										{item?.finished.date && item?.finished.date !== ' '
											? convertFromUTCtoTZ(
												item?.finished.date,
												preferedTimeZone,
											)
											: itemFormater(item?.finished.date)}
									</td>
									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(item?.finished.mileage)}
									</td>
									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(item?.finished.engine_hours)}
									</td>
								</React.Fragment> */}
							{item?.finished &&
								item?.finished?.date &&
								item?.finished?.date.length > 0 ? (
								<React.Fragment>
									<td
										width={120}
										style={{
											textAlign: 'center',
											borderLeft: '0.5px solid #D1D5DB'
										}}
									>
										{item?.finished.date && item?.finished.date !== ' '
											? convertFromUTCtoTZ(item?.finished.date, preferedTimeZone).split(' ')[0]
											: itemFormater(item?.finished.date)}
									</td>

									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(item?.finished.mileage)}
									</td>

									<td width={120} style={{ textAlign: 'center' }}>
										{itemFormater(item?.finished.engine_hours)}
									</td>
								</React.Fragment>
							) : (
								// Alternative content to render when conditions are not met
								<React.Fragment>
									<td
										width={120}
										style={{
											textAlign: 'center',
											borderLeft: '0.5px solid #D1D5DB'
										}}></td>
									<td width={120} style={{ textAlign: 'center' }}></td>
									<td width={120} style={{ textAlign: 'center' }}></td>
								</React.Fragment>
							)}
						</tr>
					))}
				</tbody>
			</table>
			{headerFilterSelected.name.length > 0 && (
				<FilterCard
					setheaderFilterSelected={setheaderFilterSelected}
					selectedFilter={headerFilterSelected}>
					{(() => {
						switch (headerFilterSelected.name) {
							case 'Status':
								return (
									<FilterStatusComponent
										itemFilterMaintenance={itemFilterMaintenance}
										setitemFilterMaintenance={setitemFilterMaintenance}
									/>
								);
							case 'Vehicle':
								return <VehicleComponents />;
							default:
								return null;
						}
					})()}
				</FilterCard>
			)}
		</>
	);
};

export default DataTable;




