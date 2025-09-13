import React from 'react';
import ReactQuill from 'react-quill';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'code-block'],
    ['clean'],
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'code-block',
];

export function QuillEditor({ value, onChange, placeholder = 'Write something…' }) {
  return (
    <div
      className="rounded-lg border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-bg)' }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="rounded-2xl"
      />
    </div>
  );
}

export default QuillEditor;
