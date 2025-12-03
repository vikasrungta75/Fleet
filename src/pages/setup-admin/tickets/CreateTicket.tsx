// import { useMutation } from '@tanstack/react-query';
import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Select from '../../../components/bootstrap/forms/Select';
import showNotification from '../../../components/extras/showNotification';
import GoBack from '../../../components/GoBack';
import ThemeContext from '../../../contexts/themeContext';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import { dashboardMenu, ticketsPages } from '../../../menu';
import { useAddTicket, useUpdateTicket } from '../../../services/tickets';
import { RootState } from '../../../store/store';
import { Iusers } from '../../../type/auth-type';
import AssistanceButton from '../../common/assitance-button/AssistanceButton';
import RichTextEditor from './components/RichTextEditor';
import { priorities } from './constants/constants';

interface CreateTicketProps {
	isEditing?: boolean;
}

const CreateTicket: FC<CreateTicketProps> = ({ isEditing }) => {
	const { t } = useTranslation(['tickets']);
	const { mobileDesign } = useContext(ThemeContext);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();
	const stateLocation = location.state;
	const [ticketItemSelected, setTicketItemSelected] = useState(stateLocation?.notification ?? '');
	const vehicleSpecifications: { [key: string]: string | string[] | undefined } = useSelector(
		(state: RootState) => state.vehicles.vehicleSpecifications,
	);

	const dummyData = [
		{
			header: 'Subject',
			data: [
				{ title: 'Vin', value: stateLocation.vin ?? ticketItemSelected.vin },
				{ title: 'reg_no', value: vehicleSpecifications.reg_no ?? '' },
			],
		},
		{
			header: 'Event',
			data: [
				{
					title: 'Rule',
					value: isEditing
						? stateLocation?.ticketState.rule
						: ticketItemSelected.alarm_type,
					// value: stateLocation?.ticketState.rule ?? ticketItemSelected.alarm_type,
				},
				{
					title: 'Time',
					value: isEditing ? stateLocation?.ticketState.time : ticketItemSelected.time,
				},
				{
					title: 'Location',
					value: isEditing
						? stateLocation?.ticketState.location
						: ticketItemSelected.location,
				},
			],
		},
	];

	const [description, setDescription] = useState(
		isEditing ? stateLocation?.ticketState.ticketbody : '',
	);
	const handleDescriptionChange = (value: string) => {
		setDescription(value);
	};
	const [priorityField, setPriorityField] = useState(
		isEditing ? stateLocation.ticketState.priorityfield : '',
	);
	const [userField, setUserField] = useState(
		isEditing ? stateLocation?.ticketState.userfield : '',
	);

	const { usersGroups } = useSelector((state: RootState) => state);
	const { user } = useSelector((state: RootState) => state.auth.user);

	/* 	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (
			selectedFile &&
			(selectedFile.type === 'application/pdf' || selectedFile.type === 'image/jpeg')
		) {
			setFile(selectedFile);
		} else {
			if (fileInputRef.current) {
				(fileInputRef.current as HTMLInputElement).value = '';
			}
			setFile(null);
			showNotification('', t('Please select a PDF or JPEG file.'), 'danger');
		}
	}; */

	React.useEffect(() => {
		if (usersGroups.users.length === 0) {
			dispatch.usersGroups.getUserListAsync();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usersGroups.users]);

	const { mutate: addTicket, isLoading: addLoading } = useAddTicket();

	const { mutate: updateTicket, isLoading: updateLoading } = useUpdateTicket();

	const onSubmit = () => {
		if (isEditing) {
			updateTicket({
				rule: stateLocation?.ticketState.rule,
				time: stateLocation?.ticketState.time,
				location: stateLocation?.ticketState.location,
				ticketBody: description,
				reg_no: vehicleSpecifications.reg_no,
				vin: ticketItemSelected.vin,
				userField,
				priorityField,
				ticket_id: stateLocation?.ticketState.ticket_id,
			});
		} else {
			addTicket({
				rule: ticketItemSelected.alarm_type,
				time: ticketItemSelected.time,
				location: ticketItemSelected.location,
				ticketBody: description,
				reg_no: vehicleSpecifications.reg_no,
				vin: ticketItemSelected.vin,
				userField,
				priorityField,
			});
		}
	};

	React.useEffect(() => {
		if (ticketItemSelected.vin) {
			dispatch.vehicles.getVehicleSpecificationAsync(ticketItemSelected.vin);
		}
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketItemSelected.vin]);

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(dashboardMenu.setup.subMenu.tickets.text),
								to: `../${dashboardMenu.setup.subMenu.tickets.path}`,
							},
							{
								title: isEditing
									? t(ticketsPages.ticketManagement.subMenu.createticket.text)
									: t(ticketsPages.ticketManagement.subMenu.createticket.text),
								to: isEditing
									? ticketsPages.ticketManagement.subMenu.createticket.path
									: ticketsPages.ticketManagement.subMenu.createticket.path,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className='d-flex'>
					<div className='d-flex pb-3 mb-4 border-bottom border-secondary w-100'>
						<GoBack />
						<h1 className='fs-2 mb-0 ms-4 fw-semibold text-secondary'>
							{isEditing
								? t(ticketsPages.ticketManagement.subMenu.createticket.text)
								: t(ticketsPages.ticketManagement.subMenu.createticket.text)}
						</h1>
					</div>
					<div className='fs-2 pb-3 mb-4 fw-semibold text-secondary border-bottom border-secondary align-self-stretch ml-auto'>
						<AssistanceButton locationPathname={window.location.pathname} />
					</div>
				</div>

				<Card>
					<CardBody className='d-flex flex-column bd-highlight mb-3 gap-4 justify-content-around'>
						<div className='p-2 bd-highlight'>
							<div className='row'>
								{dummyData.map((e, i) => {
									return (
										<div key={i} className='col'>
											<h3 className='text-secondary fw-semibold mb-4'>
												{e.header}
											</h3>

											{e.data.map((args, index) => {
												return (
													<div key={index} className='col mt-4'>
														<span className='fw-semibold'>
															{t(args.title)}
														</span>
														: {args.value}
													</div>
												);
											})}
										</div>
									);
								})}
							</div>
						</div>
						<div className='p-2 bd-highlight'>
							<div className='text-secondary fw-semibold h3 mb-5 mt-5'>
								{t('Ticket body')}
							</div>
							<RichTextEditor
								value={description}
								onChange={handleDescriptionChange}
							/>
							{/* <div className='d-flex justify-content-end mt-3'>
								{file && (
									<div className='d-flex align-items-center me-4'>
										<Button
											className='cursor-text border-custom-light-grey me-2'
											icon='Eye'>
											{file?.name}
										</Button>{' '}
										<span
											className='custom-crossed cursor-pointer px-3 py-1'
											onClick={() => {
												if (fileInputRef.current) {
													(
														fileInputRef.current as HTMLInputElement
													).value = '';
													setFile(null);
												}
											}}>
											x
										</span>
									</div>
								)}
								<Button
									className='custom-file-upload primary-btn'
									icon='AttachFile'>
									{t('Attached file')}
									<input
										id='file-upload'
										ref={fileInputRef}
										type='file'
										className='cursor-pointer'
										accept='.pdf, .jpeg, .jpg'
										onChange={handleFileChange}
									/>
								</Button>
							</div> */}
						</div>
						<div className='p-2 bd-highlight'>
							<div className='row'>
								<div className='col-6'>
									<div className='text-secondary fw-semibold h3 my-4'>
										{t('Assign to')}
									</div>

									<FormGroup id='email' label={t('User')}>
										<Select
											name='email'
											className='form-control'
											ariaLabel='metric-select'
											value={userField}
											onChange={(e: { target: { value: string } }) =>
												setUserField(e.target.value)
											}>
											<option disabled value=''>
												{t('Select person')}
											</option>
											{usersGroups.users
												?.filter((u: Iusers) => u.emailID !== user.emailID)
												?.map(({ fullName, emailID }, indexKey) => {
													return (
														<option
															disabled={userField.includes(emailID)}
															value={emailID}
															key={indexKey}>
															{`${fullName} - ${emailID}`}
														</option>
													);
												})}
										</Select>
									</FormGroup>
								</div>

								<div className='col-6'>
									<div className='text-secondary fw-semibold h3 my-4'>
										{t('Priority')}
									</div>

									<FormGroup id='priority' label={t('Priority')}>
										<Select
											className='form-control'
											ariaLabel='select-Priority'
											value={priorityField}
											onChange={(e: { target: { value: string } }) => {
												setPriorityField(e.target.value);
											}}>
											<option disabled value=''>
												{t('Select a priority')}
											</option>
											{priorities.map((priority, index) => {
												return (
													<option key={index} value={priority}>
														{priority}
													</option>
												);
											})}
										</Select>
									</FormGroup>
								</div>
							</div>
						</div>
					</CardBody>
					<CardFooter>
						<div
							className={`d-flex w-100 ${
								mobileDesign ? 'flex-column ' : 'flex-row-reverse '
							}`}>
							<Button
								color='secondary'
								className={`py-3 ${mobileDesign ? 'w-100' : 'w-25 ms-3'}`}
								isDisable={isEditing ? addLoading : updateLoading}
								onClick={onSubmit}>
								{t('Save')}
							</Button>
							<Button
								color='secondary'
								isOutline={true}
								className={`py-3 light-btn ${mobileDesign ? 'w-100 my-3' : 'w-25'}`}
								onClick={() => navigate(-1)}>
								{t('Cancel')}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default CreateTicket;
