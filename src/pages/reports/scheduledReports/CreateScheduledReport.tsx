
// import React, { FC, useContext, useEffect, useRef, useState } from 'react';
// import { FormikValues, useFormik } from 'formik';
// import { useTranslation } from 'react-i18next';
// import { useDispatch, useSelector } from 'react-redux';
// import showNotification from '../../../components/extras/showNotification';
// import Card, {
// 	CardBody,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from '../../../components/bootstrap/Card';
// import Button from '../../../components/bootstrap/Button';
// import ThemeContext from '../../../contexts/themeContext';
// import { RootState } from '../../../store/store';
// import Collapse from '../../../components/bootstrap/Collapse';
// import BasicScheduledReportForm from '../components/scheduled-reports/BasicScheduledReportForm';
// import { options } from '../constant/constant';
// import { IScheduledReports } from '../../../type/reports-types';

// interface ICreateScheduledReport {
// 	isCreating?: boolean;
// 	isOpen?: boolean;
// 	setIsOpen?: (e: boolean) => void;
// 	position: { top: number; right: number };
// 	setData?: (e: IScheduledReports[]) => void;
// }

// const CreateScheduledReport: FC<ICreateScheduledReport> = ({
// 	isOpen = false,
// 	setIsOpen,
// 	position,
// 	setData,
// }) => {
// 	const { t } = useTranslation(['reports']);
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const [selectedDays, setSelectedDays] = useState<string[]>(options.days);
// 	const ref = useRef<HTMLHeadingElement>(null);

// 	const dispatch = useDispatch();
// 	// const [deploy, setDeploy] = useState(false);

// 	const {
// 		user: {
// 			user: { emailID },
// 		},
// 	} = useSelector((state: RootState) => state.auth);

// 	const formik: FormikValues = useFormik({
// 		initialValues: {
// 			over: 1,
// 			overFrequency: 'day',
// 			frequency: 'Pick a frequency from the list...',
// 			user_email: emailID,
// 			choosenDay: 'Monday',
// 			vin: 'All Vins',
// 			report_type: '',
// 			time: '07:00',
// 			controlDays: options.days,
// 		},

// 		validate: (values) => {
// 			const errors: { [key: string]: string } = {};

// 			if (values.frequency === 'Pick a frequency from the list...') {
// 				errors.frequency = t('Pick a frequency from the list...');
// 			}
// 			if (values.report_type.length === 0) {
// 				errors.report_type = t('Select one or more reports...');
// 			}
// 			if (values.vin.length === 0) {
// 				errors.vin = t('Select a vin...');
// 			}
// 			if (values.controlDays.length === 0) {
// 				errors.vin = t('Select a day...');
// 			}
// 			if (
// 				(values.frequency === 'Once a week' || values.frequency === 'Once a month') &&
// 				values.choosenDay.length === 0
// 			) {
// 				errors.choosenDay = t('Select a day...');
// 			}

// 			return errors;
// 		},
// 		validateOnChange: true,
// 		onSubmit: async (values) => {
// 			const payload = {
// 				...values,
// 				action: 'add scheduled reports',
// 			};

// 			dispatch.reports.scheduledReportEdition(payload).then((res: boolean) => {
// 				if (res) {
// 					setTimeout(() => {
// 						dispatch.reports
// 							.getScheduledReportsAsync()
// 							.then((scheduledReports: IScheduledReports[]) => {
// 								if (
// 									Array.isArray(scheduledReports) &&
// 									scheduledReports.length > 0 &&
// 									setData
// 								) {
// 									setData(scheduledReports);
// 								}
// 							})
// 							.finally(() => {
// 								if (setIsOpen) setIsOpen(!isOpen);
// 							});
// 					}, 2000);
// 				} else {
// 					showNotification('', t('An error occured creating scheduled report'), 'danger');
// 				}
// 			});
// 		},
// 		onReset: () => {
// 			formik.resetForm();
// 		},
// 	});


// 	useEffect(() => {
// 		formik.setFieldValue('choosenDay', 'Monday');
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [formik.values.frequency]);

