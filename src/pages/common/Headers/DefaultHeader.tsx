import classNames from 'classnames';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import useDarkMode from '../../../hooks/useDarkMode';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import { RootState } from '../../../store/store';
import Button, { IButtonProps } from '../../../components/bootstrap/Button';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/icon/Icon';
import SettingsHeader from './SettingsHeader';
import Search from '../../../components/Search';
import ThemeContext from '../../../contexts/themeContext';
import DrawerNotifications from '../../notifications/components/DrawerNotifications';
import { useLocation } from 'react-router-dom';
import GoBack from '../../../components/GoBack';
 
const DefaultHeader = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth.user);
  const { notificationsCount } = useSelector((state: RootState) => state.notifications);
 
  const { t } = useTranslation(['setup']);
  const { darkModeStatus } = useDarkMode();
  const { mobileDesign } = useContext(ThemeContext);
 
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
 
  const styledBtn: IButtonProps = {
    color: darkModeStatus ? 'dark' : 'light',
    hoverShadow: 'default',
    isLight: !darkModeStatus,
    size: 'lg',
  };
 
  // Define the possible route names
  const tabNames: { [key: string]: string } = {
    '/Overview': 'Overview',
    '/setup/maintenance': 'Maintenance',
    '/reports': 'Reports',
    '/driverleadbord': 'Driver Leaderboard',
    '/workflow': 'Workflow',
    '/add_task': 'Workflow',
    '/setup/vehicles': 'Setup Admin',
    '/setup/alerts': 'Setup Admin',
     '/setup/users-list': 'Setup Admin',
      '/setup/roles': 'Setup Admin',
       '/setup/groups-list': 'Setup Admin',
        '/setup/geofences': 'Setup Admin',
    '/setup/drivers-list':'Setup Admin',
    '/setup/alerts/edit-alert':'Setup Admin',
    '/workflow/taskoverview' :'Workflow',
     '/workflow/taskmonitoring' :'Workflow',
     '/fleetcopilot' :'Fleetcopilot'
   
  };
 
  // Determine the current tab name or fallback
  // const currentTab = tabNames[location.pathname] || 'Overview';
  const currentTab = t(tabNames[location.pathname] || 'Overview');
 
 
  // Conditionally render the header based on the current path
  if (location.pathname === '/my-fleet') {
    return null; // Don't render anything for '/my-fleet'
  }
 
  // Determine heading based on the current path
  const renderHeading = () => {
    if (location.pathname === '/settings/scheduled-reports') {
      return (
        <>
          <GoBack className="me-2" /> {t("Report")}
        </>
      );
    } else if (location.pathname.startsWith('/detaildriver/profil')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Driver Leadership")}
        </>
      );
    } else if (location.pathname.startsWith('/detaildriver')) {
      return (
        <>
          <GoBack className="me-2" />{t("Driver Leadership")}
        </>
      );
    }
    else if (location.pathname.startsWith('/add-vehicle')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    }
    else if (location.pathname.startsWith('/vehicle-detail')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    }
    else if (location.pathname.startsWith('/setup/alerts/create-alert')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    } else if (location.pathname.startsWith('/setup/drivers/add-driver')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    }
    else if (location.pathname.startsWith('/setup/alerts/edit-alert')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    } else if (location.pathname.startsWith('/setup/drivers/edit-driver/')) {
      return (
        <>
          <GoBack className="me-2" /> {t("Setup Admin")}
        </>
      );
    }
    return currentTab;
  };
 
  return (
    <Header>
      {mobileDesign ? (
        <HeaderLeft>
          <Search />
        </HeaderLeft>
      ) : (
        <>
          <HeaderLeft>
            <div className="d-flex align-items-center">
              <div
                className={classNames('fs-3', 'fw-bold', 'd-flex', 'align-items-center', {
                  'text-dark': !darkModeStatus,
                })}
              >
                {renderHeading()}
              </div>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <div className="row g-3 custom-header-right">
              <Search />
              <div className="col-auto">
                <Button style={{marginTop: "-7px"}}
                  {...styledBtn}
                  className="btn-only-icon"
                  data-tour="dark-mode"
                  onClick={() => {
                    setNotificationsModalOpen(!notificationsModalOpen);
                  }}
                >
                  <Icon
                    icon="NotificationsActive"
                    className="btn-icon"
                    id="notification-btn"
                  />
                  {notificationsCount > 0 && (
                    <span className="position-absolute top-15 start-100 translate-middle badge rounded-pill bg-danger">
                      {notificationsCount === 99 ? '+' : notificationsCount}
                    </span>
                  )}
                </Button>
              </div>
              <div className="col-auto">
                <SettingsHeader styledBtn={styledBtn} />
              </div>
            </div>
          </HeaderRight>
        </>
      )}
 
      {notificationsModalOpen && (
        <DrawerNotifications
          setIsModalOpen={setNotificationsModalOpen}
          isModalOpen={notificationsModalOpen}
        />
      )}
    </Header>
  );
};
 
export default DefaultHeader;