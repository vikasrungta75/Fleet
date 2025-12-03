import React, { FC, useState } from "react";
import Button from "../../../../components/bootstrap/Button";
import Icon from "../../../../components/icon/Icon";

interface IList {
    className: string;
    title: string;
    list: Array<any>;
    handleClick: (item: any) => void

}

const List: FC<IList> = ({ className, title, list, handleClick }) => {

    

    const [showList, setShowList] = useState(true)
    return (<>
        {list && list.length > 0 && <div className={`${className}`}>
            <div className="d-flex justify-content-between mb-3 " style={{ cursor: 'pointer' }} onClick={() => setShowList(!showList)}>
                <h5 className="form-font">{title}</h5>
                <Icon icon={showList ? 'KeyboardArrowDown' : "KeyboardArrowUp"} size='md' color='dark' className='me-3' />
            </div>
            <>
                {showList && list?.map((item, index) => (<div key={index} className="d-flex justify-content-between p-0 border-bottom">
                    <p>{item?.user_email}</p>
                    <Button
                        aria-label='delete email'
                        className='mobile-header-toggle me-2 delete-email'
                        size='sm'
                        isLight
                        icon='Close'
                        onClick={() => handleClick(item)}
                    />
                </div>
                ))}
            </>
        </div>}
    </>

    )
}
export default List;