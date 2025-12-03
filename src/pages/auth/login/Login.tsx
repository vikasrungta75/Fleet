import React, { FC, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import { useFormik } from 'formik';
import '../../../styles/components/auth/_login.scss';
import Spinner from '../../../components/bootstrap/Spinner';
import { RootState, store } from '../../../store/store';
import { authPages } from '../../../menu';
import { useTranslation } from 'react-i18next';
import ConfirmPage from '../ConfirmPage';
import { useSelector } from 'react-redux';
import ValcodeLogo from '../../../assets/svg/logo3.svg';

export interface LocationStateInterface {
	from: string;
	message: string;
}

const Login: FC = () => {
	let location = useLocation();
	const state = location.state as LocationStateInterface;
	const { dispatch } = store;
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const handleOnClick = useCallback(() => navigate('/'), [navigate]);
	const { t } = useTranslation(['authPage']);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			userid: '',
			password: '',
		},
		validate: (values) => {
			const errors: { userid?: string; password?: string } = {};

			if (!values.userid) {
				errors.userid = `${t('Required')}`;
			} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.userid)) {
				errors.userid = t('Invalid email address');
			}

			if (!values.password) {
				errors.password = `${t('Required')}`;
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			setIsLoading(true);
			await dispatch.auth.getLogin(values).then(() => {
				const { auth } = store.getState();
				if (auth.success) {
					handleOnClick();
				} else {
					formik.setFieldError('password', t(auth.message));
					formik.setFieldError('userid', ' ');
				}
			});
			setIsLoading(false);
		},
	});

	const checkValidityOfToken = async () => {
		await dispatch.auth.GetValiditOfTokenAsync().then((res: any) => {
			if (res) {
				navigate(-1);
			} else {
				return;
			}
		});
	};

	React.useEffect(() => {
		checkValidityOfToken();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { dir } = useSelector((stateRematch: RootState) => stateRematch.appStore);

	return state?.from !== 'editProfile' ? (
		<PageWrapper isProtected={false} title='Login' className={classNames('page-wrapper-login')}>
			<div className='text-start position-absolute top-0 start-0 end-0 pt-2 ms-4'>
				<img src={ValcodeLogo} width='100' alt='Valcode Logo' className='responsive-img' />
			</div>
			<Page>
				<div className='row h-100  align-items-end justify-content-end position-absolute top-0 start-0 end-0'>
					<div className='col-xl-5 col-lg-6 col-md-8 no-shadow'>
						<Card className='no-shadow no-border rounded-0 ' data-tour='login-page'>
							<CardBody className='no-shadow no-border d-flex flex-column justify-content-start'>
								<form className='row g-4 m-auto position-absolute top-15 start-0 end-10'>
									<div className='text-center h1 fw-bold custom-text-color '>
										{t('SIGN IN')}
									</div>
									<div className='text-center custom-text-color- mt-0 mb-4 '>
										{t('Enter your email and password to login')}
									</div>
									<div className='col-12'>
										<FormGroup id='userid' isFloating label={t('Email')}>
											<Input
												autoComplete='Email'
												value={formik.values.userid}
												isTouched={formik.touched.userid}
												invalidFeedback={formik.errors.userid}
												isValid={formik.isValid}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												onFocus={() => {
													formik.setErrors({});
												}}
												
												className={classNames({
													'is-invalid':
														formik.touched.userid &&
														formik.errors.userid,
													'is-valid':
														formik.touched.userid &&
														!formik.errors.userid,
												})}
											/>
										</FormGroup>
									</div>
									<div className='col-12'>
										<FormGroup id='password' isFloating label={t('Password')}>
											<Input
												type='password'
												autoComplete='current-password'
												value={formik.values.password}
												isTouched={formik.touched.password}
												invalidFeedback={formik.errors.password}
												isValid={formik.isValid}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												showPasswordOption
												dir={dir}
											/>
										</FormGroup>
									</div>

									<p className='text-end'>
										{t('Forgot Password?')}{' '}
										<span
											role='button'
											className='text-blue-'
											onClick={() => {
												navigate(`/${authPages.forgetPassword.path}`);
											}}>
											{t('Click here')}
										</span>
									</p>

									<div className='col-12'>
										<Button
											className='w-100 py-3 custom-btn-color'
											onClick={formik.handleSubmit}
											type='submit'>
											{t('SIGN IN')}
											{isLoading && (
												<Spinner isSmall inButton className='ms-2' />
											)}
										</Button>
									</div>
									{/* <p className='text-center custom-margin '>
										{t("Don't have an account")}{' '}
										<span role='button' className='text-blue-'>
											<u>{t('SIGN UP')}</u>
										</span>
									</p> */}
								</form>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	) : (
		<ConfirmPage withRedirectButton={false} title={t('Congratulations')} />
	);
};

export default Login;
