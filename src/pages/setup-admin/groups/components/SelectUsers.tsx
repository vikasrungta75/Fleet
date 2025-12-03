import React, { FC, useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import classNames from 'classnames';

import Select from 'react-select';

import { useTranslation } from 'react-i18next';
import { Iusers } from '../../../../type/auth-type';
import { RootState } from '../../../../store/store';
import Avatar from '../../../../components/Avatar';
import USERS from '../../../../common/data/userDummyData';
import useDarkMode from '../../../../hooks/useDarkMode';
import { ColorStyles } from '../../../../helpers/helpers';
import ThemeContext from '../../../../contexts/themeContext';
import { useGetFleetManagers } from '../../../../services/groupsService';

interface IusersSelected {
	setUsersGroupSelected: (val: []) => void;
	selectRef: any;
	usersGroupSelected: Iusers[];
}

const SelectUsers: FC<IusersSelected> = ({
	selectRef,
	setUsersGroupSelected,
	usersGroupSelected,
}) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['groupsPages']);
	const { darkModeStatus } = useDarkMode();
	const { mobileDesign } = useContext(ThemeContext);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);


	//handel style div select Users

	const [heigth, setHeigth] = useState(false);

	const handleFocusSelect = () => {
		setHeigth(!heigth);
	};

	// handle Change select
	const [selectedOption, setSelectedOption] = useState([...usersGroupSelected]);

	useEffect(() => {
		setSelectedOption([...usersGroupSelected]);
	}, [usersGroupSelected]);

	const handlechangeSelect = async (selectOption: any) => {
		setUsersGroupSelected(selectOption);
		setSelectedOption(selectOption);
	};

	//handle show user option

	const { data, isLoading } = useGetFleetManagers()
	const formatOptionLabel = (user: any, { context }: any) => {
		if (context === 'value') {
			return <div>{user?.fullName || user?.users?.fullName}</div>;
		} else {
			return (
				<div key={user?.users?.id} className='d-flex align-items-center w-50'>
					<div className='flex-shrink-0'>
						<Avatar src={USERS.JANE.src} size={54} />
					</div>
					<div className='flex-grow-1 ms-3 d-flex justify-content-between align-items-center'>
						<div>
							<Link
								to='#'
								className={classNames('fw-bold fs-6 mb-0 text-decoration-none', {
									'link-dark': !darkModeStatus,
									'link-light': darkModeStatus,
								})}>
								{user?.fullName || user?.users?.fullName}							</Link>
						</div>
					</div>
				</div>
			);
		}
	};

	return (
		<div
			className={`h-100 ${mobileDesign ? 'w-100 mb-3' : !permissions.create_user ? 'w-100' : 'w-75 me-4'
				}`}>
			<Select
				className='usr-select-btn'
				styles={ColorStyles}
				getOptionLabel={(Users: any) => Users?.users?.fullName}
				getOptionValue={(Users: any) => String(Users?.users?.id)}
				formatOptionLabel={formatOptionLabel}
				options={data}
				onFocus={handleFocusSelect}
				isMulti
				onChange={handlechangeSelect}
				closeMenuOnSelect={false}
				controlShouldRenderValue={true}
				openMenuOnFocus={true}
				ref={selectRef}
				onBlur={handleFocusSelect}
				hideSelectedOptions={true}
				placeholder={t('Search users')}
				value={selectedOption.filter(
					(userGroupSelected: Iusers) => userGroupSelected.status !== 2,
				)}
				isDisabled={!permissions?.update_user || !permissions?.update_group}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default SelectUsers;
