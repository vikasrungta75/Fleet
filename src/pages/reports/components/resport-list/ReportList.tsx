// import React, { FC, useEffect } from 'react';
// import CardReport from '../card/Card';
// import { useCategoryRecord } from '../../../../services/vehiclesService';
// import Spinner from '../../../../components/bootstrap/Spinner';
// import { useTranslation } from 'react-i18next';
// import { Report, ReportCategory, ReportData } from '../../../../type/reports-types';
// import { stringWithUnderscore } from '../../../../helpers/helpers';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../../store/store';

// interface IReportListProps {
// 	setindexReportSelected: (val: string) => void;
// 	searchCriteria: string;
// }
// const ReportList: FC<IReportListProps> = ({ setindexReportSelected, searchCriteria }) => {
// 	const { data, isLoading } = useCategoryRecord();
// 	const { permissions } = useSelector((state: RootState) => state.auth);
// 	const { t } = useTranslation(['reports']);

// 		const requiredReports = new Set(
// 			['trip reports', 'fuel volume', 'fuel consumption', 'fuel performance', 'daily vehicle usage', 'vehicle record']
// 		) ;



// 	function displaySortedReports(categoryArray: ReportData[]) {
// 		// Sort the array by category and report name
// 		categoryArray[0].repports.sort((a: ReportCategory, b: ReportCategory) => {
// 			// Compare category names
// 			if (a.catergory < b.catergory) return -1;
// 			if (a.catergory > b.catergory) return 1;

// 			// If category names are equal, compare report names
// 			return a.reports[0].name.localeCompare(b.reports[0].name);
// 		});

// 		return categoryArray;
// 	}


// 	return (
// 		<>
// 			{isLoading ? (
// 				<div className={`loader-wrapper`}>
// 					<Spinner className='spinner-center' color='secondary' size='5rem' />
// 				</div>
// 			) : (
// 				<>
// 					{data[0] &&
// 						displaySortedReports(data)[0].repports.map(
// 							(arg: ReportCategory, index: number) => {
// 								const filteredReports = arg.reports.filter((item: Report) =>
// 									item.name.toLowerCase().includes(searchCriteria.toLowerCase()) && requiredReports.has(item.name.toLowerCase()),

// 								);
// 								const permittedReportsLengthByCategory = filteredReports.filter(
// 									(item) => permissions[stringWithUnderscore(item.id)] === true,
// 								).length;

// 								if (filteredReports.length === 0) {
// 									return null;
// 								}

// 								return (
// 									permittedReportsLengthByCategory !== 0 && (
// 										<div key={index} className='mt-3 w-100 overallReport-card'>
// 											{/* <h2 className='report-category-title mb-3'>
// 												{t(arg.catergory)}
// 											</h2> */}
// 											<div className='repport-category-container'>
// 												{filteredReports.map(
// 													(item: Report, indexx: number) => {
// 														const shouldDisplayReport =
// 															permissions[
// 															stringWithUnderscore(item.id)
// 															] === true;

// 														return shouldDisplayReport ? (
// 															<div key={indexx}>
// 																<CardReport
// 																	item={item}
// 																	setindexReportSelected={
// 																		setindexReportSelected
// 																	}
// 																/>
// 															</div>
// 														) : null;
// 													},
// 												)}
// 											</div>
// 										</div>
// 									)
// 								);
// 							},
// 						)}
// 				</>
// 			)}
// 		</>
// 	);
// };
// export default ReportList;


// 
// import React, { FC } from 'react';
// import CardReport from '../card/Card'; // Import the individual report card component
// import { useTranslation } from 'react-i18next'; // For translation
// import { useSelector } from 'react-redux'; // Redux hook for global state
// import { RootState } from '../../../../store/store'; // Root state type

// interface IReportListProps {
// 	setindexReportSelected: (val: string) => void; // Function to set selected report
// 	searchCriteria: string; // Search filter for reports
// }

// const ReportList: FC<IReportListProps> = ({ setindexReportSelected, searchCriteria }) => {
// 	// User permissions from Redux store
// 	const { permissions } = useSelector((state: RootState) => state.auth);
// 	// Translation hook for report names
// 	const { t } = useTranslation(['reports']);

