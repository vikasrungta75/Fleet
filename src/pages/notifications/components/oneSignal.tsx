import React from 'react';
import OneSignal from 'react-onesignal';
import showNotification from '../../../components/extras/showNotification';
import { store } from '../../../store/store';
import { capitalizeFirstLetter } from '../../../helpers/helpers';
import Icon from '../../../components/icon/Icon';

export const runOneSignal = async () => {
	const { user } = store.getState().auth.user;

	if (user?.id) {
		await OneSignal.init({
			appId: '5b6883cf-c6eb-4218-a703-3eba96954a6c',
			safari_web_id: 'web.onesignal.auto.67813ec5-45a5-4c64-95fb-a167cd7c4d3a',
			notifyButton: {
				enable: false,
			},
			allowLocalhostAsSecureOrigin: true,
			promptOptions: {
				slidedown: {
					prompts: [
						{
							type: 'push', // current types are "push" & "category"
							autoPrompt: true,
							text: {
								/* limited to 90 characters */
								actionMessage:
									'We use notifications to alert you of major events (speed, crash, vehicle overheating, etc)',
								/* acceptButton limited to 15 characters */
								acceptButton: 'Allow',
								/* cancelButton limited to 15 characters */
								cancelButton: 'Cancel',
							},
							delay: {
								pageViews: 1,
								timeDelay: 10,
							},
						},
					],
				},
			},
		});

		await OneSignal.Slidedown.promptPush();
		// OneSignal.Debug.setLogLevel('trace');
		OneSignal.login(user.id + '');

		const displayNotificationType = (title: string) => {
			// Notification type : 'success' | 'danger' | 'info' | 'default' | 'warning'
			if (title.includes('Alert')) {
				return 'danger';
			} else if (title.includes('driver')) {
				return 'default';
			} else {
				return 'success';
			}
		};

		const displayIcon = (key: string): string => {
			if (key === 'date') {
				return 'CalendarToday';
			} else if (key.includes('driver')) {
				return 'SwapVert';
			} else if (key === 'Method') {
				return 'Settings';
			} else {
				return '';
			}
		};

		const displayNotification = (body: string): JSX.Element => {
			// Function to test string
			function isJSON(str: string) {
				try {
					return JSON.parse(str) && !!str;
				} catch (e) {
					return false;
				}
			}
			const parsedBody = isJSON(body) ? JSON.parse(body) : body;
			if (isJSON(body)) {
				const customBody = Object.entries(parsedBody).map(([key, value], index) => {
					const title: string = key
						.replace(/_/g, ' ')
						.replace(/\b\w/g, (match: string) => match.toUpperCase());

					if (title === 'Date') {
						return (
							<div key={index} className='mb-2'>
								<Icon
									icon={displayIcon(key)}
									size='lg'
									color='light'
									className='me-3'
								/>{' '}
								<span>{capitalizeFirstLetter(value as string)}</span>
							</div>
						);
					}
					if (title.includes('Driver')) {
						return (
							<div key={index} className='mb-2'>
								<Icon
									icon={displayIcon(key)}
									size='lg'
									color='light'
									className='me-3'
								/>
								<span className='fw-semibold'>{title} :</span>{' '}
								<span>{capitalizeFirstLetter(value as string)}</span>
							</div>
						);
					}
					return (
						<div key={index} className='mb-2'>
							<Icon
								icon={displayIcon(key)}
								size='lg'
								color='light'
								className='me-3'
							/>
							<span className='fw-semibold'>{title} :</span>{' '}
							<span>{capitalizeFirstLetter(value as string)}</span>
						</div>
					);
				});

				return <>{customBody}</>;
			} else {
				return <>{body}</>;
			}
		};

		const foregroundWillDisplayListener = async (event: any) => {
			const notificationTitle = event.notification.title;
		
			const notificationBody = event.notification.body;
		
			await store.dispatch.notifications.getAllNotifications();
			showNotification(
				notificationTitle || '',
				displayNotification(notificationBody) || '',
				displayNotificationType(notificationTitle),
			);
		
		};

		OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) =>
			foregroundWillDisplayListener(event),
		);
	}
};
