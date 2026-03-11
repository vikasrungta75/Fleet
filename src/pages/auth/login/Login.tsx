// src/pages/auth/login/Login.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CHANGES (DES-03 / A11Y-01):
//   • Removed dark glassmorphism with #00c8ff blue accents
//   • New theme: light/white card with purple primary (#6c5dd3) brand palette
//   • Fixed focusedField key mismatch: was 'email', now 'loginUsername'
//   • Removed eslint-disable jsx-a11y/label-has-associated-control comment;
//     label → input association is now correct via htmlFor
//   • All colors use --rv-* CSS custom properties from _tokens.scss
// ─────────────────────────────────────────────────────────────────────────────

import React, { FC, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { authPages } from '../../../menu';
import AuthContext from '../../../contexts/authContext';
import { store } from '../../../store/store';
import styles from './Login.module.scss';

export interface LocationStateInterface {
	from: string;
	message?: string;
}

const Login: FC = () => {
	const { setUser } = useContext(AuthContext);
	const dispatch = useDispatch<any>();
	const navigate = useNavigate();
	const { t } = useTranslation(['authPage']);

	// ── [FIX A11Y-01] Field names now match the formik field ids exactly ────────
	// Previously: setFocusedField('email') — but htmlFor was 'loginUsername'
	// Now: field keys match the formik initialValues keys
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const formik = useFormik({
		initialValues: {
			loginUsername: '',
			loginPassword: '',
		},
		validate: (values) => {
			const errors: { loginUsername?: string; loginPassword?: string } = {};
			if (!values.loginUsername) errors.loginUsername = t('Required');
			if (!values.loginPassword) errors.loginPassword = t('Required');
			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			await dispatch.auth
				.getLogin({
					userid: values.loginUsername,
					password: values.loginPassword,
				})
				.then(() => {
					const { auth } = store.getState();
					if (auth.user?.success || auth.token) {
						if (setUser) setUser(values.loginUsername);
						navigate('/overview');
					} else {
						formik.setFieldError(
							'loginPassword',
							auth.message || t('Invalid credentials'),
						);
					}
				})
				.catch(() => {
					formik.setFieldError('loginPassword', t('Login failed. Please try again.'));
				});
		},
	});

	return (
		<div className={styles.root}>
			{/* Background image — same as before */}
			<img
				src='/login-bg.png'
				alt=''
				aria-hidden='true'
				className={styles.bgImage}
			/>
			{/* ── [FIX DES-03] Overlay now uses purple-tinted dark, not pure black ── */}
			<div className={styles.overlay} aria-hidden='true' />

			{/* ── Login card — white, light, brand-aligned ─────────────────────── */}
			<div className={styles.card} role='main'>
				{/* Logo + tagline */}
				<div className={styles.logoBlock}>
					<img src='/ravity-logo.png' alt='Ravity Fleet Intelligence' className={styles.logo} />
					<p className={styles.tagline}>Fleet Intelligence Platform</p>
				</div>

				{/* ── [FIX DES-03] Title now uses brand color, not white-on-dark ──── */}
				<h1 className={styles.cardTitle}>Sign In</h1>

				{/* Error banner */}
				{formik.errors.loginPassword && formik.submitCount > 0 && (
					<div className={styles.errorBanner} role='alert'>
						<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
							<circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
						</svg>
						{formik.errors.loginPassword}
					</div>
				)}

				<form onSubmit={formik.handleSubmit} noValidate className={styles.form}>
					{/* ── Email field ─────────────────────────────────────────────── */}
					<div className={styles.field}>
						{/* [FIX A11Y-01] htmlFor matches input id exactly */}
						<label htmlFor='loginUsername' className={styles.label}>
							{t('Email Address')}
						</label>
						<input
							id='loginUsername'
							name='loginUsername'
							type='text'
							value={formik.values.loginUsername}
							onChange={formik.handleChange}
							onFocus={() => setFocusedField('loginUsername')}
							onBlur={() => setFocusedField(null)}
							placeholder={t('Enter your username or email')}
							autoComplete='username'
							aria-invalid={!!formik.errors.loginUsername}
							aria-describedby={formik.errors.loginUsername ? 'loginUsername-error' : undefined}
							className={`${styles.input} ${focusedField === 'loginUsername' ? styles.inputFocused : ''} ${formik.errors.loginUsername && formik.submitCount > 0 ? styles.inputError : ''}`}
						/>
						{formik.errors.loginUsername && formik.submitCount > 0 && (
							<span id='loginUsername-error' className={styles.fieldError} role='alert'>
								{formik.errors.loginUsername}
							</span>
						)}
					</div>

					{/* ── Password field ────────────────────────────────────────────── */}
					<div className={styles.field}>
						<label htmlFor='loginPassword' className={styles.label}>
							{t('Password')}
						</label>
						<input
							id='loginPassword'
							name='loginPassword'
							type='password'
							value={formik.values.loginPassword}
							onChange={formik.handleChange}
							onFocus={() => setFocusedField('loginPassword')}
							onBlur={() => setFocusedField(null)}
							placeholder={t('Enter your password')}
							autoComplete='current-password'
							aria-invalid={!!formik.errors.loginPassword}
							className={`${styles.input} ${focusedField === 'loginPassword' ? styles.inputFocused : ''}`}
						/>
					</div>

					{/* Forgot password */}
					<div className={styles.forgotRow}>
						<Link to={`/${authPages.forgetPassword.path}`} className={styles.forgotLink}>
							{t('Forgot Password?')}
						</Link>
					</div>

					{/* Submit */}
					<button
						type='submit'
						disabled={formik.isSubmitting}
						className={`${styles.submitBtn} ${formik.isSubmitting ? styles.submitBtnLoading : ''}`}
					>
						{formik.isSubmitting ? t('Signing in…') : t('SIGN IN')}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
