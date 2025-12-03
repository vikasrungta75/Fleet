import React from 'react';
import { authPages, dashboardMenu, settings, vehiclesPages, historyPages } from '../menu';
import Footer from '../layout/Footer/Footer';

const footers = [
	{ path: authPages.login.path, element: null, exact: true },
	{ path: authPages.resetPassword.path, element: null, exact: true },
	{ path: authPages.forgetPassword.path, element: null, exact: true },
	{ path: authPages.page404.path, element: null, exact: true },
	{ path: settings.profile.path, element: null, exact: true },
	{ path: settings.profile.path, element: null, exact: true },
	{ path: `${settings.profile.path}/edit`, element: null, exact: true },
	{ path: dashboardMenu.setup.subMenu.vehicles.path, element: null, exact: true },
	{ path: `${vehiclesPages.vehicleDetail.path}/:id`, element: null, exact: true },
	{ path: dashboardMenu.fleet.path, element: null, exact: true },
	{ path: dashboardMenu.alertsNotifications.path, element: null, exact: true },
	{ path: `${historyPages.tripDetails.path}/:id`, element: null, exact: true },
	{ path: '*', element: <Footer /> },
];

export default footers;
