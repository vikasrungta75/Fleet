import React, { FC, useEffect, useState, useMemo, useContext } from 'react';
import { useGetMaintenanceVin } from '../../../../../services/maintenanceService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import Input from '../../../../../components/bootstrap/forms/Input';
import Icon from '../../../../../components/icon/Icon';
import { useFormik } from 'formik';
import Spinner from '../../../../../components/bootstrap/Spinner';
import ThemeContext from '../../../../../contexts/themeContext';

interface VehicleComponentsProps {}

const VehicleComponents: FC<VehicleComponentsProps> = () => {
	const { data: vinFilter, isSuccess: isSuccessVinFilter, isLoading } = useGetMaintenanceVin();
	const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);
	const dispatch = useDispatch();
	const formik = useFormik({
		initialValues: {
			vins: filterTaskState.vin_filter === 'All' ? [] : filterTaskState.vin_filter,
			searchVin: '',
		},
		onSubmit: (values) => {},
	});
	const [checkAll, setCheckAll] = useState(false);
	const { mobileDesign } = useContext(ThemeContext);

	const [vinFilterMaintenance, setvinFilterMaintenance] = useState<any>([]);
	const handleCheckAll = () => {
		setCheckAll((prevCheckAll) => !prevCheckAll);
		if (!checkAll) {
			// If "check all" is checked, add all _id values to the vinFilterMaintenance array
			const allIds = vinFilter.map((arg: any) => arg._id);
			setvinFilterMaintenance(allIds);
			dispatch.appStoreNoPersist.changeFilterMaintenance({
				...filterTaskState,
				vin_filter: allIds,
			});
		} else {
			// If "check all" is unchecked, clear the vinFilterMaintenance array
			setvinFilterMaintenance([]);
			dispatch.appStoreNoPersist.changeFilterMaintenance({
				...filterTaskState,
				vin_filter: vinFilterMaintenance,
			});
		}
	};

	const filtredVin = useMemo(() => {
		return vinFilter?.filter((obj: any) => {
			return obj._id?.toUpperCase().includes(formik.values.searchVin.toUpperCase());
		});
	}, [vinFilter, formik.values.searchVin]);

	const CheckHandler = (e: any) => {
		const { value, checked } = e.target;
		const updatedValues: any = { ...formik.values }; // Create a copy of the current form values

		if (checked) {
			updatedValues.vins.push(value); // Add the value to the array
		} else {
			updatedValues.vins = updatedValues.vins.filter((item: any) => item !== value);
		}

		// Update the form values using setFieldValue
		formik.setFieldValue('vins', updatedValues.vins);
		dispatch.appStoreNoPersist.changeFilterMaintenance({
			...filterTaskState,
			vin_filter: updatedValues.vins.length > 0 ? updatedValues.vins : 'All',
		});
	};

	return (
		<div className='py-2 px-4'>
			<div
				className='input-group flex-nowrap align-items-center form-control py-0'
				style={{ cursor: 'text' }}>
				<Icon icon='Search' size='lg' className='me-2' />
				<Input
					type='text'
					name='searchVin'
					value={formik.values.searchVin}
					onChange={formik.handleChange}
					className='form-control my-0'
					placeholder='Search'
					style={{ border: 0, boxShadow: 'none' }}
				/>
			</div>
			<p className='my-3' style={{ color: '#A4A4A4' }}>
				View :
			</p>
			<div className='d-flex bd-highlight mb-4'>
				<input
					className='p-2 bd-highlight'
					value={'all'}
					type='checkbox'
					checked={filterTaskState.vin_filter.length === vinFilter && vinFilter.length}
					onChange={() => {
						handleCheckAll();
					}}
				/>
				<span className='ps-2 w-100 bd-highlight fw-bold'>
					All Vehicles ({isSuccessVinFilter && filtredVin.length})
				</span>
			</div>

			{isLoading ? (
				<div
					className={`${
						mobileDesign ? 'd-flex justify-content-center pt-3' : 'cover-spin'
					}`}>
					<Spinner className='spinner-center' color='secondary' size='5rem' />
				</div>
			) : (
				isSuccessVinFilter &&
				filtredVin &&
				filtredVin.map((arg: any, index: number) => {
					return (
						<div key={index} className='d-flex bd-highlight mb-4 ms-4'>
							<input
								className='p-2 bd-highlight  mb-2'
								value={arg._id}
								type='checkbox'
								name={'vins'}
								checked={filterTaskState.vin_filter.includes(arg._id)}
								onChange={(e) => {
									CheckHandler(e);
								}}
							/>
							<div className='ps-2 w-100 bd-highlight'>{arg._id}</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default VehicleComponents;
