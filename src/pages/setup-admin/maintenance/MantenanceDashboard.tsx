import React, { FC, useContext, useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader'; // FIX UX-02: Re-enabled
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { dashboardMenu } from '../../../menu';
import { useTranslation } from 'react-i18next';
import Page from '../../../layout/Page/Page';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import Card, { CardBody, CardHeader } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import ThemeContext from '../../../contexts/themeContext';

import DataTable from './components/DataTable';
import {
    useDeleteUpdateMaintenance,
    useGetMaintenanceFinishedValues,
    useGetMaintenanceTasks,
} from '../../../services/maintenanceService';
import NoData from '../../../components/NoData';
import Spinner from '../../../components/bootstrap/Spinner';
import RevisionAddEditForm from './RevisionAddEditForm';
import XLSXLink from '../../common/xlsx-link/XLSXLink';
import Icon from '../../../components/icon/Icon';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, store } from '../../../store/store';
import { useFormik } from 'formik';
import showNotification from '../../../components/extras/showNotification';
import DeleteTask from './components/DeleteTask';
import PaginationButtons, { PER_COUNT } from '../../../components/PaginationButtons';
import GoBack from '../../../components/GoBack';
import { Search } from '../../../components/icon/material-icons';
import SvgSearch from '../../../components/icon/material-icons/Search';
import SvgNoRecords from '../../../components/icon/material-icons/NoRecords';

interface IMaintenanceDashboard {
    onSearch: (query: string) => void;
    goBack?: () => void;
}