// 	const handleClickOutside = (event: MouseEvent) => {
// 		const target = event.target as HTMLElement;
// 		if (
// 			ref.current &&
// 			!ref.current.contains(target) &&
// 			setIsOpen &&
// 			target.tagName.toLowerCase() !== 'button'
// 		) {
// 			setIsOpen(false);
// 		}
// 	};

// 	useEffect(() => {
// 		document.addEventListener('click', handleClickOutside, true);
// 		return () => {
// 			document.removeEventListener('click', handleClickOutside, true);
// 		};
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, []);

// 	return (
// 		<Collapse
// 			isOpen={isOpen}
// 			className='position-absolute'
// 			style={{ ...position, zIndex: 9999 }}
// 			ref={ref}>
// 			<Card id='create-scheduled-report' style={{ width: 380 }} ref={ref}>
// 				<CardHeader style={{ backgroundColor: '#F2F2F2' }}>
// 					<CardTitle id='create-scheduled-report-title' className='mb-0'>
// 						{t('Planify report')}
// 					</CardTitle>
// 				</CardHeader>
// 				<CardBody>
// 					<BasicScheduledReportForm
// 						formik={formik}
// 						selectedDays={selectedDays}
// 						setSelectedDays={setSelectedDays}

// 					/>
// 				</CardBody>

// 				<CardFooter className='border-top border-1 border-custom-light-grey'>
// 					<div
// 						className={`d-flex w-100 ${
// 							mobileDesign ? 'flex-column ' : 'flex-row-reverse '
// 						}`}>
// 						<Button
// 							isDisable={!formik.isValid}
// 							color='secondary'
// 							className={`py-3 ${mobileDesign ? 'w-100' : 'w-50 ms-3'}`}
// 							onClick={formik.handleSubmit}>
// 							{true ? t('Save') : t('Create')}
// 						</Button>
// 						<Button
// 							color='secondary'
// 							isOutline={true}
// 							className={`py-3 light-btn border-0 ${
// 								mobileDesign ? 'w-100 my-3' : 'w-25'
// 							}`}
// 							onClick={(e) => {
// 								if (setIsOpen) setIsOpen(false);
// 							}}>
// 							{t('Cancel')}
// 						</Button>
// 					</div>
// 				</CardFooter>
// 			</Card>
// 		</Collapse>
// 	);
// };

// export default CreateScheduledReport;



//
// import React, { FC, useContext, useEffect, useRef, useState } from 'react';
// import { FormikValues, useFormik } from 'formik';
// import { useTranslation } from 'react-i18next';
// import { useDispatch, useSelector } from 'react-redux';
// import showNotification from '../../../components/extras/showNotification';
// import Card, {
// 	CardBody,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from '../../../components/bootstrap/Card';
// import Button from '../../../components/bootstrap/Button';
// import ThemeContext from '../../../contexts/themeContext';
// import { RootState } from '../../../store/store';
// import Collapse from '../../../components/bootstrap/Collapse';
// import BasicScheduledReportForm from '../components/scheduled-reports/BasicScheduledReportForm';
// import { options } from '../constant/constant';
// import { IScheduledReports } from '../../../type/reports-types';
// import OffCanvas from '../../../components/bootstrap/OffCanvas'; // Import OffCanvas component
// import SvgClosingRightIcon from '../../../components/icon/material-icons/ClosingRightIcon';

// interface ICreateScheduledReport {
// 	isCreating?: boolean;
// 	isOpen?: boolean;
// 	setIsOpen?: (e: boolean) => void;
// 	position: { top: number; right: number };
// 	setData?: (e: IScheduledReports[]) => void;
// }

// const CreateScheduledReport: FC<ICreateScheduledReport> = ({
// 	isOpen = false,
// 	setIsOpen,
// 	position,
// 	setData,
// }) => {
// 	const { t } = useTranslation(['reports']);
// 	const { mobileDesign } = useContext(ThemeContext);
// 	const [selectedDays, setSelectedDays] = useState<string[]>(options.days);
// 	const ref = useRef<HTMLHeadingElement>(null);

