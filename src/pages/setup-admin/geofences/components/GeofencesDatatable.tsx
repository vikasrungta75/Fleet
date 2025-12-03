import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import ConfirmDeletion from '../../../../components/ConfirmDeletion';
import Icon from '../../../../components/icon/Icon';
import PaginationButtons, { PER_COUNT } from '../../../../components/PaginationButtons';
import ThemeContext from '../../../../contexts/themeContext';
import { geofencesPages } from '../../../../menu';
import { useGetGeofencesSettingsData } from '../../../../services/geofences';
import { IGeofence } from '../../../../type/geofences-type';
import { RootState } from '../../../../store/store';
import { useSelector } from 'react-redux';
import {
	TableStyle,
	thStyle,
	trStyleTable,
} from '../../../alarms_notifications/components/constants/alarmConstants';
import { columns } from '../constants/constants';

interface IGeofencesDatatableProps {
	geofences: IGeofence[];
}

const GeofencesDatatable: FC<IGeofencesDatatableProps> = ({ geofences }): JSX.Element => {
	const { t } = useTranslation(['geofence']);
	const navigate = useNavigate();
	const { mobileDesign } = useContext(ThemeContext);
	const { dir } = useSelector((state: RootState) => state.appStore);
	const { refetch } = useGetGeofencesSettingsData();
	const permissions = useSelector((state: RootState) => state.auth?.permissions);

	// pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['5']);

	// show delete field
	const [showDeleteConfirmationField, setShowDeleteConfirmationField] = useState<{
		[key: string]: boolean;
	}>({});

	// handle show delete confirmation field
	const toggleOpen = (geofence: string) => {
		setShowDeleteConfirmationField({
			...showDeleteConfirmationField,
			[geofence]: !showDeleteConfirmationField[geofence],
		});
	};

	// handle copy geofence name
	const copyToClipboard = (geofence: string) => {
		navigator.clipboard.writeText(geofence);
	};

	return (
		<Card>
			<CardBody className='table-responsive pb-5'>
				{perPage === 50 && (
					<PaginationButtons
						data={geofences}
						label='items'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				)}

				<table className={dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'}>
					<thead>
						<tr
							style={{
								...TableStyle,
							}}>
							{columns.map(({ name, width }, index) => (
								<th
									key={index}
									style={{
										width: width,
										...thStyle,
									}}>
									{t(`${name}`)}
								</th>
							))}
							<th style={{ width: mobileDesign ? '400px' : '100%' }} />
						</tr>
					</thead>
					<tbody>
						{geofences?.map((item: IGeofence) => (
							<React.Fragment key={item.geofence_id}>
								<tr style={{ ...trStyleTable, cursor: 'initial' }}>
									<td style={{ paddingLeft: 60 }}>
										{t(`${item.geofence_name}`)}
										{showDeleteConfirmationField[item.geofence_id] && (
											<Button
												className='ms-2'
												onClick={() => copyToClipboard(item.geofence_name)}
												isOutline>
												<Icon icon='ContentCopy' size='lg' color='dark' />
											</Button>
										)}
									</td>
									<td style={{ paddingLeft: 60 }}>{t(`${item.vin}`)}</td>
									<td style={{ paddingLeft: 65 }}>{t(`${item.fleet_name || '-'}`)}</td>
									<td style={{ paddingLeft: 64 }}>{t(`${item.type === 'Both' ? 'In/Out' : item.type}`)}</td>
									<td
										className='d-flex gap-3 justify-content-end'
										style={{ width: mobileDesign ? '250px' : '100%' }}>
										{permissions?.delete_geofence && (
											<Button
												aria-label='Delete Button'
												className=' me-3'
												style={{ zIndex: '3' }}
												icon='Delete'
												// color='secondary'
												isLight
												isOutline
												onClick={() => {
													toggleOpen(item.geofence_id);
												}}>
												{t('Delete')}
											</Button>
										)}
										{permissions?.read_geofence && (
											<Button
												aria-label='Go Forward'
												// className='light-btn'
												color='dark'
												isLight
												onClick={() => {
													navigate(
														`../${geofencesPages.editGeofence.path}/${item.vin}`,
														{ state: item },
													);
												}}>
												{t('View Map')}
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
										)}
									</td>
								</tr>
								{showDeleteConfirmationField[item.geofence_id] && (
									<tr style={{ ...trStyleTable, cursor: 'initial' }}>
										<td />
										<td />
										<td />
										<td />
										<td style={{ width: '35%' }}>
											<ConfirmDeletion
												showDeleteConfirmation={showDeleteConfirmationField}
												setShowDeleteConfirmation={
													setShowDeleteConfirmationField
												}
												data={{
													name: item.geofence_name,
													id: item.geofence_id,
													vin: item.vin,
													gtype: item.gtype,
												}}
												type='geofence'
												refetch={refetch}
											/>
										</td>
									</tr>
								)}
							</React.Fragment>
						))}
					</tbody>
				</table>
				<PaginationButtons
					data={geofences}
					label='items'
					setCurrentPage={setCurrentPage}
					currentPage={currentPage}
					perPage={perPage}
					setPerPage={setPerPage}
				/>
			</CardBody>
		</Card>
	);
};

export default GeofencesDatatable;
