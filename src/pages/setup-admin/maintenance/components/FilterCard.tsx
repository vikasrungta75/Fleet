import React, { FC, ReactNode, useState } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import { sortOptions } from '../maintenanceConstants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import useOutsideClick from '../hook/useOutsideClick';
 
interface ISelectedFilter {
    name: string;
    position: number;
}
interface IFilterCard {
    selectedFilter: ISelectedFilter;
    children: ReactNode;
    setheaderFilterSelected: (val: ISelectedFilter) => void;
}
 
const FilterCard: FC<IFilterCard> = ({ selectedFilter, children, setheaderFilterSelected }) => {
    const { filterTaskState } = useSelector((state: RootState) => state.appStoreNoPersist);
    const [sortSelected, setsortSelected] = useState('');
    const dispatch = useDispatch();
 
    const handleClickOutside = () => {
        if (selectedFilter.name === '') {
            setheaderFilterSelected({ name: '', position: 0 });
        }
    };
    const ref = useOutsideClick(handleClickOutside);
 
    return (
        <Card
            ref={ref}
            style={{
                position: 'absolute',
                width: '325px',
                top: 0,
                zIndex: 10,
                left: `${selectedFilter.position}%`,
                borderRadius: 0,
            }}>
            <CardHeader
                className='maintenance_card_header d-flex bd-highlight'
                style={{ borderRadius: 0, height: 40 }}>
                <span>{selectedFilter.name}</span>
 
                <div className='p-2 flex-shrink-1 bd-highlight'>
                    <Icon
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setheaderFilterSelected({ name: '', position: 0 });
                        }}
                        icon={'Close'}
                        size='lg'
                        className='me-2'
                    />
                </div>
            </CardHeader>
            <CardBody className='d-flex flex-column bd-highlight p-0' style={{ borderRadius: 0 }}>
               
                {sortOptions.map(({ name, value, key, icon }) => {
                    debugger
                    return (
                        <div
                            className={`${selectedFilter.name === sortSelected ? 'selected' : ''} sort-tab p-3 bd-highlight`}
                            key={key}
                            onClick={() => {
                                if (selectedFilter.name === sortSelected) {
                                    setsortSelected('');
                                } else setsortSelected(name);
                                // if the user click in status header
                                if (selectedFilter.name === 'Status') {
                                    dispatch.appStoreNoPersist.changeFilterMaintenance({
                                        ...filterTaskState,
                                        sort: value,
                                        sortField: 'status',
                                    });
                                }
                                // if the user click in Maintenance work header
                                if (selectedFilter.name === 'Maintenance work') {
                                    dispatch.appStoreNoPersist.changeFilterMaintenance({
                                        ...filterTaskState,
                                        sort: value,
                                        sortField: 'work',
                                    });
                                }
                                // if the user click in Vehicle header
                                if (selectedFilter.name === 'Vehicle') {
                                    dispatch.appStoreNoPersist.changeFilterMaintenance({
                                        ...filterTaskState,
                                        sort: value,
                                        sortField: 'vin',
                                    });
                                }
                            }}>
                            <Icon icon={icon} size='lg' className='me-2' />
                            <span>{name}</span>
                        </div>
                    );
                })}
                {children && <hr className='mt-0' />}
                {children}
            </CardBody>
        </Card>
        // <div className="maintenance-filter-card">
        //     <div className="maintenance-filter-card-header">
        //         <p className="maintenance-filter-card-title">
        //             {title}
        //         </p>
        //     </div>
        //     <div className="maintenance-filter-card-body">
        //             {children}
        //     </div>
        // </div>
    );
};
 
export default FilterCard;