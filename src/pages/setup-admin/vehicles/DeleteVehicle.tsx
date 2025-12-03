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
import { useDispatch } from 'react-redux';
import showNotification from '../../../components/extras/showNotification';
import { IVehicle } from '../../../type/vehicles-type';
import { useTranslation } from 'react-i18next';
import Label from '../../../components/bootstrap/forms/Label';

interface IusersSelected {
	setShowDelete: (val: boolean) => void;
	showDelete: boolean;
	idVehicle: string;
	vehicleData: IVehicle[];
	refetch?: any;
	setVehicleData: React.Dispatch<React.SetStateAction<IVehicle[]>>;
}

const DeleteVehicle: FC<IusersSelected> = ({
	setShowDelete,
	showDelete,
	idVehicle,
	vehicleData,
	setVehicleData,
	refetch,
}) => {
	const dispatch = useDispatch();
	const { t } = useTranslation(['vehicles']);

	// handle copy vin number
	const copyToClipboard = () => {
		navigator.clipboard.writeText(idVehicle);
	};

	// handle form
	const formik = useFormik({
		initialValues: {
			vin_no: '',
		},

		validate: (values) => {
			const errors: {
				vin_no?: string;
			} = {};

			// validate of VIN

			if (!values.vin_no) {
				errors.vin_no = t('You must confirm VIN to delete vehicle.');
			} else if (values.vin_no !== idVehicle) {
				errors.vin_no = t("VIN number don't match!");
			}

			return errors;
		},
		validateOnChange: true,

		onSubmit: async (values) => {
			let payloadDeletevehicule = {
				vin_no: values.vin_no,
				action: 'delete',
			};

			await dispatch.fleets
				.deleteVehiculeAsync(payloadDeletevehicule)
				.then((res: boolean) => {
					if (res) {
						showNotification('', t('Vehicle has been successfully deleted'), 'success');
						setShowDelete(false);
						formik.setFieldValue('vin_no', '');
						setVehicleData(
							vehicleData.filter((vehicle: any) => vehicle.vin_no !== idVehicle),
						);
					}
				});
		},

		onReset: () => {},
	});

	useEffect(() => {
		return () => {
			refetch();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			<OffCanvas
				id='delete-vehicule'
				titleId='delete vehicule'
				placement='end'
				isOpen={showDelete}
				setOpen={setShowDelete}>
				<OffCanvasHeader className='p-4' setOpen={setShowDelete}>
					<OffCanvasTitle
						id='offcanvasExampleLabel'
						tag={'h3'}
						className='task-heading'>
						{t('Delete Vehicle')}
					</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody className='px-4'>
					<Label className='mb-0'>{t(`VIN no`)}</Label>
					<div className='d-flex '>
						<FormGroup className='w-100 me-4 my-3'>
							<Input value={idVehicle} readOnly />
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
								{t(`Type the VIN for delete confirmation`)}
							</p>
							<div className='col-12 d-flex'>
								<FormGroup id='deleteConfirmation' className='w-100 me-4'>
									<Input
										name='vin_no'
										id='vin_no'
										onChange={formik.handleChange}
										value={formik.values.vin_no}
										invalidFeedback={formik.errors.vin_no}
										isTouched={formik.touched.vin_no}
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

export default DeleteVehicle;
