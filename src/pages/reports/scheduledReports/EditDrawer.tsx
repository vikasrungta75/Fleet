import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import Button from '../../../components/bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ThemeContext from '../../../contexts/themeContext';
import { FormikValues, useFormik } from 'formik';
import showNotification from '../../../components/extras/showNotification';
import BasicScheduledReportForm from '../components/scheduled-reports/BasicScheduledReportForm';
import { RootState } from '../../../store/store';
import { options } from '../constant/constant';
import SvgClosingRightIcon from '../../../components/icon/material-icons/ClosingRightIcon';
import { CardFooter } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';

interface IEditDrawerProps {
	setIsEditModalOpen: (val: any) => void;
	isEditModalOpen: any;
	datum: any;
	setData: (data: any[]) => void;
	setIsOpen?: (e: boolean) => void;
}

const EditDrawer: FC<IEditDrawerProps> = ({
	isEditModalOpen,
	setIsEditModalOpen,
	setData,
	datum,
	setIsOpen
}): JSX.Element => {
	const dispatch = useDispatch();
	const { t } = useTranslation('reports');
	const { mobileDesign } = useContext(ThemeContext);
	const {
		user: {
			user: { emailID },
		},
	} = useSelector((state: RootState) => state.auth);

	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [selectedDaysPersonnalize, setSelectedDaysPersonnalize] = useState<string[]>([]);
	const ref = useRef<HTMLHeadingElement>(null);
	// const { mutate, isLoading, isSuccess } = useCreateMaintenance();

	const formik: FormikValues = useFormik({
		initialValues: {
			frequency: datum?.frequency ?? 'Pick a frequency from the list...',
			vin: datum?.vin ?? 'All Vins',
			report_type:
				datum?.report_type?.map((report: string) => ({
					label: report,
					value: report,
				})) ?? [],
			over: datum?.over ?? 1,
			time: datum?.time ?? '07:00',
			overFrequency: datum?.overFrequency ?? '',
			user_email: datum?.user_email ?? emailID,
			choosenDay: datum?.choosenDay ?? '',
			scheduled_date: datum?.scheduled_date ?? '',
			startdate: datum?.startdate ?? '',
			status: datum?.status ?? '',
			controlDays: datum?.controlDays ?? options.days,
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
			if (
				(values.frequency === 'Once a week' || values.frequency === 'Once a month' ||  values.frequency === 'Everyday' ||  values.frequency === 'Personnalize') &&
				values.choosenDay.length === 0
			) {
				errors.choosenDay = t('Select a day...');
			}

			return errors;
		},
		validateOnChange: true,
		onSubmit: async (values) => {
			const payloadUpdate = {
				...values,
				sr_id: datum?.sr_id,
				action: 'update scheduled reports',
			};

			dispatch.reports.scheduledReportEdition(payloadUpdate).then((res: boolean) => {
				if (res) {
					setTimeout(() => {
						showNotification('', t('Scheduled Reports Successfully Updated'), 'success');
						setIsEditModalOpen(false);
						dispatch.reports.getScheduledReportsAsync().then((data: any[]) => {
							setData(data);
						});
					}, 2000);
				} else {
					showNotification('', t('An error occured updating scheduled report'), 'danger');
				}
			});
		},
	});

	useEffect(() => {
		if (datum && formik.values.sr_id !== datum.sr_id) {
			formik.setValues({
				frequency: datum.frequency ?? 'Pick a frequency from the list...',
				vin: datum.vin ?? 'All Vins',
				report_type: datum.report_type || [],
				over: datum.over ?? 1,
				time: datum.time ?? '07:00',
				overFrequency: datum.overFrequency ?? '',
				user_email: datum.user_email ?? emailID,
				choosenDay: datum.choosenDay ?? '',
				scheduled_date: datum.scheduled_date ?? '',
				startdate: datum.startdate ?? '',
				status: datum.status ?? '',
				controlDays: datum.controlDays,
			});
			setSelectedDays(datum.controlDays);
			setSelectedDaysPersonnalize(datum.choosenDay);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [datum]);

	const handleClose = () => {
		setIsEditModalOpen(false);
	};

	return (
		<OffCanvas
			style={{ width: 400,margin:"0px",borderRadius: "30px 0px 0px 30px"}}
			id="edit-scheduled-report"
			titleId="edit-scheduled-report"
			placement="end"
			isOpen={isEditModalOpen}
			setOpen={setIsEditModalOpen}
			isBackdrop={false}
			isBodyScroll
		>
			<div className="closingRightIcon" onClick={handleClose}>
				<SvgClosingRightIcon />
			</div>
			<OffCanvasHeader className="border-1 mb-5 create-scheduled-report-title">
				<p className="mb-0 create-scheduled-report-title"
					style={{ height: "27px", fontFamily: "Open Sans", fontSize: "20px", fontWeight: "700", lineHeight: "27.28px", textAlign: "left", textUnderlinePosition: "from-font", textDecorationSkipInk: "none", color: "#E41F3F" }}
				>
					{t("Scheduled report")}
					{datum?.report_type.length > 1 ? "s : " : ": "}
					{datum?.report_type
						?.map((report: string) => t(report?.replace("_", " ")))
						.join(", ")}
				</p>
			</OffCanvasHeader>
			<div className="scheduleReport-line"></div>

			<OffCanvasBody className="ps-4">
				<div className="d-flex align-items-center flex-column">
					<BasicScheduledReportForm
						formik={formik}
						selectedDays={selectedDays}
						setSelectedDays={setSelectedDays}
						selectedDaysPersonnalize={selectedDaysPersonnalize}
						setSelectedDaysPersonnalize={setSelectedDaysPersonnalize}
					/>
					{/* <Button
						color="secondary"
						className={`my-3 py-3  ${mobileDesign ? "w-100" : "w-50"}`}
						onClick={formik.handleSubmit}
					>
						{t("Save")}
					</Button>
					<Button
						color="secondary"
						isOutline={true}
						className={`py-3 light-btn  ${mobileDesign ? "w-100" : "w-50"}`}
						onClick={() => {
							formik.resetForm();
							setIsEditModalOpen(false); 
						}}
					>
						{t("Cancel")}
					</Button> */}
					<CardFooter borderSize={1} className='px-0 justify-content-end mr-2 w-100 card-footer border-top border-1 border-custom-light-grey'>
						<div className={`d-flex gap-3 ${!mobileDesign ? 'flex-row-reverse w-50' : 'flex-column w-100'} mr-2`}>
							<Button
								color='dark'
								className={`py-3 save-text ${!mobileDesign ? 'w-50 ms-3 me-0' : 'w-100 mb-3'}`}
								onClick={formik.handleSubmit}>
								{t('Save')}
								{/* {isLoading && <Spinner isSmall inButton className='ms-2' />} */}
							</Button>
							<Button
								className={`light-btn py-3 cancel-text ${!mobileDesign ? 'w-50' : 'w-100'}`}
								onClick={() => {
									formik.resetForm();
									setIsEditModalOpen(false);
								}}>
								{t('Cancel')}
							</Button>
						</div>
					</CardFooter>
				</div>
			</OffCanvasBody>
		</OffCanvas>
	)
}
export default EditDrawer;