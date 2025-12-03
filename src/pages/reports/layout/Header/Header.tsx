import React, { FC, useContext, useState } from 'react';
import Button from '../../../../components/bootstrap/Button';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../../contexts/themeContext';
 
import SearchBar from '../../../../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { reportsPage } from '../../../../menu';
import CreateScheduledReport from '../../scheduledReports/CreateScheduledReport';
 
interface IHeaderProps {
    // handleSearchCriteria: (e: any) => void;
    // criteria: string;
    // className?: string;
    className?: string; // make className optional
    handleSearchCriteria: (criteria: string) => void;
    criteria: string;
}
export const Header: FC<IHeaderProps> = ({ handleSearchCriteria, criteria }) => {
    const { t } = useTranslation(['reports']);
    const { mobileDesign } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
 
    return (
        <div className='d-flex justify-content-between w-100'>
            <div className={`d-flex me-4 ${mobileDesign ? 'w-100' : 'w-100'}`} data-tour='search'>
                <SearchBar
                    search={criteria}
                    setSearch={handleSearchCriteria}
                    translation='reports'
                    text={t('Search by...')}
                />
            </div>
            <div className={`d-flex ${mobileDesign ? 'flex-column ' : ' '}`}>
                <Button
                    // color='secondary'
                    isOutline={true}
                    className='outline-btn py-2 me-3 planified-report'
                    style={{ width: 150 }}
                    icon='CalendarToday'
                    onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}>
                    {t('Schedule Report')}
                </Button>
                <Button
                    isOutline={true}
                    className='outline-btn py-2 planified-report'
                    style={{ width: 180 }}
                    icon='FormatListBulleted'
                    onClick={() => navigate(`../${reportsPage.seeScheduledReports.path}`)}>
                    {t('Planified Report List')}
                </Button>
            </div>
 
            {isOpen && (
                <CreateScheduledReport
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    position={{ top: 250, right: 20 }}
                />
            )}
            {/*
          <div className="d-flex align-items-center">
     
            <Button
                icon='CalendarToday'
                color='white'
                style={{marginRight: 10}}
                className={`py-3 mb-0 border ${mobileDesign ? 'w-100' : 'w-20 '}`}>
                {t('Create new report')}
            </Button>
            <Button
                icon='Add'
                color='secondary'
                className={`py-3 mb-0  ${mobileDesign ? 'w-100' : 'w-20 '}`}>
                {t('Create new report')}
            </Button>
 
        </div>
     
     
      */}
        </div>
    );
};
 
export default Header;
 
 
