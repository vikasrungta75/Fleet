import React, { FC, useContext, useState, Dispatch, SetStateAction } from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import ThemeContext from '../../../../contexts/themeContext';
import DatePicker from '../../../../components/DatePicker';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { IDateRangeFilter } from '../../../../type/history-type';
import DriverSelect from '../../../common/filters/DriverFilter';
import { useTranslation } from 'react-i18next';

interface IHeaderProps {
	dateRangeFilter: IDateRangeFilter;
	setDateRangeFilter: Dispatch<SetStateAction<IDateRangeFilter>>;
	withDriverSelect: boolean;
	driverUrlName?: string;
	driverFilter?: string;
	setDriverFilter?: any;
	style: React.CSSProperties | string;
}

const Header: FC<IHeaderProps> = ({
	dateRangeFilter,
	setDateRangeFilter,
	withDriverSelect,
	driverUrlName,
	driverFilter,
	setDriverFilter,
}) => {
	// const { preferedTimeZone } = useSelector((state: RootState) => state.auth);
	const { i18n } = useTranslation();
	const { mobileDesign } = useContext(ThemeContext);

	return (
		// <Card>
			// <div className='row' style={{marginTop: "-78px",marginLeft: "56%"}}>
			<div className='row' style={{}}>
				{withDriverSelect && (
					<DriverSelect
						DriverNameFilter={driverFilter ?? 'All Drivers'}
						setDriverNameFilter={setDriverFilter}
						className={`${mobileDesign ? 'col-12 mb-3' : 'col-3'} w-50`}
					/>
				)}

				<DatePicker
					className={`${mobileDesign ? 'col-12' : 'col-3'}`}
					setDateRangeFilter={setDateRangeFilter}
					dateRangeFilter={dateRangeFilter}
					withHours={false}
					position={i18n.language === 'ar-AR' ? 'end' : 'start'}
				/>
			</div>
		// </Card>
	);
};

export default Header;
