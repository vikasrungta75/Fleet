import Card, { CardBody } from '../../../../components/bootstrap/Card';
import React, { FC, useEffect } from 'react';
import GroupNameCriteria from './GroupNameCriteria';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';

interface IUserGroups {
	isEditing?: boolean;
	lengthError?: boolean;
	alphaNumericError?: boolean;
	formik?: any;
}

const GroupNameComponent: FC<IUserGroups> = ({
	isEditing,
	lengthError,
	alphaNumericError,
	formik,
}) => {
	const { t } = useTranslation(['authPage', 'groupsPages']);
	const dispatch = useDispatch();
	const params = useParams();
	const {
		usersGroupDetail: { groupDetail },
	} = useSelector((state: RootState) => state);

	useEffect(() => {
		if (isEditing && params.idgroup) {
			dispatch.usersGroupDetail.getUserGroupDetailsAsync({ groupID: params.idgroup });
		}
	}, [dispatch.usersGroupDetail, isEditing, params.idgroup]);

	useEffect(() => {
		formik.setFieldValue('currentGroupName', groupDetail.name);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groupDetail.name]);

	return (
		<Card>
			<CardBody className='box-sizing'>
				<div className='d-flex row justify-content-between'>
					<div className=''>
						<GroupNameCriteria
							lengthError={lengthError}
							alphaNumericError={alphaNumericError}
						/>
						{isEditing ? (
							<>
								<FormGroup
									className='mb-4'
									id='currentGroupName'
									name='currentGroupName'
									label={t('Current group name', { ns: 'groupsPages' })}
									labelClassName='text-dark'>
									<Input
										autoComplete='currentGroupName'
										onChange={formik.handleChange}
										value={formik.values.currentGroupName}
										invalidFeedback={formik.errors.currentGroupName}
										isTouched={formik.touched.currentGroupName}
										isValid={formik.isValid}
										disabled
									/>
								</FormGroup>

								<FormGroup
									id='newGroupName'
									name='newGroupName'
									label={t('New group name', { ns: 'groupsPages' })}
									labelClassName='text-dark'>
									<Input
										placeholder={t('type new group name', {
											ns: 'groupsPages',
										})}
										autoComplete='groupName'
										onChange={formik.handleChange}
										value={formik.values.newGroupName}
										invalidFeedback={formik.errors.newGroupName}
										isTouched={formik.touched.newGroupName}
										isValid={formik.isValid}
									/>
								</FormGroup>
							</>
						) : (
							<FormGroup
								id='groupName'
								name='groupName'
								label={t('Group Name', { ns: 'groupsPages' })}
								labelClassName='text-dark'>
								<Input
									placeholder={t('type new group name', {
										ns: 'groupsPages',
									})}
									autoComplete='groupName'
									onChange={formik.handleChange}
									value={formik.values.groupName}
									invalidFeedback={formik.errors.groupName}
									isTouched={formik.touched.groupName}
									isValid={formik.isValid}
								/>
							</FormGroup>
						)}
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default GroupNameComponent;
