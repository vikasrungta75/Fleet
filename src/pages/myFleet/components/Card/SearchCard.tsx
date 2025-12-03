import React, { FC, useEffect, useContext, useState } from 'react';
import Icon from '../../../../components/icon/Icon';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useFilteredVehicles } from '../../../../hooks/useGetFilteredVehicles';
import { useGetVehicleLocationv1 } from '../../../../services/vehiclesService';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../../contexts/themeContext';
import Input from '../../../../components/bootstrap/forms/Input';

interface SearchComponentCardProps {
	searchAutoCompleteToggle: () => void;
	showSearchAutoComplete: boolean;
}

const SearchComponentCard: FC<SearchComponentCardProps> = ({
	searchAutoCompleteToggle,
	showSearchAutoComplete,
}) => {
	const { t } = useTranslation(['vehicles']);
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();
	const formik = useFormik({
		initialValues: {
			searchInput: '',
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {
			// setSearchModalStatus(true);
		},
	});
	const { data: vehicleLocationv1, isLoading } = useGetVehicleLocationv1();
	const { fleetSearched } = useSelector((state: RootState) => state.appStoreNoPersist);

	const filteredVehicles = useFilteredVehicles(vehicleLocationv1, formik.values.searchInput);
	const [showList, setShowList] = useState(false)

	useEffect(() => {
		if (Object.keys(fleetSearched).length > 0) {
			formik.setFieldValue('searchInput', fleetSearched.vin);
		}

		return () => { };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fleetSearched]);

	const highlightMatchingText = (suggestion: string) => {
		let suggestionArray = [];
		let j = 0;
		for (let i = 0; i < suggestion.length; i++) {
			if (formik.values.searchInput.length !== 0) {
				if (formik.values.searchInput.toLowerCase()[j] === suggestion.toLowerCase()[i]) {
					suggestionArray.push(
						<span key={i} style={{ fontWeight: 'bold' }}>
							{suggestion[i]}
						</span>,
					);
					j++;
				} else {
					suggestionArray.push(<span key={i}>{suggestion[i]}</span>);
				}
			}
		}
		return suggestionArray;
	};

	const pointerCursor = {
		cursor: 'pointer',
	};

	return (
		<>
		
			<div className='input-group flex-nowrap align-items-center form-control py-0' style={{
				cursor: 'text', marginTop: '1em',
				marginBottom: '1em',
				width: mobileDesign ? '85%' : undefined,
			}} >

				<Input
					type='text'
					name='searchInput'
					placeholder={t('Search ...')}
					aria-label='Search ...'
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						formik.setFieldValue('searchInput', e.target.value);
						if (!showList) {
							setShowList(true)
						}
						if (e.target.value === '') {
							dispatch.appStoreNoPersist.changeFleetDetailMap({});
						}
					}}
					value={formik.values.searchInput}
					className='form-control my-0'
					style={{ border: 0, boxShadow: "none" }}

				/>
				<Icon icon='Close' size='lg' className='me-2' onClick={() => {
					formik.setFieldValue('searchInput', '');
					dispatch.appStoreNoPersist.changeFleetDetailMap({});
					dispatch.appStoreNoPersist.changeInputSearchBarMyFleet('');
					dispatch.vehicles.changeShowAllVehicle(true);
					searchAutoCompleteToggle();
					setShowList(false)
				}}
					style={pointerCursor}
				/>
			</div>

			{vehicleLocationv1 && showList && filteredVehicles?.length !== vehicleLocationv1?.length && (
				<div className='search-filtred-result'>
					{filteredVehicles.map((arg, i) => {
						return (
							<div
								onClick={() => {
									dispatch.appStoreNoPersist.changeFleetDetailMap(arg);
									dispatch.appStoreNoPersist.changeInputSearchBarMyFleet(arg.vin);
									setShowList(false)
								}}
								className='p-2 bd-highlight cursor-pointer ms-2'
								key={i}>
								{highlightMatchingText(arg.vin)}
							</div>
						);
					})}
				</div>
			)}
		</>
	);
};

export default SearchComponentCard;
