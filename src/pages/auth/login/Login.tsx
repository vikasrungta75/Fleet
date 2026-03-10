import React, { FC, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { authPages } from '../../../menu';
import AuthContext from '../../../contexts/authContext';
import { store } from '../../../store/store';

export interface LocationStateInterface {
	from: string;
	message?: string;
}

const Login: FC = () => {
	const { setUser } = useContext(AuthContext);
	const dispatch = useDispatch<any>();
	const navigate = useNavigate();
	const { t } = useTranslation(['authPage']);
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

	const inputStyle = (field: string): React.CSSProperties => ({
		width: '100%',
		padding: '13px 16px',
		background: 'rgba(255,255,255,0.07)',
		border: `1px solid ${focusedField === field ? 'rgba(0,200,255,0.8)' : 'rgba(0,200,255,0.3)'}`,
		borderRadius: 10,
		color: '#fff',
		fontSize: 14,
		outline: 'none',
		boxSizing: 'border-box' as const,
		transition: 'border-color 0.2s, box-shadow 0.2s',
		boxShadow: focusedField === field ? '0 0 0 3px rgba(0,200,255,0.15)' : 'none',
	});

	return (
		<div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<img src='/login-bg.png' alt=''
				style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(1.15)' }} />
			<div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,10,0.35)', zIndex: 1 }} />
			<div style={{ position: 'relative', zIndex: 2, width: 440, maxWidth: '92vw', background: 'rgba(5,15,35,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(0,200,255,0.2)', boxShadow: '0 0 40px rgba(0,180,255,0.15)', borderRadius: 16, padding: '36px 36px 32px' }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
					<img src='/ravity-logo.png' alt='Ravity' style={{ height: 64, width: 'auto', marginBottom: 12 }} />
					<p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Fleet Intelligence Platform</p>
				</div>
				<h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 22, textAlign: 'center' }}>Sign In</h2>
				{formik.errors.loginPassword && formik.submitCount > 0 && (
					<div style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ff8a80', fontSize: 13 }}>
						⚠️ {formik.errors.loginPassword}
					</div>
				)}
				<form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					<div>
						<label htmlFor='loginUsername' style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email Address</label>
						<input id='loginUsername' name='loginUsername' type='text'
							value={formik.values.loginUsername} onChange={formik.handleChange}
							onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
							placeholder='Enter your username or email' autoComplete='username'
							style={inputStyle('email')} />
					</div>
					<div>
						<label htmlFor='loginPassword' style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
						<input id='loginPassword' name='loginPassword' type='password'
							value={formik.values.loginPassword} onChange={formik.handleChange}
							onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
							placeholder='Enter your password' autoComplete='current-password'
							style={inputStyle('password')} />
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
						<Link to={`/${authPages.forgetPassword.path}`} style={{ color: 'rgba(0,200,255,0.8)', fontSize: 12, textDecoration: 'none' }}>
							Forgot Password? Click here
						</Link>
					</div>
					<button type='submit' disabled={formik.isSubmitting}
						style={{ width: '100%', padding: '13px', background: formik.isSubmitting ? 'rgba(0,150,200,0.5)' : 'linear-gradient(135deg,#00c8ff,#0066ff)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: formik.isSubmitting ? 'not-allowed' : 'pointer', marginTop: 4, letterSpacing: 0.5, boxShadow: formik.isSubmitting ? 'none' : '0 4px 20px rgba(0,150,255,0.4)' }}>
						{formik.isSubmitting ? '⏳ Signing in...' : 'SIGN IN'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
