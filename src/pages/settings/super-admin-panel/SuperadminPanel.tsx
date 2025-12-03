import React, { FC, useContext, useEffect, useState } from 'react';
import { settings, superAdminPanel } from '../../../menu';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Page from '../../../layout/Page/Page';
import { useTranslation } from 'react-i18next';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import ThemeContext from '../../../contexts/themeContext';
import Button from '../../../components/bootstrap/Button';
import SearchBar from '../../../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import Datatable from '../../setup-admin/vehicles/components/Datatable';
import { columnsSuperAdminPanel } from './constant/constant';
import DeleteDrawer from './components/DeleteDrawer';
import { ISuperAdminPanelResponse } from '../../../type/settings-type';

interface ISuperAdminPanelProps {}

const SuperAdminPanel: FC<ISuperAdminPanelProps> = () => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['superAdminPanel']);
	const navigate = useNavigate();

	const { mobileDesign } = useContext(ThemeContext);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
		const superAdminPanelData = useSelector(
		(state: RootState) => state.appStore.superAdminPanelData,
	);

	const [searchInput, setSearchInput] = useState('');
	const [data, setData] = useState<ISuperAdminPanelResponse[]>(superAdminPanelData);

	const [selectedList, setSelectedList] = useState([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	useEffect(() => {
		dispatch.appStore.getSuperAdminPanelAsync().then((res: ISuperAdminPanelResponse[]) => {
			setData(res);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let filteredResult = [];
		if (superAdminPanelData && searchInput.length > 0) {
			filteredResult = superAdminPanelData.filter((obj: ISuperAdminPanelResponse) => {
				return Object.keys(obj).some((key) => {
					return obj[key as keyof typeof obj]
						?.toString()
						?.toUpperCase()
						.includes(searchInput.toUpperCase());
				});
			});
			setData(filteredResult);
		}
	}, [searchInput, superAdminPanelData]);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${settings.superAdminPanel.text}`),
								to: `../${settings.superAdminPanel.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}

			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary w-100'>
						{t(settings.superAdminPanel.text)}
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<div className='d-flex mb-3'>
					{/* ATTENTION DE CHANGER LA PERMISSION ICI */}
					<div
						className={`d-flex me-4  ${
							mobileDesign ? 'w-100' : permissions?.create_super_admin_panel ? 'w-75' : 'w-100'
						}`}
						data-tour='search'>
						<SearchBar
							search={searchInput}
							setSearch={setSearchInput}
							translation='superAdminPanel'
							text={t('Search unit by name or ID')}
						/>
					</div>
					{permissions?.create_super_admin_panel && (
						<Button
							icon={selectedList.length > 0 && permissions?.delete_super_admin_panel ? 'Delete' : 'Add'}
							color='secondary'
							isOutline={true}
							className={`primary-btn py-3 mb-0 ${mobileDesign ? 'w-100' : 'w-25 '}`}
							onClick={() =>
								selectedList.length > 0 && permissions?.delete_super_admin_panel 
									? setIsDeleteModalOpen(true)
									: navigate(`../${superAdminPanel.createSuperAdminPanel.path}`)
							}>
							{selectedList.length > 0 && permissions?.delete_super_admin_panel ? t('Delete') : t('New unit')}
						</Button>
					)}
				</div>
				<Datatable
					data={data}
					columns={columnsSuperAdminPanel}
					withCheckbox={permissions?.delete_super_admin_panel}
					setSelectedList={setSelectedList}
					rowPath={permissions?.read_super_admin_panel ?  superAdminPanel.readSuperAdminPanel.path : undefined}
					// uniqueId is used for define which key will be used for selected checkbox
					uniqueId='device_imei'
				/>

				{isDeleteModalOpen && (
					<DeleteDrawer
						selectedList={selectedList}
						isDeleteModalOpen={isDeleteModalOpen}
						setIsDeleteModalOpen={setIsDeleteModalOpen}
						setData={setData}
						topic='superAdminPanel'
					/>
				)}
			</Page>
		</PageWrapper>
	);
};

export default SuperAdminPanel;
