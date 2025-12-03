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
import Icon from '../../../components/icon/Icon';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Label from '../../../components/bootstrap/forms/Label';

interface IDeleteDriver {
	setShowDelete: (val: boolean) => void;
	refetch : any
	showDelete: boolean;
	handleDelete: any;
	driverName?: string,
}

const DeleteDriver: FC<IDeleteDriver> = ({
	setShowDelete,
	showDelete,
	handleDelete,
	driverName,
	refetch
}) => {
	const { t } = useTranslation(['driversPage']);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(driverName as string);
	};

	// handle form
	const formik = useFormik({
		initialValues: {
			driver_name: '',
		},

		validate: (values) => {
			const errors: {
				driver_name?: string;
			} = {};

			// validate of VIN

			if (!values.driver_name) {
				errors.driver_name = t('You must confirm driver name to delete the driver.');
			} else if (values.driver_name !== driverName) {
				errors.driver_name = t("driver name  don't match!");
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

		return ()=>refetch();

	})


	return (
		<div>
			<OffCanvas
				id='delete-vehicule'
				titleId='delete driver'
				placement='end'
				isOpen={showDelete}
				setOpen={setShowDelete}>
				<OffCanvasHeader className='ps-4' setOpen={setShowDelete}>
					<OffCanvasTitle
						id='offcanvasExampleLabel'
						tag={'h3'}
						className='task-heading'>
						{t('Delete Driver')}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					<Label className='mb-0'>{t(`Driver name`)}</Label>
					<div className='d-flex '>
						<FormGroup className='w-100 me-4 my-3'>
							<Input value={driverName} readOnly />
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
								{t(`Type the driver name for delete confirmation`)}
							</p>
							<div className='col-12 d-flex'>
								<FormGroup id='deleteConfirmation' className='w-100 me-4'>
									<Input
										name='driver_name'
										id='driver_name'
										onChange={formik.handleChange}
										value={formik.values.driver_name}
										invalidFeedback={formik.errors.driver_name}
										isTouched={formik.touched.driver_name}
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

export default DeleteDriver;
