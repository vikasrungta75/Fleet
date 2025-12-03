import React, { FC, useContext, useEffect } from 'react';
import { colorStatusBackground } from '../../maintenanceConstants';
import { useGetMaintenanceStatusFilter } from '../../../../../services/maintenanceService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import Spinner from '../../../../../components/bootstrap/Spinner';
import ThemeContext from '../../../../../contexts/themeContext';

interface FilterStatusComponentProps {
	itemFilterMaintenance: any;
	setitemFilterMaintenance: (value: any) => void;
}

const FilterStatusComponent: FC<FilterStatusComponentProps> = ({
	itemFilterMaintenance,
	setitemFilterMaintenance,
}) => {
	const dispatch = useDispatch();

	const { data: filterData, isLoading, isSuccess } = useGetMaintenanceStatusFilter();

	const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);

	const { mobileDesign } = useContext(ThemeContext);

	const toggleItem = (item: string) => {
		setitemFilterMaintenance((prevItems: any) => {
			const itemIndex = prevItems.indexOf(itemFilterMaintenance);

			if (itemIndex !== -1) {
				// Item exists in the array, remove it
				const resultItels = prevItems.filter(
					(value: any, index: number) => index !== itemIndex,
				);
				dispatch.appStoreNoPersist.changeFilterMaintenance({
					...filterTaskState,
					status_filter: resultItels,
				});
				return resultItels;
			} else {
				const resultItels = [...prevItems, item];
				dispatch.appStoreNoPersist.changeFilterMaintenance({
					...filterTaskState,
					status_filter: resultItels,
				});
				// Item does not exist in the array, push it
				return resultItels;
			}
		});
	};

	return (
		<div className='py-2 px-4'>
			<p className='mb-3' style={{ color: '#A4A4A4' }}>
				View :
			</p>

			{isLoading ? (
				<div className='d-flex align-items-center justify-content-center mb-3'>
					<Spinner className='spinner-center' color='secondary' size='40px' />
				</div>
			) : (
				isSuccess &&
				filterData?.map((arg: any, index: number) => {
					return (
						<div key={index} className='d-flex mb-3'>
							<input
								className='p-2 bd-highlight'
								value={arg.status}
								type='checkbox'
								name={arg.status}
								onChange={() => {
									toggleItem(arg.status);
								}}
							/>
							<div className='ps-2 w-100 bd-highlight'>{arg.status}</div>
							<div
								style={{
									backgroundColor:
										colorStatusBackground[
											arg.status as keyof typeof colorStatusBackground
										],
								}}
								className='p-2 flex-shrink-1 bd-highlight dot-status-maintenance'></div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default FilterStatusComponent;
