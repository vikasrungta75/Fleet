export const dashboardMenu = {
    fleetcopilot: {
        id: 'Fleet Copilot',
        text: 'Fleet Copilot',
        path: 'fleetcopilot',
        icon: 'CustomOverview',
        subMenu: null,
        searchable: true,
        hide: false,
    },

    aiFleetManager: {
        id: 'ai-fleet-manager',
        text: 'AI Fleet Manager',
        path: 'ai-fleet-manager',
        icon: 'SmartToy',
        subMenu: null,
        searchable: true,
        hide: false,
    },

    overview: {
        id: 'overview',
        text: 'Overview',
        path: '/overview',
        icon: 'CustomOverview',
        subMenu: null,
        searchable: true,
        hide: false,
    },
    fleet: {
        id: 'fleet',
        text: 'My Fleet',
        path: 'my-fleet',
        icon: 'CustomFleet',
        subMenu: null,
        searchable: true,
        hide: false,
    },


    liveMonitor: {
        id: 'live-monitor',
        text: 'Live Monitor',
        path: 'live-monitor',
        icon: 'Videocam',
        subMenu: null,
        searchable: true,
        hide: false,
     },

    tripHistory: {
        id: 'trip-history',
        text: 'Trip History',
        path: 'trip-history',
        icon: 'History',
        subMenu: null,
        searchable: true,
        hide: false,
    },

    // FIX DE-06: Removed duplicate alertsNotifications entry (was hide:true,
    // same path 'alerts' as the alerts entry below — caused routing ambiguity).
    // The active `alerts` entry below is the canonical one.

    maintenance: {
        id: 'see_all_maintenance',
        text: 'Maintenance',
        path: 'setup/maintenance',
        icon: 'Engineering',
        searchable: true,
        subMenu: null,
        hide: false,
    },
 
    reports: {
        id: 'see_all_report',
        text: 'Reports',
        path: 'reports',
        icon: 'Assignment',
        searchable: true,
        subMenu: null,
        hide: false,
    },
 

    alerts: {
        id: 'alerts',
        text: 'Alerts',
        path: 'alerts',
        icon: 'NotificationsActive',
        subMenu: null,
        searchable: true,
        hide: false,
    },

    // FIX UX-03: Corrected "Leaderbord" → "Leaderboard", path "driverleadbord" → "driverleaderboard"
    driverleaderboard: {
        id: 'see_all_driverleader',
        text: 'Driver Leaderboard',
        path: 'driverleaderboard',
        icon: 'Leaderboard',
        searchable: true,
        subMenu: null,
        hide: false,
    },
 
    Workflow: {
        id: 'workflow',
        text: 'Workflow',
        path: 'workflow',
        icon: 'SetupAdmin',
        searchable: true,
        hide: false,
        subMenu: {
            TaskOverview: {
                id: 'task_overview',
                text: 'Task Overview',
                path: 'workflow/taskoverview',
                icon: 'Taskoverview',
                searchable: true,
                hide: false,
                subMenu: null,
            },
            TaskMonitoring: {
                id: 'task_monitoring',
                text: 'Task Monitoring',
                path: 'workflow/taskmonitoring',
                icon: 'Taskoverview',
                searchable: true,
                hide: false,
                subMenu: null,
            },
        },
    },
 
    setup: {
        id: 'setup',
        text: 'Setup/Admin',
        path: 'setup',
        icon: 'SetupAdmin',
        searchable: true,
        hide: false,
        subMenu: {
            vehicles: {
                id: 'see_all_vehicles',
                text: 'Vehicles',
                path: 'setup/vehicles',
                icon: 'CustomCar',
                subMenu: null,
                searchable: true,
                hide: false,
            },
            alerts: {
                id: 'see_all_alerts',
                text: 'Create Alerts',
                path: 'setup/alerts',
                icon: 'Notifications',
                searchable: true,
                hide: false,
            },
            users: {
                id: 'see_all_users',
                text: 'Users',
                path: 'setup/users-list',
                icon: 'Person',
                searchable: true,
            },
            roles: {
                id: 'see_all_roles',
                text: 'Roles',
                path: 'setup/roles',
                icon: 'School',
                searchable: true,
                hide: false,
            },
            groups: {
                id: 'see_all_groups',
                text: 'Groups',
                path: 'setup/groups-list',
                icon: 'People',
                searchable: true,
                hide: false,
            },
            drivers: {
                id: 'see_all_drivers',
                text: 'Drivers',
                path: 'setup/drivers-list',
                icon: 'Face',
                searchable: true,
            },
            geofences: {
                id: 'see_all_geofences',
                text: 'Geofences',
                path: 'setup/geofences',
                icon: 'AddLocation',
                searchable: true,
                hide: false,
            },
            tickets: {
                id: 'tickets',
                text: 'Tickets',
                path: 'setup/tickets',
                icon: 'ReceiptLong',
                subMenu: null,
                // when tickets will be reintegrated => searchable: true, hide: false,
                searchable: false,
                hide: true,
            },
        },
    },
 
    help: {
        id: 'help',
        text: 'Help',
        path: 'help',
        icon: 'Help',
        searchable: true,
        hide: true,
    },
};
 
