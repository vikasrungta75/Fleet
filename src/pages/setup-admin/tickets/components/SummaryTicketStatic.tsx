import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Card, { CardBody, CardHeader, CardTitle } from '../../../../components/bootstrap/Card';

interface SummaryTicketStaticProps {}

const cardsToDisplay = [
	{
		name: 'Total',
		count: 0,
		toBeDisplayed: true,
	},
	{
		name: 'Open',
		count: 0,
		toBeDisplayed: true,
	},
	{
		name: 'Resolved',
		count: 0,
		toBeDisplayed: true,
	},
	{
		name: 'Closed',
		count: 0,
		toBeDisplayed: true,
	},
];

const SummaryTicketStatic: FC<SummaryTicketStaticProps> = () => {
	const { t } = useTranslation(['tickets']);

	return (
		<Card>
			<CardHeader className='pb-0'>
				<CardTitle className='mt-3'>{t('Summary')}</CardTitle>
			</CardHeader>
			<CardBody className={`d-flex flex-wrap align-items-start justify-content-center `}>
				{cardsToDisplay.map(({ name, count, toBeDisplayed }, index) => {
					return (
						toBeDisplayed && (
							<Card key={index} style={{ width: '280px' }} className='mx-2'>
								<CardBody className='d-flex justify-content-center align-items-center p-3'>
									<div className='ms-3'>{t(`${name}`)} :</div>
									<span className='fs-5 fw-bold ms-3'>{count}</span>
								</CardBody>
							</Card>
						)
					);
				})}
			</CardBody>
		</Card>
	);
};

export default SummaryTicketStatic;
