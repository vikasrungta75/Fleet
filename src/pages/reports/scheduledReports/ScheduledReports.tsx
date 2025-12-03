import React, { useContext, useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Page from '../../../layout/Page/Page';
import Button from '../../../components/bootstrap/Button';
import DeleteDrawer from '../../settings/super-admin-panel/components/DeleteDrawer';
import Datatable from '../../setup-admin/vehicles/components/Datatable';
import ThemeContext from '../../../contexts/themeContext';
import { RootState } from '../../../store/store';
import { IScheduledReports } from '../../../type/reports-types';
import { scheduledReportsColumns } from '../constant/constant';

import CreateScheduledReport from './CreateScheduledReport';
import GoBack from '../../../components/GoBack';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import EditDrawer from './EditDrawer';

const ScheduledReports = () => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['reports']);
	const navigate = useNavigate();
	const { mobileDesign } = useContext(ThemeContext);

	const [selectedList, setSelectedList] = useState([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [data, setData] = useState<IScheduledReports[]>([]);

	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	useEffect(() => {
		dispatch.reports.getScheduledReportsAsync().then((res: IScheduledReports[]) => {
			if (Array.isArray(res) && res.length > 0) {
				setData(res);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [isOpen, setIsOpen] = useState(false);

	const canDelete = selectedList.length > 0 && permissions?.delete_super_admin_panel;

	const [isEditableModalOpened, setIsEditableModalOpened] = useState({
		open: false,
		datum: null,
	});

	return (
		<PageWrapper isProtected={true}>
			<Page className='mw-100 px-0 mt-n4'>
				{/* <Card className='mw-100 mb-4' style={{ borderRadius: "6px" }}> */}
					<div
						className={
							!mobileDesign
								? 'd-flex justify-content-between align-items-center col-12'
								: ''
						}>
						<div className='d-flex'>
							{/* <GoBack handleClick={() => navigate(-1)} /> */}
							<CardTitle style={{marginTop: 6 }}>
							<p className='text-dark reportList-heading'> {t('Planified Report List')} </p>
							</CardTitle>
						</div>
						<div>
							<Button
								isOutline={true}
								className={`${canDelete ? '' : 'outline-btn'
									} planified-report`}
								style={{ width: canDelete ? 100 : 150, paddingTop: "8px" }}
								icon={canDelete ? 'Delete' : 'CalendarToday'}
								onClick={() =>
									canDelete ? setIsDeleteModalOpen(true) : setIsOpen(!isOpen)
								}>
								{canDelete ? t('Delete') : t('Schedule Report')}
							</Button>
						</div>
					</div>
				{/* </Card> */}

				{/* <h1 className='text-dark reportList-heading'> {t('Planified Report List')} </h1> */}
				<Datatable
					data={data}
					columns={scheduledReportsColumns}
					withCheckbox={permissions?.delete_super_admin_panel}
					setSelectedList={setSelectedList}
					// uniqueId is used for define which key will be used
					// for selected checkbox and for delete id
					uniqueId='sr_id'
					isEditable={setIsEditableModalOpened}
					translation='reports'
				/>

				{isDeleteModalOpen && (
					<DeleteDrawer
						selectedList={selectedList}
						isDeleteModalOpen={isDeleteModalOpen}
						setIsDeleteModalOpen={setIsDeleteModalOpen}
						setData={setData}
						topic='reports'
					/>
				)}
				{isEditableModalOpened && (
					<EditDrawer
						isEditModalOpen={isEditableModalOpened.open}
						setData={setData}
						setIsEditModalOpen={setIsEditableModalOpened}
						datum={isEditableModalOpened.datum}					
					/>
				)}

				{isOpen && (
					<CreateScheduledReport
						isOpen={isOpen}
						setIsOpen={setIsOpen}
						position={{ top: 210, right: 20 }}
						setData={setData}
					/>
				)}
			</Page>
		</PageWrapper>
	);
};

export default ScheduledReports;