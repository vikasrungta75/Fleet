import React, { useState } from 'react';

const weekdays = [
	{ key: 'monday', label: 'M' },
	{ key: 'tuesday', label: 'T' },
	{ key: 'wednesday', label: 'W' },
	{ key: 'thursday', label: 'T' },
	{ key: 'friday', label: 'F' },
	{ key: 'saturday', label: 'S' },
	{ key: 'sunday', label: 'S' },
];

interface RecurrencePickerProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: {
		recurrence_type: 'daily' | 'monthly';
		control_days: string[] | number[];
	}) => void;
}

const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ isOpen, onClose, onSave }) => {
	const [tab, setTab] = useState<'daily' | 'monthly'>('daily');
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [selectedDates, setSelectedDates] = useState<number[]>([]);

	const toggleDay = (day: string) => {
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const toggleDate = (date: number) => {
		setSelectedDates((prev) =>
			prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
		);
	};

	const handleSave = () => {
		onSave({
			recurrence_type: tab,
			control_days: tab === 'daily' ? selectedDays : selectedDates,
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className='modal show d-block' tabIndex={-1}>
			<div className='modal-dialog modal-dialog-centered'>
				<div className='modal-content p-3'>
					<ul className='nav nav-tabs justify-content-center' style={{ gap: '50px' }}>
						<li className='nav-item'>
							<button
								type='button'
								className={`nav-link ${tab === 'daily' ? 'active' : ''}`}
								onClick={() => setTab('daily')}
								// style={{ color: tab === 'daily' ? '#F00D69' : '#000000' }}
								style={{
									color: tab === 'daily' ? '#F00D69' : '#000000',
									fontFamily: 'Lato, sans-serif',
									fontWeight: 400,
									fontStyle: 'normal', // "Regular"
									fontSize: '9.3px',
									lineHeight: '9.3px',
									letterSpacing: '3%',
									textTransform: 'uppercase',
								}}>
								Daily
							</button>
						</li>
						<li className='nav-item'>
							<button
								type='button'
								className={`nav-link ${tab === 'monthly' ? 'active' : ''}`}
								onClick={() => setTab('monthly')}
								// style={{ color: tab === 'monthly' ? '#F00D69' : '#000000' }}
								style={{
									color: tab === 'monthly' ? '#F00D69' : '#000000',
									fontFamily: 'Lato, sans-serif',
									fontWeight: 400,
									fontStyle: 'normal', // "Regular"
									fontSize: '9.3px',
									lineHeight: '9.3px',
									letterSpacing: '3%',
									textTransform: 'uppercase',
								}}>
								Monthly
							</button>
						</li>
					</ul>

					{tab === 'daily' && (
						<div className='d-flex justify-content-around mt-3'>
							{weekdays.map((d) => (
								<button
									type='button'
									key={d.key}
									className={`btn rounded-circle`}
									style={{
										backgroundColor: selectedDays.includes(d.key)
											? '#F00D69'
											: '#E9E9E9',
										color: selectedDays.includes(d.key) ? '#FFFFFF' : '#000000',
										border: '1px solid #E9E9E9',
										width: '40px',
										height: '40px',
									}}
									onClick={() => toggleDay(d.key)}>
									{d.label}
								</button>
							))}
						</div>
					)}

					{tab === 'monthly' && (
						<div className='d-flex flex-wrap mt-3'>
							{Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
								<button
									type='button'
									key={date}
									className='btn m-1 rounded-circle'
									style={{
										backgroundColor: selectedDates.includes(date)
											? '#F00D69'
											: '#E9E9E9',
										color: selectedDates.includes(date) ? '#FFFFFF' : '#000000',
										border: '1px solid #E9E9E9',
										width: '50px',
										height: '50px',
									}}
									onClick={() => toggleDate(date)}>
									{date}
								</button>
							))}
						</div>
					)}

					<div className='d-flex justify-content-end mt-3'>
						<button className='btn btn-outline-dark me-2' onClick={onClose}>
							Cancel
						</button>
						<button className='btn btn-dark' onClick={handleSave}>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecurrencePicker;
