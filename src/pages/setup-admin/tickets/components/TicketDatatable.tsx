import React, { FC, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../../components/bootstrap/Button';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../../components/PaginationButtons';
import ThemeContext from '../../../../contexts/themeContext';
import useSortableData from '../../../../hooks/useSortableData';
import { RootState } from '../../../../store/store';
import { ITicketsData } from '../../../../type/tickets-types';
import { TableStyle } from '../../../alarms_notifications/components/constants/alarmConstants';
import { thStyle, trStyleTable } from '../../../notifications/constants/NotificationConstants';
import { columnsTickets } from '../constants/constants';
import { useNavigate } from 'react-router-dom';
import { ticketsPages } from '../../../../menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDeleteTicket } from '../../../../services/tickets';

interface TicketDatatableProps {
	ticketsData: ITicketsData[];
}

const TicketDatatable: FC<TicketDatatableProps> = ({ ticketsData }) => {
	const { items, requestSort, getClassNamesFor } = useSortableData(ticketsData);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { t } = useTranslation(['tickets']);
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();

	const { mutate: deleteTickett, isLoading: deleteLoading } = useDeleteTicket();

	return (
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
			<table className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
				<thead>
					<tr style={TableStyle}>
						{columnsTickets.map(({ name, key, sortable, width }, index) => (
							<th
								key={index}
								style={{ ...thStyle, width: width }}
								onClick={() => (sortable === true ? requestSort(key) : null)}
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
						<th style={{ width: mobileDesign ? '100px' : '20%' }} />
					</tr>
				</thead>
				<tbody>
					{dataPagination(items, currentPage, perPage).map(
						(item: ITicketsData, index) => {
							return (
								<tr style={trStyleTable} key={index}>
									<td>{item.vin}</td>
									<td>{item.priorityfield}</td>
									<td>{item.rule}</td>
									<td>{item.ticket_id}</td>
									<td>{item.time}</td>
									<td>{item.userfield}</td>
									<td
										className='d-flex gap-3 justify-content-end'
										// style={{ width: mobileDesign ? '250px' : '100%' }}
									>
										<Button
											isDisable={deleteLoading}
											aria-label='Delete Button'
											className='primary-btn me-3'
											style={{ zIndex: '3' }}
											icon='Delete'
											color='secondary'
											isLight
											isOutline
											onClick={() => {
												deleteTickett(item.ticket_id);
												// deleteTicket(item.ticket_id);
											}}>
											{t('Delete')}
										</Button>

										<Button
											aria-label='Go Forward'
											className='light-btn'
											color='dark'
											isLight
											onClick={() => {
												navigate(
													`../setup/tickets/edit-ticket/${item.ticket_id}`,
													{
														state: { ticketState: item },
													},
												);
											}}>
											{t('View Ticket')}
											<Icon
												icon={
													dir === 'rtl'
														? 'ArrowBackIos'
														: 'ArrowForwardIos'
												}
												className='ms-3'
												size='md'
											/>
										</Button>
									</td>
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
	);
};

export default TicketDatatable;
