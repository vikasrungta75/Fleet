import React, { lazy } from 'react';
import { useDispatch } from 'react-redux';
import {
    authPages,
    dashboardMenu,
    settings,
    groups,
    vehiclesPages,
    users,
    alertsNotificationsPages,
    geofencesPages,
    rolesPages,
    ticketsPages,
    driver,
    superAdminPanel,
    reportsPage,
    TasksPages
} from '../menu';
import Login from '../pages/auth/login/Login';

const LiveMonitor = lazy(() => import('../pages/liveStreaming/LiveStreaming'));
const StreamDiagnostic = lazy(() => import('../pages/liveStreaming/StreamDiagnostic'));
const AIFleetManager = lazy(() => import('../pages/aiFleetManager/AIFleetManager'));
const AlertsAndNotifications = lazy(() => import('../pages/alarms_notifications/AlertsAndNotifications'));
// eslint-disable-next-line import/no-unresolved, import/extensions
const TripHistory = lazy(() => import('../pages/tripHistory/TripHistory'));


const onSearch = (query: string) => {
    // dispatch.appStoreNoPersist.changeFilterMaintenance({
    //     vin_filter: query !==''?query: 'All',
    //     status_filter: 'All',
    //     sort: 1,
    //     sortField: 'vin',
    // });
};

const ERRORS = {
    PAGE_404: lazy(() => import('../pages/common/error/Page404')),
    BUILDING_PAGE: lazy(() => import('../pages/common/error/BuildPage')),
};
const AUTH = {
    RESET_PASSWORD: lazy(() => import('../pages/auth/resetPassword/ResetPassword')),
    FORGET_PASSWORD: lazy(() => import('../pages/auth/forgetPassword/ForgetPassword')),
};

const APP = {
    PROFILE: {
        VIEW: lazy(() => import('../pages/settings/profile/ProfilePage')),
        EDIT: lazy(() => import('../pages/settings/profile/EditProfile')),
    },
    GROUPS: {
        GROUPS_LIST: lazy(() => import('../pages/setup-admin/groups/GroupsList')),
        CREATE_EDIT_GROUP: lazy(() => import('../pages/setup-admin/groups/CreateEditGroup')),
        ADD_USERS_TO_GROUP: lazy(() => import('../pages/setup-admin/groups/AddUsersToGroup')),
    },
    ROLES: {
        ROLES_LIST: lazy(() => import('../pages/setup-admin/roles/RolesList')),
        ADD_USERS_TO_ROLE: lazy(
            () => import('../pages/setup-admin/roles/components/AddUsersToRole'),
        ),
    },

    USERS: {
        CREATE_EDIT_USER: lazy(() => import('../pages/setup-admin/users/CreateEditUser')),
        USERS_LIST: lazy(() => import('../pages/setup-admin/users/UsersList')),
        EDIT_PERMISSION_USER: lazy(() => import('../pages/setup-admin/users/EditPermissions')),
    },

    VEHICLES: {
        VEHICLES: lazy(() => import('../pages/setup-admin/vehicles/DashboardVehicles')),
        VEHICLE_DETAILS: lazy(() => import('../pages/setup-admin/vehicles/VehicleDetails')),
        ADD_VEHICLE: lazy(() => import('../pages/setup-admin/vehicles/AddVehicle')),
    },

    SETTINGS: {
        APP_SETTINGS: lazy(() => import('../pages/settings/language/SettingsPages')),
        ACTIVITY_LOGS: lazy(() => import('../pages/settings/activity-logs/ActivityLogsPage')),
        SUPER_ADMIN_PANEL: lazy(
            () => import('../pages/settings/super-admin-panel/SuperadminPanel'),
        ),
    },

    MY_FLEET: {
        MAP: lazy(() => import('../pages/myFleet/MyFleet')),
    },

    ALARMS_NOTIFICATIONS: {
        ALARMS_FLEET: lazy(() => import('../pages/alarms_notifications/AlertsAndNotifications')),
        CREATE_UPDATE_ALERT: lazy(() => import('../pages/setup-admin/alerts/CreateUpdateAlert')),
        DETAIL_TRIP_ALARM: lazy(() => import('../pages/alarms_notifications/AlertDetails')),
        SETTINGS_ALARM: lazy(() => import('../pages/setup-admin/alerts/AlarmSettings')),
    },
    OVERVIEW: {
        OVERVIEW: lazy(() => import('../pages/overview/Overview')),
    },
    GEOFENCE: {
        CREATE_EDIT_GEOFENCE: lazy(
            () => import('../pages/setup-admin/geofences/CreateEditGeofence'),
        ),
        GEOFENCE_DASHBOARD: lazy(() => import('../pages/setup-admin/geofences/GeofenceDashboard')),
    },
    NOTIFICATION: {
        LIST_NOTIFICATIONS: lazy(() => import('../pages/notifications/DashboardNotifications')),
    },
    TICKETS: {
        LIST_TICKETS: lazy(() => import('../pages/setup-admin/tickets/TicketsDashboard')),
        CREATE_TICKET: lazy(() => import('../pages/setup-admin/tickets/CreateTicket')),
    },
    HELP: {
        HELP: lazy(() => import('../pages/help/Help')),
    },
    ECODRIVING: {
        DRIVER_LEADERBORD: lazy(() => import('../pages/eco-driving/DriverLeaderbord')),
        // DETAIL_DRIVER: lazy(() => import('../pages/eco-driving/DriverDetail')),
        PROFIL_DRIVER: lazy(() => import('../pages/eco-driving/DriverProfile')),
    },
    DRIVER: {
        DRIVER_FORM: lazy(() => import('../pages/setup-admin/driver/DriverAddEditForm')),
        DRIVERS_LIST: lazy(() => import('../pages/setup-admin/driver/DriversList')),
        DRIVER_DETAILS: lazy(() => import('../pages/setup-admin/driver/DriverDetails')),
    },

    MAINTENANCE: {
        MAINTENANCE_DASHBOARD: lazy(
            () => import('../pages/setup-admin/maintenance/MantenanceDashboard'),
        ),
    },

    REPORTS: {
        REPORTS_DASHBOARD: lazy(() => import('../pages/reports/ReportDashboard')),
        SEE_SCHEDULED_REPORTS: lazy(
            () => import('../pages/reports/scheduledReports/ScheduledReports'),
        ),
    },
    SUPER_ADMIN_PANEL: {
        READ_UPDATE_SUPER_ADMIN_PANEL: lazy(
            () => import('../pages/settings/super-admin-panel/CreateReadUpdate'),
        ),
    },
    FLEETCOPILOT: {
        FLEETCOPILOT: lazy(() => import('../pages/fleetcopilot/fleetcopilot')),
    },
    
    WORKFLOW: {
        TASK_OVERVIEW: lazy(() => import('../pages/workFlow/TaskOverview')),
        TASK_MONITORING: lazy(() => import('../pages/workFlow/WorkFlow')),
        ADDWORKFLOW: lazy(() => import('../pages/workFlow/AddTask')),
    },
};

