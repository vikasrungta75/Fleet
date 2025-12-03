import React, { useContext, useRef, useState } from 'react';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../../components/extras/Chart';
import { chartOptions, columnsAlarmDataTable, DUMMY_DATA } from '../OverviewConstant';
import { useTranslation } from 'react-i18next';
import Alert from '../../../components/bootstrap/Alert';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import Spinner from '../../../components/bootstrap/Spinner';
 
type OverviewVehicleUsageProps = React.PropsWithChildren<{
    data: any[];
    setSortOrder: React.Dispatch<
        React.SetStateAction<{
            [key: string]: number;
        }>
    >;
    sortorder: { [key: string]: number };
}>;
 
const OverviewVehicleUsage = (props: OverviewVehicleUsageProps) => {
    const { data, setSortOrder, sortorder } = props;
    const { mobileDesign } = useContext(ThemeContext);
    const isVehicleUsageLoading = useSelector(
        (state: RootState) => state.loading.effects.overview.getVehicleUsage,
    );
    const { dir } = useSelector((state: RootState) => state.appStore);
 
    const [showChart, setShowChart] = React.useState(false);
 
    const [state, setState] = React.useState<IChartOptions>({
        series: DUMMY_DATA.MONTH.series,
        options: chartOptions,
    });
    const dataArrayMileage = data?.map((value) => {
        return Number(value.mileage);
    });
    const keyArrayMileage = data?.map((value) => {
        return value._id;
    });
 
    const [hoveredRow, setHoveredRow] = useState('');
    const [dataChartOptions, setDataChartOptions] = useState({ vin: [], color: [] });
 
    const optionPie = {
        ...chartOptions,
        chart: {
            ...chartOptions.chart,
            events: {
                click: function () {
                    return null;
                },
                dataPointMouseEnter: (event: any, chartContext: any, config: any) => {
                    setHoveredRow(config.w.config.labels[config.dataPointIndex]);
                    handleScrollToRow(config.w.config.labels[config.dataPointIndex]);
                },
                dataPointMouseLeave: () => {
                    setHoveredRow('');
                },
                mounted: function (ctx: any) {
                    setDataChartOptions({
                        vin: ctx.w.config.labels,
                        color: ctx.w.config.colors,
                    });
                },
            },
        },
        labels: keyArrayMileage,
    };
    const { t } = useTranslation(['overview']);
 
    const tableRef = useRef<HTMLTableElement | null>(null);
 
    const handleScrollToRow = (rowIndex: string) => {
        if (tableRef.current) {
            const element = tableRef.current.querySelector(`#${rowIndex}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };
 
    return (
        <Card className='rounded-2'>
            <p className='table-titles'>{t('Vehicle Usage')}</p>
            <CardBody>
                {data?.length ? (
                    <div className={mobileDesign ? 'col' : 'row'}>
                        <div
                            style={{ height: '280px',overflowY: 'scroll' }}
                            className={`col ${mobileDesign ? 'mb-3' : ''}`}>
                            <table
                                ref={tableRef}
                                className={`table   ${
                                    dir === 'rtl' ? 'table table-modern-rtl' : 'table table-modern'
                                }`}>
                                <thead>
                                    <tr>
                                        {columnsAlarmDataTable.map(({ name, sortable }, index) =>
                                            name !== 'icon' ? (
                                                <th
                                                    key={index}
                                                    onClick={() =>
                                                        sortable && !isVehicleUsageLoading
                                                            ? setSortOrder({
                                                                    ...sortorder,
                                                                    mileage:
                                                                        sortorder.mileage === 1
                                                                            ? -1
                                                                            : 1,
                                                              })
                                                            : null
                                                    }
                                                    scope='col'
                                                    className={
                                                        sortable && !isVehicleUsageLoading
                                                            ? 'cursor-pointer'
                                                            : ''
                                                    }>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexWrap: 'nowrap',
                                                        }}>
                                                        {(`${name}`)}
                                                        {sortable &&
                                                            (!isVehicleUsageLoading ? (
                                                                <Icon
                                                                    size='lg'
                                                                    className='ms-3'
                                                                    style={{
                                                                        transform:
                                                                            sortorder.mileage !== -1
                                                                                ? 'rotate(180deg)'
                                                                                : '',
                                                                    }}
                                                                    icon='FilterList'
                                                                />
                                                            ) : (
                                                                <Spinner
                                                                    size='15px'
                                                                    className='ms-3'
                                                                    color='secondary'
                                                                />
                                                            ))}
                                                    </div>
                                                </th>
                                            ) : (
                                                <th
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}>
                                                    <Icon
                                                        className='cursor-pointer'
                                                        onClick={() => setShowChart(!showChart)}
                                                        size='2x'
                                                        color={showChart ? 'secondary' : 'dark'}
                                                        icon='BarChart'
                                                    />
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.map((item, index) => {
                                        return (
                                            <tr id={item._id} key={item._id}>
                                                <td
                                                    className='d-flex align-items-center'
                                                    style={{
                                                        backgroundColor:
                                                            hoveredRow === item._id
                                                                ? '#d5c5c5b5'
                                                                : 'transparent',
                                                    }}>
                                                    {dataChartOptions.vin[index] === item._id &&
                                                    showChart ? (
                                                        <span
                                                            className='round-badge'
                                                            style={{
                                                                backgroundColor:
                                                                    dataChartOptions.color[index],
                                                            }}
                                                        />
                                                    ) : null}
                                                    {item._id}{' '}
                                                </td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            hoveredRow === item._id
                                                                ? '#d5c5c5b5'
                                                                : 'transparent',
                                                    }}>
                                                    {item.mileage}
                                                </td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            hoveredRow === item._id
                                                                ? '#d5c5c5b5'
                                                                : 'transparent',
                                                    }}
                                                />
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {showChart && (
                            <div className='col-5 d-flex align-items-center'>
                                <Chart
                                    series={dataArrayMileage}
                                    options={optionPie}
                                    type={state.options.chart?.type}
                                    height={state.options.chart?.height}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        style={{ height: '280px' }}
                        className={`col ${mobileDesign ? 'mb-3' : ''}`}>
                        <Alert color='info' className='flex-column w-100 align-items-start'>
                            <p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
                                <Icon icon='Info' size='2x' className='me-2' />{' '}
                                {t('Information : No data available')}
                            </p>
                        </Alert>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};
 
export default OverviewVehicleUsage;