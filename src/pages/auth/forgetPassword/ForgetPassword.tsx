import React, { useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import ConfirmPage from '../ConfirmPage';
import { authPages } from '../../../menu';
import { store } from '../../../store/store';
import { useTranslation } from 'react-i18next';
import LogoKeeplin from '../../../components/LogoKeeplin';
import ValcodeLogo from '../../../assets/svg/logo3.svg';
 
const ForgetPassword = (): JSX.Element => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation(['authPage']);
 
    const [successSending, setSuccessSending] = useState(false);
 
    const formik = useFormik({
        initialValues: {
            email: '',
        },
 
        validate: (values) => {
            const errors: { email?: string } = {};
 
            if (!values.email) {
                errors.email = t('Required');
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                errors.email = t('Invalid email address');
            }
 
            return errors;
        },
        validateOnChange: false,
 
        onSubmit: async (values) => {
            const spaceId = {
                userid: values.email,
                authType: 'ep',
            };
            await dispatch.auth.getCustomerSpacesAsync(spaceId).then(() => {
                const { auth } = store.getState();
                if (auth.messageCode !== 'MSG_COMMON_0002') {
                    setSuccessSending(true);
                } else {
                    formik.setFieldError('email', auth.message);
                }
            });
        },
    });
 
    const LogoComponent = process.env.REACT_APP_LOGO === 'Keeplin' ? LogoKeeplin : Logo;
 
    return !successSending ? (
        <PageWrapper isProtected={false} title='Login' className={classNames('page-wrapper-login')}>
            <div className='text-start position-absolute top-0 start-0 end-0 pt-2 ms-4'>
                <img src={ValcodeLogo} width='100' alt='Valcode Logo' className='responsive-img' />
            </div>
            <Page>
                <div className='row h-100  align-items-end justify-content-end position-absolute top-0 start-0 end-0'>
                    <div className='col-xl-5 col-lg-6 col-md-8 no-shadow'>
                        <Card className='no-shadow no-border rounded-0 ' data-tour='login-page'>
                            <CardBody className='no-shadow no-border d-flex flex-column justify-content-start'>
                                <form className='row g-4  m-auto position-absolute top-20 start-0 end-10'>
                                    <div className='text-center h1 fw-bold custom-text-color'>
                                        {t('FORGOT PASSWORD')}
                                    </div>
                                    <div className='text-center custom-text-color- mt-0 mb-4'>
                                        {t(
                                            'Enter your email and you will receive a link to reset your password.',
                                        )}
                                        <br />
                                        {t('Please check your inbox.')}
                                    </div>
                                    <div className='col-12'>
                                        <FormGroup
                                            id='email'
                                            name='email'
                                            isFloating
                                            label={t('Enter Email')}>
                                            <Input
                                                autoComplete='email'
                                                onChange={formik.handleChange}
                                                value={formik.values.email}
                                                invalidFeedback={formik.errors.email}
                                                isTouched={formik.touched.email}
                                                isValid={formik.isValid}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className='col-12'></div>
 
                                    <div className='col-12'>
                                        <Button
                                            color='dark'
                                              className='w-100 py-3 my-3 mb-0 mt-0 custom-btn-color'
                                            onClick={formik.handleSubmit}>
                                            {t('Continue')}
                                            
                                        </Button>
                                    </div>
                                    <p className='text-center custom-text-color custom-margin'>
                                        {t('Return to login?')}{' '}
                                        <span
                                            role='button'
                                            className='text-blue-'
                                            onClick={() => {
                                                navigate(`/${authPages.login.path}`);
                                            }}>
                                            {t('Click here')}
                                        </span>
                                    </p>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </Page>
        </PageWrapper>
    ) : (
        <ConfirmPage
            title='SUCCESS'
            withRedirectButton={true}
            textButton='Login'
            redirectTo={`../${authPages.login.path}`}
        />
    );
};
 
export default ForgetPassword;