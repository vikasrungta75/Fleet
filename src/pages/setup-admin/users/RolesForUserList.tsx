import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../../store/store';
// import Select from 'react-select';
import Card, { CardBody, CardHeader, CardTitle } from '../../../components/bootstrap/Card';
import { useTranslation } from 'react-i18next';
import { IRole } from '../../../type/role-types';
import Select from '../../../components/bootstrap/forms/Select';
import { useGetUsersRole } from '../../../services/role';

interface IRolesdSelected {
	formik: any;
	data: Array<{ role: string; id: string }>;
}

const RolesForUsersList: FC<IRolesdSelected> = ({ formik, data }) => {
	const { roles } = useSelector((state: RootState) => state.roles);
	const { permissions } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch();
	const { t } = useTranslation('usersPage');
	const [filtredRole, setFilterdRoles] = useState<any[]>([]);

	useEffect(() => {
		if (roles.length === 0) {
			dispatch.roles.getRolesAsync();
		}
	}, [roles, dispatch]);

	// if data exists use it, otherwise fallback to Redux roles
	useEffect(() => {
		if (data && data.length > 0) {
			setFilterdRoles(data);
		} else if (roles && roles.length > 0) {
			setFilterdRoles(
				roles.map((r: any) => ({
					id: r.group_id,
					role: r.group_name,
				})),
			);
		}
	}, [data, roles]);

	return (
		<Card>
			<CardHeader className='pb-0'>
				<CardTitle className='mt-2' style={{ color: '#F00D69' }}>{t('Role')} </CardTitle>
			</CardHeader>
			<CardBody className='box-sizing'>
				<Select
					name='role'
					className='form-control'
					ariaLabel='fleet-select'
					value={formik.values.role}
					invalidFeedback={formik.errors.role}
					isTouched={formik.touched.role}
					isValid={formik.isValid}
					placeholder={t('Select a role')}
					onChange={formik.handleChange}
					disabled={!permissions?.update_user}>
					<option disabled>{t('Select a role')}</option>

					{filtredRole?.map((option: { role: string; id: string }, index: number) => {
						return (
							<option key={index} value={option.role}>
								{option.role}
							</option>
						);
					})}
				</Select>
			</CardBody>
		</Card>
	);
};

export default RolesForUsersList;
