"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getGendersRoute, getBranchesRoute, getCategoryTreeRoute, updateProductByIdRoute, getProductByIdRoute, getTagsRoute, getOccasionsRoute, createProductRoute } from "@/utils/apiRoutes";
import useAxiosConfig from "@/hooks/useAxiosConfig";
import MultiSelectDropdown from "@/components/dashboard/shared/MultiSelectDropdown";
import StatusToggle from "@/components/dashboard/shared/StatusToggle";
import marbleUploadUrl from "@/utils/marbleUploadUrl";
import axios from "axios";
import Common from "@/utils/Common"
import { toast, ToastContainer } from "react-toastify";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
const MemoJoditEditor = React.memo(JoditEditor);

export default function AddProductForm({ productId = null, onAddProduct }) {
  const [selectedFile, setSelectedFile] = useState([]);
  const { token } = useAxiosConfig();
  const id = productId;

  const isEditMode = Boolean(id);
  const [productData, setProductData] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const descriptionRef = useRef("");
  const [genders, setGenders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [errors, setErrors] = useState([]);
  const router = useRouter();
  const [branchIds, setBranchIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagIds, setTagIds] = useState([]);
  const [occasionIds, setOccasionIds] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [genderIds, setGenderIds] = useState([]);
  const slugify = (value) =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    slug: "",
    tag_ids: [],
    description: "",
    occasion_ids: [],
    regular_price: "",
    sale_price: "",
    tax_status: "Taxable",
    tax_class: "Standard",
    pickup_only: false,
    stock_status: "instock",
    special_day_active: true,
    special_day_start: "",
    special_day_end: "",
    special_day_date: "",
    special_day_lock_date: false,
    branch_ids: [],
    category_ids: []
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFile(files);
  };

  const fetchGenders = async () => {
    try {
      const response = await axios.get(getGendersRoute);
      setGenders(response?.data?.data);
    } catch (error) {
      console.error("Error fetching Genders", error);
    }
  };

  // fetchProduct
  useEffect(() => {
    if (!token || !isEditMode) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(getProductByIdRoute(id));
        setProductData(res.data);
      } catch (error) {
        console.error("Product fetch failed", error);
      }
    };

    fetchProduct();
  }, [token, id, isEditMode]);


  /* ===== PREFILL (IMPORTANT PART) ===== */
  useEffect(() => {
    if (!productData || !isEditMode) return;

    setFormData({
      name_en: productData.name_en || "",
      name_ar: productData.name_ar || "",
      slug: productData.slug || "",
      description: productData.description || "",
      regular_price: productData.regular_price || "",
      sale_price: productData.sale_price || "",
      tax_status: productData.tax_status || "",
      tax_class: productData.tax_class || "",
      pickup_only: productData.pickup_only === true,
      stock_status:
        productData.stock_status === "outofstock" ? "outofstock" : "instock",
      // Default Active when unset; only explicit false/0 turns it off.
      special_day_active: !(
        productData.special_day_active === false ||
        productData.special_day_active === 0 ||
        productData.special_day_active === "0" ||
        productData.special_day_active === "false"
      ),
      special_day_start: productData.special_day_start
        ? String(productData.special_day_start).slice(0, 10)
        : "",
      special_day_end: productData.special_day_end
        ? String(productData.special_day_end).slice(0, 10)
        : "",
      special_day_date: productData.special_day_date
        ? String(productData.special_day_date).slice(0, 10)
        : "",
      special_day_lock_date: productData.special_day_lock_date === true,
    });

    setBranchIds(productData.branches?.map(b => b.id) || []);
    setCategoryIds(productData.categories?.map(c => c.id) || []);
    setOccasionIds(productData.occasions?.map(o => o.id) || []);
    setTagIds(productData.tags?.map(t => t.id) || []);
    setGenderIds(productData.genders?.map(g => g.id) || []);
  }, [productData, isEditMode]);


  const fetchBranches = async () => {
    try {
      const res = await axios.get(getBranchesRoute);
      setBranches(res?.data?.data || []);
    } catch (err) {
      console.error("Branch fetch error", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get(getTagsRoute);
      setTags(res?.data?.data || []);
    } catch (err) {
      console.error("Tag fetch error", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(getCategoryTreeRoute);
      const flatCategories = Common.flattenCategories(res.data.data);
      setParentCategories(flatCategories);
    } catch (err) {
      console.error("Category fetch error", err);
    }
  };

  const fetchOccasions = async () => {
    try {
      const res = await axios.get(getOccasionsRoute);
      setOccasions(res?.data?.data || []);
    } catch (err) {
      console.error("Occasion fetch error", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchGenders();
    fetchBranches();
    fetchTags();
    fetchCategories();
    fetchOccasions();
  }, [token]);

  const editorConfig = useMemo(() => ({
    height: 300,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough',
      '|', 'superscript', 'subscript',
      '|', 'ul', 'ol', 'outdent', 'indent',
      '|', 'font', 'fontsize', 'brush', 'paragraph',
      '|', 'image', 'video', 'table', 'link',
      '|', 'align', 'undo', 'redo', 'fullsize'
    ],
    style: { background: '#f8f9fa', color: '#212529' }
  }), []);

  const validateForm = () => {
    const errors = [];
    if (!formData.name_en) errors.push("Name English is require!");
    if (!formData.name_ar) errors.push("Name Arabic is require!");
    if (!formData.slug) errors.push("Slug is require!");
    if (formData.slug && !/^[a-z0-9-]+$/i.test(formData.slug)) {
      errors.push("Slug can contain only letters, numbers, and dashes.");
    }
    if (!formData.description) errors.push("Description is require!");
    // if (!formData.gender_id) errors.push("Gender is require!");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach((err) => toast.error(err));
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (typeof v === "boolean") {
        payload.append(k, v ? "true" : "false");
        return;
      }
      payload.append(k, v == null ? "" : v);
    });

    branchIds.forEach(id => payload.append("branch_ids[]", id));
    categoryIds.forEach(id => payload.append("category_ids[]", id));
    occasionIds.forEach(id => payload.append("occasion_ids[]", id));
    tagIds.forEach(id => payload.append("tag_ids[]", id));
    genderIds.forEach(id => payload.append("gender_ids[]", id));
    selectedFile.forEach(file => payload.append("image_url", file));

    try {
      if (isEditMode) {
        await axios.put(updateProductByIdRoute(id), payload);

        toast.success("Product updated successfully!", {
          autoClose: 1000,
          onClose: () => {
            router.push("/dashboard/product");
          },
        });

      } else {
        await axios.post(createProductRoute, payload);

        toast.success("Product added successfully!", {
          autoClose: 1000,
          onClose: () => {
            router.push("/dashboard/product");
          },
        });
      }

    } catch (err) {
      toast.error("Something went wrong");
    }
  };


  return (
    <div className="container-fluid py-4 product-add-page">
      <div className="d-flex justify-content-between mb-3">
        <p className="pagetitle mb-0 fnt-color">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </p>
        <div>
          <button
            type="button"
            className="form-cancel-btn d-inline-flex align-items-center gap-2 bg-white border rounded-3 text-muted fs-14 px-3 py-2"
            onClick={() => router.push("/dashboard/product")}
          >
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card product-form-card mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fs-18 fw-semibold">Product Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name (English) <span className="text-danger">*</span></label>
                    <input
                      name="name_en"
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => {
                        const name_en = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name_en,
                          slug: prev.slug ? prev.slug : slugify(name_en),
                        }));
                      }}
                      className="form-control fs-14 mt-2 textarea-hover-dark text-secondary"
                      placeholder="Enter product name in English"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name (Arabic) <span className="text-danger">*</span></label>
                    <input
                      name="name_ar"
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="form-control fs-14 mt-2 textarea-hover-dark text-secondary"
                      placeholder="أدخل اسم المنتج باللغة العربية"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Slug <span className="text-danger">*</span></label>
                  <input
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="form-control fs-14 mt-2 textarea-hover-dark text-secondary"
                    placeholder="product-slug"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description <span className="text-danger">*</span></label>
                  <div className="overflow-hidden">
                    <MemoJoditEditor
                      value={formData.description}
                      config={editorConfig}
                      onChange={(content) => {
                        descriptionRef.current = content;
                      }}
                      onBlur={(newContent) => {
                        setFormData(prev => ({
                          ...prev,
                          description: newContent
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Tags <span className="text-danger">*</span></label>
                    <MultiSelectDropdown
                      label=""
                      items={tags}
                      selectedIds={tagIds}
                      setSelectedIds={setTagIds}
                      placeholder="Select tags..."
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <MultiSelectDropdown
                      label=""
                      items={genders}
                      selectedIds={genderIds}
                      setSelectedIds={setGenderIds}
                      placeholder="Select genders..."
                    />
                  </div>
                </div>

                <div className="border rounded-3 p-3">
                  <StatusToggle
                    id="stock_status"
                    label="In stock"
                    checked={formData.stock_status === "instock"}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        stock_status: checked ? "instock" : "outofstock",
                      })
                    }
                  />
                  <p className="small text-muted mb-0 mt-2">
                    When off, customers cannot add this product to the cart.
                  </p>
                </div>

                <div className="border rounded-3 p-3 mt-3">
                  <StatusToggle
                    id="pickup_only"
                    label="Pickup only"
                    checked={formData.pickup_only}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        pickup_only: checked,
                      })
                    }
                  />
                  <p className="small text-muted mb-0 mt-2">
                    Customers cannot order this product using Delivery.
                  </p>
                </div>

                <div className="border rounded-3 p-3 mt-3">
                  <p className="fs-16 fw-medium fnt-color mb-2">
                    Pre-order / special-day window
                  </p>
                  <p className="small text-muted mb-3">
                    Optional. When Active is on with start and end dates,
                    customers can only add this product during the window, and
                    delivery or pickup dates are limited to that range. Saving
                    with Active off clears the date fields.
                  </p>
                  <StatusToggle
                    id="special_day_active"
                    label="Active"
                    className="mb-3"
                    checked={formData.special_day_active}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        special_day_active: checked,
                      })
                    }
                  />
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor="special_day_start"
                      >
                        Start date
                      </label>
                      <input
                        id="special_day_start"
                        name="special_day_start"
                        type="date"
                        className="form-control fs-14"
                        value={formData.special_day_start}
                        disabled={!formData.special_day_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            special_day_start: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor="special_day_end"
                      >
                        End date
                      </label>
                      <input
                        id="special_day_end"
                        name="special_day_end"
                        type="date"
                        className="form-control fs-14"
                        value={formData.special_day_end}
                        min={formData.special_day_start || undefined}
                        disabled={!formData.special_day_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            special_day_end: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor="special_day_date"
                      >
                        Required delivery / pickup date
                      </label>
                      <input
                        id="special_day_date"
                        name="special_day_date"
                        type="date"
                        className="form-control fs-14"
                        value={formData.special_day_date}
                        min={formData.special_day_start || undefined}
                        max={formData.special_day_end || undefined}
                        disabled={!formData.special_day_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            special_day_date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check form-switch mb-2">
                        <input
                          id="special_day_lock_date"
                          name="special_day_lock_date"
                          type="checkbox"
                          role="switch"
                          className="form-check-input"
                          checked={formData.special_day_lock_date}
                          disabled={
                            !formData.special_day_active ||
                            !formData.special_day_date
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              special_day_lock_date: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label fw-semibold"
                          htmlFor="special_day_lock_date"
                        >
                          Lock date field for customers
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card product-form-card mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fs-18 fw-semibold">Pricing & Tax</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Regular Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        name="regular_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.regular_price}
                        onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                        className="form-control fs-14 textarea-hover-dark border-start-0 rounded-start-0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sale Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        name="sale_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        className="form-control fs-14 textarea-hover-dark border-start-0 rounded-start-0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tax Status</label>
                    <select
                      name="tax_status"
                      className="form-select fs-14"
                      value={formData.tax_status}
                      onChange={(e) => setFormData({ ...formData, tax_status: e.target.value })}
                    >
                      <option value="Taxable">Taxable</option>
                      <option value="Shipping only">Shipping only</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tax Class</label>
                    <select
                      name="tax_class"
                      className="form-select fs-14"
                      value={formData.tax_class}
                      onChange={(e) => setFormData({ ...formData, tax_class: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Popular">Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card product-form-card mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fs-18 fw-semibold">Product Image</h5>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div
                    className={`dropzone dashboard-dropzone rounded-3 p-4 mb-3${selectedFile.length > 0 ? " has-file" : ""}${isDraggingImage ? " drag-active" : ""}`}
                    onClick={() => document.getElementById('fileInput').click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileChange({ target: { files: e.dataTransfer.files } });
                      setIsDraggingImage(false);
                    }}
                  >
                    {selectedFile.length > 0 ? (
                      <div>
                        <i className="bi bi-check-circle-fill text-success fs-1"></i>
                        <p className="mt-3 mb-1 fs-14 fw-medium fnt-color opacity-75">{selectedFile.length} file(s) selected</p>
                        <p className="text-muted small">Click or drag to change</p>
                      </div>
                    ) : isEditMode && productData?.image_url ? (
                      <div>
                        <img
                          src={marbleUploadUrl(productData.image_url)}
                          alt="Current product image"
                          className="img-fluid rounded-3 dashboard-img-max-150 object-fit-contain"
                        />
                        <p className="mt-2 mb-0 text-muted small">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <i className="bi bi-cloud-arrow-up fs-1 text-muted"></i>
                        <p className="mt-3 mb-1 fs-14 fw-medium fnt-color opacity-75">Click to upload or drag & drop</p>
                        <p className="text-muted small">JPG, JPEG or PNG (Max. 2MB each)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    multiple
                    className="d-none"
                  />
                </div>
              </div>
            </div>

            <div className="card product-form-card mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fs-18 fw-semibold">Categories & Organization</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Categories <span className="text-danger">*</span></label>
                  <MultiSelectDropdown
                    label=""
                    items={parentCategories}
                    selectedIds={categoryIds}
                    setSelectedIds={setCategoryIds}
                    placeholder="Select categories..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Branches <span className="text-danger">*</span></label>
                  <MultiSelectDropdown
                    label=""
                    items={branches}
                    selectedIds={branchIds}
                    setSelectedIds={setBranchIds}
                    placeholder="Select branches..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Occasions <span className="text-danger">*</span></label>
                  <MultiSelectDropdown
                    label=""
                    items={occasions}
                    selectedIds={occasionIds}
                    setSelectedIds={setOccasionIds}
                    placeholder="Select occasions..."
                  />
                </div>
              </div>
            </div>

            <div className="card product-form-card sticky-top dashboard-sticky-top-20">
              <div className="card-body">
                <h6 className="fs-18 fw-semibold mb-3">Ready to Publish?</h6>
                <p className="text-muted small mb-4">Review all information before submitting.  fields are marked with *</p>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="form-submit-btn border-0 p-2 px-3 text-white fs-16 rounded-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2" aria-hidden="true"></i>
                        {isEditMode ? "Update Product" : "Add Product"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="form-cancel-btn bg-white border rounded-3 text-muted fs-14 p-2"
                    onClick={() => router.push("/dashboard/product")}>
                    <i className="bi bi-x-circle me-1" aria-hidden="true"></i> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}