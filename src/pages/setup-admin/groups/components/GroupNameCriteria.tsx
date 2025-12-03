import React, { FC } from 'react';
import Icon from '../../../../components/icon/Icon';
import { displayColorIcon, displayIcon } from '../../../../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

interface GroupNameCriteriaProps {
	lengthError: boolean | undefined;
	alphaNumericError: boolean | undefined;
}
const GroupNameCriteria: FC<GroupNameCriteriaProps> = ({ lengthError, alphaNumericError }) => {
	const { t } = useTranslation(['authPage', 'groupsPages']);
	const { dir } = useSelector((state: RootState) => state.appStore);

	const contrains = [
		{
			text: `${t('authPage:min/max', { min: 8, max: 25 })}`,
			hasError: lengthError,
		},
		{ text: `${t('alphaNumeric', { ns: 'authPage' })}`, hasError: alphaNumericError },
	];

	return (
		<div>
			<div className='fw-bold'>{t('Group name must contain', { ns: 'groupsPages' })} : </div>
			<ul className='mt-3 mb-4 ps-0'>
				{contrains.map(({ text, hasError }, index) => {
					return (
						<div key={index}>
							{dir === 'rtl' ? (
								<>
									{text}
									<Icon
										icon={displayIcon(hasError)}
										color={displayColorIcon(hasError)}
										className='me-2'
									/>
								</>
							) : (
								<>
									<Icon
										icon={displayIcon(hasError)}
										color={displayColorIcon(hasError)}
										className='me-2'
									/>
									{text}
								</>
							)}
						</div>
					);
				})}
			</ul>
		</div>
	);
};
export default GroupNameCriteria;
