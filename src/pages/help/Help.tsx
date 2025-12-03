import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Card, { CardBody } from '../../components/bootstrap/Card';
import GoBack from '../../components/GoBack';
import Icon from '../../components/icon/Icon';
import SearchBar from '../../components/SearchBar';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
// import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import { dashboardMenu } from '../../menu';
import { IHelp } from '../../type/help-type';
import { RootState } from '../../store/store';
import Menu from './components/Menu';
import TopicDetails from './components/TopicDetails';
import { useLocation } from 'react-router-dom';
import ThemeContext from '../../contexts/themeContext';
import NoData from '../../components/NoData';
import useLanguage from '../../hooks/useLanguage';

const Help: FC = (): JSX.Element => {
	const { t, i18n } = useTranslation(['help']);
	const { mobileDesign } = useContext(ThemeContext);
	const dispatch = useDispatch();

	const location = useLocation();
	const stateLocation = location.state;

	const { topics } = useSelector((state: RootState) => state.help);

	const [inputSearch, setInputSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(stateLocation?.category ?? '');

	const [isSearchActivated, setisSearchActivated] = useState(false);

	const [Articles, setArticles] = useState<any>();

	const handleGoBack = () => {
		setSelectedCategory('');
		setInputSearch('');
	};

	useEffect(() => {
		if (stateLocation?.category) {
			window.history.replaceState({}, document.title);
		}
	}, [stateLocation]);

	const highlightMatchingText = (suggestion: string) => {
		let suggestionArray = [];
		let j = 0;
		if (suggestion) {
			for (let i = 0; i < suggestion.length; i++) {
				if (inputSearch.length !== 0) {
					if (inputSearch.toLowerCase()[j] === suggestion.toLowerCase()[i]) {
						suggestionArray.push(
							<span key={i} style={{ fontWeight: 'bold' }}>
								{suggestion[i]}
							</span>,
						);
						j++;
					} else {
						suggestionArray.push(<span key={i}>{suggestion[i]}</span>);
					}
				}
			}
			return suggestionArray;
		}
	};

	useEffect(() => {
		dispatch.help.getAllTopicsAsync();
		dispatch.help.getAllCategoriesAsync();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const payload = {
			payloadQuery: inputSearch,
			fieldName: `topic_name_${languageISOCode}`,
		};
		if (inputSearch.length !== 0) {
			setisSearchActivated(true);
			setTimeout(() => {
				dispatch.help.getAllArticlesAsync(payload).then((results: any) => {
					setArticles(results);
				});
			}, 1500);
		} else {
			setisSearchActivated(false);
			setArticles([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputSearch]);

	const languageISOCode = useLanguage();

	return (
		<PageWrapper isProtected={true}>
			{/* <SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{
								title: t(`${dashboardMenu.help.text}`),
								to: dashboardMenu.help.path,
							},
						]}
					/>
				</SubHeaderLeft>
			</SubHeader> */}
			<Page className='mw-100 px-3'>
				<div className=' d-flex pb-3 mb-4 border-bottom border-secondary w-100'>
					{topics?.length > 0 && <GoBack handleClick={handleGoBack} className='me-4' />}
					<h1 className='fs-2 fw-semibold text-secondary'>
						{t(`${dashboardMenu.help.text}`)}
					</h1>
				</div>

				{topics?.length > 0 ? (
					<div className={`d-flex mb-4 ${mobileDesign ? 'flex-column' : ''}`}>
						<div className={mobileDesign ? '' : 'help-menu me-3'}>
							<Card className='mb-3'>
								<CardBody
									style={
										Articles?.length !== 0 && isSearchActivated
											? {
													position: 'absolute',
													zIndex: 1,
													backgroundColor: 'white',
													right: 0,
													left: 0,
											  }
											: undefined
									}>
									<SearchBar
										search={inputSearch}
										setSearch={setInputSearch}
										translation='help'
									/>
									{Articles && Articles?.data?.length > 0 && isSearchActivated
										? Articles?.data.map((e: any, index: number) => {
												return (
													<div
														key={index}
														className='p-2 bd-highlight cursor-pointer ms-2'
														onClick={() => {
															setSelectedCategory(
																e.attributes[
																	`topic_name_${languageISOCode}`
																],
															);
															setisSearchActivated(false);
														}}>
														<label
															className='border-0 bg-transparent cursor-pointer m-auto'
															htmlFor='searchInput'>
															<Icon
																icon='Search'
																size='2x'
																color='dark'
																className='me-3'
															/>
														</label>
														{highlightMatchingText(
															e.attributes[
																`topic_name_${languageISOCode}`
															],
														)}
													</div>
												);
										  })
										: null}
								</CardBody>
							</Card>

							<Menu
								selectedCategory={selectedCategory}
								setSelectedCategory={setSelectedCategory}
							/>
						</div>
						<TopicDetails
							selectedCategory={selectedCategory}
							setSelectedCategory={setSelectedCategory}
						/>
					</div>
				) : (
					<NoData text={t('No help section to display')} />
				)}
			</Page>
		</PageWrapper>
	);
};

export default Help;
