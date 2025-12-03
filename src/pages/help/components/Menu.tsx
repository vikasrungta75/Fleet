import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import Accordion, { AccordionItem } from '../../../components/bootstrap/Accordion';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { RootState } from '../../../store/store';
import useLanguage from '../../../hooks/useLanguage';
import { ICodeLanguage, ITopic } from '../../../type/help-type';

interface IMenuProps {
	selectedCategory: string;
	setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Menu: FC<IMenuProps> = ({ setSelectedCategory, selectedCategory }): JSX.Element => {
	const { topics, categories } = useSelector((state: RootState) => state.help);
	const { permissions } = useSelector((state: RootState) => state.auth);

	const array: any[] = [...categories];
	const id = array?.find((el) => el.attributes.name_en === selectedCategory)?.id;

	const hideItem = (item: string) => {
		if (permissions && (permissions[item] === undefined || permissions[item])) {
			return false;
		} else {
			return true;
		}
	};

	const languageISOCode = useLanguage();

	return (
		<Card>
			<CardBody>
				<Accordion
					className='custom-accordion'
					tag='div'
					id='menu'
					shadow='default'
					isFlush={true}
					activeItemId={selectedCategory.length === 0 ? false : id}
					color='light'>
					{categories?.map((datum: any) => {
						return (
							<AccordionItem
								key={datum.id}
								id={datum.id || ''}
								title={
									datum.attributes[`name_${languageISOCode as ICodeLanguage}`] ||
									''
								}
								activeItem={id}
								icon=''
								tag='div'
								headerTag='h5'
								overWriteColor='secondary'>
								{datum?.attributes.topics.data.map((category: any) => {
									return (
										!hideItem(category.permissions) && (
											<ul key={category?.id}>
												<li
													onClick={() =>
														setSelectedCategory(
															category.attributes[
																`topic_name_${languageISOCode}`
															],
														)
													}
													className={`cursor-pointer ${
														selectedCategory ===
														category.attributes[
															`topic_name_${languageISOCode}`
														]
															? 'text-secondary'
															: ''
													}`}>
													{
														category.attributes[
															`topic_name_${languageISOCode}`
														]
													}
												</li>
											</ul>
										)
									);
								})}
							</AccordionItem>
						);
					})}
				</Accordion>
			</CardBody>
		</Card>
	);
};

export default Menu;