const presentation = [
    /* MY FLEET */
    {
        path: dashboardMenu.fleet.path,
        element: <APP.MY_FLEET.MAP />,
        exact: true,
    },

    {
        path: dashboardMenu.liveMonitor.path,
        element: <LiveMonitor />,
        exact: true,
    },

    {
        path: 'stream-diagnostic',
        element: <StreamDiagnostic />,
        exact: true,
    },

    {
        path: dashboardMenu.tripHistory.path,
        element: <TripHistory />,
        exact: true,
    },

    /* OVERVIEW */
    {
        path: dashboardMenu.overview.path,
        element: <APP.OVERVIEW.OVERVIEW />,
        exact: true,
    },

    /* Fleet Copilot */
    {
        path: dashboardMenu.fleetcopilot.path,
        element: <APP.FLEETCOPILOT.FLEETCOPILOT />,
        exact: true,
    },

    /* ALERTS & NOTIFICATIONS */

    {
        path: `${alertsNotificationsPages.alertsDetails.path}/:vin/:datetime`,
        element: <APP.ALARMS_NOTIFICATIONS.DETAIL_TRIP_ALARM />,
        exact: true,
    },

    // /*workflow*/
    // {
    //     path: dashboardMenu.setup1.subMenu.TaskOverview.path,
    //     element: <APP.TASK_OVERVIEW.TASK_OVERVIEW />,
    //     exact: true,
    // },

    {
        path: dashboardMenu.Workflow.subMenu.TaskOverview.path,
        element: <APP.WORKFLOW.TASK_OVERVIEW />,
    },
    {
        path: dashboardMenu.Workflow.subMenu.TaskMonitoring.path,
        element: <APP.WORKFLOW.TASK_MONITORING />,
    },
    {
        path: TasksPages.addTasks.path,
        element: <APP.WORKFLOW.ADDWORKFLOW />,
    },
    {
        path: `${TasksPages.editTask.path}/:vin`,
        element: <APP.WORKFLOW.ADDWORKFLOW isEditing />,
    },

    // /* SETUP / ADMIN => VEHICLES */
    {
        path: dashboardMenu.setup.subMenu.vehicles.path,
        element: <APP.VEHICLES.VEHICLES />,
        exact: true,
    },
    {
        path: `${vehiclesPages.vehicleDetail.path}/:id`,
        element: <APP.VEHICLES.VEHICLE_DETAILS />,
        exact: true,
    },
    {
        path: vehiclesPages.addVehicles.path,
        element: <APP.VEHICLES.ADD_VEHICLE isCreating />,
        exact: true,
    },

    // /* SETUP / ADMIN => ALERTS */

    {
        path: alertsNotificationsPages.createAlert.path,
        element: <APP.ALARMS_NOTIFICATIONS.CREATE_UPDATE_ALERT />,
        exact: true,
    },

    {
        path: dashboardMenu.aiFleetManager.path,
        element: <AIFleetManager />,
        exact: true,
    },
    {
        path: dashboardMenu.alerts.path,
        element: <AlertsAndNotifications />,
        exact: true,
    },


    {
        path: alertsNotificationsPages.editAlert.path,
        element: <APP.ALARMS_NOTIFICATIONS.CREATE_UPDATE_ALERT isEditing />,
        exact: true,
    },
    {
        path: dashboardMenu.setup.subMenu.alerts.path,
        element: <APP.ALARMS_NOTIFICATIONS.SETTINGS_ALARM />,
        exact: true,
    },

    // /* SETUP / ADMIN => NOTIFICATIONS */
    {
        path: alertsNotificationsPages.notificationsDashboard.path,
        element: <APP.NOTIFICATION.LIST_NOTIFICATIONS />,
        exact: true,
    },

    // /* SETUP / ADMIN => TICKETS */

    {
        path: ticketsPages.ticketManagement.path,
        element: <APP.TICKETS.LIST_TICKETS />,
        exact: true,
    },
    {
        path: ticketsPages.ticketManagement.subMenu.createticket.path,
        element: <APP.TICKETS.CREATE_TICKET />,
        exact: true,
    },

    {
        path: `setup/tickets/edit-ticket/:id`,
        element: <APP.TICKETS.CREATE_TICKET isEditing />,
        exact: true,
    },
    {
        path: `${ticketsPages.ticketManagement.subMenu.editTicket.path}/:id `,
        element: <APP.TICKETS.CREATE_TICKET isEditing />,
        exact: true,
    },

    // /* SETUP / ADMIN => USERS */

    {
        path: users.addUser.path,
        element: <APP.USERS.CREATE_EDIT_USER />,
        exact: true,
    },
    {
        path: `${users.editUser.path}/:id`,
        element: <APP.USERS.CREATE_EDIT_USER isEditing />,
        exact: true,
    },
    {
        path: `${users.editPermissions.path}/:id`,
        element: <APP.USERS.EDIT_PERMISSION_USER />,
        exact: true,
    },

    {
        path: dashboardMenu.setup.subMenu.users.path,
        element: <APP.USERS.USERS_LIST />,
        exact: true,
    },

    // /* SETUP / ADMIN => ROLES */

    {
        path: dashboardMenu.setup.subMenu.roles.path,
        element: <APP.ROLES.ROLES_LIST />,
        exact: true,
    },
    {
        path: `${rolesPages.rolesManagment.subMenu.addUsersToRole.path}/:id`,
        element: <APP.ROLES.ADD_USERS_TO_ROLE />,
        exact: true,
    },

    // /* SETUP / ADMIN => GROUPS */

    {
        path: dashboardMenu.setup.subMenu.groups.path,
        element: <APP.GROUPS.GROUPS_LIST />,
        exact: true,
    },

    {
        path: groups.groupManagment.subMenu.addGroup.path,
        element: <APP.GROUPS.CREATE_EDIT_GROUP />,
        exact: true,
    },

    {
        path: `${groups.groupManagment.subMenu.editGroup.path}/:idgroup`,
        element: <APP.GROUPS.CREATE_EDIT_GROUP isEditing />,
        exact: true,
    },
    {
        path: `${groups.groupManagment.subMenu.addUsersToGroup.path}/:idgroup`,
        element: <APP.GROUPS.ADD_USERS_TO_GROUP />,
        exact: true,
    },

    // /* SETUP / ADMIN => GOEFENCES */

    {
        path: dashboardMenu.setup.subMenu.geofences.path,
        element: <APP.GEOFENCE.GEOFENCE_DASHBOARD />,
        exact: true,
    },
    {
        path: geofencesPages.createGeofence.path,
        element: <APP.GEOFENCE.CREATE_EDIT_GEOFENCE />,
        exact: true,
    },
    {
        path: `${geofencesPages.editGeofence.path}/:vin`,
        element: <APP.GEOFENCE.CREATE_EDIT_GEOFENCE isEditing />,
        exact: true,
    },

    // /* HELP */
    {
        path: dashboardMenu.help.path,
        element: <APP.HELP.HELP />,
        exact: true,
    },

    /* AUTH PAGE */
    {
        path: authPages.page404.path,
        element: <ERRORS.PAGE_404 />,
        exact: true,
    },
    {
        path: authPages.login.path,
        element: <Login />,
        exact: true,
    },

    {
        path: authPages.forgetPassword.path,
        element: <AUTH.FORGET_PASSWORD />,
        exact: true,
    },

    {
        path: authPages.resetPassword.path,
        element: <AUTH.RESET_PASSWORD />,
        exact: true,
    },

    // /* SETTINGS  / PROFILE / NOTIFICATIONS */

    {
        path: settings.profile.path,
        element: <APP.PROFILE.VIEW />,
        exact: true,
    },
    {
        path: `${settings.profile.path}/edit`,
        element: <APP.PROFILE.EDIT />,
        exact: true,
    },
    {
        path: settings.settings.path,
        element: <APP.SETTINGS.APP_SETTINGS />,
        exact: true,
    },
    {
        path: settings.activityLog.path,
        element: <APP.SETTINGS.ACTIVITY_LOGS />,
        exact: true,
    },
    {
        path: settings.superAdminPanel.path,
        element: <APP.SETTINGS.SUPER_ADMIN_PANEL />,
        exact: true,
    },
    {
        path: superAdminPanel.createSuperAdminPanel.path,
        element: <APP.SUPER_ADMIN_PANEL.READ_UPDATE_SUPER_ADMIN_PANEL isCreating />,
        exact: true,
    },
    {
        path: superAdminPanel.readSuperAdminPanel.path,
        element: <APP.SUPER_ADMIN_PANEL.READ_UPDATE_SUPER_ADMIN_PANEL />,
        exact: true,
    },
    {
        path: 'driverleadbord',
        element: <APP.ECODRIVING.DRIVER_LEADERBORD />,
        exact: true,
    },
    {
        path: 'detaildriver/:id',
        //  element: <APP.ECODRIVING.DETAIL_DRIVER />,
        exact: true,
    },
    {
        path: 'detaildriver/profil/:id',
        element: <APP.ECODRIVING.PROFIL_DRIVER />,
        exact: true,
    },
    {
        path: driver.addDriver.path,
        element: <APP.DRIVER.DRIVER_FORM />,
        exact: true,
    },
    {
        path: `${driver.editDriver.path}/:id`,
        element: <APP.DRIVER.DRIVER_FORM isEditing />,
        exact: true,
    },

    {
        path: dashboardMenu.setup.subMenu.drivers.path,
        element: <APP.DRIVER.DRIVERS_LIST />,
        exact: true,
    },
    // /*  maintenance*/

    {
        path: dashboardMenu.maintenance.path,
        element: <APP.MAINTENANCE.MAINTENANCE_DASHBOARD onSearch={onSearch} />,
        exact: true,
    },

    // /*   REPORTS */

    {
        path: dashboardMenu.reports.path,
        element: <APP.REPORTS.REPORTS_DASHBOARD />,
    },
    {
        path: reportsPage.seeScheduledReports.path,
        element: <APP.REPORTS.SEE_SCHEDULED_REPORTS />,
    },

    /* BUILDING PAGES */

    /*  {
            path: dashboardMenu.reports.subMenu.standard.path,
            element: <ERRORS.BUILDING_PAGE />,
            exact: true,
        },
        {
            path: dashboardMenu.reports.subMenu.dashboards.path,
            element: <ERRORS.BUILDING_PAGE />,
            exact: true,
        },
        {
            path: dashboardMenu.reports.subMenu.insights.path,
            element: <ERRORS.BUILDING_PAGE />,
            exact: true,
        },
        {
            path: dashboardMenu.reports.subMenu.documents.path,
            element: <ERRORS.BUILDING_PAGE />,
            exact: true,
        }, */
];

const contents = [...presentation];

export default contents;