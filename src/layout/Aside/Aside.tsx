import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';
import { motion, MotionStyle } from 'framer-motion';
import Brand from '../Brand/Brand';
import Navigation, { NavigationLine } from '../Navigation/Navigation';
import { dashboardMenu } from '../../menu';
import ThemeContext from '../../contexts/themeContext';
import useAsideTouch from '../../hooks/useAsideTouch';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const Aside = () => {
	const { asideStatus, setAsideStatus, mobileDesign } = useContext(ThemeContext);

	const { asideStyle, touchStatus, hasTouchButton } = useAsideTouch();

	const isModernDesign = process.env.REACT_APP_MODERN_DESGIN === 'true';

	const { dir } = useSelector((state: RootState) => state.appStore);

	useEffect(() => {
		const asideElement = document.querySelector('.aside') as HTMLElement;

		if (asideElement && mobileDesign) {
			asideElement.style.removeProperty('left');
		}
	}, [mobileDesign]);

	return (
		<>
			<motion.aside
				style={dir === 'rtl' ? undefined : (asideStyle as MotionStyle)}
				className={classNames(
					'aside',
					{ open: asideStatus },
					{
						aside_rtl: dir === 'rtl',
						'aside-touch-bar': hasTouchButton && isModernDesign,
						'aside-touch-bar-close': !touchStatus && hasTouchButton && isModernDesign,
						'aside-touch-bar-open': touchStatus && hasTouchButton && isModernDesign,
					},
				)}>
				<div className='aside-head'>
					<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
				</div>
				<div className='aside-body'>
					<Navigation menu={dashboardMenu} id='aside-dashboard' />
					{/* <NavigationLine /> */}
				</div>
			</motion.aside>
		</>
	);
};

export default Aside;
