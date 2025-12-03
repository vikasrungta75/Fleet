import React, { FC, useEffect } from 'react';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../components/bootstrap/OffCanvas';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Input from '../../components/bootstrap/forms/Input';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Icon from '../../components/icon/Icon';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Label from '../../components/bootstrap/forms/Label';
import { useDispatch } from 'react-redux';
import showNotification from '../../components/extras/showNotification';

const DeleteTask: FC<any> = ({ setShowDelete, showDelete, deletePayload }) => {
	
	const { t } = useTranslation(['driversPage']);
	const dispatch = useDispatch();
	const copyToClipboard = () => {
		navigator.clipboard.writeText(deletePayload.task_name as string);
	};

	// handle form
	const formik = useFormik({
		initialValues: {
			task: '',
		},

		validate: (values) => {
			const errors: {
				task?: string;
			} = {};

			// validate of VIN

			if (!values.task) {
				// errors.task = t('You must confirm task name to delete the task.');
			} else if (values.task !== deletePayload.task_name) {
				errors.task = t("task name  don't match!");
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			dispatch.tasks
				.deleteGeofenceAsync({ poiId: deletePayload.task_unique_id })
				.then(() => {
					showNotification('', t('Task has been successfully deleted'), 'success');
					setTimeout(() => {
						dispatch.tasks.getTasksAsync({
							Name: 1,
							status: 1,
						});
						setShowDelete(false);

						setShowDelete(false); // Hide loading after success
					}, 2000);

					// Success case
				})
				.catch((error: any) => {
					showNotification('', t('Error deleting Task'), 'error');
					setShowDelete(false); // Hide loading even on error
				});
		},
		onReset: () => {},
	});

	// useEffect(() => {

	// 	return ()=> dispatch.tasks.getTasksAsync({});

	// })
	return (
		<div>
			<OffCanvas
				id='delete-vehicule'
				titleId='delete task'
				placement='end'
				isOpen={showDelete}
				setOpen={setShowDelete}>
				<OffCanvasHeader className='ps-2' setOpen={setShowDelete}>
					<OffCanvasTitle
						id='offcanvasExampleLabel'
						tag={'h3'}
						className='border-2 border-bottom w-100'>
						{t('Delete task')}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					<Label className='mb-0'>{t(`task name`)}</Label>
					<div className='d-flex '>
						<FormGroup className='w-100 me-4 my-3'>
							<Input value={deletePayload.task_name} readOnly />
						</FormGroup>

						<Button onClick={copyToClipboard} size={'lg'}>
							<Icon
								icon='ContentCopy'
								size='lg'
								color='dark'
								forceFamily={'material'}
							/>
						</Button>
					</div>
					<Card>
						<CardBody className='p-3'>
							<p className='w-100 fw-semibold d-flex flex-row align-items-center'>
								{t(`Type the task name for delete confirmation`)}
							</p>
							<div className='col-12 d-flex'>
								<FormGroup id='deleteConfirmation' className='w-100 me-4'>
									<Input
										name='task'
										id='task'
										onChange={formik.handleChange}
										value={formik.values.task}
										invalidFeedback={formik.errors.task}
										isTouched={formik.touched.task}
										isValid={formik.isValid}
									/>
								</FormGroup>
								<div className={`d-flex`}>
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
						</CardBody>
					</Card>
				</OffCanvasBody>
			</OffCanvas>
		</div>
	);
};

export default DeleteTask;