const MaintenanceDashboard: FC<IMaintenanceDashboard> = ({ onSearch }) => {
    const { t } = useTranslation(['maintenancePage', 'common']);
    const navigate = useNavigate();
    const { mobileDesign } = useContext(ThemeContext);
    const [localData, setLocalData] = useState<any[]>([]);




    const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);

    const { data, isLoading, refetch, isError, isRefetching = false, } = useGetMaintenanceTasks(filterTaskState, { refetchOnMountOrArgChange: true, });
    const shouldShowData = !isLoading && !isRefetching && Array.isArray(localData) && localData.length > 0;

    const [showForm, setShowForm] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState(false);
    const [finishedValues, setFinishedValues] = useState<Array<string>>([]);
    const permissions = useSelector((state: RootState) => state.auth?.permissions);
    const dispatch = useDispatch();

    const goBack = () => {
        dispatch.appStoreNoPersist.changeFilterMaintenance({
            vin_filter: 'All',
            status_filter: 'All',
            sort: 1,
            sortField: 'vin',
        });
    };

    const [deletePayload, setDeletePayload] = useState();
    const {
        user: {
            user: { userName },
        },
    } = store.getState().auth;

    const formik = useFormik({
        initialValues: {
            checkedList: [],
        },
        onSubmit: (values) => {
            setFinishedValues(getVinOrMst('vin'));
        },
    });
    const getMaintenanceTasks = useGetMaintenanceFinishedValues({
        vin: finishedValues,
    });

    const getAllMstVins = () => {
        return data.map((item: any, index: number) =>
            JSON.stringify({ vin: item.vin, mst_id: item.mst_id }),
        );
    };

    const handleCheckAll = (event: any) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            formik.setFieldValue('checkedList', [...getAllMstVins()]);
        } else {
            formik.setFieldValue('checkedList', []);
        }
    };

    const getVinOrMst = (key: 'vin' | 'mst_id') => {
        const values = formik.values.checkedList.map((item: string, index) => {
            return JSON.parse(item)[key];
        });
        return values;
    };
    const CudMaintenance = useDeleteUpdateMaintenance();
    const deleteMaintenance = useDeleteUpdateMaintenance();

    const handleDeleteTask = () => {
        setShowDelete(true);
    };

    useEffect(() => {
        if (formik.values.checkedList.length > 0 && getMaintenanceTasks.isSuccess) {
            CudMaintenance.mutate({
                revision: {
                    finished: getMaintenanceTasks.data?.map((item: any) => ({
                        date: item.date,
                        engine_hours: Number(item.engine_hours),
                        mileage: Number(item.mileage),
                    })),
                    mst_id: getVinOrMst('mst_id'),
                },
                action: 'update maintenance task',
            });
            showNotification('', t('task has been marked as finished successfully'), 'success');
            formik.setFieldValue('checkedList', []);
            setFinishedValues([]);
            setTimeout(() => {
                refetch();
            }, 2000);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getMaintenanceTasks.isSuccess]);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterTaskState]);

    useEffect(() => {
        if (Array.isArray(data)) {
            setLocalData(data);
        }
        if (isError && !isLoading && !isRefetching) {
            setLocalData([]);
        }
    }, [data, isError, isLoading, isRefetching]);

    // useEffect(() => {
    //     refetch();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    useEffect(() => {
        if (isRefetching) {
            setLocalData([]);
        }
    }, [isRefetching]);

    // useEffect(() => {
    //     if (formik.values.checkedList.length > 0 && deleteMaintenance.isSuccess) {
    //         showNotification('', t('maintenance task successfully deleted'), 'success');
    //         formik.setFieldValue('checkedList', []);
    //         setFinishedValues([]);
    //         setShowDelete(false);
    //         refetch();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [deleteMaintenance.isSuccess]);

    const [perPage, setPerPage] = useState(PER_COUNT['5']);
    const [currentPage, setCurrentPage] = useState(1);

    const [query, setQuery] = useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
    };

    const handleClick = () => {
        let value = query;
        onSearch(value);
        dispatch.appStoreNoPersist.changeFilterMaintenance({
            ...filterTaskState,
            vin_filter: value !== '' ? value : 'All',
        });
    };

    // const handlePrint = () => {
    //     const printWindow = window.open('', '', 'height=600,width=800');

    //     // Copy the table HTML structure
    //     const tableHtml = document.querySelector('.overall-card .table-responsive')?.innerHTML;

    //     // Open the print window and write the required HTML
    //     printWindow?.document.write('<html><head><title>Maintenance List</title>');

    //     // Add styles for the print view
    //     printWindow?.document.write(`
    //         <style>
    //             body { font-family: Arial, sans-serif; }
    //             table { width: 100%; border-collapse: collapse; }
    //             th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
    //             th { background-color: #f2f2f2; }
    //         </style>
    //     `);

    //     printWindow?.document.write('</head><body>');
    //     printWindow?.document.write('<h3>Maintenance Tasks</h3>');

    //     // Add the table HTML to the print window
    //     printWindow?.document.write(tableHtml || '');

    //     printWindow?.document.write('</body></html>');
    //     printWindow?.document.close();
    //     printWindow?.print();
    // };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=2000');

        // Copy the table HTML structure
        const tableHtml = document.querySelector('.overall-card .table-responsive')?.innerHTML;

        // Open the print window and write the required HTML
        printWindow?.document.write('<html><head><title>Maintenance List</title>');

        // Add styles for the print view
        printWindow?.document.write(`
            <style>
                body { font-family: Open Sans; text-align: center; }
                table { width: 100% ;border:1px solid #ddd;border-collapse: collapse;}
                th, td { padding: 12px; border:1px solid #ddd }
                th { background-color: #f2f2f2; white-space: nowrap; width: auto;text-align: center;}
            </style>
        `);

        printWindow?.document.write('</head><body>');
        printWindow?.document.write('<h3>Maintenance Tasks</h3>');

        // Add the table HTML to the print window
        printWindow?.document.write(tableHtml || '');

        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
    };

    return (
        <PageWrapper isProtected={true} title={dashboardMenu.maintenance.text}>
            {/* FIX UX-02: Re-enabled breadcrumb navigation */}
            <SubHeader>
                <SubHeaderLeft>
                    <Breadcrumb
                        list={[
                            { title: 'Setup', to: '/setup' },
                            { title: dashboardMenu.maintenance.text, to: `/${dashboardMenu.maintenance.path}` },
                        ]}
                    />
                </SubHeaderLeft>
            </SubHeader>
            <Page className="mw-100 px-0">
                <div className="d-flex mt-n2 justify-content-between">
                    <div className="fs-2 pb-3 mb-4 fw-semibold content-heading">
                        <GoBack handleClick={goBack} />
                        <p style={{ margin: "-30px 0px 0 40px" }}>{t("Vehicle Health Maintenance")}</p>
                        <div className="d-flex justify-content-between"></div>
                    </div>
                    <div>
                        {formik.values.checkedList.length > 0 ? (
                            <div className="d-flex justify-content-between " style={{ width: 230 }}>
                                {permissions?.delete_maintenance && (
                                    <Button
                                        icon="DeleteOutline"
                                        size="lg"
                                        className={`btn`}
                                        onClick={handleDeleteTask}
                                    />
                                )}
                                {permissions?.update_maintenance && (
                                    <Button
                                        icon="CheckCircleOutline"
                                        color="dark"
                                        className={`py-3 mb-0  ${mobileDesign ? 'w-100' : 'w-20 '}`}
                                        onClick={formik.handleSubmit}
                                    >
                                        {t('markAsFinished')}
                                        {getMaintenanceTasks.isLoading && (
                                            <Spinner isSmall inButton className="ms-2" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="d-flex justify-content-between" style={{ maxWidth: 400, height: 35 }}>
                                {data?.length > 0 && (
                                    <div className="d-flex align-items-center">
                                        <div className="search-container">
                                            <Button
                                                icon="Search"
                                                size="lg"
                                                className={`btn `}
                                                onClick={handleClick}
                                            />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={handleChange}
                                                placeholder="Search by..."
                                                className="search-bar"
                                            />
                                        </div>
                                        <Button
                                            size="lg"
                                            style={{ textDecoration: 'none', paddingRight: 0, position: 'relative', marginRight: -17 }}
                                            className="btn border-0"
                                            onClick={handlePrint}
                                        >
                                            <Icon icon="Print" className="pdf-link" size={'2x'} />
                                        </Button>
                                        <XLSXLink
                                            style={{ textDecoration: 'none' }}
                                            className="xlsx-button btn border-0"
                                            filename={'maintenance-list'}
                                            data={data}
                                        >
                                            <Icon icon="Download" size={'2x'} />
                                        </XLSXLink>
                                    </div>
                                )}
                                {permissions?.create_maintenance && (
                                    <Button
                                        icon="Add"
                                        color="dark"
                                        className={`crt-task ${mobileDesign ? 'w-100' : 'w-20 '}`}
                                        onClick={setShowForm}
                                    >
                                        {t('Create Task')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Card className="overall-card mt-1" style={{ marginTop: '0.4rem !important' }}>
                    <CardBody className="table-responsive p-0">
                        {permissions?.see_all_maintenance ? (
                            shouldShowData ? (
                                <DataTable
                                    withCheckbox={permissions?.delete_maintenance}
                                    items={localData}
                                    values={formik.values.checkedList}
                                    handleCheck={formik.handleChange}
                                    handleCheckAll={handleCheckAll}
                                    currentPage={currentPage}
                                    perPage={perPage}
                                />
                            ) : isLoading || isRefetching ? (
                                <div
                                    className={
                                        mobileDesign
                                            ? 'd-flex justify-content-center pt-3'
                                            : 'cover-spin my-3'
                                    }
                                >
                                    <Spinner className="spinner-center" color="secondary" size="1rem" />
                                </div>
                            ) : (
                                <NoData
                                    text={
                                        <div className="noReports-found d-flex justify-content-between">
                                            <SvgNoRecords />
                                        </div>
                                    }
                                    withCard={false}
                                />
                            )
                        ) : (
                            <NoData text={t('permission_error')} withCard={false} />
                        )}

                    </CardBody>

                </Card>
                {data?.length > 0 && perPage === 5 && (
                    <PaginationButtons
                        data={localData}
                        label="items"
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                        perPage={perPage}
                        setPerPage={setPerPage}
                    />
                )}
                {showForm && (
                    <RevisionAddEditForm
                        refetch={refetch}
                        showForm={showForm}
                        setShowForm={setShowForm}
                    />
                )}
                {showDelete && (
                    <DeleteTask
                        refetch={refetch}
                        showDelete={showDelete}
                        setShowDelete={setShowDelete}
                        userName={userName}
                        handleDelete={() => {
                            const deletedIds = getVinOrMst('mst_id');

                            deleteMaintenance.mutate(
                                {
                                    revision: { mst_id: deletedIds },
                                    action: 'delete maintenance task',
                                },
                                {
                                    onSuccess: () => {
                                        showNotification(
                                            '',
                                            t('maintenance task successfully deleted'),
                                            'success'
                                        );
                                        setLocalData(prev =>
                                            prev.filter(item => !deletedIds.includes(item.mst_id))
                                        );


                                        formik.setFieldValue('checkedList', []);
                                        setFinishedValues([]);
                                        setShowDelete(false);

                                        // ✅ CRITICAL FIX: RESET FILTER + REFRESH
                                        dispatch.appStoreNoPersist.changeFilterMaintenance({
                                            vin_filter: 'All',
                                            status_filter: 'All',
                                            sort: 1,
                                            sortField: 'vin',
                                        });

                                        // ✅ Force API re-sync
                                        setTimeout(() => {
                                            refetch();
                                        }, 0);
                                    },
                                }
                            );
                        }}

                    />
                )}

            </Page>
        </PageWrapper>
    );
};

export default MaintenanceDashboard;