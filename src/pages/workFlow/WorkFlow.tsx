import React, { FC, useContext, useEffect, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { TasksPages } from '../../menu';
import { useTranslation } from 'react-i18next';
import Page from '../../layout/Page/Page';
import Button from '../../components/bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../store/store';
import SimpleDataTableSort from './components/SimpleDataTableSort';
import { columnsTaskmonitoring } from './components/WorkFlowConstant';
import i18n from '../../i18n';
 
interface IMaintenanceDashboard {}
 
const WorkFlow: FC<IMaintenanceDashboard> = () => {
    const { t } = useTranslation(['vehicles']);
    const navigate = useNavigate();
    const { mobileDesign } = useContext(ThemeContext);
    const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);
 
    const [sortorder, setSortOrder] = useState<{ [key: string]: number }>({
        poi_name: 1,
        status: 1,
    });
 
    const {
        user: {
            user: { userName },
        },
    } = store.getState().auth;
 
    const dispatch = useDispatch();
 
    useEffect(() => {
        dispatch.tasks.getTasksAsync({
            Name: sortorder.poi_name,
            status: sortorder.status,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortorder]);
 
    const tasks = useSelector((state: RootState) => state.tasks.tasks);
 
    const { getTasksAsync: igetTasksAsynckDataLoading } = useSelector(
        (state: RootState) => state.loading.effects.tasks,
    );
 
    return (
        <PageWrapper isProtected={true}>
            <Page className='mw-100 px-3'>
                <div className='mw-100 mb-3'>
                    <div
                        className={
                            !mobileDesign
                                ? 'd-flex justify-content-between align-items-center col-12'
                                : ''
                        }>
                        <div id='vehicle_usage'>
                            <div className='d-flex align-items-center bd-highlight mb-3'>
                                <div className='flex-fill bd-highlight fs-4 fw-semibold content-heading'>
                                    {t('Task Monitoring ')}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex   '>
                            <Button
                                icon='Add'
                                color='dark'
                                onClick={() => {
                                    navigate(`../${TasksPages.addTasks.path}`);
                                    setTimeout(() => {
                                        dispatch.appStoreNoPersist.clearStore();
                                    }, 0);
                                }}>
                                {t('Create new task')}
                            </Button>
                        </div>
                    </div>
                </div>
                <SimpleDataTableSort
                    height={350}
                    displayFullData={false}
                    data={tasks}
                    columns={columnsTaskmonitoring}
                    sortorder={sortorder}
                    setSortOrder={setSortOrder}
                    isLoading={igetTasksAsynckDataLoading}
                    sortField='ss'
                />
            </Page>
        </PageWrapper>
    );
};
 
export default WorkFlow;