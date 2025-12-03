import React, { FC, useState, useEffect } from 'react';
import FieldsGenerator from '../../../../components/FieldsGenerator';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import Input from '../../../../components/bootstrap/forms/Input';
import PersonnalizeProgrammer from './PersonnalizeProgrammer';
import { FormikValues } from 'formik';
import { options, scheduledReportFields } from '../../constant/constant';
import { useCategoryRecord } from '../../../../services/vehiclesService';
import { extractReportNames } from '../../../../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

interface IBasicScheduledReportFormProps {
	formik: FormikValues;
	selectedDays: string[];
	setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
	setSelectedDaysPersonnalize?: React.Dispatch<React.SetStateAction<string[]>>;
	selectedDaysPersonnalize?: string[];
}

const BasicScheduledReportForm: FC<IBasicScheduledReportFormProps> = ({
	formik,
	selectedDays,
	setSelectedDays,
	setSelectedDaysPersonnalize,
	selectedDaysPersonnalize,
}) => {
	const [edit, setEdit] = useState(true);
	const [selectOptions, setSelectOptions] = useState<any>(options);
	const { permissions } = useSelector((state: RootState) => state.auth);

	const { data } = useCategoryRecord();
	const { t } = useTranslation(['reports']);

	useEffect(() => {
		if (selectOptions.reports.length === 0 && data) {
			setSelectOptions({ ...selectOptions, reports: extractReportNames(data, permissions) });
		}
	}, [data, selectOptions.reports, permissions, selectedDays, selectOptions]);

	const handleDayClick = (day: string) => {
		setSelectedDays((prevSelectedDays) => {
			let updatedDays;
			if (prevSelectedDays.includes(day)) {
				updatedDays = prevSelectedDays.filter((d) => d !== day);
			} else {
				updatedDays = [...prevSelectedDays, day];
			}
			formik.setFieldValue('controlDays', updatedDays);
			return updatedDays;
		});
	};

	useEffect(() => {
		// Update selected days when "Everyday" is selected
		if (formik.values.frequency === 'Everyday') {
			setSelectedDays(options.days);
		}
	}, [setSelectedDays, formik.values.frequency]);

	return (
		<>
			<FieldsGenerator
				data={scheduledReportFields}
				selectOptions={selectOptions}
				formik={formik}
				edit={edit}
				setEdit={setEdit}
				isEditable={true}
				translation="reports"
			/>

			<FormGroup className={`field-card mb-3 col-12`} label={t('Control days')} id="Control days">
				<div className="d-flex align-items-center">
					{selectOptions.days.map((day: string, index: number) => (
						<span
							key={index}
							className={`days-scheduled ${selectedDays?.includes(day) ? 'active' : ''}`}
							onClick={() => handleDayClick(day)}>
							{t(day).charAt(0)}
						</span>
					))}
				</div>
			</FormGroup>

			{formik.values.frequency !== 'Pick a frequency from the list' && (
				<FormGroup className={`field-card mb-3 col-12`} label={t('Settings')} id="settings">
					<div className="d-flex align-items-center">
						{(formik.values.frequency.includes('week') || formik.values.frequency.includes('month')) && (
							<>
								<div className="col-2 d-flex justify-content-center">{t('Every')}</div>
								<div className={`${formik.values.frequency.includes('month') ? 'col-3' : 'col-5'}`}>
									<Select
										className=""
										isLoading={false}
										disabled={false}
										ariaLabel="choosenDay"
										id="choosenDay"
										name="choosenDay"
										placeholder={t('Select')}
										size="lg"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											formik.setFieldValue('choosenDay', e.target.value);
										}}
										value={formik.values.choosenDay}
										isValid={formik.isValid}>
										{(formik.values.frequency.includes('week')
											? selectOptions.days
											: selectOptions.daysCount
										)?.map((option: string) => (
											<Option key={option} value={option}>
												{t(option)}
											</Option>
										))}
									</Select>
								</div>
							</>
						)}
						<div className={`d-flex justify-content-center ${formik.values.frequency.includes('month') ? 'col-3' : 'col-1'}`}>
							{t(formik.values.frequency.includes('month') ? 'of month at' : 'At')}
						</div>
						<div className="col-4">
							<Input
								value={formik.values.time}
								id="time"
								name="time"
								type="time"
								onChange={formik.handleChange}
							/>
						</div>
					</div>
				</FormGroup>
			)}

			{formik.values.frequency === 'Personnalize' && (
				<PersonnalizeProgrammer
					formik={formik}
					setSelectedDaysPersonnalize={setSelectedDaysPersonnalize || setSelectedDays}
					selectedDays={selectedDaysPersonnalize || selectedDays}
					selectOptions={selectOptions}
					setDeploy={() => true} setSelectedDays={function (value: React.SetStateAction<string[]>): void {
						throw new Error('Function not implemented.');
					}}
				/>
			)}
		</>
	);
};

export default BasicScheduledReportForm;
