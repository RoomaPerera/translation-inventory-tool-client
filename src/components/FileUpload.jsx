import React from 'react';

const FileUpload = ({ file, setFile, fileType, setFileType }) => (
  <>
    <input
      type="file"
      accept=".csv,.json"
      onChange={(e) => setFile(e.target.files[0])}
      className="mb-2 w-full border rounded p-2"
    />
    <select
      value={fileType}
      onChange={(e) => setFileType(e.target.value)}
      className="w-full border p-2 mb-2 rounded"
    >
      <option value="">Select File Type</option>
      <option value="csv">CSV</option>
      <option value="json">JSON</option>
    </select>
  </>
);

export default FileUpload;
