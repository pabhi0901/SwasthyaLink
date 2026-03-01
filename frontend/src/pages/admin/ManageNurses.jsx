import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FiUsers, FiLayers, FiCalendar, FiClipboard, FiClock } from 'react-icons/fi'
import RosterPanel from './manageNurses/RosterPanel'
import ServiceAssignmentsPanel from './manageNurses/ServiceAssignmentsPanel'
import LeaveRequestsPanel from './manageNurses/LeaveRequestsPanel'
import AvailabilityPanel from './manageNurses/AvailabilityPanel'
import NursesOnLeavePanel from './manageNurses/NursesOnLeavePanel'
import PlaceholderPanel from './manageNurses/PlaceholderPanel'

const API_BASE = 'http://localhost:5003/api'
const PAGE_LIMIT = 6
const ASSIGNMENT_LIMIT = 5

const SIDEBAR_LINKS = [
  { id: 'all', label: 'Roster Overview', icon: <FiUsers className="w-4 h-4" /> },
  { id: 'services', label: 'Assigned Services', icon: <FiLayers className="w-4 h-4" /> },
  { id: 'leaves', label: 'Leave Requests', icon: <FiCalendar className="w-4 h-4" /> },
  { id: 'availability', label: 'Availability', icon: <FiClock className="w-4 h-4" /> },
  { id: 'nursesOnLeave', label: 'Nurses On Leave', icon: <FiClipboard className="w-4 h-4" /> }
]

