import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FiLayers, FiGrid, FiBarChart2, FiSettings, FiUsers, FiCalendar } from 'react-icons/fi'
import ServiceCatalogPanel from './manageServices/ServiceCatalogPanel'
import ServiceDetailsPanel from './manageServices/ServiceDetailsPanel'
import ServicePlaceholderPanel from './manageServices/ServicePlaceholderPanel'
import ServiceAssignmentsPanel from './manageServices/ServiceAssignmentsPanel'
import ServiceBookingsPanel from './manageServices/ServiceBookingsPanel'

const API_BASE = 'http://localhost:5003/api'
const SERVICE_LIMIT = 8
const MAX_SERVICE_IMAGES = 5
const ASSIGNMENTS_LIMIT = 6
const BOOKINGS_LIMIT = 6

const SIDEBAR_LINKS = [
  { id: 'catalog', label: 'Service Catalog', icon: <FiLayers className="w-4 h-4" /> },
  { id: 'details', label: 'Service Details', icon: <FiGrid className="w-4 h-4" /> },
  { id: 'assignments', label: 'Assigned Nurses', icon: <FiUsers className="w-4 h-4" /> },
  { id: 'bookings', label: 'Confirmed Bookings', icon: <FiCalendar className="w-4 h-4" /> },
  { id: 'insights', label: 'Insights', icon: <FiBarChart2 className="w-4 h-4" /> }
]

const CATEGORY_OPTIONS = [
  'nursing',
  'elder-care',
  'post-surgery-care',
  'physiotherapy',
  'diagnostic',
  'home-visit-doctor',
  'vaccination',
  'palliative-care',
  'medical-equipment-rental',
  'icu-at-home',
  'mother-and-baby-care',
  'massage-therapy'
]

