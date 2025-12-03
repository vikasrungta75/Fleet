import React, { FC } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import { useTranslation } from 'react-i18next';

interface DetailCardComponentProps {
	title: string;
	details: any;
}

const DetailCardComponent: FC<DetailCardComponentProps> = ({ title, details }) => {
	const { t } = useTranslation(['driverLeaderboard']);

	return (
		<Card style={{ background: '#FFFFFF',width: "396px",height: "484px",gap: "10px",borderRadius: "8px",border: "1px solid #D9D9D9",boxShadow: "0px 0px 25px 0px #5E5C9A1A"}} className='mt-5 px-0'>
			<CardHeader style={{  background: '#FFFFFF' }}>
				<p className='drIverProfile-heading'>{title}</p>
			</CardHeader>
			<CardBody className='mt-n4'>
				{details.map((arg: any, index: number) => (
					<div className='d-flex flex-column bd-highlight mb-3' key={index}>
						<div className='d-flex flex-row p-1 bd-highlight justify-content-between'>
							<div style={{ width: '50%' }} className='bd-highlight fw-bold'>
								{t(arg.label)}
							</div>
							<div style={{ width: '50%' }} className='bd-highlight'>
								{arg.value}
							</div>
						</div>
					</div>
				))}
			</CardBody>
		</Card>
	);
};

export default DetailCardComponent;


