export default function FileUploadBox({
  inputId,
  selectedFiles = [],
  onChange,
  multiple = true,
  accept,
  name,
}) {
  const files = Array.isArray(selectedFiles) ? selectedFiles : [];

  return (
    <div className="upload-container text-center flex-column w-100">
      <input
        type="file"
        className="d-none"
        id={inputId}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={onChange}
      />
      <label htmlFor={inputId} role="button" className="d-block cursor-pointer">
        <div className="mb-1">
          <span className="fs-16 fw-medium">Upload File</span>
        </div>
        <div className="upload-text fs-16 fw-normal">
          <i className="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>
          Drag &amp; drop or <span className="text-decoration-underline">browse files</span>
        </div>
      </label>
      {files.length > 0 && (
        <div className="mt-2 fnt-color opacity-50 fs-16 fw-normal">
          {files.length === 1
            ? `File size ${(files[0].size / 1024).toFixed(1)} KB`
            : `${files.length} files selected`}
        </div>
      )}
    </div>
  );
}
