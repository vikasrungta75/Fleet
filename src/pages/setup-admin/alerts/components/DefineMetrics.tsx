import React, { FC, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import Select from '../../../../components/bootstrap/forms/Select';
import ThemeContext from '../../../../contexts/themeContext';
import { RootState } from '../../../../store/store';
import { IOperands } from '../../../../type/alert-types';
import AlarmTypeSelect from '../../../common/filters/AlarmTypeSelect';
import AlarmTypeSelectCreateAlerte from '../../../common/filters/AlarmTypeSelectCreateAlerte';

interface IDefineMetricsProps {
	isEditing?: boolean;
	formik: any;
	hasSign: string[];
}
const DefineMetrics: FC<IDefineMetricsProps> = ({ isEditing, formik, hasSign }): JSX.Element => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['alertNotification', 'vehicles']);
	const dispatch = useDispatch();
	const permissions = useSelector((state: RootState) => state.auth?.permissions);
	const { getAlarmOperands: isOperandsLoading } = useSelector(
		(state: RootState) => state.loading.effects.alertsNotifications,
	);
	const [selectOptions, setSelectOptions] = useState<IOperands[]>([]);

	const durations = ['is', 'under', 'above'];
	const durationsValue = ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
	const durationMetrics = ['min.', 'sec.', 'h.'];

	// useEffect(() => {
	// 	if (formik.values.alarm.length > 0) {
	// 		const payload = { alarm_type: formik.values.alarm };
	// 		dispatch.alertsNotifications.getAlarmOperands(payload).then((res: IOperands[]) => {
	// 			setSelectOptions(res);
	// 			if (!isEditing) {
	// 				formik.setFieldValue('value', '');
	// 				formik.setFieldValue('duration_type', '');
	// 				formik.setFieldValue('duration_value', '');
	// 				formik.setFieldValue('duration_unit', '');
	// 				formik.setFieldValue('sign', res[0].operands);
	// 			}
	// 		});
	// 	} else {
	// 		setSelectOptions([]);
	// 		formik.setFieldValue('sign', '');
	// 	}
	// 	if (!hasSign.includes(formik.values.alarm)) {
	// 		formik.setFieldValue('value', '');
	// 		formik.setFieldValue('sign', '');
	// 	}
	// 	if (formik.values.alarm === 'Temperature' && !isEditing) {
	// 		formik.setFieldValue('duration_type', durations[0]);
	// 		formik.setFieldValue('duration_value', durationsValue[0]);
	// 		formik.setFieldValue('duration_unit', durationMetrics[0]);
	// 	}
	// 	// if (isEditing) {
	// 	// 	dispatch.alertsNotifications
	// 	// 		.getAlarmEmails({ alarm: formik.values.alarm })
	// 	// 		.then((emails: IAlarmEmails[]) => {
	// 	// 			setFormValues([...emails.map(({ email }) => email)]);
	// 	// 		});
	// 	// }
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [formik.values.alarm]);

	useEffect(() => {
		if (formik.values.alarm.length > 0) {
		  const payload = { alarm_type: formik.values.alarm };
		  dispatch.alertsNotifications
			.getAlarmOperands(payload)
			.then((res: IOperands[] | undefined) => {
			  if (Array.isArray(res) && res.length > 0) {
				setSelectOptions(res);
				if (!isEditing) {
				  formik.setFieldValue('value', '');
				  formik.setFieldValue('duration_type', '');
				  formik.setFieldValue('duration_value', '');
				  formik.setFieldValue('duration_unit', '');
				  formik.setFieldValue('sign', res[0].operands);
				}
			  } else {
				// fallback when API returns nothing
				setSelectOptions([]);
				formik.setFieldValue('sign', '');
			  }
			})
			.catch(() => {
			  // handle API error
			  setSelectOptions([]);
			  formik.setFieldValue('sign', '');
			});
		} else {
		  setSelectOptions([]);
		  formik.setFieldValue('sign', '');
		}
	  
		if (!hasSign.includes(formik.values.alarm)) {
		  formik.setFieldValue('value', '');
		  formik.setFieldValue('sign', '');
		}
	  
		if (formik.values.alarm === 'Temperature' && !isEditing) {
		  formik.setFieldValue('duration_type', durations[0]);
		  formik.setFieldValue('duration_value', durationsValue[0]);
		  formik.setFieldValue('duration_unit', durationMetrics[0]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, [formik.values.alarm]);
	  

	return (
		<Card className='mt-4 mb-5' style={{ borderRadius: "8px" }}>
			<CardBody>
				<FormGroup
					className={` ${mobileDesign ? '' : 'mb-3 d-flex justify-content-satrt row'}`}>
					<FormGroup
						className={` ${mobileDesign ? 'col-12' : 'col-2'}`}
						label={t('Metric')}
						labelClassName='text-dark fw-bold label-required'>
						{!isEditing ? (
							<AlarmTypeSelectCreateAlerte
								alarmFilter={formik.values.alarm}
								setalarmFilter={(e: any) => formik.setFieldValue('alarm', e)}
							/>
						) : (
							<Input name='alarm' value={t(formik.values.alarm)} disabled />
						)}
					</FormGroup>
					<FormGroup
						className={`${mobileDesign ? 'col-12 mt-2' : 'col-1'}`}
						label={t('is')}
						labelClassName={`text-dark fw-bold ${hasSign.includes(formik.values.alarm) && 'label-required'
							}`}>
						{permissions?.update_alert ? (
							<Select
								disabled={selectOptions.length === 0 || isOperandsLoading}
								isLoading={isOperandsLoading}
								ariaLabel='symbol-select'
								name='sign'
								className='form-control'
								onChange={formik.handleChange}>
								{/* {selectOptions.map(({ operands }, index) => {
									return (
										<option
											value={operands}
											key={index}
											selected={formik.values.sign === operands}>
											{operands}
										</option>
									);
								})} */}
								{Array.isArray(selectOptions) && selectOptions.length > 0 ? (
									selectOptions.map(({ operands }, index) => (
										<option
											key={index}
											value={operands}
											selected={formik.values.sign === operands}
										>
											{operands}
										</option>
									))
								) : (
									<option disabled>No options available</option>
								)}
							</Select>
						) : (
							<Input name='sign' value={formik.values.sign} disabled />
						)}
					</FormGroup>
					<FormGroup
						className={` ${mobileDesign ? 'col-12 mt-2' : 'col-2'}`}
						label={t(formik.values.sign === '><' ? 'start value' : 'value')}
						labelClassName={`text-dark fw-bold ${hasSign.includes(formik.values.alarm) && 'label-required'
							}`}>
						{permissions?.update_alert ? (
							<Input
								disabled={selectOptions.length === 0 || isOperandsLoading}
								onChange={formik.handleChange}
								name='value'
								placeholder={t(
									formik.values.sign === '><'
										? 'Start value is...'
										: 'Value result is...',
								)}
								value={formik.values.value}
							/>
						) : (
							<Input name='value' value={formik.values.value} disabled />
						)}
					</FormGroup>

					{formik.values.alarm === 'Temperature' ? (
						<>
							{formik.values.sign === '><' ? (
								<FormGroup
									className={` ${mobileDesign ? 'col-12 mt-2' : 'col-2'}`}
									label={t('end value')}
									labelClassName={`text-dark fw-bold ${hasSign.includes(formik.values.alarm) && 'label-required'
										}`}>
									{permissions?.update_alert ? (
										<Input
											onChange={formik.handleChange}
											name='end_value'
											placeholder={t('End value is...')}
											value={formik.values.end_value}
										/>
									) : (
										<Input
											name='end_value'
											value={formik.values.end_value}
											disabled
										/>
									)}
								</FormGroup>
							) : (
								<></>
							)}

							<FormGroup
								className={` ${mobileDesign ? 'col-12 mt-2' : 'col-2'}`}
								label={t('when duration')}
								labelClassName={`text-dark fw-bold ${hasSign.includes(formik.values.alarm) && 'label-required'
									}`}>
								{permissions?.update_alert ? (
									<Select
										isLoading={isOperandsLoading}
										ariaLabel='symbol-select'
										name='duration_type'
										className='form-control'
										onChange={formik.handleChange}>
										{durations.map((duration: string, index: number) => {
											return (
												<option
													value={duration}
													key={index}
													selected={
														formik.values.duration_type === duration
													}>
													{t(duration)}
												</option>
											);
										})}
									</Select>
								) : (
									<Input
										name='duration_type'
										value={formik.values.duration_type}
										disabled
									/>
								)}
							</FormGroup>
							<FormGroup
								className={`${mobileDesign ? 'col-12 mt-2 ' : 'col-2'}`}
								label={t('duration value')}
								labelClassName={`text-dark fw-bold ${hasSign.includes(formik.values.alarm) && 'label-required'
									}`}>
								{permissions?.update_alert ? (
									<div className='d-flex gap-3'>
										<Select
											ariaLabel='symbol-select'
											name='duration_value'
											className='form-control'
											onChange={formik.handleChange}>
											{durationsValue.map(
												(duration: string, index: number) => {
													return (
														<option
															value={duration}
															key={index}
															selected={
																formik.values.duration_value ===
																duration
															}>
															{duration}
														</option>
													);
												},
											)}
										</Select>
										<Select
											ariaLabel='symbol-select'
											name='duration_unit'
											className='form-control'
											onChange={formik.handleChange}>
											{durationMetrics.map(
												(duration: string, index: number) => {
													return (
														<option
															value={duration}
															key={index}
															selected={
																formik.values.duration_unit ===
																duration
															}>
															{t(duration)}
														</option>
													);
												},
											)}
										</Select>
									</div>
								) : (
									<div className='d-flex gap-3'>
										<Input
											name='duration_value'
											value={formik.values.duration_value}
											disabled
										/>
										<Input
											name='duration_unit'
											value={formik.values.duration_unit}
											disabled
										/>
									</div>
								)}
							</FormGroup>
						</>
					) : (
						<></>
					)}
				</FormGroup>
				<span style={{ fontSize: 12 }} className='float-end'>
					<span className='text-danger'>*</span> {t('mandatory fields')}
				</span>
			</CardBody>
		</Card>
	);
};

export default React.memo(DefineMetrics);
