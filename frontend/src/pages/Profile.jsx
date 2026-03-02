import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { disconnectSocket } from '../services/socket'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const Profile = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addresses, setAddresses] = useState([])
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)
  const [showEditAddressModal, setShowEditAddressModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Form states
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [addressForm, setAddressForm] = useState({ flatNumber: '', locality: '', city: '', state: '', pincode: '' })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses()
    }
  }, [isLoggedIn])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
      if (response.data.success && response.data.user) {
        setIsLoggedIn(true)
        setUser(response.data.user)
        setEditProfileForm({ name: response.data.user.name, phone: response.data.user.phone })
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/addresses`, { withCredentials: true })
      if (response.data.success) {
        setAddresses(response.data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true })
      disconnectSocket()
      setIsLoggedIn(false)
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile/image`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.data.success) {
        setUser({ ...user, image: response.data.image })
        alert('Profile image updated successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, editProfileForm, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.data.success) {
        setUser(response.data.user)
        setShowEditProfileModal(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile/password`, 
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      )
      if (response.data.success) {
        setShowChangePasswordModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Password changed successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/address`, addressForm, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.data.success) {
        fetchAddresses()
        setShowAddAddressModal(false)
        setAddressForm({ flatNumber: '', locality: '', city: '', state: '', pincode: '' })
        alert('Address added successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add address')
    }
  }

  const handleEditAddress = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/address/${selectedAddress._id}`, addressForm, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.data.success) {
        fetchAddresses()
        setShowEditAddressModal(false)
        setSelectedAddress(null)
        alert('Address updated successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/address/${addressId}`, { withCredentials: true })
      if (response.data.success) {
        fetchAddresses()
        alert('Address deleted successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete address')
    }
  }

  const openEditAddressModal = (address) => {
    setSelectedAddress(address)
    setAddressForm({
      flatNumber: address.flatNumber,
      locality: address.locality,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    })
    setShowEditAddressModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to view your profile</p>
            <div className="space-y-4 max-w-md mx-auto">
              <button onClick={() => navigate('/login')} className="w-full bg-primary-400 hover:bg-primary-500 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all">
                Create an Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary-100" />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center border-4 border-primary-100">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">{user?.name}</h2>
                <p className="text-sm text-primary-600 font-semibold uppercase mt-1">{user?.role}</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button onClick={() => setShowEditProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button onClick={() => setShowChangePasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Customer ID</p>
                  <p className="text-lg font-semibold text-gray-900">#{user?.publicId}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.phone}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Saved Addresses
                </h3>
                <button onClick={() => { setAddressForm({ flatNumber: '', locality: '', city: '', state: '', pincode: '' }); setShowAddAddressModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>No addresses saved yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address._id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{address.flatNumber}, {address.locality}</p>
                          <p className="text-gray-600 text-sm mt-1">{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => openEditAddressModal(address)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteAddress(address._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl pointer-events-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editProfileForm.name} onChange={(e) => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={editProfileForm.phone} onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors">Save Changes</button>
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl pointer-events-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required minLength={6} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors">Change Password</button>
                <button type="button" onClick={() => { setShowChangePasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flat/House No.</label>
                <input type="text" value={addressForm.flatNumber} onChange={(e) => setAddressForm({...addressForm, flatNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality/Area</label>
                <input type="text" value={addressForm.locality} onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} pattern="[0-9]{6}" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors">Add Address</button>
                <button type="button" onClick={() => setShowAddAddressModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Address</h3>
            <form onSubmit={handleEditAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flat/House No.</label>
                <input type="text" value={addressForm.flatNumber} onChange={(e) => setAddressForm({...addressForm, flatNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality/Area</label>
                <input type="text" value={addressForm.locality} onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} pattern="[0-9]{6}" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors">Save Changes</button>
                <button type="button" onClick={() => { setShowEditAddressModal(false); setSelectedAddress(null); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default Profile