export const geofencesPages = {
    createGeofence: {
        id: 'creategeofence',
        text: 'Create Geofence',
        path: 'setup/geofences/create-geofence',
        icon: 'Add',
        subMenu: null,
        searchable: true,
    },
    editGeofence: {
        id: 'editgeofence',
        text: 'Edit Geofence',
        path: 'setup/geofences/edit-geofence',
        icon: '',
        subMenu: null,
        searchable: false,
    },
};
 
export const alertsNotificationsPages = {
    alertsDetails: {
        id: 'alertdetails',
        text: 'Alert Detail',
        path: 'alerts/alert-detail',
        icon: 'NotificationsActive',
        subMenu: null,
        searchable: false,
    },
    createAlert: {
        id: 'createalert',
        text: 'Create New Alert',
        path: 'setup/alerts/create-alert',
        icon: 'Add',
        subMenu: null,
        searchable: true,
    },
    editAlert: {
        id: 'editalert',
        text: 'Edit Alert',
        path: 'setup/alerts/edit-alert',
        icon: '',
        subMenu: null,
        searchable: false,
    },
    notificationsDashboard: {
        id: 'notifications',
        text: 'Notifications',
        path: 'notifications',
        icon: '',
        searchable: true,
    },
};
 
export const TasksPages = {
    addTasks: {
        id: 'add_task',
        text: 'Create New Task',
        path: 'add_task',
        icon: 'Add',
        subMenu: null,
        searchable: true,
    },
    editTask: {
        id: 'edittask',
        text: 'Edit task',
        path: 'setup/tasks/edit-task',
        icon: '',
        subMenu: null,
        searchable: false,
    },
};
 
export const vehiclesPages = {
    vehicleDetail: {
        id: 'vehicleDetail',
        text: 'Vehicle Info',
        path: 'vehicle-detail',
        icon: 'CustomCar',
        searchable: false,
    },
    addVehicles: {
        id: 'add_vehicle',
        text: 'Add Vehicle',
        path: 'add-vehicle',
        icon: 'Add',
        subMenu: null,
        searchable: true,
    },
};
 
export const authPages = {
    login: {
        id: 'login',
        text: 'Login',
        path: '/',
        icon: 'Login',
    },
    forgetPassword: {
        id: 'forgotPassword',
        text: 'Forgot Password',
        path: 'auth-pages/forget-password',
        icon: 'Login',
        hide: true,
    },
    resetPassword: {
        id: 'resetPassword',
        text: 'Reset Password',
        path: 'home/',
        icon: 'Login',
        hide: true,
    },
    page404: {
        id: 'Page404',
        text: '404 Page',
        path: 'auth-pages/404',
        icon: 'ReportGmailerrorred',
        hide: true,
    },
};
 
export const historyPages = {
    tripDetails: {
        id: 'trip details',
        text: 'Trip Details',
        path: 'history/trip-details',
        icon: '',
        subMenu: null,
        hide: true,
        searchable: false,
    },
};
 
export const settings = {
    profile: {
        id: 'profile',
        text: 'Profile',
        path: 'profile',
        icon: 'AccountCircle',
        hide: true,
        searchable: true,
    },
    settings: {
        id: 'settings',
        text: 'Settings',
        path: 'settings',
        icon: 'Settings',
        hide: true,
        searchable: true,
    },
    activityLog: {
        id: 'activity log',
        text: 'Activity Log',
        path: 'settings/activity',
        icon: 'History',
        hide: true,
        searchable: true,
    },
    superAdminPanel: {
        id: 'superAdminPanel',
        text: 'Super Admin Panel',
        path: 'settings/super-admin-panel',
        icon: 'AdminPanelSettings',
        hide: true,
        searchable: true,
    },
};
 
export const users = {
    addUser: {
        id: 'addUser',
        text: 'New User Profile',
        path: 'setup/users/add-user',
        icon: 'Add',
        searchable: true,
    },
    editUser: {
        id: 'editUser',
        text: 'Edit User Profile',
        path: 'setup/users/edit-user',
        icon: '',
        searchable: false,
    },
    editPermissions: {
        id: 'editPermission',
        text: 'Edit Permissions',
        path: 'edit-permissions',
        icon: '',
        searchable: false,
    },
    readPermissions: {
        id: 'readPermissions',
        text: 'See Permissions',
        path: 'read-permissions',
        icon: '',
        searchable: false,
    },
    userDetails: {
        id: 'userDetail',
        text: 'User Details',
        path: 'setup/users/user-detail',
        icon: '',
        searchable: false,
    },
};
 