// 	// Hardcoded list of report names with descriptions
// 	const reportNames = [
// 		{
// 			name: 'Trip Reports',
// 			description: 'Detailed trip information for vehicles',
// 			id: 'trip_reports'
// 		},
// 		{
// 			name: 'Fuel Volume',
// 			description: 'Total fuel volume used by vehicles',
// 			id: 'fuel_volume'
// 		},
// 		{
// 			name: 'Fuel Consumption',
// 			description: 'Fuel consumption rates for vehicles',
// 			id: 'fuel_consumption'
// 		},
// 		{
// 			name: 'Fuel Performance',
// 			description: 'Fuel efficiency analysis for vehicles',
// 			id: 'fuel_performance'
// 		},
// 		{
// 			name: 'Daily Vehicle Usage',
// 			description: 'Daily activity log of vehicle usage',
// 			id: 'daily_vehicle_usage'
// 		},
// 		{
// 			name: 'Vehicle Record',
// 			description: 'Complete record of vehicle data',
// 			id: 'vehicle_record'
// 		}
// 	];

// 	// Function to get filtered and permitted reports
// 	const getFilteredReports = () => {
// 		return reportNames
// 			.filter((name) =>
// 				name.name.toLowerCase().includes(searchCriteria.toLowerCase())
// 			)
// 			.map((name) => {
// 				return {
// 					...name,
// 					id: name.id.toLowerCase().replace(/\s+/g, '_')
// 				};
// 			})
// 			.filter((report) => permissions[report.id] === true);
// 	};

// 	const filteredReports = getFilteredReports();

// 	return (
// 		<>
// 			{filteredReports.length === 0 ? (
// 				<div className="mt-3 no-reports-message">No reports found based on the search criteria.</div>
// 			) : (
// 				<div className="w-100 justify-content-between overallReport-card" style={{ marginTop:"1.9rem"}}>
// 					<div className="d-flex justify-content-between flex-wrap"> {/* Applied flexbox for layout */}
// 						{/* Loop through the filtered reports and display them */}
// 						{filteredReports.map((report, index) => (
// 							<div
// 								key={index}
// 								className="report-card-container"
// 								style={{
// 									flex: '1 0 calc(33% - 20px)', 
// 									// display:"flex",	
// 									margin: '10px'
// 								}}
// 							>
// 								{/* Flex layout applied to report cards */}
// 								<CardReport
// 									item={report} // Pass the report data to CardReport, now including 'description'
// 									setindexReportSelected={setindexReportSelected} // Function to set selected report
// 								/>
// 							</div>
// 						))}
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default ReportList;



// 3
// import React, { FC } from 'react';
// import CardReport from '../card/Card';
// import { useCategoryRecord } from '../../../../services/vehiclesService';
// import Spinner from '../../../../components/bootstrap/Spinner';
// import { useTranslation } from 'react-i18next';
// import { Report, ReportCategory, ReportData } from '../../../../type/reports-types';
// import { stringWithUnderscore } from '../../../../helpers/helpers';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../../store/store';

// interface IReportListProps {
// 	setindexReportSelected: (val: string) => void;
// 	searchCriteria: string;
// }
// const ReportList: FC<IReportListProps> = ({ setindexReportSelected, searchCriteria }) => {
// 	const { data, isLoading } = useCategoryRecord();
// 	const { permissions } = useSelector((state: RootState) => state.auth);
// 	const { t } = useTranslation(['reports']);

// 	function displaySortedReports(categoryArray: ReportData[]) {
// 		// Sort the array by category and report name
// 		categoryArray[0].repports.sort((a: ReportCategory, b: ReportCategory) => {
// 			// Compare category names
// 			if (a.catergory < b.catergory) return -1;
// 			if (a.catergory > b.catergory) return 1;

// 			// If category names are equal, compare report names
// 			return a.reports[0].name.localeCompare(b.reports[0].name);
// 		});

// 		return categoryArray;
// 	}

// 	return (
// 		<>
// 			{isLoading ? (
// 				<div className={`loader-wrapper`}>
// 					<Spinner className='spinner-center' color='secondary' size='5rem' />
// 				</div>
// 			) : (
// 				<>
// 					{data[0] &&
// 						displaySortedReports(data)[0].repports.map(
// 							(arg: ReportCategory, index: number) => {
// 								const filteredReports = arg.reports.filter((item: Report) =>
// 									item.name.toLowerCase().includes(searchCriteria.toLowerCase()),
// 								);
// 								const permittedReportsLengthByCategory = filteredReports.filter(
// 									(item) => permissions[stringWithUnderscore(item.id)] === true,
// 								).length;

