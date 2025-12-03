import React, { FC, useState, useContext, useEffect } from 'react';
import { svg } from '../../../../assets';
import { useGetVehicleLocationv1 } from '../../../../services/vehiclesService';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../../../../components/bootstrap/Spinner';
import { RootState } from '../../../../store/store';
import { rtlStyleSortFilter } from '../map/constants/mapConstants';
import ThemeContext from '../../../../contexts/themeContext';

interface ISortCardProps {
	show: (show: boolean) => void;
}
const SortCard: FC<ISortCardProps> = ({ show }) => {
	const { refetch, fetchStatus } = useGetVehicleLocationv1();
	const [showSpinner, setshowSpinner] = useState(false);
	const { sortFilter } = useSelector((state: RootState) => state.appStoreNoPersist);
	const { dir } = useSelector((state: RootState) => state.appStore);

	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);

	const formik = useFormik({
		initialValues: {
			sortBy: sortFilter.sortfield || 'vin',
			ordre: sortFilter.sort || 1,
		},
		onSubmit: (values) => {
			dispatch.appStoreNoPersist.setIsFilterLoading(true);

			let paylaodFilter = {
				sortfield: formik.values.sortBy,
				sort: formik.values.ordre,
			};
			setshowSpinner(true);
			dispatch.appStoreNoPersist.changeSortFilter(paylaodFilter);

			refetch();
			show(false);
			setTimeout(() => {
				dispatch.appStoreNoPersist.setIsFilterLoading(false);
			}, 4000);
		},
	});
	useEffect(() => {
		if (fetchStatus === 'idle') setshowSpinner(false);
	}, [fetchStatus]);
	const deleleFilter = () => {
		formik.setFieldValue('sortBy', 'vin');
		formik.setFieldValue('ordre', 1);
	};
	const { mobileDesign } = useContext(ThemeContext);

	return (
		<div
			style={{
				maxHeight: mobileDesign ? '190px' : undefined,
				overflow: mobileDesign ? 'scroll' : undefined,
				...(dir === 'rtl' ? rtlStyleSortFilter : {}), 
			}}
			className='filter-container'>
			<div className='order-body mb-5'>
				<select
					className='order-type'
					name='sortBy'
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}>
					<option value='vin' selected={formik.values.sortBy === 'vin'}>
						{t('VIN')}
					</option>
					{/* <option value='group_name' selected={formik.values.sortBy === "group_name"}>{t("Fleet Name")}</option> */}
					<option value='status' selected={formik.values.sortBy === 'status'}>
						{t('Status')}
					</option>
				</select>
				<select className='order-style' name='ordre' onChange={formik.handleChange}>
					<option value={1} selected={Number(formik.values.ordre) === 1}>
						{t('Ascending')}
					</option>
					<option value={-1} selected={Number(formik.values.ordre) === -1}>
						{t('Descending')}
					</option>
				</select>
				{showSpinner && (
					<div className='d-flex justify-content-center h-100 align-items-center'>
						<Spinner color='secondary' size='3rem' />
					</div>
				)}
			</div>
			{/* <div className='filter-footer'>
				<button className=' btn primary-btn' >
					{t('Apply')}
				</button>
			
			</div> */}
		</div>
	);
};

export default SortCard;
