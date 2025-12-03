import React, { FC, useContext, useState } from 'react';
import Card, { CardBody, CardHeader } from '../../../components/bootstrap/Card';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';
import SmallMenuReport from '../components/menu/SmallMenu';
// import Card { CardBody, CardHeader } from '../../../components/bootstrap/Card';

interface StickyLeftMenuProps {}

const StickyLeftMenu: FC<StickyLeftMenuProps> = () => {
	const MenuItem = [
		{
			label: 'Recent reports',
			icon: 'description',
			length: '35',
			subMenu: [{ label: 'Fuel entries' }],
		},
		{
			label: 'Favorites',
			icon: 'favorite',
			length: '4',
			subMenu: [{ label: 'Fuel entries favorite' }],
		},
	];

	const ReportTypes = [
		{ label: 'Safety and security', icon: 'health_and_safety', length: '4', subMenu: [{}] },
		{ label: 'Logistics usage', icon: 'ReportProblem', length: '4', subMenu: [{}] },
		{ label: 'Driving behaviour', icon: 'SwapHoriz', length: '4', subMenu: [{}] },
	];

	const [selectedReport, setselectedReport] = useState('');
	const [selectedSubMenu, setselectedSubMenu] = useState('');
	const [subMenuIsOpened, setsubMenuIsOpened] = useState(-1);
	const [subReportTypeIsOpened, setsubReportTypeIsOpened] = useState(-1);

	const { setLeftRepportMenuElement, leftRepportMenuElement } = useContext(ThemeContext);

	return (
		<>
			{leftRepportMenuElement ? (
				<Card className='rounded-0 sticky-left-menu'>
					<CardHeader
						style={{ background: 'black', color: 'white', height: '15px' }}
						className='d-flex bd-highlight rounded-0'>
						<div className='p-2 w-100 bd-highlight'>
							<h3>Menu</h3>
						</div>
						<div className='p-2 flex-shrink-1 bd-highlight'>
							<Icon
								icon='FirstPage'
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
									<div
										key={index}
										className='d-flex flex-row bd-highlight  w-100'>
										<div
											onClick={() => {
												setselectedReport(label);
												setsubMenuIsOpened(index);
											}}
											style={{
												cursor: 'pointer',
											}}
											className='d-flex flex-row bd-highlight mb-2 w-75'>
											<div className='p-2 bd-highlight'>
												<Icon
													style={{
														color:
															selectedReport === label
																? '#4c80ff'
																: '',
													}}
													icon={icon}
													size='lg'
													className='m-auto rotated'
												/>
											</div>
											<div
												style={{
													color:
														selectedReport === label ? '#4c80ff' : '',
												}}
												className='p-2 bd-highlight'>
												{label}
											</div>
										</div>
										<div>
											{subMenu.length > 0 && (
												<>
													<div className='d-flex flex-row bd-highlight mb-2 pe-3'>
														<div className='p-2 bd-highlight'>
															{subMenuIsOpened !== index && (
																<Icon
																	onClick={() =>
																		setsubMenuIsOpened(index)
																	}
																	style={{ cursor: 'pointer' }}
																	icon={'ExpandMore'}
																	size='lg'
																	className='m-auto rotated'
																/>
															)}
															{subMenuIsOpened === index && (
																<Icon
																	onClick={() =>
																		setsubMenuIsOpened(-1)
																	}
																	style={{ cursor: 'pointer' }}
																	icon={'ExpandLess'}
																	size='lg'
																	className='m-auto rotated'
																/>
															)}
														</div>
														<div
															style={{
																background:
																	selectedReport === label
																		? '#fef5f9'
																		: '#f1f1f1',
																width: '40px',
																textAlign: 'center',
															}}
															className='p-2 bd-highlight rounded-pill'>
															{length}
														</div>
													</div>
												</>
											)}
										</div>
									</div>
									{subMenuIsOpened === index &&
										subMenu.map((arg: any, indd: any) => {
											return (
												<div style={{ marginLeft: '50px' }} key={indd}>
													<div
														onClick={() =>
															setselectedSubMenu(arg.label)
														}
														style={{
															cursor: 'pointer',
															color:
																selectedSubMenu === arg.label
																	? '#4c80ff'
																	: '',
														}}>
														{arg.label}
													</div>
												</div>
											);
										})}
								</>
							);
						})}

						<span style={{ color: '#b4b4b4' }} className='p-3'>
							Report Type
						</span>
						{ReportTypes.map(({ label, icon, length, subMenu }, index) => {
							return (
								<>
									<div
										key={index}
										className='d-flex flex-row bd-highlight  w-100'>
										<div
											onClick={() => {
												setselectedReport(label);
												setsubReportTypeIsOpened(index);
											}}
											style={{
												cursor: 'pointer',
											}}
											className='d-flex flex-row bd-highlight mb-2 w-75'>
											<div className='p-2 bd-highlight'>
												<Icon
													style={{
														color:
															selectedReport === label
																? '#4c80ff'
																: '',
													}}
													icon={icon}
													size='lg'
													className='m-auto rotated'
												/>
											</div>
											<div
												style={{
													color:
														selectedReport === label ? '#4c80ff' : '',
												}}
												className='p-2 bd-highlight'>
												{label}
											</div>
										</div>
										<div>
											{subMenu.length > 0 && (
												<>
													<div className='d-flex flex-row bd-highlight mb-2 pe-3'>
														<div className='p-2 bd-highlight'>
															{subReportTypeIsOpened !== index && (
																<Icon
																	onClick={() =>
																		setsubReportTypeIsOpened(
																			index,
																		)
																	}
																	style={{ cursor: 'pointer' }}
																	icon={'ExpandMore'}
																	size='lg'
																	className='m-auto rotated'
																/>
															)}
															{subReportTypeIsOpened === index && (
																<Icon
																	onClick={() =>
																		setsubReportTypeIsOpened(-1)
																	}
																	style={{ cursor: 'pointer' }}
																	icon={'ExpandLess'}
																	size='lg'
																	className='m-auto rotated'
																/>
															)}
														</div>
														<div
															style={{
																background:
																	selectedReport === label
																		? '#fef5f9'
																		: '#f1f1f1',
																width: '40px',
																textAlign: 'center',
															}}
															className='p-2 bd-highlight rounded-pill'>
															{length}
														</div>
													</div>
												</>
											)}
										</div>
									</div>
									{subReportTypeIsOpened === index &&
										subMenu.map((arg: any, indd: any) => {
											return (
												<div style={{ marginLeft: '50px' }} key={indd}>
													<div
														onClick={() =>
															setselectedSubMenu(arg.label)
														}
														style={{
															cursor: 'pointer',
															color:
																selectedSubMenu === arg.label
																	? '#4c80ff'
																	: '',
														}}>
														{arg.label}
													</div>
												</div>
											);
										})}
								</>
							);
						})}
					</CardBody>
				</Card>
			) : (
				<SmallMenuReport
					selectedReport={selectedReport}
					setselectedReport={setselectedReport}
					selectedSubMenu={selectedSubMenu}
					setselectedSubMenu={setselectedSubMenu}
					MenuItem={MenuItem}
					ReportTypes={ReportTypes}
					setsubMenuIsOpened={setsubMenuIsOpened}
					setsubReportTypeIsOpened={setsubReportTypeIsOpened}
				/>
			)}
		</>
	);
};

export default StickyLeftMenu;