const ManageNurses = () => {
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('all')

  const [nurses, setNurses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNurses: 0
  })

  const [statusCounts, setStatusCounts] = useState({ active: 0, inactive: 0 })
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [rosterLeaveDate, setRosterLeaveDate] = useState(() => new Date().toISOString().split('T')[0])
  const [rosterLeaveCount, setRosterLeaveCount] = useState(0)
  const [rosterLeaveLoading, setRosterLeaveLoading] = useState(false)
  const [rosterLeaveError, setRosterLeaveError] = useState('')
  const [togglingNurseId, setTogglingNurseId] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState('name')

  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('')
  const [assignmentSearchMode, setAssignmentSearchMode] = useState('name')
  const [assignmentSearchLoading, setAssignmentSearchLoading] = useState(false)
  const [assignmentSearchError, setAssignmentSearchError] = useState('')
  const [assignmentResults, setAssignmentResults] = useState([])
  const [selectedNurse, setSelectedNurse] = useState(null)

  const [assignmentPagination, setAssignmentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAssignments: 0
  })
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [assignmentError, setAssignmentError] = useState('')
  const [nurseAssignments, setNurseAssignments] = useState([])

  const [showAssignPanel, setShowAssignPanel] = useState(false)
  const [serviceOptions, setServiceOptions] = useState([])
  const [serviceOptionsLoading, setServiceOptionsLoading] = useState(false)
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [commissionInput, setCommissionInput] = useState('')
  const [assigningService, setAssigningService] = useState(false)
  const [assignPanelFeedback, setAssignPanelFeedback] = useState({ type: '', message: '' })

  const [leaveSearchTerm, setLeaveSearchTerm] = useState('')
  const [leaveSearchMode, setLeaveSearchMode] = useState('name')
  const [leaveSearchFeedback, setLeaveSearchFeedback] = useState('')
  const [leavePagination, setLeavePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLeaves: 0
  })
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [leaveActionTarget, setLeaveActionTarget] = useState('')

  const [availabilitySearchTerm, setAvailabilitySearchTerm] = useState('')
  const [availabilitySearchMode, setAvailabilitySearchMode] = useState('name')
  const [availabilitySearchLoading, setAvailabilitySearchLoading] = useState(false)
  const [availabilitySearchError, setAvailabilitySearchError] = useState('')
  const [availabilityResults, setAvailabilityResults] = useState([])
  const [availabilitySelectedNurse, setAvailabilitySelectedNurse] = useState(null)
  const [availabilityDetailLoading, setAvailabilityDetailLoading] = useState(false)
  const [availabilityData, setAvailabilityData] = useState(null)
  const [shiftForm, setShiftForm] = useState({
    startTime: '',
    endTime: '',
    weeklyOffDays: []
  })
  const [availabilityFeedback, setAvailabilityFeedback] = useState({ type: '', message: '' })
  const [savingShift, setSavingShift] = useState(false)
  const [nursesOnLeaveDate, setNursesOnLeaveDate] = useState(() => new Date().toISOString().split('T')[0])
  const [nursesOnLeaveFetchedDate, setNursesOnLeaveFetchedDate] = useState('')
  const [nursesOnLeave, setNursesOnLeave] = useState([])
  const [nursesOnLeaveLoading, setNursesOnLeaveLoading] = useState(false)
  const [nursesOnLeaveError, setNursesOnLeaveError] = useState('')
  const [nursesOnLeavePagination, setNursesOnLeavePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNursesOnLeave: 0
  })

  useEffect(() => {
    fetchNurses(1)
    fetchStatusCounts()
  }, [])

  useEffect(() => {
    if (activeSection === 'leaves' && !leaveRequests.length && !leaveLoading) {
      fetchPendingLeaves(1)
    }
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'nursesOnLeave' && !nursesOnLeaveFetchedDate && !nursesOnLeaveLoading) {
      fetchNursesOnLeave(1, nursesOnLeaveDate)
    }
  }, [activeSection, nursesOnLeaveFetchedDate, nursesOnLeaveLoading, nursesOnLeaveDate])

  useEffect(() => {
    if (rosterLeaveDate) {
      fetchRosterLeaveCount(rosterLeaveDate)
    }
  }, [rosterLeaveDate])

  const fetchNurses = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/nurses`, {
        params: { page, limit: PAGE_LIMIT },
        withCredentials: true
      })

      setNurses(data.data || [])
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalNurses: data.pagination?.totalNurses || data.data?.length || 0
      })
    } catch (err) {
      console.error('Failed to fetch nurses:', err)
      setNurses([])
      setError(err.response?.data?.message || 'Unable to fetch nurse roster right now.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatusCounts = async () => {
    setStatusLoading(true)
    setStatusError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/nurses/status-counts`, {
        withCredentials: true
      })
      setStatusCounts(data.data || { active: 0, inactive: 0 })
    } catch (err) {
      console.error('Failed to fetch status counts:', err)
      setStatusError(err.response?.data?.message || 'Unable to fetch live status counts.')
    } finally {
      setStatusLoading(false)
    }
  }

  const fetchRosterLeaveCount = async (date) => {
    if (!date) {
      setRosterLeaveError('Select a date to review leave count.')
      setRosterLeaveCount(0)
      return
    }

    setRosterLeaveLoading(true)
    setRosterLeaveError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/leaves/count-by-date`, {
        params: { date },
        withCredentials: true
      })
      setRosterLeaveCount(data.data?.totalOnLeave ?? 0)
    } catch (err) {
      console.error('Failed to fetch roster leave count:', err)
      setRosterLeaveCount(0)
      setRosterLeaveError(err.response?.data?.message || 'Unable to fetch leave count right now.')
    } finally {
      setRosterLeaveLoading(false)
    }
  }

  const handlePagination = (direction) => {
    const { currentPage, totalPages } = pagination
    if (direction === 'next' && currentPage < totalPages) {
      fetchNurses(currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchNurses(currentPage - 1)
    }
  }

  const handleRosterLeaveDateChange = (value) => {
    if (!value) {
      setRosterLeaveDate('')
      setRosterLeaveCount(0)
      setRosterLeaveError('Select a date to review leave count.')
      return
    }
    setRosterLeaveDate(value)
  }

  const handleSearch = async () => {
    const query = searchTerm.trim()
    if (!query) {
      fetchNurses(1)
      return
    }

    setLoading(true)
    setError('')
    try {
      if (searchMode === 'name') {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search-by-name`, {
          params: { name: query, page: 1, limit: PAGE_LIMIT },
          withCredentials: true
        })
        setNurses(data.data || [])
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalNurses: data.pagination?.totalNurses || data.data?.length || 0
        })
      } else {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search/${query}`, {
          withCredentials: true
        })
        const nurse = data.data?.nurse
        setNurses(nurse ? [nurse] : [])
        setPagination({ currentPage: 1, totalPages: nurse ? 1 : 0, totalNurses: nurse ? 1 : 0 })
      }
    } catch (err) {
      console.error('Search failed:', err)
      setNurses([])
      setError(err.response?.data?.message || 'Unable to complete search.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNurseAccess = async (nurseId) => {
    if (!nurseId) return
    setTogglingNurseId(nurseId)
    try {
      const { data } = await axios.put(`${API_BASE}/admin/toggle-nurse-access/${nurseId}`, {}, {
        withCredentials: true
      })

      const updatedNurse = data.data
      setNurses((prev) => prev.map((nurse) => (
        nurse._id === nurseId
          ? { ...nurse, ...(updatedNurse || {}), isActive: updatedNurse?.isActive ?? !nurse.isActive }
          : nurse
      )))
      fetchStatusCounts()
    } catch (err) {
      console.error('Failed to toggle nurse access:', err)
      setError(err.response?.data?.message || 'Unable to update nurse access right now.')
    } finally {
      setTogglingNurseId('')
    }
  }

  const handleNavigateToAddNurse = () => {
    navigate('/admin/register-nurse')
  }

  const handleAssignmentSearch = async () => {
    const query = assignmentSearchTerm.trim()
    if (!query) {
      setAssignmentResults([])
      setAssignmentSearchError('Enter a name or public ID to search.')
      return
    }

    setAssignmentSearchLoading(true)
    setAssignmentSearchError('')
    try {
      if (assignmentSearchMode === 'name') {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search-by-name`, {
          params: { name: query, page: 1, limit: 5 },
          withCredentials: true
        })
        setAssignmentResults(data.data || [])
      } else {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search/${query}`, {
          withCredentials: true
        })
        const nurse = data.data?.nurse
        if (!nurse) {
          setAssignmentResults([])
          setAssignmentSearchError('No nurse found with that public ID.')
        } else {
          setAssignmentResults([nurse])
        }
      }
    } catch (err) {
      console.error('Assignment search failed:', err)
      setAssignmentResults([])
      setAssignmentSearchError(err.response?.data?.message || 'Unable to search nurses right now.')
    } finally {
      setAssignmentSearchLoading(false)
    }
  }

  const fetchAssignments = async (nurseId, page = 1) => {
    if (!nurseId) return
    setAssignmentLoading(true)
    setAssignmentError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/nurses/${nurseId}/services`, {
        params: { page, limit: ASSIGNMENT_LIMIT },
        withCredentials: true
      })
      setNurseAssignments(data.assignments || [])
      setAssignmentPagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalAssignments: data.pagination?.totalAssignments || data.assignments?.length || 0
      })
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
      setNurseAssignments([])
      setAssignmentError(err.response?.data?.message || 'Unable to load assigned services.')
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleSelectAssignmentNurse = (nurse) => {
    setSelectedNurse(nurse)
    setAssignmentResults([])
    setAssignmentPagination({ currentPage: 1, totalPages: 1, totalAssignments: 0 })
    fetchAssignments(nurse._id, 1)
  }

  const handleAssignmentPagination = (direction) => {
    if (!selectedNurse) return
    const { currentPage, totalPages } = assignmentPagination
    if (direction === 'next' && currentPage < totalPages) {
      fetchAssignments(selectedNurse._id, currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchAssignments(selectedNurse._id, currentPage - 1)
    }
  }

  const fetchServiceOptions = async (search = '') => {
    setServiceOptionsLoading(true)
    setAssignPanelFeedback({ type: '', message: '' })
    try {
      const endpoint = search ? `${API_BASE}/services/search` : `${API_BASE}/services/`
      const params = search
        ? { search, page: 1, limit: 10 }
        : { page: 1, limit: 10 }

      const { data } = await axios.get(endpoint, {
        params,
        withCredentials: true
      })

      const options = data.services || data.data || []
      setServiceOptions(options)
      if (options.length) {
        setSelectedServiceId(options[0]._id)
      }
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setAssignPanelFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to load services right now.'
      })
    } finally {
      setServiceOptionsLoading(false)
    }
  }

  const handleServiceSearch = () => {
    fetchServiceOptions(serviceSearchTerm.trim())
  }

  const openAssignPanel = () => {
    if (!selectedNurse) return
    setAssignPanelFeedback({ type: '', message: '' })
    setShowAssignPanel(true)
    if (!serviceOptions.length) {
      fetchServiceOptions()
    }
  }

  const closeAssignPanel = () => {
    setShowAssignPanel(false)
    setServiceSearchTerm('')
  }

  const handleAssignService = async () => {
    if (!selectedNurse || !selectedServiceId) {
      setAssignPanelFeedback({ type: 'error', message: 'Select a nurse and service to continue.' })
      return
    }

    setAssigningService(true)
    setAssignPanelFeedback({ type: '', message: '' })
    try {
      await axios.post(`${API_BASE}/admin/assign-service`, {
        nurseId: selectedNurse._id,
        serviceId: selectedServiceId,
        commissionPercentage: commissionInput ? Number(commissionInput) : undefined
      }, {
        withCredentials: true
      })

      setAssignPanelFeedback({ type: 'success', message: 'Service assigned successfully.' })
      setCommissionInput('')
      fetchAssignments(selectedNurse._id, assignmentPagination.currentPage)
    } catch (err) {
      console.error('Failed to assign service:', err)
      setAssignPanelFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to assign service right now.'
      })
    } finally {
      setAssigningService(false)
    }
  }

  const handleToggleServiceRelation = async (serviceId) => {
    if (!selectedNurse || !serviceId) return
    try {
      await axios.put(`${API_BASE}/admin/toggle-service/${selectedNurse._id}/${serviceId}`, {}, {
        withCredentials: true
      })
      fetchAssignments(selectedNurse._id, assignmentPagination.currentPage)
    } catch (err) {
      console.error('Failed to toggle service relation:', err)
      setAssignmentError(err.response?.data?.message || 'Unable to update service assignment right now.')
    }
  }

  const fetchPendingLeaves = async (page = 1) => {
    setLeaveLoading(true)
    setLeaveError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/leaves/pending`, {
        params: { page, limit: PAGE_LIMIT },
        withCredentials: true
      })

      setLeaveRequests(data.data || [])
      setLeavePagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalLeaves: data.pagination?.totalLeaves || data.data?.length || 0
      })
    } catch (err) {
      console.error('Failed to fetch leave requests:', err)
      setLeaveRequests([])
      setLeaveError(err.response?.data?.message || 'Unable to load leave requests right now.')
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleLeaveSearch = async () => {
    const query = leaveSearchTerm.trim()
    if (!query) {
      setLeaveSearchFeedback('Showing all pending leave requests.')
      fetchPendingLeaves(1)
      return
    }

    setLeaveLoading(true)
    setLeaveError('')
    setLeaveSearchFeedback('')
    try {
      let response
      if (leaveSearchMode === 'name') {
        response = await axios.get(`${API_BASE}/admin/leaves/search-by-name`, {
          params: { name: query, page: 1, limit: PAGE_LIMIT },
          withCredentials: true
        })
      } else {
        response = await axios.get(`${API_BASE}/admin/leaves/search-by-id/${query}`, {
          withCredentials: true
        })
      }

      const results = response.data.data || []
      setLeaveRequests(results)
      setLeavePagination({
        currentPage: response.data.pagination?.currentPage || 1,
        totalPages: response.data.pagination?.totalPages || (results.length ? 1 : 0),
        totalLeaves: response.data.pagination?.totalLeaves || results.length
      })

      if (!results.length) {
        setLeaveSearchFeedback('No leave requests matched your search.')
      }
    } catch (err) {
      console.error('Leave search failed:', err)
      setLeaveRequests([])
      setLeaveError(err.response?.data?.message || 'Unable to search leave requests right now.')
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleLeavePagination = (direction) => {
    const { currentPage, totalPages } = leavePagination
    if (direction === 'next' && currentPage < totalPages) {
      fetchPendingLeaves(currentPage + 1)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchPendingLeaves(currentPage - 1)
    }
  }

  const handleLeaveReset = () => {
    setLeaveSearchTerm('')
    setLeaveSearchFeedback('')
    fetchPendingLeaves(1)
  }

  const actOnLeaveRequest = async (leaveId, status) => {
    if (!leaveId || !status) return
    setLeaveActionTarget(`${leaveId}-${status}`)
    setLeaveError('')
    try {
      await axios.put(`${API_BASE}/admin/leaves/${leaveId}/status`, { status }, {
        withCredentials: true
      })

      setLeaveRequests((prev) => prev.filter((leave) => leave._id !== leaveId))
      setLeavePagination((prev) => ({
        ...prev,
        totalLeaves: Math.max((prev.totalLeaves || 1) - 1, 0)
      }))

      if (leaveRequests.length <= 1) {
        const fallbackPage = leavePagination.currentPage > 1 ? leavePagination.currentPage - 1 : 1
        fetchPendingLeaves(fallbackPage)
      }
    } catch (err) {
      console.error('Failed to update leave status:', err)
      setLeaveError(err.response?.data?.message || 'Unable to update leave status.')
    } finally {
      setLeaveActionTarget('')
    }
  }

  const fetchNursesOnLeave = async (page = 1, targetDate = nursesOnLeaveDate) => {
    if (!targetDate) {
      setNursesOnLeaveError('Select a date to view leave roster.')
      setNursesOnLeave([])
      return
    }

    setNursesOnLeaveLoading(true)
    setNursesOnLeaveError('')
    try {
      const { data } = await axios.get(`${API_BASE}/admin/leaves/by-date`, {
        params: { date: targetDate, page, limit: PAGE_LIMIT },
        withCredentials: true
      })

      setNursesOnLeave(data.data || [])
      setNursesOnLeavePagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalNursesOnLeave: data.pagination?.totalNursesOnLeave || data.data?.length || 0
      })
      setNursesOnLeaveFetchedDate(targetDate)
    } catch (err) {
      console.error('Failed to fetch nurses on leave:', err)
      setNursesOnLeave([])
      setNursesOnLeaveError(err.response?.data?.message || 'Unable to fetch leave roster right now.')
    } finally {
      setNursesOnLeaveLoading(false)
    }
  }

  const handleNursesOnLeaveDateChange = (value) => {
    setNursesOnLeaveDate(value)
    setNursesOnLeaveFetchedDate('')
  }

  const handleNursesOnLeaveFetch = () => {
    fetchNursesOnLeave(1, nursesOnLeaveDate)
  }

  const handleNursesOnLeavePagination = (direction) => {
    const { currentPage, totalPages } = nursesOnLeavePagination
    const activeDate = nursesOnLeaveFetchedDate || nursesOnLeaveDate
    if (!activeDate) return

    if (direction === 'next' && currentPage < totalPages) {
      fetchNursesOnLeave(currentPage + 1, activeDate)
    }
    if (direction === 'prev' && currentPage > 1) {
      fetchNursesOnLeave(currentPage - 1, activeDate)
    }
  }

  const handleAvailabilitySearch = async () => {
    const query = availabilitySearchTerm.trim()
    if (!query) {
      setAvailabilityResults([])
      setAvailabilitySearchError('Enter a name or public ID to search.')
      return
    }

    setAvailabilitySearchLoading(true)
    setAvailabilitySearchError('')
    try {
      if (availabilitySearchMode === 'name') {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search-by-name`, {
          params: { name: query, page: 1, limit: 5 },
          withCredentials: true
        })
        setAvailabilityResults(data.data || [])
      } else {
        const { data } = await axios.get(`${API_BASE}/admin/nurses/search/${query}`, {
          withCredentials: true
        })
        const nurse = data.data?.nurse
        if (nurse) {
          setAvailabilityResults([nurse])
        } else {
          setAvailabilityResults([])
          setAvailabilitySearchError('No nurse found with that public ID.')
        }
      }
    } catch (err) {
      console.error('Availability search failed:', err)
      setAvailabilityResults([])
      setAvailabilitySearchError(err.response?.data?.message || 'Unable to search nurses right now.')
    } finally {
      setAvailabilitySearchLoading(false)
    }
  }

  const fetchAvailabilityDetails = async (nurse) => {
    if (!nurse) return
    if (!nurse.publicId) {
      setAvailabilitySelectedNurse(nurse)
      setAvailabilityData(null)
      setShiftForm({ startTime: '', endTime: '', weeklyOffDays: [] })
      return
    }

    setAvailabilityDetailLoading(true)
    setAvailabilityFeedback({ type: '', message: '' })
    try {
      const { data } = await axios.get(`${API_BASE}/admin/nurses/search/${nurse.publicId}`, {
        withCredentials: true
      })
      const payload = data.data || {}
      const nurseProfile = payload.nurse || nurse
      const availability = payload.availability || null
      setAvailabilitySelectedNurse(nurseProfile)
      setAvailabilityData(availability)
      setShiftForm({
        startTime: availability ? minutesToTimeString(availability.startMinutes) : '',
        endTime: availability ? minutesToTimeString(availability.endMinutes) : '',
        weeklyOffDays: availability?.weeklyOffDays || []
      })
    } catch (err) {
      console.error('Failed to fetch nurse availability:', err)
      setAvailabilitySelectedNurse(nurse)
      setAvailabilityData(null)
      setShiftForm({ startTime: '', endTime: '', weeklyOffDays: [] })
      setAvailabilityFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to fetch availability right now.'
      })
    } finally {
      setAvailabilityDetailLoading(false)
    }
  }

  const handleSelectAvailabilityNurse = (nurse) => {
    setAvailabilityResults([])
    fetchAvailabilityDetails(nurse)
  }

  const handleShiftTimeChange = (field, value) => {
    setShiftForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleToggleWeeklyOffDay = (day) => {
    setShiftForm((prev) => {
      const exists = prev.weeklyOffDays.includes(day)
      const updated = exists
        ? prev.weeklyOffDays.filter((d) => d !== day)
        : [...prev.weeklyOffDays, day]
      return {
        ...prev,
        weeklyOffDays: updated.sort((a, b) => a - b)
      }
    })
  }

  const handleSaveShift = async () => {
    if (!availabilitySelectedNurse) {
      setAvailabilityFeedback({ type: 'error', message: 'Select a nurse before saving.' })
      return
    }

    const start = parseTimeString(shiftForm.startTime)
    const end = parseTimeString(shiftForm.endTime)

    if (!start || !end) {
      setAvailabilityFeedback({ type: 'error', message: 'Enter both start and end times.' })
      return
    }

    if (end.minutesValue <= start.minutesValue) {
      setAvailabilityFeedback({ type: 'error', message: 'End time must be greater than start time.' })
      return
    }

    const basePayload = {
      weeklyOffDays: shiftForm.weeklyOffDays.length ? shiftForm.weeklyOffDays : [0],
      startHour: start.hour,
      startMinute: start.minute,
      endHour: end.hour,
      endMinute: end.minute
    }

    setSavingShift(true)
    setAvailabilityFeedback({ type: '', message: '' })
    try {
      if (availabilityData) {
        await axios.put(`${API_BASE}/admin/nurse-time-shift/${availabilitySelectedNurse._id}`, basePayload, {
          withCredentials: true
        })
        setAvailabilityFeedback({ type: 'success', message: 'Time shift updated successfully.' })
      } else {
        await axios.post(`${API_BASE}/admin/nurse-time-shift`, {
          nurseId: availabilitySelectedNurse._id,
          ...basePayload
        }, {
          withCredentials: true
        })
        setAvailabilityFeedback({ type: 'success', message: 'Time shift assigned successfully.' })
      }
      fetchAvailabilityDetails(availabilitySelectedNurse)
    } catch (err) {
      console.error('Failed to save time shift:', err)
      setAvailabilityFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Unable to save time shift right now.'
      })
    } finally {
      setSavingShift(false)
    }
  }

  const pageWindow = useMemo(() => {
    if (!nurses.length) {
      return 'Showing 0 results'
    }

    const start = (pagination.currentPage - 1) * PAGE_LIMIT + 1
    const end = start + nurses.length - 1
    const cap = pagination.totalNurses || nurses.length
    return `Showing ${start}-${Math.min(end, cap)} of ${cap} nurses`
  }, [nurses, pagination])

  const assignmentWindow = useMemo(() => {
    if (!selectedNurse) {
      return 'Select a nurse to review assigned services'
    }

    if (!nurseAssignments.length) {
      return assignmentLoading ? 'Loading assigned services...' : 'No services assigned yet'
    }

    const start = (assignmentPagination.currentPage - 1) * ASSIGNMENT_LIMIT + 1
    const end = start + nurseAssignments.length - 1
    const cap = assignmentPagination.totalAssignments || nurseAssignments.length
    return `Showing ${start}-${Math.min(end, cap)} of ${cap} services`
  }, [selectedNurse, nurseAssignments, assignmentPagination, assignmentLoading])

  const activeAssignments = useMemo(() => (
    nurseAssignments.filter((relation) => relation.isActive).length
  ), [nurseAssignments])

  const minutesToTimeString = (minutes) => {
    if (minutes === undefined || minutes === null) {
      return ''
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  const parseTimeString = (value) => {
    if (!value || !value.includes(':')) {
      return null
    }
    const [hourStr, minuteStr] = value.split(':')
    const hour = Number(hourStr)
    const minute = Number(minuteStr)
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return null
    }
    return {
      hour,
      minute,
      minutesValue: hour * 60 + minute
    }
  }

  const renderActivePanel = () => {
    switch (activeSection) {
      case 'all':
        return (
          <RosterPanel
            statusCounts={statusCounts}
            statusLoading={statusLoading}
            statusError={statusError}
            rosterLeaveDate={rosterLeaveDate}
            onRosterLeaveDateChange={handleRosterLeaveDateChange}
            rosterLeaveCount={rosterLeaveCount}
            rosterLeaveLoading={rosterLeaveLoading}
            rosterLeaveError={rosterLeaveError}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            onSearch={handleSearch}
            pageWindow={pageWindow}
            nurses={nurses}
            pagination={pagination}
            onPaginate={handlePagination}
            loading={loading}
            error={error}
            onToggleNurseAccess={handleToggleNurseAccess}
            togglingNurseId={togglingNurseId}
            onAddNurse={handleNavigateToAddNurse}
          />
        )
      case 'services':
        return (
          <ServiceAssignmentsPanel
            assignmentSearchTerm={assignmentSearchTerm}
            assignmentSearchMode={assignmentSearchMode}
            onAssignmentSearchTermChange={setAssignmentSearchTerm}
            onAssignmentSearchModeChange={setAssignmentSearchMode}
            onAssignmentSearch={handleAssignmentSearch}
            assignmentSearchError={assignmentSearchError}
            assignmentSearchLoading={assignmentSearchLoading}
            assignmentResults={assignmentResults}
            onSelectAssignmentNurse={handleSelectAssignmentNurse}
            selectedNurse={selectedNurse}
            assignmentWindow={assignmentWindow}
            assignmentPagination={assignmentPagination}
            assignmentError={assignmentError}
            assignmentLoading={assignmentLoading}
            nurseAssignments={nurseAssignments}
            activeAssignments={activeAssignments}
            onAssignmentPaginate={handleAssignmentPagination}
            showAssignPanel={showAssignPanel}
            onOpenAssignPanel={openAssignPanel}
            onCloseAssignPanel={closeAssignPanel}
            serviceOptions={serviceOptions}
            serviceOptionsLoading={serviceOptionsLoading}
            serviceSearchTerm={serviceSearchTerm}
            onServiceSearchTermChange={setServiceSearchTerm}
            onServiceSearch={handleServiceSearch}
            selectedServiceId={selectedServiceId}
            onSelectServiceId={setSelectedServiceId}
            commissionInput={commissionInput}
            onCommissionInputChange={setCommissionInput}
            assignPanelFeedback={assignPanelFeedback}
            assigningService={assigningService}
            onAssignService={handleAssignService}
            onToggleServiceRelation={handleToggleServiceRelation}
          />
        )
      case 'availability':
        return (
          <AvailabilityPanel
            availabilitySearchTerm={availabilitySearchTerm}
            availabilitySearchMode={availabilitySearchMode}
            onAvailabilitySearchTermChange={setAvailabilitySearchTerm}
            onAvailabilitySearchModeChange={setAvailabilitySearchMode}
            onAvailabilitySearch={handleAvailabilitySearch}
            availabilitySearchError={availabilitySearchError}
            availabilitySearchLoading={availabilitySearchLoading}
            availabilityResults={availabilityResults}
            onSelectAvailabilityNurse={handleSelectAvailabilityNurse}
            availabilitySelectedNurse={availabilitySelectedNurse}
            availabilityDetailLoading={availabilityDetailLoading}
            availabilityData={availabilityData}
            shiftForm={shiftForm}
            onShiftTimeChange={handleShiftTimeChange}
            onToggleWeeklyOffDay={handleToggleWeeklyOffDay}
            onSaveShift={handleSaveShift}
            savingShift={savingShift}
            availabilityFeedback={availabilityFeedback}
          />
        )
      case 'nursesOnLeave':
        return (
          <NursesOnLeavePanel
            selectedDate={nursesOnLeaveDate}
            onDateChange={handleNursesOnLeaveDateChange}
            onFetch={handleNursesOnLeaveFetch}
            loading={nursesOnLeaveLoading}
            error={nursesOnLeaveError}
            nursesOnLeave={nursesOnLeave}
            pagination={nursesOnLeavePagination}
            onPaginate={handleNursesOnLeavePagination}
            lastFetchedDate={nursesOnLeaveFetchedDate}
          />
        )
      case 'leaves':
        return (
          <LeaveRequestsPanel
            leaveSearchTerm={leaveSearchTerm}
            leaveSearchMode={leaveSearchMode}
            onLeaveSearchTermChange={setLeaveSearchTerm}
            onLeaveSearchModeChange={setLeaveSearchMode}
            onLeaveSearch={handleLeaveSearch}
            leaveSearchFeedback={leaveSearchFeedback}
            leavePagination={leavePagination}
            leaveError={leaveError}
            leaveLoading={leaveLoading}
            leaveRequests={leaveRequests}
            onLeaveReset={handleLeaveReset}
            onLeavePagination={handleLeavePagination}
            leaveActionTarget={leaveActionTarget}
            onActOnLeaveRequest={actOnLeaveRequest}
          />
        )
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <PlaceholderPanel label={SIDEBAR_LINKS.find((link) => link.id === activeSection)?.label || 'Coming Soon'} />
          </div>
        )
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 left-4 z-30 bg-teal-600 text-white p-3 rounded-full shadow-lg"
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
            <h2 className="text-xl font-semibold text-gray-900 mt-1">Nurse Management</h2>
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
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={activeSection === link.id ? 'text-teal-600' : 'text-gray-500'}>{link.icon}</span>
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

export default ManageNurses