// 	const dispatch = useDispatch();
// 	// const [deploy, setDeploy] = useState(false);

// 	const {
// 		user: {
// 			user: { emailID },
// 		},
// 	} = useSelector((state: RootState) => state.auth);

// 	const formik: FormikValues = useFormik({
// 		initialValues: {
// 			over: 1,
// 			overFrequency: 'day',
// 			frequency: 'Pick a frequency from the list...',
// 			user_email: emailID,
// 			choosenDay: 'Monday',
// 			vin: 'All Vins',
// 			report_type: '',
// 			time: '07:00',
// 			controlDays: options.days,
// 		},

// 		validate: (values) => {
// 			const errors: { [key: string]: string } = {};

// 			if (values.frequency === 'Pick a frequency from the list...') {
// 				errors.frequency = t('Pick a frequency from the list...');
// 			}
// 			if (values.report_type.length === 0) {
// 				errors.report_type = t('Select one or more reports...');
// 			}
// 			if (values.vin.length === 0) {
// 				errors.vin = t('Select a vin...');
// 			}
// 			if (values.controlDays.length === 0) {
// 				errors.vin = t('Select a day...');
// 			}
// 			// if(values.frequency === 'Everyday'){

// 			// }
// 			if (
// 				(values.frequency === 'Once a week' || values.frequency === 'Once a month') &&
// 				values.choosenDay.length === 0
// 			) {
// 				errors.choosenDay = t('Select a day...');
// 			}

// 			return errors;
// 		},
// 		validateOnChange: true,
// 		onSubmit: async (values) => {
// 			const payload = {
// 				...values,
// 				action: 'add scheduled reports',
// 			};

// 			dispatch.reports.scheduledReportEdition(payload).then((res: boolean) => {
// 				if (res) {
// 					setTimeout(() => {
// 						showNotification('', t('Scheduled Reports Successfully Added'), 'success');
// 						dispatch.reports
// 							.getScheduledReportsAsync()
// 							.then((scheduledReports: IScheduledReports[]) => {
// 								if (
// 									Array.isArray(scheduledReports) &&
// 									scheduledReports.length > 0 &&
// 									setData
// 								) {
// 									setData(scheduledReports);
// 								}
// 							})
// 							.finally(() => {
// 								// Check if setIsOpen is defined before calling it
// 								if (setIsOpen) setIsOpen(!isOpen);
// 							});
// 					}, 2000);
// 				} else {
// 					showNotification('', t('An error occured creating scheduled report'), 'danger');
// 				}
// 			});

// 		},
// 		onReset: () => {
// 			formik.resetForm();
// 		},
// 	});


// 	useEffect(() => {
// 		formik.setFieldValue('choosenDay', 'Monday');
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [formik.values.frequency]);

// 	const handleClickOutside = (event: MouseEvent) => {
// 		const target = event.target as HTMLElement;
// 		if (
// 			ref.current &&
// 			!ref.current.contains(target) &&
// 			setIsOpen &&
// 			target.tagName.toLowerCase() !== 'button'
// 		) {
// 			if (setIsOpen) setIsOpen(false);
// 		}
// 	};

// 	useEffect(() => {
// 		document.addEventListener('click', handleClickOutside, true);
// 		return () => {
// 			document.removeEventListener('click', handleClickOutside, true);
// 		};
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, []);
// 	const handleClose = () => {
// 		if (setIsOpen) setIsOpen(false); // Safely call setIsOpen if it's defined
// 	};

// 	return (
// 		<OffCanvas isOpen={isOpen}
// 			setOpen={setIsOpen ? setIsOpen : () => { }}
// 			placement="end"
// 			width="380px"
// 			style={{ zIndex: 9999, position: 'absolute', ...position, top: "0px", right: "-8" }}
// 		>
// 			<Card id="create-scheduled-report" style={{ width: 400, height: "990px", borderRadius: "30px 0px 0px 30px", backgroundColor: "#FFFFFF", boxShadow: "0px 4px 4px 0px #00000040" }} ref={ref}>
// 				{/* <div className='closingRightIcon'>
// 					<SvgClosingRightIcon />
// 				</div> */}
// 				<div className="closingRightIcon" onClick={handleClose}>
// 					<SvgClosingRightIcon />
// 				</div>

