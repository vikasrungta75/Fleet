import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Card, { CardBody, CardHeader } from '../../../components/bootstrap/Card';
import { dateFormatter } from '../../../helpers/helpers';
import { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import { ICodeLanguage, IHelp, ITopicDetail } from '../../../type/help-type';
import MostPopularSections from './MostPopularSections';
import ReactMarkdown from 'react-markdown';
import ThemeContext from '../../../contexts/themeContext';
import useLanguage from '../../../hooks/useLanguage';

interface ITopicDetailsProps {
	selectedCategory: string;
	setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}
const TopicDetails: FC<ITopicDetailsProps> = ({ selectedCategory, setSelectedCategory }) => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['help']);
	const dispatch = useDispatch();
	const [topicDetail, setTopicDetail] = useState<any>();
	const languageISOCode = useLanguage();

	useEffect(() => {
		if (selectedCategory.length > 0) {
			dispatch.help
				.getTopicDetailsAsync({ selectedCategory, languageISOCode })
				.then((res: any) => {
					setTopicDetail(res.attributes);
				});
		} else {
			setTopicDetail(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCategory]);

	return topicDetail !== undefined && Object?.values(topicDetail).length > 0 ? (
		<Card className='topic-detail'>
			<CardHeader className={mobileDesign ? '' : 'pb-0 px-5'}>
				{!mobileDesign ? (
					<>
						<HeaderLeft>
							<div className='fs-2 fw-semibold text-secondary w-100 '>
								{
									(topicDetail?.catgory.data.attributes as any)[
										`name_${languageISOCode}`
									]
								}
							</div>
						</HeaderLeft>
						<HeaderRight>
							<div className='me-4 topic-update'>
								{topicDetail?.updatedAt &&
									`${t('Last update')} : ${dateFormatter(
										topicDetail?.updatedAt,
									)}`}
							</div>
						</HeaderRight>
					</>
				) : (
					<>
						<div className='fs-2 fw-semibold text-secondary w-100 mb-0'>
							{
								(topicDetail?.catgory.data.aatributes as any)[
									`name_${languageISOCode}`
								]
							}
						</div>
						<div className='topic-update'>
							{topicDetail?.updatedAt &&
								`${t('Last update')} : ${dateFormatter(topicDetail?.updatedAt)}`}
						</div>
					</>
				)}
			</CardHeader>
			<CardBody className={mobileDesign ? '' : 'px-5'}>
				<div className='fs-6 fw-semibold w-100'>
					{/* i.e = Create Alert */}
					{topicDetail[`topic_name_${languageISOCode}`]}
				</div>

				<div>
					<div>{topicDetail[`topic_name_${languageISOCode}`]}</div>
					<br />

					<ReactMarkdown className='help-description'>
						{topicDetail[`topic_description_${languageISOCode}`]}
					</ReactMarkdown>
				</div>
			</CardBody>
		</Card>
	) : (
		<MostPopularSections setSelectedCategory={setSelectedCategory} />
	);
};

export default TopicDetails;
