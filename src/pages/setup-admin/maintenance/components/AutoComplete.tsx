// import React, { FC, useEffect, useState } from 'react';
// import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
// import Input from '../../../../components/bootstrap/forms/Input';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../../../store/store';
// import { Iusers } from '../../../../type/auth-type';
// import { useGetFleetManagers } from '../../../../services/groupsService';

// interface IAutoComplete {
// 	handleClick: (email: Iusers) => void;
// 	placeholder?: string; 
// 	children?: React.ReactNode; 
// }
// const AutoComplete: FC<IAutoComplete> = ({ handleClick, placeholder }) => {
// 	const [searchInput, setShearch] = useState('');

// 	const [autoCompleteData, setAutoCompleteData] = useState<string[]>([]);
// 	const { data, isSuccess, refetch } = useGetFleetManagers();

// 	useEffect(() => {
// 		let filtredInput = [];
// 		filtredInput = data?.filter((item: any) => {
// 			return item?.users?.EmailID.toUpperCase().includes(searchInput?.toUpperCase());
// 		});

// 		setAutoCompleteData(filtredInput);
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [searchInput]);

// 	return (
// 		<>
// 			<Input
// 				type='text'
// 				placeholder={placeholder}
// 				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
// 					setShearch(e.target.value);
// 				}}
// 				value={searchInput}
// 				style={{color: "black" }} 
// 			/>
// 			{searchInput && isSuccess && (
// 				<div
// 					className='mt-2 w-100 shadow-sm p-3 mb-5 bg-white rounded'
// 					style={{ maxHeight: '100px', overflow: 'scroll' }}>
// 					<ul className='list-group list-group-flush'>
// 						{autoCompleteData?.map((item: any, index: number) => (
// 							<li
// 								key={index}
// 								className='list-group-item autocomplete-item'
// 								onClick={() => {
// 									handleClick(item);
// 									setShearch('');
// 								}}>
// 								{item?.users?.EmailID}
// 							</li>
// 						))}
// 					</ul>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default AutoComplete;


// import React, { FC, useEffect, useState } from 'react';
// import Input from '../../../../components/bootstrap/forms/Input';
// import { Iusers } from '../../../../type/auth-type';
// import { useGetFleetManagers } from '../../../../services/groupsService';

// interface IAutoComplete {
// 	handleClick: (email: Iusers) => void;
// 	placeholder?: string;	
// }

// const AutoComplete: FC<IAutoComplete> = ({ handleClick, placeholder }) => {
// 	const [searchInput, setSearchInput] = useState('');
// 	const [autoCompleteData, setAutoCompleteData] = useState<Iusers[]>([]);
// 	const { data, isSuccess } = useGetFleetManagers();

// 	useEffect(() => {
// 		if (data) {
// 			const filteredData = data.filter((item: any) =>
// 				item?.users?.EmailID.toUpperCase().includes(searchInput.toUpperCase())
// 			);
// 			setAutoCompleteData(filteredData);
// 		}
// 	}, [searchInput, data]);

// 	return (
// 		<>
// 			<Input
// 				type="text"
// 				placeholder={placeholder}
// 				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
// 					setSearchInput(e.target.value);
// 				}}
// 				value={searchInput}
// 				style={{gap: '0px',fontFamily: 'Open Sans', fontSize: '12px', fontWeight: '500', textAlign: 'left', textUnderlinePosition: 'from-font', textDecorationSkipInk: 'none', color: '#888EA8',borderRadius:"5px",height:"43px" }} />
// 			{searchInput && isSuccess && (
// 				<div
// 					className="mt-2 w-100 shadow-sm p-3 mb-5 bg-white rounded"
// 					style={{ maxHeight: '100px', overflowY: 'scroll' }}
// 				>
// 					<ul className="list-group list-group-flush">
// 						{autoCompleteData.map((item: any, index: number) => (
// 							<li
// 								key={index}
// 								className="list-group-item autocomplete-item"
// 								onClick={() => {
// 									handleClick(item);
// 									setSearchInput('');
// 								}}
// 							>
// 								{item?.users?.EmailID}
// 							</li>
// 						))}
// 					</ul>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// export default AutoComplete;

//
import React, { FC, useEffect, useState } from 'react';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { Iusers } from '../../../../type/auth-type';
import { useGetFleetManagers } from '../../../../services/groupsService';
interface IAutoComplete {
	handleClick: (email: Iusers) => void;
  	placeholder?: string;
}
const AutoComplete: FC<IAutoComplete> = ({ handleClick,placeholder }) => {
	const [searchInput, setShearch] = useState('');
    const [autoCompleteData, setAutoCompleteData] = useState<string[]>([]);
	const { data, isSuccess, refetch } = useGetFleetManagers();

	useEffect(() => {
		let filtredInput = [];
		filtredInput = data?.filter((item: any) => {
			return item?.users?.EmailID.toUpperCase().includes(searchInput?.toUpperCase());
		});

		setAutoCompleteData(filtredInput);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput]);

	return (
		<>
			<Input
				type='text'
                placeholder={placeholder}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setShearch(e.target.value);
				}}
				value={searchInput}
                style={{gap: '0px',fontFamily: 'Open Sans', fontSize: '12px', fontWeight: '500', textAlign: 'left', textUnderlinePosition: 'from-font', textDecorationSkipInk: 'none', color: '#888EA8',borderRadius:"5px",height:"43px" }} />
			{searchInput && isSuccess && (
				<div
					className='mt-2 w-100 shadow-sm p-3 mb-5 bg-white rounded'
					style={{ maxHeight: '100px', overflow: 'scroll' }}>
              
					<ul className='list-group list-group-flush'>
						{autoCompleteData?.map((item: any, index: number) => (
							<li
								key={index}
								className='list-group-item autocomplete-item'
								onClick={() => {
									handleClick(item);
									setShearch('');
								}}>
								{item?.users?.EmailID}
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
};

export default AutoComplete;