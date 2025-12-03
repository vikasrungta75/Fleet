import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Card, { CardBody, CardHeader } from '../../../components/bootstrap/Card';
import ThemeContext from '../../../contexts/themeContext';
import { RootState } from '../../../store/store';
import { ICategory, IHelp, ITopic } from '../../../type/help-type';
import useLanguage from '../../../hooks/useLanguage';

interface IMostPopularSectionsProps {
	setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

const MostPopularSections: FC<IMostPopularSectionsProps> = ({
	setSelectedCategory,
}): JSX.Element => {
	const { mobileDesign } = useContext(ThemeContext);
	const { t } = useTranslation(['help']);
	const { topics, categories } = useSelector((state: RootState) => state.help);
	const { permissions } = useSelector((state: RootState) => state.auth);
	const [categoriesArray, setCategories] = useState<any>(); // Assuming your categories state is an object

	const languageISOCode = useLanguage();
	let customTopics: ITopic[] = [...topics];

	const updatedCategories = categories.map((category: any) => {
		return {
			...category,
			attributes: {
				...category.attributes,
				helps: {
					data: category.attributes.topics.data.filter((topic: any) => {
						return topic.attributes.most_popular;
					}),
				},
			},
		};
	});

	const hideItem = (item: string) => {
		if (permissions && (permissions[item] === undefined || permissions[item])) {
			return false;
		} else {
			return true;
		}
	};

	return (
		<Card className='topic-detail'>
			<CardHeader className={mobileDesign ? '' : 'px-5'}>
				<div className='fs-2 fw-semibold text-secondary w-100'>
					{t('Most popular help sections')}
				</div>
			</CardHeader>
			<CardBody className={mobileDesign ? '' : 'px-5'}>
				{updatedCategories
					.filter((topic: any) => {
						return (
							topic.attributes.most_popular &&
							(!hideItem(topic.attributes.permissions) ? topic : null) !== null
						);
					})

					.map((topic: any) => {
						return (
							<div key={topic.id}>
								<div className='fs-5 fw-semibold text-secondary w-100 mb-3'>
									{/* i.e = Authentification */}
									{topic?.attributes[`name_${languageISOCode}`]}
								</div>
								<div className='help-popular-section'>
									{topic.attributes.helps.data.map((category: any) => {
										return (
											<Card
												className={mobileDesign ? 'w-100' : 'help-card'}
												key={category.id}
												onClick={() => {
													setSelectedCategory(
														category.attributes[
															`topic_name_${languageISOCode}`
														],
													);
												}}>
												<CardBody>
													<div className='fw-bold'>
														{
															category.attributes[
																`topic_name_${languageISOCode}`
															]
														}
													</div>
													{/* {category.attributes.helps
																?.filter(
																	(help: IHelp) =>
																		help.most_popular,
																)
																?.map((help: any) => {
																	return (
																		<div
																			key={help.id}
																			className='color-light'>
																			{
																				help?.[
																					`title_${languageISOCode}`
																				]
																			}
																		</div>
																	);
																})} */}
												</CardBody>
											</Card>
										);
									})}
								</div>
							</div>
						);
					})}
			</CardBody>
		</Card>
	);
};

export default MostPopularSections;
