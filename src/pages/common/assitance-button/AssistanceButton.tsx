import React, { useEffect, useState } from 'react';
import Button from '../../../components/bootstrap/Button';
import OffCanvas, { OffCanvasBody, OffCanvasHeader } from '../../../components/bootstrap/OffCanvas';
import { useDispatch, useSelector } from 'react-redux';
import { ICodeLanguage, IHelp } from '../../../type/help-type';
import Icon from '../../../components/icon/Icon';
import { useNavigate } from 'react-router-dom';
import { dashboardMenu } from '../../../menu';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../store/store';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import useLanguage from '../../../hooks/useLanguage';

interface IAssistanceProps {
	locationPathname: string;
}
const AssistanceButton: React.FC<IAssistanceProps> = ({ locationPathname }) => {
	const { t } = useTranslation(['assistance']);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [helpArticle, setHelpArticle] = useState<any>();
	const isLoading = useSelector((state: RootState) => state.loading.models.help);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const languageISOCode = useLanguage();

	useEffect(() => {
		const payload = {
			payloadQuery: locationPathname,
			fieldName: 'slug',
		};
		dispatch.help.getAllArticlesAsync(payload).then((res: any) => {
			setHelpArticle(res);
		});
	}, [dispatch.help, locationPathname]);

	const handleOpenModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	return (
		<>
			{helpArticle && helpArticle.length > 0 && (
				<Button
					icon='HelpOutline'
					isOutline={true}
					className='assistance-btn'
					onClick={() => handleOpenModal()}>
					{t('Assistance')}
				</Button>
			)}
			<OffCanvas
				style={{ width: 350 }}
				id='show-fleet-details'
				titleId='fleet details'
				placement='end'
				isOpen={isModalOpen}
				setOpen={setIsModalOpen}
				isBackdrop
				isBodyScroll>
				<OffCanvasHeader className='border-1 border-bottom border-secondary'>
					<div className='d-flex justify-content-between mt-4 ml-5'>
						<div className='fs-3 fw-semibold text-secondary '>
							{t('Need Assistance ?')}
						</div>
						{/* <span className='border-bottom border-1 border-light w-100 ms-3' /> */}
					</div>
				</OffCanvasHeader>
				{!isLoading ? (
					<OffCanvasBody className='ps-4 pe-2 mt-3'>
						<Button
							aria-label='Toggle Close'
							className='mobile-header-toggle mb-4'
							size='lg'
							color='dark'
							isLight
							icon='Close'
							onClick={() => setIsModalOpen(!isModalOpen)}
						/>
						{helpArticle && helpArticle?.length > 0 ? (
							<>
								{/*INFORMATION SECTION*/}
								<div className='mb-4'>
									<span className='fw-bolder '>
										{t(
											'From this page you can do any of the following actions :',
										)}
									</span>
								</div>
								{helpArticle &&
									helpArticle.map((datum: any, index: number) => {
										
										return (
											<ReactMarkdown key={index} className='help-description'>
												{
													datum.attributes[
														`topic_description_${
															languageISOCode as ICodeLanguage
														}`
													]
												}
											</ReactMarkdown>
										);
									})}
								<div className='mb-4'>
									<span className='fw-bolder '>
										{t('For more information, please go check this link :')}
									</span>
								</div>
								<div
									onClick={() =>
										navigate(`/${dashboardMenu.help.path}`, {
											state: {
												category: `${
													helpArticle[0]?.attributes.catgory.data
														.attributes[
														`name_${languageISOCode as ICodeLanguage}`
													]
												}`,
											},
										})
									}
									style={{ cursor: 'pointer' }}
									className='border rounded py-3 d-flex justify-content-between'>
									<span className='fw-bold px-4'>
										{
											helpArticle[0]?.attributes.catgory.data.attributes[
												`name_${languageISOCode as ICodeLanguage}`
											]
										}
									</span>
									<Icon icon='ChevronRight' size='2x' className='me-3 ' />
								</div>
							</>
						) : (
							<Alert color='info' className='flex-column w-100 align-items-start'>
								<p className='w-100 fw-semibold d-flex flex-row align-items-center mb-0'>
									<Icon icon='Info' size='2x' className='me-2' />{' '}
									{t('No help section to display')}
								</p>
							</Alert>
						)}
					</OffCanvasBody>
				) : (
					<div className='d-flex justify-content-center h-100 align-items-center'>
						<Spinner color='secondary' size='5rem' />
					</div>
				)}
			</OffCanvas>
		</>
	);
};

export default AssistanceButton;
