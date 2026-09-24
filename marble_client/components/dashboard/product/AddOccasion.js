"use Client"
import React , { useState , useEffect } from 'react'
import {createOccasionRoute, updateOccasionByIdRoute} from "@/utils/apiRoutes"
import { toast } from 'react-toastify';
import axios from 'axios';
import FileUploadBox from "@/components/dashboard/shared/FileUploadBox";

function AddOccasions({closePopup, occasionData = null, onAddOccasion, onUpdateOcassion}) {

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    parent_ocassion: "",
    slug: "",
  });

  useEffect(() => {
    if (occasionData) {
      setFormData({
        name_en: occasionData.name_en || "",
        name_ar: occasionData.name_ar || "",
        parent_ocassion: occasionData.parent_ocassion || "",
        slug: occasionData.slug || "",
      });
    }
  }, [occasionData]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name_en) errors.push("Name English is required.");
    if (!formData.name_ar) errors.push("Name Arabic is required.");
    if (!formData.slug) errors.push("Slug is required.");
    if (!formData.parent_ocassion) errors.push("Parent Occasion is required.");

    return errors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

      if (selectedFiles.length > 0) {
        payload.append("image_url", selectedFiles[0]);
      }

      if (occasionData) {
        const res = await axios.put(updateOccasionByIdRoute(occasionData.id), payload);
        if (res.status === 200 || res.status === 201) {
          toast.success("Ocassion updated successfully!", { autoClose: 1000, onClose: closePopup });
          onUpdateOcassion(res.data);
        }
      } else {
        const res = await axios.post(createOccasionRoute, payload);
        if (res.status === 200 || res.status === 201) {
          toast.success("Ocassion added successfully!", { autoClose: 1000, onClose: closePopup });
          onAddOccasion(res.data);
        }
      }
    }catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Something went wrong!";

      toast.error(backendMessage);
    }
  };


  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      setErrors([]);
    }
  }, [errors]);

  return (
    <form className='mt-0 popup-form-grid' onSubmit={handleSubmit}>
        <div className='form-group'>
            <label className="form-label">Name English</label>
            <input
             name='name_en'
             type='text'
             className='form-control form-control-lg text-secondary'
             value={formData.name_en}
             onChange={(e)=>setFormData({...formData,name_en:e.target.value})}
             />
        </div>
        <div className='form-group mt-3'>
            <label className="form-label">Name Arabic</label>
            <input
             name='name_ar'
             className='form-control form-control-lg text-secondary'
             value={formData.name_ar}
             onChange={(e)=>setFormData({...formData,name_ar:e.target.value})}/>
        </div>
        <div className='form-group mt-3'>
            <label className="form-label">Slug</label>
            <input
             name='slug'
             className='form-control form-control-lg text-secondary'
             value={formData.slug}
             onChange={(e)=>setFormData({...formData,slug:e.target.value})}/>
        </div>
        <div className='form-group mt-3'>
            <label className="form-label">Select Parent Occasion</label>
            <select className='form-select'
             value={formData.parent_ocassion}
             onChange={(e)=>setFormData({...formData,parent_ocassion:e.target.value})}>
                <option value="">Select Parent Occasion</option>
                <option value="None">None</option>
                <option value="Achievement">Achievement</option>
                <option value="Birthdays">Birthdays</option>
                <option value="Congratulations">Congratulations</option>
                <option value="Get Well Soon">Get Well Soon</option>
                <option value="Graduation">Graduation</option>
                <option value="Holidays">Holidays</option>
                <option value="New Born">New Born</option>
                <option value="Weddings">Weddings</option>
            </select>
        </div>

        <div className="col-md-12 px-1 mt-2 popup-form-full popup-upload-row">
        <FileUploadBox
          inputId="occasionFileInput"
          selectedFiles={selectedFiles}
          onChange={handleFileChange}
        />
        <div className="text-danger">
          <i className="bi bi-info-circle me-2"></i>
          <span className="fs-14 fw-normal">
            Supported files : GIF ,JPG , PNG, PDF , DOC , or DOCX
          </span>
        </div>
      </div>
      <hr className="mt-4 mb-3" />
      <div className="d-flex align-items-center justify-content-between">
        <button type="submit" className="form-submit-btn form-submit-btn-size d-inline-flex align-items-center justify-content-center gap-2 border-0 text-white fs-16 fw-medium rounded-3">
          <i className="bi bi-send-fill" aria-hidden="true"></i> Save
        </button>
        <button type="button" className="form-cancel-btn form-cancel-btn-size d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3" onClick={closePopup}>
          <i className="bi bi-x-circle" aria-hidden="true"></i> Cancel
        </button>
      </div>
    </form>
  )
}

export default AddOccasions;
