import React, { FC, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { dashboardMenu } from '../../../menu';
import Page from '../../../layout/Page/Page';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { useTranslation } from 'react-i18next';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import Vehicles from './tabs/Vehicles';

interface IDashboardVehiclesProps {
	isFluid?: boolean;
}

const DashboardVehicles: FC<IDashboardVehiclesProps> = () => {
	const { t } = useTranslation(['vehicles']);

	const [Tab, setTab] = useState('My Fleet Vehicles');

	return (
		<PageWrapper className='vehicles-dashboard' isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.setup.subMenu.vehicles.text}`),
								to: `../${dashboardMenu.setup.subMenu.vehicles.path}`,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-0'>
				<div className='d-flex'>
					{/* <div className='fs-2 pb-3 mb-4 fw-semibold content-heading'>
						{t(Tab)}
					</div> */}
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
					
				</div>
				<Vehicles />
			</Page>
		</PageWrapper>
	);
};

export default DashboardVehicles;
