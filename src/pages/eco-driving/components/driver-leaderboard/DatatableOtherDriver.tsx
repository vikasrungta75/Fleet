import React, { FC, useContext, useState } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import { IOtherDriverScore } from '../../../../type/driver-types';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../../../../contexts/themeContext';
import { useTranslation } from 'react-i18next';
import PaginationButtons from '../../../../components/PaginationButtons';
import ProfileArrow from '../../../../components/icon/svg-icons/ProfileArrow';
import DriverLeaderboardListProfile from '../../../../components/icon/svg-icons/DriverLeaderboardListProfile';

interface DataTableOtherDriverComponentProps {
	dataOtherDriverScore: IOtherDriverScore[];
}

const DataTableOtherDriverComponent: FC<DataTableOtherDriverComponentProps> = ({
	dataOtherDriverScore,
}) => {
	const navigate = useNavigate();
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['driverLeaderboard']);

	// Pagination states
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(5);

	const styleVertical: React.CSSProperties = { verticalAlign: 'middle', textAlign: 'center' };

	// Logic to paginate data
	const indexOfLastDriver = currentPage * perPage;
	const indexOfFirstDriver = indexOfLastDriver - perPage;
	const currentDrivers = dataOtherDriverScore.slice(indexOfFirstDriver, indexOfLastDriver);

	const handleViewProfile = (driverName: string | undefined) => {
		if (!driverName) {
			alert('Driver name is not defined, cannot display the profile details');
			return (
				<button onClick={() => navigate('/driverleaderboard')} className="btn btn-primary">
					Go to Driver Leaderboard
				</button>
			);
		} else {
			navigate(`/detaildriver/profil/${driverName}`);
		}
	};

	return (
		<div className='mt-3'>
			<p className='content-heading'>{t('Driver Leaderboard List')}</p>

			<table className="table mt-2" style={{ border: "1px solid #D9D9D9", borderRadius: "8px" }}>
				<thead style={{ backgroundColor: "#D8D8D8" }}>
					<tr style={{ ...styleVertical, height: "44px" }}>
						<th>{t('Name')}</th>
						<th>{t('Gender')}</th>
						<th>{t('Vehicle ID')}</th>
						<th>{t('Driver Score')}</th>
						<th>{t('Contact No.')}</th>
						<th>{t('View Profile')}</th>
					</tr>
				</thead>
				<tbody style={{ ...styleVertical, height: "44px" }}>
					{currentDrivers.map((driver, index) => (
						<tr key={index} style={styleVertical}>
							<td><DriverLeaderboardListProfile style={{right:"0px"}}/> {driver.driver_name}</td>
							<td>{driver.Gender}</td>
							<td>{driver.vin}</td>
							<td>{driver.score}</td>
							<td>{driver.Contact_no}</td>
							<td>
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handleViewProfile(driver.driver_name);
									}}
									style={{ cursor: 'pointer' }}
								>
									<p className='viewProfile1'>{t('View Profile')} <ProfileArrow /></p>
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{dataOtherDriverScore.length > 0 && (
				<PaginationButtons
					data={dataOtherDriverScore}
					label="items"
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					perPage={perPage}
					setPerPage={setPerPage}
				/>
			)}
		</div>
	);
};

export default DataTableOtherDriverComponent;
