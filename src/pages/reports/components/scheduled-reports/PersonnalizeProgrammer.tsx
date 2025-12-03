import React, { ChangeEvent, FC } from 'react';
import Input from '../../../../components/bootstrap/forms/Input';
import { useTranslation } from 'react-i18next';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import { FormikValues } from 'formik';
interface IPersonnalizeProgrammerProps {
	setDeploy: (bool: boolean) => void;
	formik: FormikValues;
	selectOptions: any;
	setSelectedDaysPersonnalize?: React.Dispatch<React.SetStateAction<string[]>>;
	selectedDaysPersonnalize?: string[];
	selectedDays: string[]; // Add selectedDays as a prop here
	setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
}

const PersonnalizeProgrammer: FC<IPersonnalizeProgrammerProps> = ({
	setDeploy,
	formik,
	selectOptions,
	setSelectedDaysPersonnalize,
	selectedDaysPersonnalize,
	selectedDays,
	setSelectedDays,
}): JSX.Element => {
	const { t } = useTranslation(['reports']);

	const handleDayClick = (day: string) => {
		if (setSelectedDaysPersonnalize) {
			setSelectedDaysPersonnalize((prevSelectedDaysPersonnalize) => {
				let updatedDays;
				if (prevSelectedDaysPersonnalize.includes(day)) {
					updatedDays = prevSelectedDaysPersonnalize.filter((d) => d !== day);
				} else {
					updatedDays = [...prevSelectedDaysPersonnalize, day];
				}
				// Mettre à jour le champ choosenDay après la mise à jour de selectedDaysPersonnalize
				formik.setFieldValue('choosenDay', updatedDays);
				return updatedDays; // Retourner la valeur mise à jour de selectedDaysPersonnalize
			});
		}
	};

	return (
		<>
			<div className='d-flex align-items-center col-12 mb-3'>
				<div className='col-3 d-flex justify-content-start ps-3'>{t('Repeat on')}</div>
				{selectOptions.days.map((day: string, index: number) => (
					<span
						key={index}
						className={`days-scheduled repeatOnDays ${selectedDays?.includes(day) ? 'active' : ''
							}`}
						onClick={() => handleDayClick(day)}>
						{day.charAt(0)}
					</span>
				))}
			</div>

			<div className='d-flex align-items-center col-12 mb-3' onClick={() => setDeploy(true)}>
				<div className='col-3 d-flex justify-content-start ps-3'>{t('Over')}</div>
				<div className='col-2'>
					<Input
						type='number'
						name='over'
						id='over'
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							formik.setFieldValue('over', e.target.value);
						}}
						defaultValue={formik.values.over}
						value={formik.values.over}
						min={1}
						max={30}
						step={1}
						invalidFeedback={formik.errors.over}
						isTouched={formik.touched.over}
						isValid={formik.isValid}
					/>
				</div>
				<div className='col-4 field-card ms-2'>
					<Select
						className=''
						isLoading={false}
						disabled={false}
						ariaLabel='overFrequency'
						id='overFrequency'
						name='overFrequency'
						placeholder={t('Select')}
						size='lg'
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							formik.setFieldValue('overFrequency', e.target.value);
						}}
						value={formik.values.overFrequency}
						isValid={formik.isValid}>
						{selectOptions.overFrequencies?.map((option: any) => {
							return (
								<Option key={option} value={option}>
									{`${t(option)}${formik.values.over > 1 ? 's' : ''}`}
								</Option>
							);
						})}
					</Select>
				</div>
			</div>
		</>
	);
};

export default PersonnalizeProgrammer;