// 								if (filteredReports.length === 0) {
// 									return null;
// 								}

// 								return (
// 									permittedReportsLengthByCategory !== 0 && (
// 										<div key={index} className='w-100 overallReport-card' style={{ marginTop: "2rem" }}>
// 											<h2 className='report-category-title mb-3'>
// 												{t(arg.catergory)}
// 											</h2>
// 											<div className='repport-category-container'>
// 												{filteredReports.map(
// 													(item: Report, indexx: number) => {
// 														const shouldDisplayReport =
// 															permissions[
// 																stringWithUnderscore(item.id)
// 															] === true;

// 														return shouldDisplayReport ? (
// 															<div key={indexx}>
// 																<CardReport
// 																	item={item}
// 																	setindexReportSelected={
// 																		setindexReportSelected
// 																	}
// 																/>
// 															</div>
// 														) : null;
// 													},
// 												)}
// 											</div>
// 										</div>
// 									)
// 								);
// 							},
// 						)}
// 				</>
// 			)}
// 		</>
// 	);
// };
// export default ReportList;



import React, { FC } from 'react';
import CardReport from '../card/Card';
import { useCategoryRecord } from '../../../../services/vehiclesService';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useTranslation } from 'react-i18next';
import { Report, ReportCategory, ReportData } from '../../../../type/reports-types';
import { stringWithUnderscore } from '../../../../helpers/helpers';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

interface IReportListProps {
	setindexReportSelected: (val: string) => void;
	searchCriteria: string;
}

const ReportList: FC<IReportListProps> = ({ setindexReportSelected, searchCriteria }) => {
	const { data, isLoading } = useCategoryRecord();
	const { permissions } = useSelector((state: RootState) => state.auth);
	const { t } = useTranslation(['reports']);

	function displaySortedReports(categoryArray: ReportData[]) {
		if (!Array.isArray(categoryArray) || categoryArray.length === 0) return [];

		// Sort safely
		return categoryArray.map((category) => ({
			...category,
			repports: (category.repports || []).sort((a: ReportCategory, b: ReportCategory) => {
				if (a.catergory < b.catergory) return -1;
				if (a.catergory > b.catergory) return 1;
				return (a.reports?.[0]?.name || '').localeCompare(b.reports?.[0]?.name || '');
			}),
		}));
	}

	if (isLoading) {
		return (
			<div className="loader-wrapper">
				<Spinner className="spinner-center" color="secondary" size="5rem" />
			</div>
		);
	}

	if (!data || !Array.isArray(data) || data.length === 0) {
		return <p className="text-center mt-5">No reports available</p>;
	}

	const sortedReports = displaySortedReports(data);

	return (
		<>
			{sortedReports.map((catData, i) => (
				<div key={i}>
					{(catData.repports || []).map((arg: ReportCategory, index: number) => {
						const filteredReports = (arg.reports || []).filter((item: Report) =>
							item.name.toLowerCase().includes(searchCriteria.toLowerCase())
						);

						const permittedReportsLengthByCategory = filteredReports.filter(
							(item) => permissions[stringWithUnderscore(item.id)] === true
						).length;

						if (filteredReports.length === 0 || permittedReportsLengthByCategory === 0) {
							return null;
						}

						return (
							<div key={index} className="w-100 overallReport-card" style={{ marginTop: '2rem' }}>
								<h2 className="report-category-title mb-3">{t(arg.catergory)}</h2>
								<div className="repport-category-container">
									{filteredReports.map((item: Report, indexx: number) => {
										const shouldDisplayReport =
											permissions[stringWithUnderscore(item.id)] === true;

										return shouldDisplayReport ? (
											<div key={indexx}>
												<CardReport
													item={item}
													setindexReportSelected={setindexReportSelected}
												/>
											</div>
										) : null;
									})}
								</div>
							</div>
						);
					})}
				</div>
			))}
		</>
	);
};

export default ReportList;
