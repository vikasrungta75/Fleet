import { ThemeProvider } from 'react-jss';
import React, { FC, ReactNode, useContext, useRef } from 'react';
import { ToastProvider } from 'react-toast-notifications';
import ThemeContext from '../../../../contexts/themeContext';

interface ILayoutProps {
	children: ReactNode;
}

const ReportWrapper: FC<ILayoutProps> = ({ children }) => {
	const { leftRepportMenuElement } = useContext(ThemeContext);

	return (
			<div  className={`d-flex flex-row  menu-closed py-2`}>
				{/* <div className={`d-flex flex-row ${leftRepportMenuElement ? "menu-open" : "menu-closed"}`}> */}
				{/* <div className='menu m-2'>{children[0]}</div> */}

				<div className='w-100 mx-0'>{children}</div>
			</div>
	);
};

export default ReportWrapper;