// 				<CardHeader style={{}}>
// 					<CardTitle id="create-scheduled-report-title" className="mb-0">
// 						{t('Schedule Report')}
// 						<div className='planifyreport-line'>

// 						</div>
// 					</CardTitle>

// 				</CardHeader>
// 				<CardBody className='planifyReport-card'>
// 					<BasicScheduledReportForm
// 						formik={formik}
// 						selectedDays={selectedDays}
// 						setSelectedDays={setSelectedDays}
// 					/>
// 				</CardBody>

// 				<CardFooter className="border-top border-1 border-custom-light-grey">
// 					<div
// 						className={`d-flex w-100 ${mobileDesign ? 'flex-column ' : 'flex-row-reverse '}`}>
// 						<Button
// 							isDisable={!formik.isValid}
// 							color="dark"
// 							style={{ backgroundColor: "black" }}
// 							className={`py-3 save-text ${mobileDesign ? 'w-100' : 'w-50 ms-3'}`}
// 							onClick={formik.handleSubmit}>
// 							{true ? t('Save') : t('Create')}
// 						</Button>
// 						<Button
// 							color="dark"
// 							isOutline={true}
// 							className={`py-3 cancel-text ${mobileDesign ? 'w-100 my-3' : 'w-25'
// 								}`}
// 							onClick={(e) => {
// 								// Check if setIsOpen is defined before calling it
// 								if (setIsOpen) setIsOpen(false);
// 							}}>
// 							{t('Cancel')}
// 						</Button>
// 					</div>
// 				</CardFooter>
// 			</Card>
// 		</OffCanvas>
// 	);
// };

// export default CreateScheduledReport;


