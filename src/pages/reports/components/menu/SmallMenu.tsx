import React, { FC, useContext } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import ThemeContext from '../../../../contexts/themeContext';

interface SmallMenuReportProps {
	selectedReport: string;
	setselectedReport: (value: string) => void;
	selectedSubMenu: string;
	setselectedSubMenu: (value: string) => void;
	setsubMenuIsOpened: (value: number) => void;
	setsubReportTypeIsOpened: (value: number) => void;
	MenuItem: any[];
	ReportTypes: any[];
}

const SmallMenuReport: FC<SmallMenuReportProps> = ({
	selectedReport,
	setselectedReport,
	selectedSubMenu,
	setselectedSubMenu,
	MenuItem,
	ReportTypes,
	setsubMenuIsOpened,
	setsubReportTypeIsOpened,
}) => {
	const { setLeftRepportMenuElement, leftRepportMenuElement } = useContext(ThemeContext);

	return (
		<>
			<Card style={{ width: '80px' }} className='rounded-0 sticky-left-menu'>
				<CardHeader
					style={{ background: 'black', color: 'white', height: '15px' }}
					className='d-flex bd-highlight'>
					<div className='p-2 w-100 bd-highlight'>
						<Icon
							icon='OpenInFull'
							className='brand-aside-toggle-close'
							size={'2x'}
							onClick={() => setLeftRepportMenuElement(!leftRepportMenuElement)}
						/>
					</div>
				</CardHeader>
				<CardBody style={{ padding: '0px', marginTop: '8px' }}>
					{MenuItem.map(({ label, icon, length, subMenu }, index) => {
						return (
							<>
								<div key={index} className='d-flex flex-row bd-highlight  w-100'>
									<div
										onClick={() => {
											setselectedReport(label);
											setsubMenuIsOpened(index);
										}}
										style={{
											cursor: 'pointer',
										}}
										className='d-flex flex-row bd-highlight mb-2 w-75'>
										<div
											style={{ marginLeft: '20px' }}
											className='p-2 bd-highlight'>
											<Icon
												style={{
													color:
														selectedReport === label ? '#f00d69' : '',
												}}
												icon={icon}
												size='lg'
												className='m-auto rotated'
											/>
										</div>
									</div>
								</div>
							</>
						);
					})}
					<hr />

					{ReportTypes.map(({ label, icon, length, subMenu }, index) => {
						return (
							<>
								<div key={index} className='d-flex flex-row bd-highlight  w-100'>
									<div
										onClick={() => {
											setselectedReport(label);
											setsubReportTypeIsOpened(index);
										}}
										style={{
											cursor: 'pointer',
										}}
										className='d-flex flex-row bd-highlight mb-2 w-75'>
										<div
											style={{ marginLeft: '20px' }}
											className='p-2 bd-highlight'>
											<Icon
												style={{
													color:
														selectedReport === label ? '#f00d69' : '',
												}}
												icon={icon}
												size='lg'
												className='m-auto rotated'
											/>
										</div>
									</div>
								</div>
							</>
						);
					})}
				</CardBody>
			</Card>
		</>
	);
};

export default SmallMenuReport;