export const driver = {
    addDriver: {
        id: 'addDriver',
        text: 'Add New Driver',
        path: 'setup/drivers/add-driver',
        icon: 'Add',
        searchable: true,
    },
    editDriver: {
        id: 'editDriver',
        text: 'Edit Driver Info',
        path: 'setup/drivers/edit-driver',
        icon: '',
        searchable: false,
    },
    driverDetails: {
        id: 'driverDetail',
        text: 'Driver Details',
        path: 'setup/drivers/driver-detail',
        icon: '',
        searchable: false,
    },
};
 
export const groups = {
    groupManagment: {
        id: 'groups',
        text: 'Group Management',
        path: 'groups',
        icon: 'BackupTable',
        searchable: false,
        subMenu: {
            addGroup: {
                id: 'addGroup',
                text: 'Create New Group',
                path: 'add-group',
                icon: 'Add',
                searchable: true,
            },
 
            addUsersToGroup: {
                id: 'addUsersToGroup',
                text: 'Add Users',
                path: 'add-users-to-group',
                icon: '',
                searchable: false,
            },
            editGroup: {
                id: 'editGroup',
                text: 'Edit group name',
                path: 'edit-group-name',
                icon: '',
                searchable: false,
            },
 
            usersListGroup: {
                id: 'usersListGroup',
                text: 'Users List Group',
                path: 'users-list-group',
                icon: '',
                searchable: false,
            },
        },
    },
};
 
export const rolesPages = {
    rolesManagment: {
        id: 'roles',
        text: 'Roles',
        path: 'setup/roles',
        icon: 'BackupTable',
        searchable: false,
        subMenu: {
            addUsersToRole: {
                id: 'addUsersToRole',
                text: 'Add Users To Role',
                path: 'setup/roles/add-users-to-role',
                icon: '',
                searchable: false,
            },
            editPermissions: {
                id: 'editPermission',
                text: 'Edit Permissions',
                path: 'setup/roles/edit-permissions',
                icon: '',
                searchable: false,
            },
            readPermissions: {
                id: 'readPermissions',
                text: 'Permissions Details',
                path: 'edit-permissions',
                icon: '',
                searchable: false,
            },
            usersListRole: {
                id: 'usersLisRole',
                text: 'Users List Role',
                path: 'setup/roles/users-list-role',
                icon: '',
                searchable: false,
            },
        },
    },
};
export const ticketsPages = {
    ticketManagement: {
        id: 'tickets',
        text: 'Tickets',
        path: 'setup/tickets',
        icon: 'BackupTable',
        searchable: false,
        subMenu: {
            ticketDetails: {
                id: 'ticketDetails',
                text: 'Ticket Detail',
                path: 'setup/tickets/ticket-detail',
                icon: 'NotificationsActive',
                subMenu: null,
                searchable: false,
            },
            createticket: {
                id: 'createTicket',
                text: 'Create New Ticket',
                path: 'setup/tickets/create-ticket',
                icon: 'Add',
                subMenu: null,
                searchable: true,
            },
            editTicket: {
                id: 'editTicket',
                text: 'Edit Ticket',
                path: 'setup/tickets/edit-ticket',
                icon: '',
                subMenu: null,
                searchable: false,
            },
        },
    },
};
 
export const maintenance = {
    addVehicleRevision: {
        id: 'addVehicleRevision',
        text: 'Add a vehicle revision',
        path: 'setup/maintenance/add-vehicle-revision',
        icon: 'Add',
        searchable: true,
    },
    editVehicleRevision: {
        id: 'editVehicleRevision',
        text: 'Edit vehicle revision',
        path: 'setup/maintenance/edit-vehicle-revision',
        icon: '',
        searchable: false,
    },
};
export const superAdminPanel = {
    createSuperAdminPanel: {
        id: 'createSuperAdminPanel',
        text: 'Create Super Admin Panel',
        path: 'settings/create-super-admin-panel',
        icon: '',
        searchable: false,
    },
    readSuperAdminPanel: {
        id: 'readSuperAdminPanel',
        text: 'Read Super Admin Panel',
        path: 'settings/read-super-admin-panel',
        icon: '',
        searchable: false,
    },
    editSuperAdminPanel: {
        id: 'editSuperAdminPanel',
        text: 'Edit Super Admin Panel',
        path: 'settings/edit-super-admin-panel',
        icon: '',
        searchable: false,
    },
};
 
export const reportsPage = {
    createScheduledReport: {
        id: 'createScheduledReport',
        text: 'Create Scheduled Report',
        path: 'settings/create-scheduled-report',
        icon: '',
        searchable: false,
    },
    seeScheduledReports: {
        id: 'seeScheduledReport',
        text: 'List of planified reports',
        path: 'settings/scheduled-reports',
        icon: '',
        searchable: false,
    },
    readScheduledReport: {
        id: 'readScheduledReport',
        text: 'Read Scheduled Report',
        path: 'settings/read-scheduled-report',
        icon: '',
        searchable: false,
    },
    editScheduledReport: {
        id: 'editScheduledReport',
        text: 'Edit Scheduled Report',
        path: 'settings/edit-scheduled-report',
        icon: '',
        searchable: false,
    },
};
