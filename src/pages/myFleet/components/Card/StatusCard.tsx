import React, { FC, useState, useMemo, useEffect, useContext } from 'react';
import { svg } from '../../../../assets';
import { useGetVehicleLocationv1, useGetVehicleStatus } from '../../../../services/vehiclesService';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useFormik } from 'formik';
import Checks from '../../../../components/bootstrap/forms/Checks';
import ThemeContext from '../../../../contexts/themeContext';
import { rtlStyleSortFilter } from '../map/constants/mapConstants';

interface IStatusFilterProps {
	show: (show: boolean) => void;
}
const StatusFilter: FC<IStatusFilterProps> = ({ show }) => {
	const { dir } = useSelector((state: RootState) => state.appStore);

	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);
	const { statusFilter } = useSelector((state: RootState) => state.appStoreNoPersist);

	const [groupNameFilter, setGroupNameFilter] = useState('All Fleets');
	const [allVehiclesStatus, setAllVehiclesStatus] = useState<{
		[key: string]: number | string;
	}>();
	const payloadFilter = useMemo(
		() => ({
			fleet_name: groupNameFilter,
			status: statusFilter,
			// trouble: 'All',
		}),
		[statusFilter, groupNameFilter],
	);

	const formik = useFormik({
		initialValues: {
			status: statusFilter,
		},
		onSubmit: (values) => {
			dispatch.appStoreNoPersist.setIsFilterLoading(true);
			dispatch.appStoreNoPersist.changeStatusFilter(values.status);
			refetch();
			show(false);
			setTimeout(() => {
				dispatch.appStoreNoPersist.setIsFilterLoading(false);
			}, 4000);
		},
	});
	const { data: vehiclesStatus, status: vehiclesStatusStatus } =
		useGetVehicleStatus(payloadFilter);
	const { refetch } = useGetVehicleLocationv1();

	useEffect(() => {
		if (vehiclesStatusStatus === 'success') {
			setAllVehiclesStatus(vehiclesStatus || {});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vehiclesStatus]);

	const handleClick = () => {
		formik.handleSubmit();
	};
	const statusFilters = [
		// { label: 'Total', value: 'total_vehicles', filteredGroup: 'Total', color: 'dark' },
		{
			label: 'Running',
			value: 'active_vehicles',
			filteredGroup: 'Running',
			color: 'custom-green',
		},
		{
			label: 'Idle',
			value: 'idle_vehicles',
			filteredGroup: 'Idle',
			color: 'warning',
		},
		{
			label: 'Parked',
			value: 'parked_vehicles',
			filteredGroup: 'Parked',
			color: 'custom-blue',
		},
		{
			label: 'Stopped',
			value: 'stopped_vehicles',
			filteredGroup: 'Stopped',
			color: 'danger',
		},
		{
			label: 'Disconnected',
			value: 'disconnected_vehicles',
			filteredGroup: 'Disconnected',
			color: 'custom-grey',
		},
		{
			label: 'Trouble',
			value: 'trouble_vehicles',
			filteredGroup: 'Trouble',
			color: '',
		},
	];
	const { mobileDesign } = useContext(ThemeContext);

	return (
		<div
			style={{
				maxHeight: mobileDesign ? '190px' : undefined,
				overflow: mobileDesign ? 'scroll' : undefined,
				...(dir === 'rtl' ? rtlStyleSortFilter : {}), // Apply rtlStyleFilter conditionally
			}}
			className={'filter-container'}>
			{allVehiclesStatus ? (
				<div className='filter-body '>
					{statusFilters.map(({ label, value, filteredGroup, color }, index) => {
						return (
							<div key={index} className='filter-optionOne'>
								<label className='d-flex align-items-center'>
									<Checks
										value={label}
										type='checkbox'
										onChange={formik.handleChange}
										name='status'
										checked={formik.values.status.includes(label)}
										className='checkbox-nrml'
										style={{
											right: 10,
										}}
									/>
									<span
										style={{
											marginTop: -3,
											marginLeft: 2,
											fontFamily: 'Open Sans',
											fontSize: '12px',
											lineHeight: '16.1px',
										}}>
										{t(`${label}`)}
									</span>
								</label>

								<img
									alt={svg[label.toLowerCase() as keyof typeof svg]}
									src={svg[label.toLowerCase() as keyof typeof svg]}
								/>
							</div>
						);
					})}
				</div>
			) : (
				<div className='d-flex justify-content-center align-items-center  h-100'>
					<Spinner color='secondary' size='3rem' />
				</div>
			)}
			<div className='filter-footer'>
				<button className='w-100 py-1 custom-btn-color' onClick={handleClick}>
					{t('Apply')}
				</button>
				{/* <button
					className='btn secondary-btn'
					onClick={() => formik.setFieldValue('status', [])}>
					<img src={svg.deleteIcon} alt={svg.deleteIcon} />
					<span>{t('Reset')}</span>
				</button> */}
			</div>
		</div>
	);
};

export default StatusFilter;
