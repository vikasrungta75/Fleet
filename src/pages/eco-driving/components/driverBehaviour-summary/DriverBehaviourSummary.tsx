// working***
import React, { FC } from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import { useTranslation } from 'react-i18next';

interface IDriverBehaviourSummary {
  timestamp: string;
  recommendation: string;
  poi_type: string;
}

interface IDriverBehaviourSummaryProps {
  DriverBehaviourSummaryData: { Recommendation: IDriverBehaviourSummary[] }[];
}

const DriverBehaviourSummary: FC<IDriverBehaviourSummaryProps> = ({ DriverBehaviourSummaryData }) => {
  const { t } = useTranslation(['recommendations']);

  return (
    <Card style={{ borderRadius: '8px', border: '1px solid #D9D9D9', backgroundColor: '#FFFFFF', boxShadow: '0px 2px 4px 0px #00000040', height: '500px', }} className="col-6">
      <CardHeader>
        <p className="scoresHeading mb-0">{t('Recommendations')}</p>
      </CardHeader>
      <CardBody
        style={{ maxHeight: 'calc(100% - 80px)', overflowY: 'auto', marginTop: '-27px', }}>
        {DriverBehaviourSummaryData.length > 0 &&
          DriverBehaviourSummaryData[0].Recommendation.length > 0 ? (
          DriverBehaviourSummaryData[0].Recommendation.map((item, index) => (
            <div key={index}
              style={{ borderBottom: '1px solid #F0F0F0', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', }}>
              <div style={{ display: 'flex', gap: '8px', }}>
                <span style={{ fontSize: '12px', color: '#1F1E1E'}} >
                  &#8226; {/* Bullet point */}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6C757D', }}>
                    {item.recommendation}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6C757D', }}>
                    {t('Location')}: {item.poi_type}
                  </p>
                </div>
              </div>
              {/* <div style={{ textAlign: 'right', fontSize: '12px', color: '#6C757D', whiteSpace: 'nowrap', }}>
                {item.timestamp || t('No timestamp available')}
              </div> */}
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6C757D', fontSize: '14px', }}>
            {t('No data available')}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default DriverBehaviourSummary;

