import React, { FC, useEffect } from 'react';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Input from '../../../components/bootstrap/forms/Input';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import showNotification from '../../../components/extras/showNotification';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../components/Avatar';
import USERS from '../../../common/data/userDummyData';
import { UpdateProfileInterface } from '../../../type/auth-type';
import { useNavigate } from 'react-router-dom';
import { dashboardMenu } from '../../../menu';

interface IusersSelected {
	setShowDelete: (val: boolean) => void;
	showDelete: boolean;
	userInformation: UpdateProfileInterface;
	type: string;
}

const DeleteUser: FC<IusersSelected> = ({ setShowDelete, showDelete, userInformation, type }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('usersPage');
	const navigate = useNavigate();

	// handle copy paste
	const copyToClipboard = () => {
		navigator.clipboard.writeText(userInformation.fullName);
	};

	// handle form
	const formik = useFormik({
		initialValues: {
			confirmDeletion: '',
		},

		validate: (values) => {
			const errors: {
				confirmDeletion?: string;
			} = {};

			if (!values.confirmDeletion) {
				errors.confirmDeletion = t('confirm to delete');
			} else if (values.confirmDeletion !== userInformation.fullName) {
				errors.confirmDeletion = t('not match');
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async () => {
			dispatch.usersGroupDetail.deleteUserAsync(userInformation.id).then((res: boolean) => {
				if (res) {
					showNotification('', t('User has been successfully deleted'), 'success');
					formik.setFieldValue('confirmDeletion', '');
					setShowDelete(false);
					setTimeout(() => {
						navigate(`../${dashboardMenu.setup.subMenu.users.path}`);
					}, 2000);
				}
			});
		},

		onReset: () => {},
	});

	useEffect(() => {
		dispatch.usersGroups.getUserListAsync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showDelete]);

	return (
		<div>
			<OffCanvas
				id='delete'
				titleId='delete'
				placement='end'
				isOpen={showDelete}
				setOpen={setShowDelete}>
				<OffCanvasHeader className='ps-3' setOpen={setShowDelete}>
					<OffCanvasTitle
						id='offcanvasExampleLabel'
						tag={'h3'}
						className='border-bottom w-100' style={{ color: '#F00D69' }}>
						{t('delete user')}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					<div className='d-flex justify-content-between mx-3 pb-3 mb-3 border-bottom border-light'>
						<div>
							<Avatar
								size={40}
								src={USERS.JANE.src}
								userName={userInformation.fullName}
							/>
							<span className='ms-3'>{userInformation.fullName}</span>
						</div>

						<Button onClick={copyToClipboard} size={'lg'} icon='ContentCopy' />
					</div>
					<Card>
						<CardBody className='p-3'>
							<p className='w-100 fw-semibold d-flex flex-row align-items-center'></p>
							<div className='col-12 d-flex'>
								<FormGroup id='deleteConfirmation' className='w-100 me-4'>
									<p className='w-100 fs-6 fw-semibold d-flex flex-row align-items-center'>
										{t(
											`Type the name of the ${type} for ${
												type === 'group' ? 'block' : 'delete'
											} confirmation :`,
										)}{' '}
									</p>
									<div className='d-flex align-items-center'>
										<Input
											name='confirmDeletion'
											id='confirmDeletion'
											onChange={formik.handleChange}
											value={formik.values.confirmDeletion}
											invalidFeedback={formik.errors.confirmDeletion}
											isTouched={formik.touched.confirmDeletion}
											isValid={formik.isValid}
										/>
										<div className='d-flex align-items-center ms-3'>
											<Button
												aria-label='Toggle Go Back'
												className='mobile-header-toggle me-2'
												size='sm'
												color='dark'
												isLight
												icon='Close'
												onClick={formik.handleReset}
											/>
											<Button
												aria-label='Toggle Go Back'
												className='mobile-header-toggle'
												size='sm'
												color='success'
												isLight
												icon='Check'
												onClick={formik.handleSubmit}
											/>
										</div>
									</div>
								</FormGroup>
							</div>
						</CardBody>
					</Card>
				</OffCanvasBody>
			</OffCanvas>
		</div>
	);
};

export default DeleteUser;
