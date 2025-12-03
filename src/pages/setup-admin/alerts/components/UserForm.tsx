import React, { FC, memo, useContext, useEffect, useState } from 'react';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Select from '../../../../components/bootstrap/forms/Select';
import ThemeContext from '../../../../contexts/themeContext';
import { IGroupAssignedToRole } from '../../../../type/groups-type';
import { Iusers } from '../../../../type/auth-type';
import Icon from '../../../../components/icon/Icon';
import Checks from '../../../../components/bootstrap/forms/Checks';
import { useDispatch } from 'react-redux';

interface IUserForm {
	t: any;
	index: number;
	permissions: any;
	element: any;
	groupsListAssignedToRole: any;
	removeFormFields: any;
	handleChange: any;
	groupname: string;
	user: any;
}

const UserForm: FC<IUserForm> = ({
	t,
	index,
	permissions,
	element,
	groupsListAssignedToRole,
	removeFormFields,
	handleChange,
	groupname,
	user,
}) => {
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();
	const [userList, setuserList] = useState<Iusers[]>([]);

	const [isLoading, setLoading] = useState(false);

	// useEffect(() => {
	// 	if (groupname) {
	// 		setLoading(true);
	// 		dispatch.usersGroupDetail
	// 			.getUserGroupDetailsAsync({ groupID: groupname })
	// 			.then((res: Iusers[]) => {
	// 				setuserList(res);
	// 				setLoading(false);
	// 			});
	// 	}

	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [groupname]);

	useEffect(() => {
		if (groupname) {
			setLoading(true);
			dispatch.usersGroupDetail
				.getUserGroupDetailsAsync({ groupID: groupname })
				.then((res: Iusers[] | undefined) => {
					setuserList(Array.isArray(res) ? res : []);
					setLoading(false);
				})
				.catch(() => {
					setuserList([]);
					setLoading(false);
				});
		}
	}, [groupname, dispatch.usersGroupDetail]); 
	

	const [spinnerValue, setspinnerValue] = useState(false);

	return (
		<FormGroup
			key={index}
			className={` ${mobileDesign
				? 'col-12'
				: 'row col-12 border-top pt-4 mt-4 border-1 border-custom-light-grey'
				}`}>
			<FormGroup
				className={` ${mobileDesign
					? 'col-12'
					: 'col-5 d-flex align-items-center notify-select border-1'
					}`}
				// className='col-5 d-flex align-items-center notify-select border-1 border-custom-light-grey border-end'
				labelClassName={` me-3 mb-0 text-dark ${mobileDesign ? 'mt-3' : ''}`}
				label={`${t('Group')}:`}>
				<Select
					name={`users[${index}].groupname`}
					className='form-control'
					ariaLabel='metric-select'
					onChange={handleChange}
					disabled={!permissions?.update_alert}>
					<option selected disabled value=''>
						{t('Select a group')}
					</option>
					{groupsListAssignedToRole.map((arg: IGroupAssignedToRole, indexKey: number) => {
						return (
							<option
								selected={arg.group_id === element.groupname}
								value={arg.group_id}
								key={indexKey}>
								{arg.group_name}
							</option>
						);
					})}
				</Select>
			</FormGroup>
			<FormGroup
				className={` ${mobileDesign ? 'col-12' : 'col-7 d-flex align-items-center notify-select'
					}`}
				labelClassName={` mx-3 mb-0 text-dark ${mobileDesign ? 'mt-3' : ''}`}
				label={`${t('User')}:`}>
				<Select
					name={`users[${index}].user_email`}
					className='form-control'
					ariaLabel='metric-select'
					isLoading={isLoading}
					onChange={handleChange}
					disabled={!permissions?.update_alert || isLoading}>
					<option selected={spinnerValue} disabled={spinnerValue} value=''>
						{t('Select person')}
					</option>
					{userList.length > 0 ? (
						<>
							{userList
								.filter((u: Iusers) => u.emailID !== user.emailID)
								.map((arg: any, i: any) => (
									<option
										selected={
											arg.uniqueId === element.user_email && !spinnerValue
										}
										//disabled={formValues.includes(arg.emailID)}
										value={arg.emailID}
										key={i}>
										{`${arg.fullName} - ${arg.emailID}`}
									</option>
								))}
						</>
					) : (
						<>
							{userList.map((arg: any, i: any) => (
								<option
									selected={arg.uniqueId === element.user_email && !spinnerValue}
									//disabled={formValues.includes(arg.emailID)}
									value={arg.emailID}
									key={i}>
									{`${arg.fullName} - ${arg.emailID}`}
								</option>
							))}
						</>
					)}
				</Select>
				<div className="d-flex justify-content-end">
					<button
						className="ms-5 d-flex align-items-center justify-content-center"
						onClick={removeFormFields}
						style={{
							width: '110px',
							height: '34px',
							borderRadius: '4px',
							// borderWidth: '0.5px',
							paddingTop: '11px',
							paddingRight: '9px',
							paddingBottom: '11px',
							paddingLeft: '9px',
							background: '#FFFFFF',
							border: '0.5px solid #E0E6ED',
						}}
					>
						<Icon
							style={{ width: 20 }}
							className="me-2"
							icon="RemoveCircleOutline"
							size="lg"
							color="secondary"
						/>
						<span>{t('Remove')}</span>
					</button>
				</div>
			</FormGroup>
			<FormGroup
				className={` ${mobileDesign
					? 'col-12'
					: 'col-6 mt-4 d-flex justify-content-start align-items-center'
					}`}
				label={`${t('Notification Type')}:`}
				labelClassName={`mb-0 text-dark ${mobileDesign ? 'mt-3 mb-2' : ''}`}>
				<FormGroup
					className='col-3 d-flex flex-row-reverse align-items-center justify-content-center'
					labelClassName='ms-3 mb-0 text-dark fw-semibold'
					label={t('Email')}>
					<Checks
						type='checkbox'
						onChange={handleChange}
						name={`users[${index}].notify_email`}
						checked={element.notify_email === true}
						className='checkbox-nrml'
						disabled={!permissions?.update_alert}
					/>
				</FormGroup>
				<FormGroup
					className='col-3 d-flex flex-row-reverse align-items-center justify-content-center'
					labelClassName='ms-3 mb-0 text-dark fw-semibold'
					label={t('Web Push')}>
					<Checks
						type='checkbox'
						onChange={handleChange}
						name={`users[${index}].notify_web_push`}
						checked={element.notify_web_push === true}
						className='checkbox-nrml'
						disabled={!permissions?.update_alert}
					/>
				</FormGroup>
			</FormGroup>
		</FormGroup>
	);
};

export default memo(UserForm);
