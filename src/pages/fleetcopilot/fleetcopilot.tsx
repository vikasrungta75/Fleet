import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/icon/Icon';

interface HistoryItem {
	context: string;
	session_id: string;
	last_activity?: string;
}

const FleetCopilot = () => {
	const [inputText, setInputText] = useState('');
	const [responses, setResponses] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
	const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);
	const [historyOpen, setHistoryOpen] = useState(true);
	const { token, user } = useSelector((state: any) => state.auth);
	const { t } = useTranslation(['overview', 'history']);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [hoveredIndex1, setHoveredIndex1] = useState<number | null>(null);
	const [hoveredIndex2, setHoveredIndex2] = useState<number | null>(null);
	const [history, setHistory] = useState<any[]>([]);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const chatEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [responses, loading]);

	useEffect(() => {
		const userId = user?.user?.id || user?.user?.userId;
		if (!userId) return;

		const sessionKey = `fleet_session_${userId}`;
		const loginKey = `fleet_login_user`;

		const lastLoginUser = localStorage.getItem(loginKey);
		let savedSessionId = localStorage.getItem(sessionKey);

		if (!savedSessionId || lastLoginUser !== userId.toString()) {
			const newId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
			localStorage.setItem(sessionKey, newId);
			localStorage.setItem(loginKey, userId.toString());
			savedSessionId = newId;
		}

		setSessionId(savedSessionId);
	}, [user]);

	// ✅ Fetch latest chat history
	useEffect(() => {
		const fetchChatHistory = async () => {
			try {
				const userId = user?.user?.id || user?.user?.userId;
				if (!userId) return;
				// pro
				const apiUrl = `https://platform.ravity.io/services/api/vc_chat_history_older?user_id=${userId}`;
				const headers = {
					'Content-Type': 'application/x-www-form-urlencoded',
					clientid: 'FOIQYDJAWVRQXHZMCBJC@1111',
					appname: 'valcode_fleet_api',
					clientsecret: 'TZOGAYRAPHMRRBKDYNHF1731307654016',
				};
				//stg
				// const apiUrl = `https://stg.ravity.io/services/api/vc_chart_history_older?user_id=${userId}`;

				// const headers = {
				// 	'Content-Type': 'application/x-www-form-urlencoded',
				// 	clientid: 'FGNGFLCIJAHACNUZOGOE@1723',
				// 	appname: 'valcode_fleet_api',
				// 	clientsecret: 'CDFMWISLNMPZEBKPMMAR1753942762958',
				// };
				//demo
				// const apiUrl = `https://platform.ravity.io/services/api/vc_chat_history_older?user_id=${userId}`;
				// const headers = {
				// 	'Content-Type': 'application/x-www-form-urlencoded',
				// 	clientid: 'VTBPJEQBEEDBEQSHIXDJ@5129',
				// 	appname: 'valcode_demo_api',
				// 	clientsecret: 'ESUKBCLCYETVMHAZPQXW1760338574796',
				// };

				const response = await fetch(apiUrl, {
					method: 'GET',
					headers,
				});
				if (!response.ok) {
					console.error('Failed to fetch chat history:', await response.text());
					return;
				}

				const text = await response.text();
				const data = text.startsWith('{') || text.startsWith('[') ? JSON.parse(text) : [];

				setQuestionHistory(Array.isArray(data) ? data : []);

				setHistory(data);
			} catch (err) {
				console.error('Error fetching chat history:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchChatHistory();
	}, [user]);

	const safeParseData = (data: any) => {
		if (!data) return [];

		try {
			if (Array.isArray(data)) return data;
			if (typeof data === 'object') return [data];
			if (typeof data === 'string') {
				const parsed = JSON.parse(data);
				if (Array.isArray(parsed)) return parsed;
				if (typeof parsed === 'object') return [parsed];
			}
		} catch (err) {
			console.warn('safeParseData: Unable to parse data field', err);
		}
		return [];
	};

	const fetchHistoryDetail = async (userId: string, historySessionId: string) => {
		setLoading(true);
		try {
			//prod
			const apiUrl = `https://platform.ravity.io/services/api/vc_chat_history?user_id=${userId}&session_id=${historySessionId}`;
			const headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				clientid: 'FOIQYDJAWVRQXHZMCBJC@1111',
				appname: 'valcode_fleet_api',
				clientsecret: 'TZOGAYRAPHMRRBKDYNHF1731307654016',
			};
			// stg
			// const apiUrl = `https://stg.ravity.io/services/api/vc_chat_history?user_id=${userId}&session_id=${historySessionId}`;
			// const headers = {
			// 	'Content-Type': 'application/x-www-form-urlencoded',
			// 	clientid: 'FGNGFLCIJAHACNUZOGOE@1723',
			// 	appname: 'valcode_fleet_api',
			// 	clientsecret: 'CDFMWISLNMPZEBKPMMAR1753942762958',
			// };
			//demo
			// const apiUrl = `https://platform.ravity.io/services/api/vc_chat_history?user_id=${userId}&session_id=${historySessionId}`;
			// const headers = {
			// 	'Content-Type': 'application/x-www-form-urlencoded',
			// 	clientid: 'VTBPJEQBEEDBEQSHIXDJ@5129',
			// 	appname: 'valcode_demo_api',
			// 	clientsecret: 'ESUKBCLCYETVMHAZPQXW1760338574796',
			// };

			const response = await fetch(apiUrl, { method: 'GET', headers });
			if (!response.ok) {
				console.error('Failed to fetch detailed history:', await response.text());
				return;
			}

			const data = await response.json();

			const parsedResponses = data.map((item: any) => {
				let firstParsed: any = {};
				try {
					firstParsed = JSON.parse(item.response);
				} catch {
					firstParsed = { response: item.response };
				}

				let finalParsed: any = {};
				try {
					finalParsed = JSON.parse(firstParsed.response);
				} catch {
					finalParsed = firstParsed;
				}

				let tableHTML = '';
				let cleanedResponse = '';
				let suggestionList: string[] = [];

				try {
					const parsedData = safeParseData(finalParsed.data);
					if (parsedData.length > 0) {
						const keys = Object.keys(parsedData[0]);
						const rows = parsedData
							.map(
								(row: any) =>
									`<tr>${keys
										.map(
											(k) =>
												`<td style="padding:6px; border:1px solid #ccc;">${
													row[k] ?? '-'
												}</td>`,
										)
										.join('')}</tr>`,
							)
							.join('');

						tableHTML = `
						<div style="margin-top:20px;">
							<table style="border-collapse:collapse; width:100%; font-size:14px;">
								<thead>
									<tr style="background:#f0f0f0;">
										${keys
											.map(
												(k) =>
													`<th style="padding:6px; border:1px solid #ccc; text-align:left;">
														${k
															.split('_')
															.map(
																(w) =>
																	w.charAt(0).toUpperCase() +
																	w.slice(1),
															)
															.join(' ')}
													</th>`,
											)
											.join('')}
									</tr>
								</thead>
								<tbody>${rows}</tbody>
							</table>
						</div>`;
					}

					if (finalParsed.visualization?.Suggestions) {
						const raw = finalParsed.visualization.Suggestions;
						suggestionList = Array.isArray(raw)
							? raw
							: raw
									.split(',')
									.map((s: string) => s.trim())
									.filter(Boolean);
					}

					cleanedResponse = `
					<div style="font-family: sans-serif; line-height: 1.6;">
						${tableHTML}
						${finalParsed.visualization?.Answer || finalParsed.visualization?.answer || ''}
						${finalParsed.visualization?.Analysis || finalParsed.visualization?.analysis || ''}
						${finalParsed.explanation ? `<p>${finalParsed.explanation}</p>` : ''}
					</div>`;
				} catch (err) {
					console.warn('Error parsing nested response:', err);
					cleanedResponse = 'No response available';
				}

				return {
					question: item.question,
					htmlResponse: cleanedResponse,
					suggestions: suggestionList,
				};
			});

			setResponses(parsedResponses);
		} catch (err) {
			console.error('Error fetching detailed history:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleSend = async (customText?: string, sessionIdFromHistory?: string) => {
		const textToSend = customText || inputText;
		if (!textToSend.trim()) return;

		setLoading(true);
		try {
			setQuestionHistory((prev) => [
				{ context: textToSend, session_id: sessionId || 'new' },
				...prev,
			]);

			// const url = 'https://stg.ravity.io/cxf/bizvizllm/llmService';

			const url = 'https://platform.ravity.io/cxf/bizvizllm/llmService';

			const authToken = token;
			const userId = user?.user?.id || user?.user?.userId;
			const spaceKey = user?.user?.spaceKey;

			const headers = {
				accept: 'application/json, text/plain, */*',
				'content-type': 'application/x-www-form-urlencoded',
				authtoken: authToken,
				spacekey: spaceKey,
				userid: userId,
				'cache-control': 'no-cache',
			};

			const bodyData = new URLSearchParams({
				serviceType: 'process_text',
				data: JSON.stringify({
					text: textToSend,
					userID: userId,
					sessionID:
						sessionId || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
					// assistId: '2779055408', //stg
					assistId: '1126914980', //prod
					// assistId: '1462804234',//demo
					// connector: '2762327433',//stg
					connector: '1085359343',//prod
					// connector: '1463300714',//demo
					description: 'I am the Fleet Analyzer Agent, an intelligent assistant...',
					tables: [
						'fleet_vehicle_daily_data',
						'daily_vehicle_usage',
						'agg_fleet_reports',
						'fleet_trip_enriched_collection',
						'fleet_driver_details',
						'vehicle_alerts',
						'vehicle_live_status',
						'vehicle_last_location',
						'fuel_prices',
						'fleet_vehicles',
						'fleet_fuel_sensor_info',
					],
					selected_files: [],
					type: 'connector',
					documentStoreIds: [
						'fleet_vehicle_daily_data',
						'daily_vehicle_usage',
						'agg_fleet_reports',
						'fleet_trip_enriched_collection',
						'fleet_driver_details',
						'vehicle_alerts',
						'vehicle_live_status',
						'vehicle_last_location',
						'fuel_prices',
						'fleet_vehicles',
						'fleet_fuel_sensor_info',
					],
					spaceKey: spaceKey,
				}),
				spacekey: spaceKey,
			});

			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: bodyData,
			});

			if (!response.ok) {
				const text = await response.text();
				console.error('Error response:', text);

				setResponses((prev) => [
					...prev,
					{ question: inputText, error: 'Server returned an error or empty response' },
				]);
				return;
			}

			const data = await response.json();

			let parsedResponse;
			try {
				parsedResponse = JSON.parse(data.response);
			} catch {
				parsedResponse = { html: data.response };
			}

			let cleanedResponse = '';
			let suggestionList: string[] = [];

			try {
				if (parsedResponse && !parsedResponse.html) {
					delete parsedResponse.query;
					delete parsedResponse.dashboards;
					delete parsedResponse.data_refreshed_at;

					const parsedData = safeParseData(parsedResponse.data);

					let tableHTML = '';
					if (parsedData.length > 0) {
						const keys = Object.keys(parsedData[0]);
						const rows = parsedData
							.map(
								(item) => `
						<tr>
							${keys
								.map(
									(key) =>
										`<td style="padding:6px; border:1px solid #ccc;">${
											item[key] ?? '-'
										}</td>`,
								)
								.join('')}
						</tr>`,
							)
							.join('');

						tableHTML = `
				<div style="margin-top:20px;">
					<table style="border-collapse:collapse; width:100%; font-size:14px;">
						<thead>
							<tr style="background:#f0f0f0;">

																${keys
																	.map((key) => {
																		const formattedKey = key
																			.split('_')
																			.map(
																				(word) =>
																					word
																						.charAt(0)
																						.toUpperCase() +
																					word.slice(1),
																			)
																			.join(' ');
																		return `<th style="padding:6px; border:1px solid #ccc; text-align:left;">${formattedKey}</th>`;
																	})
																	.join('')}
							</tr>
						</thead>
						<tbody>${rows}</tbody>
					</table>
				</div>
			`;
					}

					if (parsedResponse.visualization?.Suggestions) {
						const raw = parsedResponse.visualization.Suggestions;
						suggestionList = Array.isArray(raw)
							? raw
							: raw
									.split(',')
									.map((s: string) => s.trim())
									.filter(Boolean);
					}

					cleanedResponse = `
			<div style="font-family: sans-serif; line-height: 1.6;">
				${tableHTML}
				${parsedResponse.visualization?.answer || ''}
				${parsedResponse.visualization?.Answer || ''}
				${parsedResponse.visualization?.analysis || ''}
				${parsedResponse.visualization?.Analysis || ''}
				${parsedResponse.explanation ? `<p>${parsedResponse.explanation}</p>` : ''}
			</div>`;
				} else {
					cleanedResponse = parsedResponse.html || 'No response available';
				}
			} catch (err) {
				console.warn('Response handling failed — fallback to raw string', err);
				cleanedResponse = data.response || 'No response available';
			}
			setResponses((prev) => [
				...prev,
				{
					question: data.original_text || inputText,
					htmlResponse: cleanedResponse,
					suggestions: suggestionList,
				},
			]);

			// ✅ Ingestion API integration
			try {
				//prod
				const ingestionUrl = 'https://platform.ravity.io/ingestion/dataIngestion';
				const ingestionHeaders = {
					'Content-Type': 'application/json',
					IngestionId: '0a20cc5f-18e3-4610-8e70-71ed68af1b3f',
					IngestionSecret:
						'3xNIv66LGHA5DYU6ha2XgYdqg94mxE751+6OnJkWQNCbibCdD6ea1Q013khFQssA',
				};
				//stg
				// const ingestionUrl = 'https://stg.ravity.io/ingestion/dataIngestion';
				// const ingestionHeaders = {
				// 	'Content-Type': 'application/json',
				// 	IngestionId: 'f9db2198-c96f-4b64-9e76-6af225d16737',
				// 	IngestionSecret:
				// 		'F79ew+8v31o0ayARbJB/1SqcB0sI+Y8H6XnQa1xr/HGbibCdD6ea1Q013khFQssA',
				// };
				// demo
				// const ingestionUrl = 'https://platform.ravity.io/ingestion/dataIngestion';
				// const ingestionHeaders = {
				// 	'Content-Type': 'application/json',
				// 	IngestionId: '08601a6f-59eb-4e1c-a7c7-25be334996de',
				// 	IngestionSecret:
				// 		'yuWB2h089TX36m9HrWTwpUt76E2A3TMTAMXraQU5hHubibCdD6ea1Q013khFQssA',
				// };

				const ingestionBody = {
					question: textToSend,
					response: JSON.stringify(data),
					user_id: userId,
					action: 'add',
					session_id:
						sessionId || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,

					spacekey: spaceKey,
					user_name: user?.user?.fullName || 'Unknown_User',
					user_email: user?.user?.emailID || 'unknown@ravity.io',
				};

				const ingestionResponse = await fetch(ingestionUrl, {
					method: 'POST',
					headers: ingestionHeaders,
					body: JSON.stringify(ingestionBody),
				});

				if (!ingestionResponse.ok) {
					console.error('Ingestion API failed:', await ingestionResponse.text());
				} else {
					// console.log('✅ Ingestion success:', await ingestionResponse.json());
				}
			} catch (ingErr) {
				console.error('Error sending to ingestion API:', ingErr);
			}
		} catch (error) {
			console.error('Error:', error);
			setResponses((prev) => [
				...prev,
				{ question: inputText, error: 'Something went wrong!' },
			]);
		} finally {
			setLoading(false);
			setInputText('');
		}
	};

	const handleDeleteHistory = async (sessionIdToDelete: string) => {
		try {
			const userId = user?.user?.id || user?.user?.userId;
			if (!userId || !sessionIdToDelete) return;

			setLoading(true);
			//prod
			const apiUrl = 'https://platform.ravity.io/ingestion/dataIngestion';
			const headers = {
				'Content-Type': 'application/json',
				IngestionId: '0a20cc5f-18e3-4610-8e70-71ed68af1b3f',
				IngestionSecret: '3xNIv66LGHA5DYU6ha2XgYdqg94mxE751+6OnJkWQNCbibCdD6ea1Q013khFQssA',
			};
			// stg
			// const apiUrl = 'https://stg.ravity.io/ingestion/dataIngestion';
			// const headers = {
			// 	'Content-Type': 'application/json',
			// 	IngestionId: 'f9db2198-c96f-4b64-9e76-6af225d16737',
			// 	IngestionSecret: 'F79ew+8v31o0ayARbJB/1SqcB0sI+Y8H6XnQa1xr/HGbibCdD6ea1Q013khFQssA',
			// };
			//demo
			// const apiUrl = 'https://platform.ravity.io/ingestion/dataIngestion';

			// const headers = {
			// 	'Content-Type': 'application/json',
			// 	IngestionId: '08601a6f-59eb-4e1c-a7c7-25be334996de',
			// 	IngestionSecret: 'yuWB2h089TX36m9HrWTwpUt76E2A3TMTAMXraQU5hHubibCdD6ea1Q013khFQssA',
			// };
			const body = {
				question: '',
				response: '',
				user_id: userId,
				action: 'delete',
				session_id: sessionIdToDelete,
				spacekey: user?.user?.spaceKey || '11123',
				user_name: user?.user?.fullName || 'Unknown_User',
				user_email: user?.user?.emailID || 'unknown@ravity.io',
			};

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers,
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errText = await response.text();
				console.error('Failed to delete history:', errText);
				alert('❌ Failed to delete history. Check console for details.');
				return;
			}

			// ✅ Remove deleted item from UI
			setQuestionHistory((prev) => prev.filter((h) => h.session_id !== sessionIdToDelete));

			alert('✅ Chat history deleted successfully!');
		} catch (error) {
			console.error('Error deleting chat history:', error);
			alert('⚠️ Something went wrong while deleting.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={styles.wrapper}>
			<div style={{ ...styles.sidebar, width: historyOpen ? 250 : 60 }}>
				<div
					style={styles.sidebarHeader}
					onClick={() => {
						setInputText('');
						setResponses([]);
						setSelectedSuggestion('');
					}}>
					💬 {historyOpen && 'New chat'}
				</div>

				<div style={styles.sidebarHeader} onClick={() => setHistoryOpen((p) => !p)}>
					🕑 {historyOpen && 'History'}
				</div>
				{historyOpen && (
					<ul style={styles.historyList}>
						{/* {questionHistory.map((item, idx) => (
							<li
								key={idx}
								style={{
									...styles.historyItem,
									...(hoveredIndex1 === idx
										? {
												background: '#e3f2ff',
												border: '1px solid #007bff',
												transform: 'scale(1.02)',
												transition: 'all 0.2s ease',
										  }
										: {}),
								}}
								onMouseEnter={() => setHoveredIndex1(idx)}
								onMouseLeave={() => setHoveredIndex1(null)}
								onClick={() => {
									const userId = user?.user?.id || user?.user?.userId;
									if (userId && item.session_id)
										fetchHistoryDetail(userId, item.session_id);
								}}>
								{item.context}
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (
											window.confirm(
												'Are you sure you want to delete this chat history?',
											)
										) {
											handleDeleteHistory(item.session_id);
										}
									}}
									style={{
										background: 'none',
										border: 'none',
										color: 'red',
										cursor: 'pointer',
										fontSize: '16px',
										marginLeft: '8px',
									}}>
									🗑️
								</button>
							</li>
						))} */}
						{questionHistory.map((item, idx) => (
							<li
								key={idx}
								style={{
									...styles.historyItem,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '8px 12px',
									...(hoveredIndex1 === idx
										? {
												background: '#e3f2ff',
												border: '1px solid #007bff',
												transform: 'scale(1.02)',
												transition: 'all 0.2s ease',
										  }
										: {}),
								}}
								onMouseEnter={() => setHoveredIndex1(idx)}
								onMouseLeave={() => setHoveredIndex1(null)}>
								<div
									title={item.context}
									style={{
										flex: 1,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										cursor: 'pointer',
									}}
									onClick={() => {
										const userId = user?.user?.id || user?.user?.userId;
										if (userId && item.session_id)
											fetchHistoryDetail(userId, item.session_id);
									}}>
									{item.context}
								</div>

								<button
									onClick={(e) => {
										e.stopPropagation();
										if (
											window.confirm(
												'Are you sure you want to delete this chat history?',
											)
										) {
											handleDeleteHistory(item.session_id);
										}
									}}
									style={{
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										marginLeft: '8px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '4px',
										transition: 'transform 0.2s ease, background 0.2s ease',
										borderRadius: '6px',
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = '#fff1f0')
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = 'transparent')
									}>
									<Icon
										icon='Delete'
										size='lg'
										// color='danger'
										forceFamily='material'
									/>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Main Chat */}
			<div style={styles.chatArea}>
				{responses.length === 0 && (
					<div style={styles.chatHeader}>
						<h2 style={{ margin: 0, fontWeight: 600 }}>
							Hey {user?.user?.fullName || 'User'}, How may I assist you today?
						</h2>
					</div>
				)}

				<div style={styles.messages}>
					{responses.map((res, idx) => (
						<div key={idx}>
							<div style={styles.userBubble}>{res.question}</div>
							<div
								style={styles.aiBubble}
								dangerouslySetInnerHTML={{ __html: res.htmlResponse }}
							/>
							{res.error && <p style={{ color: 'red' }}>{res.error}</p>}
							{res.suggestions?.length > 0 && (
								<div style={styles.suggestionContainer}>
									{res.suggestions.map((s: string, i: number) => (
										<button
											key={i}
											style={{
												...styles.suggestionBtn,
												...(selectedSuggestion === s
													? styles.suggestionBtnActive
													: {}),
												...(hoveredIndex2 === i
													? {
															transform: 'scale(1)',
															backgroundColor: '#e3f2ff',
															borderColor: '#007bff',
													  }
													: {}),
											}}
											onMouseEnter={() => setHoveredIndex2(i)}
											onMouseLeave={() => setHoveredIndex2(null)}
											onClick={() => handleSend(s)}>
											{s}
										</button>
									))}
								</div>
							)}
						</div>
					))}
					{loading && (
						<div style={styles.aiBubble}>
							<span className='typing-dots'>
								<span>loading</span>
								<span>.</span>
								<span>.</span>
								<span>.</span>
							</span>
						</div>
					)}

					<div ref={chatEndRef} />
				</div>

				{(responses.length === 0 ||
					!responses[responses.length - 1]?.suggestions?.length) && (
					<div style={styles.initialSuggestions}>
						{[
							'Can you provide the current address of AL7 fleet vehicles?',
							'Fleet cost report for Jan–Aug 2025: operational costs, fuel expenses, cost per mile?',
							'Can you provide mileage data for other manufacturers in Fleet 2 for a complete comparison?',
							'Can you provide the alerts count for each vehicle from AL7?',
						].map((question, index) => (
							<button
								key={index}
								style={{
									...styles.suggestionBtn,
									...(selectedSuggestion === question
										? styles.suggestionButtonActive
										: {}),
									...(hoveredIndex === index
										? { backgroundColor: '#e3f2ff', borderColor: '#007bff' }
										: {}),
									transition: 'all 0.2s ease',
								}}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								onClick={() => {
									setSelectedSuggestion(question);
									setInputText(question);
									handleSend(question);
								}}>
								{question}
							</button>
						))}
					</div>
				)}

				<div style={styles.inputBar}>
					<input
						type='text'
						placeholder='Ask anything about fleet...'
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSend()}
						style={styles.input}
					/>
					<button onClick={() => handleSend()} style={styles.sendBtn}>
						➤
					</button>
				</div>
			</div>
		</div>
	);
};

const styles: { [key: string]: React.CSSProperties } = {
	wrapper: { display: 'flex', height: '92vh', fontFamily: 'Arial, sans-serif' },
	sidebar: {
		background: '#f8f8f8',
		borderRight: '1px solid #ddd',
		transition: 'width 0.3s',
		overflow: 'hidden',
	},
	sidebarHeader: {
		padding: '16px',
		borderBottom: '1px solid #ddd',
		fontWeight: 600,
		cursor: 'pointer',
	},
	historyList: {
		listStyle: 'none',
		margin: 0,
		padding: 12,
		overflowY: 'auto',
		height: 'calc(100vh - 60px)',
	},
	historyItem: {
		padding: 8,
		marginBottom: 8,
		background: '#fff',
		borderRadius: 6,
		cursor: 'pointer',
		boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
	},
	chatArea: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f2f2f2' },
	chatHeader: { padding: 16, borderBottom: '1px solid #ddd', background: '#fff' },
	messages: {
		flex: 1,
		padding: 20,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: 28,
	},
	userBubble: {
		background: '#007bff',
		color: 'white',
		padding: '12px 16px',
		borderRadius: 20,
		maxWidth: '70%',
		alignSelf: 'flex-end',
		marginBottom: 6,
	},
	aiBubble: {
		background: '#fff',
		padding: '14px 18px',
		borderRadius: 20,
		boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
		maxWidth: '100%',
		border: '1px solid #eee',
		marginTop: 6,
	},
	inputBar: { display: 'flex', padding: 12, borderTop: '1px solid #ddd', background: '#fff' },
	input: {
		flex: 1,
		border: '1px solid #ccc',
		borderRadius: 20,
		padding: '10px 14px',
		outline: 'none',
		marginRight: 8,
	},
	sendBtn: {
		background: '#007bff',
		color: '#fff',
		border: 'none',
		borderRadius: '50%',
		width: 40,
		height: 40,
		cursor: 'pointer',
	},
	suggestionContainer: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 },
	suggestionBtn: {
		padding: '6px 12px',
		borderRadius: 20,
		border: '1px solid #ccc',
		background: '#f9f9f9',
		cursor: 'pointer',
		fontSize: 13,
	},
	initialSuggestions: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 10,
		justifyContent: 'center',
		padding: '16px',
		borderTop: '1px solid #eee',
		background: '#fafafa',
	},
};

export default FleetCopilot;