// ********************
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { FormikValues, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import showNotification from '../../../components/extras/showNotification';
import Card, {
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import ThemeContext from '../../../contexts/themeContext';
import { RootState } from '../../../store/store';
import Collapse from '../../../components/bootstrap/Collapse';
import BasicScheduledReportForm from '../components/scheduled-reports/BasicScheduledReportForm';
import { options } from '../constant/constant';
import { IScheduledReports } from '../../../type/reports-types';
import OffCanvas from '../../../components/bootstrap/OffCanvas'; // Import OffCanvas component
import SvgClosingRightIcon from '../../../components/icon/material-icons/ClosingRightIcon';

interface ICreateScheduledReport {
  isCreating?: boolean;
  isOpen?: boolean;
  setIsOpen?: (e: boolean) => void;
  position: { top: number; right: number };
  setData?: (e: IScheduledReports[]) => void;
}

const CreateScheduledReport: FC<ICreateScheduledReport> = ({
  isOpen = false,
  setIsOpen,
  position,
  setData,
}) => {
  const { t } = useTranslation(['reports']);
  const { mobileDesign } = useContext(ThemeContext);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const ref = useRef<HTMLHeadingElement>(null);

  const dispatch = useDispatch();
  const {
    user: {
      user: { emailID },
    },
  } = useSelector((state: RootState) => state.auth);

  const formik: FormikValues = useFormik({
    initialValues: {
      over: 1,
      overFrequency: 'day',
      frequency: 'Pick a frequency from the list...',
      user_email: emailID,
      choosenDay: '',
      vin: 'All Vins',
      report_type: '',
      time: '07:00',
      controlDays: options.days,
    },

    validate: (values) => {
      const errors: { [key: string]: string } = {};

      if (values.frequency === 'Pick a frequency from the list...') {
        errors.frequency = t('Pick a frequency from the list...');
      }
      if (values.report_type.length === 0) {
        errors.report_type = t('Select one or more reports...');
      }
      if (values.vin.length === 0) {
        errors.vin = t('Select a vin...');
      }
      if (values.controlDays.length === 0) {
        errors.vin = t('Select a day...');
      }
      if (
        (values.frequency === 'Once a week' || values.frequency === 'Once a month') &&
        values.choosenDay.length === 0
      ) {
        errors.choosenDay = t('Select a day...');
      }

      return errors;
    },
    validateOnChange: true,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        action: 'add scheduled reports',
      };

      // dispatch.reports.scheduledReportEdition(payload).then((res: boolean) => {
      //   if (res) {
      //     setTimeout(() => {
      //       showNotification('', t('Scheduled Reports Successfully Added'), 'success');
      //       dispatch.reports.getScheduledReportsAsync().then((scheduledReports: IScheduledReports[]) => {
      //         if (
      //           Array.isArray(scheduledReports) &&
      //           scheduledReports.length > 0 &&
      //           setData
      //         ) {
      //           setData(scheduledReports);
      //         }
      //       })
      //         .finally(() => {
      //           if (setIsOpen) setIsOpen(!isOpen);
      //         });
      //     }, 2000);
      //   } else {
      //     showNotification('', t('An error occured creating scheduled report'), 'danger');
      //   }
      // });
      dispatch.reports.scheduledReportEdition(payload).then((res: boolean) => {
        if (res) {
          showNotification('', t('Scheduled Reports Successfully Added'), 'success');
          setTimeout(() => {
            dispatch.reports.getScheduledReportsAsync().then((scheduledReports: IScheduledReports[]) => {
              if (Array.isArray(scheduledReports) && scheduledReports.length > 0) {
                setData?.(scheduledReports);
              }
            }).finally(() => {
              setIsOpen?.(!isOpen); 
            });
          }, 2000);
        } else {
          showNotification('', t('An error occurred creating scheduled report'), 'danger');
        }
      });
      
    },
    onReset: () => {
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (formik.values.frequency === 'Everyday') {
      formik.setFieldValue('choosenDay', options.days); // Set all days if "Everyday" is selected
    } else if (formik.values.frequency === 'Personnalize') {
      formik.setFieldValue('choosenDay', []); // Clear days for "Personnalize"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.frequency]);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      ref.current &&
      !ref.current.contains(target) &&
      setIsOpen &&
      target.tagName.toLowerCase() !== 'button'
    ) {
      if (setIsOpen) setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (setIsOpen) setIsOpen(false); // Safely call setIsOpen if it's defined
  };

  return (
    <OffCanvas isOpen={isOpen} setOpen={setIsOpen ? setIsOpen : () => { }} placement="end" width="380px" style={{ zIndex: 9999, position: 'absolute', ...position, top: "0px", right: "-8" }}>
      <Card id="create-scheduled-report" style={{ width: 400, height: "990px", borderRadius: "30px 0px 0px 30px", backgroundColor: "#FFFFFF", boxShadow: "0px 4px 4px 0px #00000040" }} ref={ref}>
        <div className="closingRightIcon" onClick={handleClose}>
          <SvgClosingRightIcon />
        </div>

        <CardHeader>
          <CardTitle id="create-scheduled-report-title" className="mb-0">
            {t('Schedule Report')}
            <div className="planifyreport-line"></div>
          </CardTitle>
        </CardHeader>
        <CardBody className="planifyReport-card">
          <BasicScheduledReportForm formik={formik} selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
        </CardBody>

        <CardFooter className="border-top border-1 border-custom-light-grey">
          <div className={`d-flex w-100 ${mobileDesign ? 'flex-column ' : 'flex-row-reverse '}`}>
            <Button isDisable={!formik.isValid} color="dark" style={{ backgroundColor: "black" }} className={`py-3 save-text ${mobileDesign ? 'w-100' : 'w-50 ms-3'}`} onClick={formik.handleSubmit}>
              {true ? t('Save') : t('Create')}
            </Button>
            <Button color="dark" isOutline={true} className={`py-3 cancel-text ${mobileDesign ? 'w-100 my-3' : 'w-25'}`} onClick={(e) => { if (setIsOpen) setIsOpen(false); }}>
              {t('Cancel')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </OffCanvas>
  );
};

export default CreateScheduledReport;
