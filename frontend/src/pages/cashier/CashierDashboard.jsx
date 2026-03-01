import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

const CashierDashboard = () => {
  const stats = [
    { label: 'Today\'s Revenue', value: '₹45,230', icon: '💰', color: 'bg-green-100 text-green-600' },
    { label: 'Total Transactions', value: '34', icon: '💳', color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Payments', value: '8', icon: '⏳', color: 'bg-orange-100 text-orange-600' },
    { label: 'Refunds', value: '2', icon: '↩️', color: 'bg-red-100 text-red-600' },
  ]

  const recentTransactions = [
    { id: 'TXN001', patient: 'John Doe', service: 'Doctor Consultation', amount: '₹500', status: 'Completed', time: '10:30 AM' },
    { id: 'TXN002', patient: 'Jane Smith', service: 'Home Nursing', amount: '₹1,200', status: 'Completed', time: '11:15 AM' },
    { id: 'TXN003', patient: 'Mike Johnson', service: 'Lab Tests', amount: '₹800', status: 'Pending', time: '12:00 PM' },
    { id: 'TXN004', patient: 'Sarah Williams', service: 'IV Therapy', amount: '₹1,500', status: 'Completed', time: '01:30 PM' },
    { id: 'TXN005', patient: 'David Brown', service: 'Doctor Consultation', amount: '₹500', status: 'Pending', time: '02:15 PM' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-dark-900">Cashier Dashboard</h1>
              <p className="text-dark-600 mt-1">Welcome back, Admin</p>
            </div>
            <Link to="/profile" className="bg-primary-400 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-all">
              View Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-dark-600 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-dark-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-dark-900">Recent Transactions</h2>
                      <button className="text-primary-400 hover:text-primary-500 text-sm font-medium">
                        View All
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-dark-900">{transaction.patient}</p>
                                <span className="text-xs text-dark-500 bg-gray-100 px-2 py-1 rounded">{transaction.id}</span>
                              </div>
                              <p className="text-sm text-dark-600">{transaction.service}</p>
                              <p className="text-xs text-dark-500 mt-1">🕐 {transaction.time}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-dark-900">{transaction.amount}</p>
                              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                transaction.status === 'Completed' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button className="w-full bg-primary-400 hover:bg-primary-500 text-white py-3 rounded-lg font-medium transition-all">
                        New Payment
                      </button>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-dark-700 py-3 rounded-lg font-medium transition-all">
                        Process Refund
                      </button>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-dark-700 py-3 rounded-lg font-medium transition-all">
                        Generate Invoice
                      </button>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-dark-700 py-3 rounded-lg font-medium transition-all">
                        Daily Report
                      </button>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Payment Summary</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-dark-600 text-sm">Cash Payments</span>
                        <span className="font-semibold text-dark-900">₹12,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-600 text-sm">Card Payments</span>
                        <span className="font-semibold text-dark-900">₹20,130</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-600 text-sm">Online Payments</span>
                        <span className="font-semibold text-dark-900">₹12,600</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-dark-900 font-semibold">Total</span>
                          <span className="font-bold text-dark-900 text-lg">₹45,230</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Actions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
                        ⚠️
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 text-sm">Pending Review</p>
                        <p className="text-xs text-dark-600 mt-1">8 payments require verification</p>
                        <button className="text-xs text-yellow-600 font-medium mt-2 hover:text-yellow-700">
                          Review Now →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  )
}

export default CashierDashboard
