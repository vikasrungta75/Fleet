import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import DatePicker from '../../../components/DatePicker';
import NoData from '../../../components/NoData';
import ThemeContext from '../../../contexts/themeContext';
import { getDefaultDateRangeFilter } from '../../../helpers/helpers';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { ticketsPages } from '../../../menu';
import { useGetTicketsData } from '../../../services/tickets';
import { RootState } from '../../../store/store';
import { IDateRangeFilter } from '../../../type/history-type';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import SummaryTicketStatic from './components/SummaryTicketStatic';
import TicketDatatable from './components/TicketDatatable';
import Loader from '../../../components/Loader';

interface TicketsDashboardProps {}

const TicketsDashboard: FC<TicketsDashboardProps> = () => {
	const { data: ticketsData, isLoading: isLoadingTickets, refetch, remove } = useGetTicketsData();
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['tickets']);

	const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const [dateRangeFilter, setDateRangeFilter] = useState<IDateRangeFilter>(
		getDefaultDateRangeFilter(preferedTimeZone),
	);

	React.useEffect(() => {
		refetch();

		return () => {
			remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(ticketsPages.ticketManagement.text),
								to: ticketsPages.ticketManagement.path,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary w-100'>
						{t(ticketsPages.ticketManagement.text)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>
				<div className='w-100 mb-4 d-flex justify-content-end'>
					<div className='d-flex flex-row-reverse align-items-center w-75'>
						<DatePicker
							className={`${mobileDesign ? 'col-12' : 'col-6'}`}
							setDateRangeFilter={setDateRangeFilter}
							dateRangeFilter={dateRangeFilter}
							withHours={false}
						/>
					</div>
				</div>
				{isLoadingTickets ? (
					<Loader />
				) : ticketsData?.length > 0 ? (
					<>
						<SummaryTicketStatic />
						<Card>
							<CardBody>
								<TicketDatatable ticketsData={ticketsData} />
							</CardBody>
						</Card>
					</>
				) : (
					<NoData text={t('No ticket to display')} />
				)}
			</Page>
		</PageWrapper>
	);
};

export default TicketsDashboard;