const ManageServices = () => {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('catalog')

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState('')
  const [servicePagination, setServicePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalServices: 0
  })
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: CATEGORY_OPTIONS[0],
    sessionDuration: '',
    price: ''
  })
  const [serviceFeedback, setServiceFeedback] = useState({ type: '', message: '' })
  const [updatingService, setUpdatingService] = useState(false)
  const [togglingServiceId, setTogglingServiceId] = useState('')
  const [imageFeedback, setImageFeedback] = useState({ type: '', message: '' })
  const [imageUploading, setImageUploading] = useState(false)
  const [imageDeletingId, setImageDeletingId] = useState('')
  const [assignmentsState, setAssignmentsState] = useState({
    serviceId: '',
    serviceInfo: null,
    list: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, limit: ASSIGNMENTS_LIMIT },
    loading: false,
    error: ''
  })
  const [assignmentServiceSearchTerm, setAssignmentServiceSearchTerm] = useState('')
  const [assignmentActionId, setAssignmentActionId] = useState('')
  const [assignmentFeedback, setAssignmentFeedback] = useState({ type: '', message: '' })
  const [bookingsState, setBookingsState] = useState({
    serviceId: '',
    serviceInfo: null,
    list: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, limit: BOOKINGS_LIMIT },
    loading: false,
    error: ''
  })
  const [bookingServiceSearchTerm, setBookingServiceSearchTerm] = useState('')

  const updateServiceState = (serviceId, mapper) => {
    if (!serviceId || typeof mapper !== 'function') return
    setServices((prev) => prev.map((service) => (
      service._id === serviceId ? mapper(service) : service
    )))
    setSelectedService((prev) => (
      prev && prev._id === serviceId ? mapper(prev) : prev
    ))
  }

  useEffect(() => {
    fetchServices(1)
  }, [])

  useEffect(() => {
    if (!selectedServiceId) return
    const updated = services.find((service) => service._id === selectedServiceId)
    if (updated) {
      setSelectedService(updated)
      setServiceForm({
        name: updated.name || '',
        description: updated.description || '',
        category: updated.category || CATEGORY_OPTIONS[0],
        sessionDuration: updated.sessionDuration ? String(updated.sessionDuration) : '',
        price: updated.price ? String(updated.price) : ''
      })
      setImageFeedback({ type: '', message: '' })
    }
  }, [services, selectedServiceId])

  const fetchServices = async (page = 1) => {
    setServicesLoading(true)
    setServicesError('')
    const search = serviceSearchTerm.trim()
    const endpoint = search ? `${API_BASE}/services/search` : `${API_BASE}/services`
    const params = search
      ? { search, page, limit: SERVICE_LIMIT, includeInactive: true }
      : { page, limit: SERVICE_LIMIT, includeInactive: true }

    try {
      const { data } = await axios.get(endpoint, {
        params,
        withCredentials: true
      })

      const records = data.services || data.data || []
      setServices(records)
      setServicePagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalServices: data.pagination?.totalServices || records.length
      })
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setServices([])
      setServicesError(err.response?.data?.message || 'Unable to fetch services right now.')
    } finally {
      setServicesLoading(false)
    }
  }

  const handleServiceSearch = () => {
    fetchServices(1)
  }

  const handleServiceReset = () => {
    setServiceSearchTerm('')
    fetchServices(1)
  }

  const handleServicePagination = (direction) => {
    const { currentPage, totalPages } = servicePagination
    if (direction === 'next' && currentPage < totalPages) {
      fetchServices(currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchServices(currentPage - 1)
    }
  }

  const handleSelectService = (service) => {
    setSelectedServiceId(service._id)
    setSelectedService(service)
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      category: service.category || CATEGORY_OPTIONS[0],
      sessionDuration: service.sessionDuration ? String(service.sessionDuration) : '',
      price: service.price ? String(service.price) : ''
    })
    setServiceFeedback({ type: '', message: '' })
    setImageFeedback({ type: '', message: '' })
    setActiveSection('details')
  }

  const handleBackToCatalog = () => {
    setActiveSection('catalog')
  }

  const handleServiceFormChange = (field, value) => {
    setServiceForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const fetchServiceAssignments = async (serviceIdParam, page = 1) => {
    if (!serviceIdParam) return
    setAssignmentsState((prev) => ({
      ...prev,
      serviceId: serviceIdParam,
      loading: true,
      error: ''
    }))
    try {
      const { data } = await axios.get(`${API_BASE}/admin/services/${serviceIdParam}/assignments`, {
        params: { page, limit: ASSIGNMENTS_LIMIT },
        withCredentials: true
      })

      setAssignmentsState((prev) => ({
        ...prev,
        loading: false,
        list: data.assignments || [],
        serviceInfo: data.service || null,
        pagination: {
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          totalRecords: data.pagination?.totalRecords || data.assignments?.length || 0,
          limit: data.pagination?.limit || ASSIGNMENTS_LIMIT
        }
      }))
    } catch (err) {
      console.error('Failed to fetch service assignments:', err)
      setAssignmentsState((prev) => ({
        ...prev,
        loading: false,
        list: [],
        serviceInfo: null,
        error: err.response?.data?.message || 'Unable to load assignments right now.'
      }))
    }
  }

  const handleAssignmentServiceSearch = () => {
    fetchServices(1)
  }

  const handleAssignmentServiceSearchReset = () => {
    setAssignmentServiceSearchTerm('')
    fetchServices(1)
  }

  const handleAssignmentServiceSelect = (service) => {
    const serviceIdParam = service?._id
    setAssignmentsState((prev) => ({
      ...prev,
      serviceId: serviceIdParam || '',
      pagination: { ...prev.pagination, currentPage: 1 }
    }))
    setAssignmentFeedback({ type: '', message: '' })

    if (!serviceIdParam) {
      setAssignmentsState((prev) => ({
        ...prev,
        list: [],
        serviceInfo: null,
        error: ''
      }))
      return
    }

    fetchServiceAssignments(serviceIdParam, 1)
  }

  const handleAssignmentPaginate = (direction) => {
    const { currentPage, totalPages } = assignmentsState.pagination
    if (!assignmentsState.serviceId) return

    if (direction === 'next' && currentPage < totalPages) {
      fetchServiceAssignments(assignmentsState.serviceId, currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchServiceAssignments(assignmentsState.serviceId, currentPage - 1)
    }
  }

  const refreshAssignments = () => {
    if (!assignmentsState.serviceId) return
    fetchServiceAssignments(assignmentsState.serviceId, assignmentsState.pagination.currentPage || 1)
  }

  const handleToggleNurseServiceAssignment = async (nurseId, serviceIdParam, relationId) => {
    if (!nurseId || !serviceIdParam) return
    setAssignmentActionId(relationId)
    setAssignmentFeedback({ type: '', message: '' })

    try {
      const { data } = await axios.put(`${API_BASE}/admin/toggle-service/${nurseId}/${serviceIdParam}`, {}, {
        withCredentials: true
      })

      const isActive = typeof data?.data?.isActive === 'boolean' ? data.data.isActive : undefined

      setAssignmentsState((prev) => ({
        ...prev,
        list: prev.list.map((assignment) => (
          assignment.relationId === relationId
            ? { ...assignment, isActive: typeof isActive === 'boolean' ? isActive : !assignment.isActive, updatedAt: new Date().toISOString() }
            : assignment
        ))
      }))

      setAssignmentFeedback({
        type: 'success',
        message: isActive ? 'Assignment activated for this nurse.' : 'Assignment disabled for this nurse.'
      })
    } catch (err) {
      console.error('Failed to toggle nurse assignment:', err)
      setAssignmentFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to update assignment right now.'
      })
    } finally {
      setAssignmentActionId('')
    }
  }

  const handleAddServiceImages = async (fileList) => {
    if (!selectedServiceId || !fileList || !fileList.length) return

    const currentCount = selectedService?.images?.length || 0
    const remainingSlots = MAX_SERVICE_IMAGES - currentCount

    if (remainingSlots <= 0) {
      setImageFeedback({ type: 'error', message: `Maximum of ${MAX_SERVICE_IMAGES} images reached for this service.` })
      return
    }

    const files = Array.from(fileList).slice(0, remainingSlots)
    if (!files.length) {
      setImageFeedback({ type: 'error', message: 'No images available to upload.' })
      return
    }

    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    setImageUploading(true)
    setImageFeedback({ type: '', message: '' })
    try {
      const { data } = await axios.post(`${API_BASE}/services/${selectedServiceId}/images`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const addedImages = data.addedImages || []
      if (!addedImages.length) {
        setImageFeedback({ type: 'error', message: 'No images were uploaded. Please try again.' })
        return
      }

      updateServiceState(selectedServiceId, (service) => ({
        ...service,
        images: [...(service.images || []), ...addedImages]
      }))
      setImageFeedback({
        type: 'success',
        message: `Added ${addedImages.length} new ${addedImages.length === 1 ? 'image' : 'images'}.`
      })
    } catch (err) {
      console.error('Failed to upload images:', err)
      setImageFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to upload images right now.'
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleDeleteServiceImage = async (imageId) => {
    if (!selectedServiceId || !imageId) return
    setImageDeletingId(imageId)
    setImageFeedback({ type: '', message: '' })

    try {
      await axios.delete(`${API_BASE}/services/${selectedServiceId}/images/${imageId}`, {
        withCredentials: true
      })

      updateServiceState(selectedServiceId, (service) => ({
        ...service,
        images: (service.images || []).filter((image) => image._id !== imageId)
      }))
      setImageFeedback({ type: 'success', message: 'Image removed successfully.' })
    } catch (err) {
      console.error('Failed to delete image:', err)
      setImageFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to delete image right now.'
      })
    } finally {
      setImageDeletingId('')
    }
  }

  const fetchServiceBookings = async (serviceIdParam, page = 1) => {
    if (!serviceIdParam) return
    setBookingsState((prev) => ({
      ...prev,
      serviceId: serviceIdParam,
      loading: true,
      error: ''
    }))

    try {
      const { data } = await axios.get(`${API_BASE}/admin/services/${serviceIdParam}/bookings`, {
        params: { page, limit: BOOKINGS_LIMIT },
        withCredentials: true
      })

      setBookingsState((prev) => ({
        ...prev,
        loading: false,
        list: data.bookings || [],
        serviceInfo: data.service || null,
        pagination: {
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          totalRecords: data.pagination?.totalRecords || data.bookings?.length || 0,
          limit: data.pagination?.limit || BOOKINGS_LIMIT
        }
      }))
    } catch (err) {
      console.error('Failed to fetch service bookings:', err)
      setBookingsState((prev) => ({
        ...prev,
        loading: false,
        list: [],
        serviceInfo: null,
        error: err.response?.data?.message || 'Unable to load bookings right now.'
      }))
    }
  }

  const handleBookingServiceSearch = () => {
    fetchServices(1)
  }

  const handleBookingServiceSearchReset = () => {
    setBookingServiceSearchTerm('')
    fetchServices(1)
  }

  const handleBookingServiceSelect = (service) => {
    const serviceIdParam = service?._id
    setBookingsState((prev) => ({
      ...prev,
      serviceId: serviceIdParam || '',
      pagination: { ...prev.pagination, currentPage: 1 }
    }))

    if (!serviceIdParam) {
      setBookingsState((prev) => ({
        ...prev,
        list: [],
        serviceInfo: null,
        error: ''
      }))
      return
    }

    fetchServiceBookings(serviceIdParam, 1)
  }

  const handleBookingPaginate = (direction) => {
    const { currentPage, totalPages } = bookingsState.pagination
    if (!bookingsState.serviceId) return

    if (direction === 'next' && currentPage < totalPages) {
      fetchServiceBookings(bookingsState.serviceId, currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchServiceBookings(bookingsState.serviceId, currentPage - 1)
    }
  }

  const refreshBookings = () => {
    if (!bookingsState.serviceId) return
    fetchServiceBookings(bookingsState.serviceId, bookingsState.pagination.currentPage || 1)
  }

  const handleSaveServiceDetails = async () => {
    if (!selectedServiceId) {
      setServiceFeedback({ type: 'error', message: 'Select a service before saving.' })
      return
    }

    const payload = {}
    if (serviceForm.name?.trim()) payload.name = serviceForm.name.trim()
    if (serviceForm.description?.trim()) payload.description = serviceForm.description.trim()
    if (serviceForm.category) payload.category = serviceForm.category
    if (serviceForm.sessionDuration !== '') payload.sessionDuration = Number(serviceForm.sessionDuration)
    if (serviceForm.price !== '') payload.price = Number(serviceForm.price)

    if (Object.keys(payload).length === 0) {
      setServiceFeedback({ type: 'error', message: 'Update at least one field before saving.' })
      return
    }

    setUpdatingService(true)
    setServiceFeedback({ type: '', message: '' })
    try {
      const { data } = await axios.put(`${API_BASE}/services/${selectedServiceId}`, payload, {
        withCredentials: true
      })

      const updated = data.service
      updateServiceState(selectedServiceId, (service) => ({
        ...service,
        ...updated,
        price: updated?.price ?? service.price
      }))
      setServiceFeedback({ type: 'success', message: 'Service details updated successfully.' })
    } catch (err) {
      console.error('Failed to update service:', err)
      setServiceFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to update service right now.'
      })
    } finally {
      setUpdatingService(false)
    }
  }

  const handleToggleServiceStatus = async (serviceId) => {
    if (!serviceId) return
    setTogglingServiceId(serviceId)
    try {
      const { data } = await axios.patch(`${API_BASE}/services/${serviceId}/toggle-status`, {}, {
        withCredentials: true
      })

      updateServiceState(serviceId, (service) => ({
        ...service,
        isActive: typeof data.service?.isActive === 'boolean'
          ? data.service.isActive
          : !service.isActive
      }))
    } catch (err) {
      console.error('Failed to toggle service status:', err)
      setServicesError(err.response?.data?.message || 'Unable to update service status right now.')
    } finally {
      setTogglingServiceId('')
    }
  }

  const serviceSummary = useMemo(() => {
    const active = services.filter((service) => service.isActive).length
    const inactive = services.length - active
    return {
      active,
      inactive,
      total: servicePagination.totalServices
    }
  }, [services, servicePagination])

  const renderActivePanel = () => {
    switch (activeSection) {
      case 'catalog':
        return (
          <ServiceCatalogPanel
            services={services}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            pagination={servicePagination}
            searchTerm={serviceSearchTerm}
            onSearchTermChange={setServiceSearchTerm}
            onSearch={handleServiceSearch}
            onResetSearch={handleServiceReset}
            onPaginate={handleServicePagination}
            onSelectService={handleSelectService}
            selectedServiceId={selectedServiceId}
            onToggleServiceStatus={handleToggleServiceStatus}
            togglingServiceId={togglingServiceId}
            summary={serviceSummary}
          />
        )
      case 'details':
        return (
          <ServiceDetailsPanel
            categories={CATEGORY_OPTIONS}
            selectedService={selectedService}
            serviceForm={serviceForm}
            onFormChange={handleServiceFormChange}
            onSave={handleSaveServiceDetails}
            updatingService={updatingService}
            feedback={serviceFeedback}
            onToggleServiceStatus={handleToggleServiceStatus}
            togglingServiceId={togglingServiceId}
            onAddImages={handleAddServiceImages}
            onDeleteImage={handleDeleteServiceImage}
            imageUploading={imageUploading}
            imageDeletingId={imageDeletingId}
            imageFeedback={imageFeedback}
            maxImages={MAX_SERVICE_IMAGES}
            onBackToCatalog={handleBackToCatalog}
          />
        )
      case 'assignments':
        return (
          <ServiceAssignmentsPanel
            services={services}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            servicePagination={servicePagination}
            serviceSearchTerm={assignmentServiceSearchTerm}
            onServiceSearchChange={setAssignmentServiceSearchTerm}
            onServiceSearch={handleAssignmentServiceSearch}
            onServiceSearchReset={handleAssignmentServiceSearchReset}
            serviceSummary={serviceSummary}
            serviceId={assignmentsState.serviceId}
            selectedService={services.find((s) => s._id === assignmentsState.serviceId) || null}
            serviceInfo={assignmentsState.serviceInfo}
            assignments={assignmentsState.list}
            loading={assignmentsState.loading}
            error={assignmentsState.error}
            pagination={assignmentsState.pagination}
            feedback={assignmentFeedback}
            onServiceChange={handleAssignmentServiceSelect}
            onPaginate={handleAssignmentPaginate}
            onServicesPaginate={handleServicePagination}
            onToggleAssignment={handleToggleNurseServiceAssignment}
            togglingRelationId={assignmentActionId}
            onRefresh={refreshAssignments}
            onSelectService={handleSelectService}
          />
        )
      case 'bookings':
        return (
          <ServiceBookingsPanel
            services={services}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            servicePagination={servicePagination}
            serviceSearchTerm={bookingServiceSearchTerm}
            onServiceSearchChange={setBookingServiceSearchTerm}
            onServiceSearch={handleBookingServiceSearch}
            onServiceSearchReset={handleBookingServiceSearchReset}
            serviceSummary={serviceSummary}
            serviceId={bookingsState.serviceId}
            selectedService={services.find((s) => s._id === bookingsState.serviceId) || null}
            serviceInfo={bookingsState.serviceInfo}
            bookings={bookingsState.list}
            loading={bookingsState.loading}
            error={bookingsState.error}
            pagination={bookingsState.pagination}
            onServiceChange={handleBookingServiceSelect}
            onPaginate={handleBookingPaginate}
            onServicesPaginate={handleServicePagination}
            onRefresh={refreshBookings}
            onSelectService={handleSelectService}
          />
        )
      default:
        return (
          <ServicePlaceholderPanel label={SIDEBAR_LINKS.find((link) => link.id === activeSection)?.label || 'Coming soon'} />
        )
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 left-4 z-30 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-full">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-200 flex flex-col h-screen transform transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mt-1">Service Management</h2>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveSection(link.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={activeSection === link.id ? 'text-indigo-600' : 'text-gray-500'}>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold"
            >
              Back to main panel
            </button>
            <div className="text-xs text-gray-400 text-center">SwasthyaLink v1.0</div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 lg:ml-60">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  )
}

export default ManageServices
