import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Select from 'react-select';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import { IGroup, IGroupAssignedToRole } from '../../../type/groups-type';
import { ColorStyles } from '../../../helpers/helpers';
import Badge from '../../../components/bootstrap/Badge';
import Label from '../../../components/bootstrap/forms/Label';
import { useTranslation } from 'react-i18next';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { useGetUsersRole } from '../../../services/role';

interface IGroupsdSelected {
	setGroupsSelected: (val: IGroup[]) => void;
	selectRef: any;
	groupsSelected: IGroup[];
}

const GroupsForUserList: FC<IGroupsdSelected> = ({
	selectRef,
	setGroupsSelected,
	groupsSelected,
}) => {
	const { groupsListAssignedToRole, userGroupsList } = useSelector(
		(state: RootState) => state.usersGroups,
	);
	const { assignedUserGroups } = useSelector(
		(state: RootState) => state.usersGroupDetail.userDetails,
	);
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const dispatch = useDispatch();
	const { t } = useTranslation('usersPage');
	const [filteredGroups, setFilteredGroups] = useState<IGroup[]>([]);

	useEffect(() => {
		dispatch.usersGroupDetail.cleanGroupDetail();
		dispatch.usersGroups.getGroupsListAsync();
		dispatch.usersGroups.getGroupsListAssignedToRoleAsync();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// const groupsListAssignedToRoleIds = groupsListAssignedToRole.map(
		// 	(group: IGroupAssignedToRole) => group.group_id,
		// );
		// const newFilteredGroups = userGroupsList.filter((group: IGroup) => {
		// 	return groupsListAssignedToRoleIds.includes(group?.id.toString());
		// });
		const groupsListAssignedToRoleIds = groupsListAssignedToRole.map(
			(group: IGroupAssignedToRole) => group.group_id.toString(),
		);
		const newFilteredGroups = userGroupsList.filter((group: IGroup) => {
			return groupsListAssignedToRoleIds.includes(group.id.toString());
		});

		setFilteredGroups(newFilteredGroups);

		
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userGroupsList, groupsListAssignedToRole]);
	

	useEffect(() => {
		if (assignedUserGroups.length !== 0) {
			setGroupsSelected(assignedUserGroups);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assignedUserGroups]);

	//handelChange select

	const handleChangeSelect = (selectOption: any) => {
		setGroupsSelected(selectOption);
	};

	//handle show user option

	return (
		<Card>
			<CardHeader className='pb-0'>
				<CardTitle className=' mt-2' style={{ color: '#F00D69' }}>
					{t('Groups')}{' '}
				</CardTitle>
			</CardHeader>
			<CardBody className='box-sizing'>
				<div className='col-12'>
					<Label>{t('Current groups')}</Label>
					<div className='d-flex flex-wrap mb-3'>
						{groupsSelected?.length > 0 &&
							groupsSelected?.map((item: IGroup, index: number) => {
								return (
									<div key={index} className='col-auto'>
										<Badge isLight className='fs-6 px-3 py-2 me-2 mb-2'>
											{item.name}
										</Badge>
									</div>
								);
							})}
					</div>

					<FormGroup id='groups' label={t('Add groups')}>
						<Select
							className='usr-select-btn'
							styles={ColorStyles}
							getOptionLabel={(groups: IGroup) => groups.name}
							getOptionValue={(groups: IGroup) => groups.id.toString()}
							options={filteredGroups}
							isMulti
							onChange={handleChangeSelect}
							closeMenuOnSelect={false}
							controlShouldRenderValue={true}
							openMenuOnFocus={true}
							hideSelectedOptions={true}
							ref={selectRef}
							placeholder={t('Add more groups')}
							value={groupsSelected}
							isDisabled={!permissions?.update_user}
						/>
					</FormGroup>
				</div>
			</CardBody>
		</Card>
	);
};

export default GroupsForUserList;
