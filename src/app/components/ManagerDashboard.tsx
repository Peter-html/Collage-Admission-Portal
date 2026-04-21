import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, Users, BookOpen, Filter, Search, Mail, Loader2, AlertCircle, RefreshCw, LogOut, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { applicationsAPI, coursesAPI, clearAuth } from '../services/api';

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, selectedCourse, selectedStatus, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, statsRes, coursesRes] = await Promise.all([
        applicationsAPI.getAll(),
        applicationsAPI.getDashboardStats(),
        coursesAPI.getAllAdmin(),
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];
    if (selectedCourse !== 'all') {
      filtered = filtered.filter((app) => app.courseId?._id === selectedCourse);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.personalDetails?.fullName?.toLowerCase().includes(q) ||
          app.studentId?.email?.toLowerCase().includes(q) ||
          app.personalDetails?.phone?.includes(q)
      );
    }
    setFilteredApplications(filtered);
  };

  const handleApprove = async (app: any) => {
    setActionLoading(true);
    try {
      const result = await applicationsAPI.approve(app._id);
      showToast('success', result.message);
      await loadData();
      setSelectedApplication(null);
    } catch (err: any) {
      showToast('error', err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (app: any) => {
    const reason = window.prompt('Optional: Enter a reason for rejection (or press OK to skip):');
    setActionLoading(true);
    try {
      const result = await applicationsAPI.reject(app._id, reason || undefined);
      showToast('success', result.message);
      await loadData();
      setSelectedApplication(null);
    } catch (err: any) {
      showToast('error', err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <span className={`${styles[status] || ''} px-3 py-1 rounded-full text-sm capitalize`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-900 animate-spin" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl text-gray-800">Failed to Load Dashboard</h2>
        <p className="text-gray-500 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const summary = stats?.summary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm max-w-xs">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-blue-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-blue-200 mb-4">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
            <h1 className="text-3xl">Manager Dashboard</h1>
            <p className="text-blue-100 mt-1">Application Management & Analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Applications', value: summary?.totalApplications || 0, Icon: Users, color: 'text-blue-900' },
            { label: 'Pending Review', value: summary?.pendingCount || 0, Icon: BookOpen, color: 'text-yellow-600' },
            { label: 'Approved', value: summary?.approvedCount || 0, Icon: CheckCircle, color: 'text-green-600' },
            { label: 'Avg PCM %', value: `${summary?.avgPcm || 0}%`, Icon: TrendingUp, color: 'text-blue-900' },
          ].map(({ label, value, Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{label}</p>
                  <h3 className={`text-3xl ${color} mt-1`}>{value}</h3>
                </div>
                <Icon className={`w-12 h-12 ${color} opacity-20`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Seat Usage ── */}
        {summary && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl mb-4 text-blue-900">Overall Seat Usage</h2>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-600">{summary.filledSeats} / {summary.totalSeats} seats filled</span>
              <span className="ml-auto text-sm text-blue-900 font-medium">{summary.seatUtilization}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-900 rounded-full transition-all"
                style={{ width: `${summary.seatUtilization}%` }}
              />
            </div>
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>🟢 {summary.approvedCount} Approved</span>
              <span>🟡 {summary.pendingCount} Pending</span>
              <span>🔴 {summary.rejectedCount} Rejected</span>
              <span>📚 {summary.totalCourses} Courses</span>
            </div>
          </div>
        )}

        {/* ── Course-wise Analytics ── */}
        {stats?.courseStats?.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl mb-4 text-blue-900">Course-wise Analytics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Course Name</th>
                    <th className="text-center py-3 px-4">Total Seats</th>
                    <th className="text-center py-3 px-4">Filled</th>
                    <th className="text-center py-3 px-4">Applications</th>
                    <th className="text-center py-3 px-4">Pending</th>
                    <th className="text-center py-3 px-4">Approved</th>
                    <th className="text-center py-3 px-4">Avg PCM</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.courseStats.map((course: any) => (
                    <tr key={course._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{course.courseName || 'Unknown'}</td>
                      <td className="text-center py-3 px-4">{course.totalSeats || '-'}</td>
                      <td className="text-center py-3 px-4">{course.filledSeats || 0}</td>
                      <td className="text-center py-3 px-4">{course.total}</td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">{course.pending}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{course.approved}</span>
                      </td>
                      <td className="text-center py-3 px-4 text-blue-900 font-medium">{course.avgPcm}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Applications Table ── */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.courseName}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Student Name</th>
                  <th className="text-left py-3 px-4">Course</th>
                  <th className="text-center py-3 px-4">PCM %</th>
                  <th className="text-center py-3 px-4">12th %</th>
                  <th className="text-center py-3 px-4">Applied</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app, index) => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{app.personalDetails?.fullName || app.studentId?.name}</p>
                          <p className="text-sm text-gray-600">{app.studentId?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{app.courseId?.courseName || '-'}</td>
                      <td className="text-center py-3 px-4">
                        <span className="font-medium text-blue-900">{app.academicDetails?.pcmPercentage}%</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-medium">{app.academicDetails?.twelfthMarks}%</span>
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="text-center py-3 px-4">{getStatusBadge(app.status)}</td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="text-blue-900 hover:text-blue-700 text-sm underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Showing {filteredApplications.length} of {applications.length} applications • Sorted by PCM % (highest first)
          </p>
        </div>
      </div>

      {/* ── Application Detail Modal ── */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-blue-900 text-white p-6 z-10">
              <h2 className="text-2xl">Application Details</h2>
              <p className="text-blue-100 text-sm mt-1">{selectedApplication.personalDetails?.fullName}</p>
              {selectedApplication.rank && (
                <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Merit Rank: #{selectedApplication.rank}
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Academic highlights */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'PCM %', value: `${selectedApplication.academicDetails?.pcmPercentage}%`, highlight: true },
                  { label: '12th %', value: `${selectedApplication.academicDetails?.twelfthMarks}%` },
                  { label: '10th %', value: `${selectedApplication.academicDetails?.tenthMarks}%` },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`p-4 rounded-lg text-center ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className={`text-2xl font-bold ${highlight ? 'text-blue-900' : 'text-gray-800'}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg mb-3 text-blue-900">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Full Name', selectedApplication.personalDetails?.fullName],
                    ['Email', selectedApplication.studentId?.email],
                    ['Phone', selectedApplication.personalDetails?.phone],
                    ['Date of Birth', selectedApplication.personalDetails?.dateOfBirth ? new Date(selectedApplication.personalDetails.dateOfBirth).toLocaleDateString() : '-'],
                    ['Gender', selectedApplication.personalDetails?.gender],
                    ['Aadhar', selectedApplication.personalDetails?.aadharNumber],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-600">{label}</p>
                      <p className="font-medium capitalize">{value || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg mb-3 text-blue-900">Academic Details</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {[
                    ['Course Applied', selectedApplication.courseId?.courseName],
                    ['Maths Marks', `${selectedApplication.academicDetails?.mathsMarks}/100`],
                    ['Physics Marks', `${selectedApplication.academicDetails?.physicsMarks}/100`],
                    ['Chemistry Marks', `${selectedApplication.academicDetails?.chemistryMarks}/100`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-600">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg mb-3 text-blue-900">Address & Family Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{selectedApplication.personalDetails?.address}</p>
                    <p className="font-medium">{selectedApplication.personalDetails?.city}, {selectedApplication.personalDetails?.state} - {selectedApplication.personalDetails?.pincode}</p>
                  </div>
                  {[
                    ["Father's Name", selectedApplication.personalDetails?.fatherName],
                    ["Mother's Name", selectedApplication.personalDetails?.motherName],
                    ['Guardian Phone', selectedApplication.personalDetails?.guardianPhone],
                    ['Annual Income', selectedApplication.personalDetails?.annualIncome?.replace('-', ' - ')],
                    ['Community', selectedApplication.personalDetails?.communityCategory?.toUpperCase()],
                    ['Applied On', new Date(selectedApplication.appliedAt).toLocaleString()],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-600">{label}</p>
                      <p className="font-medium">{value || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.rejectionReason && (
                <div className="border-t pt-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{selectedApplication.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t flex gap-4">
              <button
                onClick={() => setSelectedApplication(null)}
                disabled={actionLoading}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedApplication)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {actionLoading ? 'Processing...' : 'Approve & Send Email'}
                  </button>
                </>
              )}
              {selectedApplication.status !== 'pending' && (
                <div className="flex-1 text-center py-2.5">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${selectedApplication.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedApplication.status === 'approved' ? (
                      <><CheckCircle className="w-5 h-5" /> Already Approved</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> Already Rejected</>
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
