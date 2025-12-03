import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
}

const RichTextEditor: FC<RichTextEditorProps> = ({ value, onChange }) => {
	const { t } = useTranslation(['tickets']);
	const [editorHtml, setEditorHtml] = useState(value);
	const handleChange = (html: string) => {
		setEditorHtml(html);
		onChange(html);
	};

	return (
		<ReactQuill
			value={editorHtml}
			onChange={handleChange}
			theme={'snow'}
			modules={{
				toolbar: [
					['bold', 'italic', 'underline', 'strike'], // toggled buttons
					['blockquote', 'code-block'],

					[{ header: 1 }, { header: 2 }], // custom button values
					[{ list: 'ordered' }, { list: 'bullet' }],
					[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
					[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
					[{ direction: 'rtl' }], // text direction

					[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
					[{ header: [1, 2, 3, 4, 5, 6, false] }],

					[{ color: [] }, { background: [] }], // dropdown with defaults from theme
					[{ font: [] }],
					['link', 'image'],
					[{ align: [] }],

					['clean'], // remove formatting button
				],
			}}
			placeholder={t('Write your description here')}
		/>
	);
};

export default RichTextEditor;
