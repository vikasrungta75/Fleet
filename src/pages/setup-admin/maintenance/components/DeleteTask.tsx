import React, { FC, useEffect } from 'react';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../../components/bootstrap/OffCanvas';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Input from '../../../../components/bootstrap/forms/Input';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Icon from '../../../../components/icon/Icon';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Label from '../../../../components/bootstrap/forms/Label';

interface IDeleteTask {
	setShowDelete: (val: boolean) => void;
	refetch: any
	showDelete: boolean;
	handleDelete: any;
	userName?: string,
}

const DeleteTask: FC<IDeleteTask> = ({
	setShowDelete,
	showDelete,
	handleDelete,
	userName,
	refetch
}) => {
	const { t } = useTranslation(['maintenancePage']);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(userName as string);
	};

	// handle form
	const formik = useFormik({
		initialValues: {
			user_name: '',
		},

		validate: (values) => {
			const errors: {
				user_name?: string;
			} = {};

			// validate of VIN

			if (!values.user_name) {
				errors.user_name = t('You must confirm username to delete the task.');
			} else if (values.user_name !== userName) {
				errors.user_name = t("user name  don't match!");
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			handleDelete()
		},
		onReset: () => { },
	});

	useEffect(() => {

		return () => refetch();

	})


	return (
		<div>
			<OffCanvas
				style={{borderRadius: "30px 0px 0px 30px"}}
				id='delete-task'
				titleId='delete task'
				placement='end'
				isOpen={showDelete}
				setOpen={setShowDelete}>
				<OffCanvasHeader className='ps-2' setOpen={setShowDelete}>
					<OffCanvasTitle
						id='offcanvasExampleLabel'
						tag={'h3'}
						className='deletetask-heading'>
						{t('Delete Maintenance Task')}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<div className='deleteTask-line'>

				</div>
				<OffCanvasBody>
					<Label className='mb-0'>{t(`user name`)}</Label>
					<div className='d-flex deletetask-card'>
						<FormGroup className='w-100 me-4 my-3'>
							<Input value={userName} readOnly />
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
					<Card className='deletetask-card'>
						<CardBody className='p-3'>
							<p className='w-100 fw-semibold d-flex flex-row align-items-center'>
								{t(`deleteConfirmationPrompt`)}
							</p>
							<div className='col-12 d-flex'>
								<FormGroup id='deleteConfirmation' className='w-100 me-4'>
									<Input
										name='user_name'
										id='user_name'
										onChange={formik.handleChange}
										value={formik.values.user_name}
										invalidFeedback={formik.errors.user_name}
										isTouched={formik.touched.user_name}
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
