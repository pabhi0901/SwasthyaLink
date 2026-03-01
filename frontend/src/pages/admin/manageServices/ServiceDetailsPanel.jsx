import React from 'react'
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiClock, FiImage, FiInfo, FiTag, FiToggleRight, FiTrash2, FiUpload } from 'react-icons/fi'

const ServiceDetailsPanel = ({
  categories,
  selectedService,
  serviceForm,
  onFormChange,
  onSave,
  updatingService,
  feedback,
  onToggleServiceStatus,
  togglingServiceId,
  onAddImages,
  onDeleteImage,
  imageUploading,
  imageDeletingId,
  imageFeedback,
  maxImages,
  onBackToCatalog
}) => {
  if (!selectedService) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
        Select a service from the catalog to review and update its details.
      </div>
    )
  }

  const heroImage = selectedService.images?.[0]?.url
  const galleryImages = selectedService.images || []
  const maxGalleryImages = maxImages ?? 5
  const totalImages = galleryImages.length
  const canAddImages = totalImages < maxGalleryImages
  const remainingSlots = Math.max(maxGalleryImages - totalImages, 0)
  const uploadInputId = `service-image-upload-${selectedService._id}`

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div className="lg:w-1/3 space-y-4">
            <div className="relative">
              {heroImage ? (
                <img src={heroImage} alt={selectedService.name} className="w-full h-56 object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex flex-col items-center justify-center gap-2 text-indigo-500">
                  <FiImage className="w-10 h-10" />
                  <p className="text-sm font-semibold">No image provided</p>
                </div>
              )}
              <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full ${
                selectedService.isActive ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {selectedService.isActive ? 'Active Service' : 'Inactive Service'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <p className="font-semibold text-gray-700">Gallery ({totalImages}/{maxGalleryImages})</p>
                {remainingSlots > 0 && (
                  <span className="text-xs text-gray-500">{remainingSlots} slot{remainingSlots === 1 ? '' : 's'} remaining</span>
                )}
              </div>

              {imageFeedback?.message && (
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border ${
                    imageFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}
                >
                  {imageFeedback.type === 'success' ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiAlertCircle className="w-3.5 h-3.5" />}
                  <span>{imageFeedback.message}</span>
                </div>
              )}

              {galleryImages.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((image) => (
                    <div key={image._id} className="relative rounded-xl overflow-hidden border border-gray-100 group">
                      <img
                        src={image.url}
                        alt={`${selectedService.name} asset`}
                        className="h-28 w-full object-cover"
                      />
                      {image.isPrimary && (
                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteImage?.(image._id)}
                        disabled={imageDeletingId === image._id}
                        className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-rose-600 shadow-sm opacity-0 pointer-events-none transition ${
                          imageDeletingId === image._id
                            ? 'opacity-60 cursor-not-allowed'
                            : 'group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto'
                        }`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">
                  No gallery images added yet.
                </div>
              )}

              <div className="space-y-2">
                {canAddImages ? (
                  <div className="flex flex-col gap-2">
                    <input
                      id={uploadInputId}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        onAddImages?.(event.target.files)
                        event.target.value = ''
                      }}
                      disabled={imageUploading}
                    />
                    <label
                      htmlFor={uploadInputId}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-dashed ${
                        imageUploading ? 'border-gray-200 text-gray-400' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      } px-4 py-2 text-sm font-semibold cursor-pointer ${imageUploading ? 'cursor-not-allowed' : ''}`}
                    >
                      <FiUpload className="w-4 h-4" />
                      {imageUploading ? 'Uploading...' : 'Add more images'}
                    </label>
                    <p className="text-xs text-gray-500 text-center">You can attach up to {maxGalleryImages} images per service.</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center">Maximum image capacity reached.</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-indigo-500" />
                Category: <span className="capitalize font-semibold">{selectedService.category?.replace(/-/g, ' ')}</span>
              </p>
              <p className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-indigo-500" />
                Session duration: <span className="font-semibold">{selectedService.sessionDuration || 'N/A'} mins</span>
              </p>
              <p className="flex items-center gap-2">
                <FiTag className="w-4 h-4 text-indigo-500" />
                Priced at: <span className="font-semibold">₹{selectedService.price ?? 'N/A'}</span>
              </p>
            </div>

            <button
              onClick={() => onToggleServiceStatus(selectedService._id)}
              disabled={togglingServiceId === selectedService._id}
              className={`w-full px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                selectedService.isActive
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              } ${togglingServiceId === selectedService._id ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FiToggleRight className="w-4 h-4" />
              {selectedService.isActive ? 'Disable service' : 'Activate service'}
            </button>
          </div>

          <div className="flex-1 space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Currently editing</p>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedService.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Update the text fields below and save to apply changes instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => onBackToCatalog?.()}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to catalog
              </button>
            </div>

            {feedback.message && (
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}
              >
                {feedback.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="grid gap-5">
              <label className="space-y-1 text-sm">
                <span className="text-gray-600 font-medium">Service name</span>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter service title"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-gray-600 font-medium">Category</span>
                <select
                  value={serviceForm.category}
                  onChange={(e) => onFormChange('category', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 capitalize"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="capitalize">
                      {category.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="space-y-1 text-sm">
                  <span className="text-gray-600 font-medium">Session duration (mins)</span>
                  <input
                    type="number"
                    min="0"
                    value={serviceForm.sessionDuration}
                    onChange={(e) => onFormChange('sessionDuration', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g. 45"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="text-gray-600 font-medium">Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={serviceForm.price}
                    onChange={(e) => onFormChange('price', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g. 1200"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-gray-600 font-medium">Description</span>
                <textarea
                  rows="5"
                  value={serviceForm.description}
                  onChange={(e) => onFormChange('description', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Describe the inclusions, prerequisites, or any preparation needed for this service"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onSave}
                disabled={updatingService}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 ${
                  updatingService ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {updatingService ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceDetailsPanel
