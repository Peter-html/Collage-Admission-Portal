import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, BookOpen, TrendingUp, LogOut, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { applicationsAPI, getUser, clearAuth } from '../services/api';

export function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await applicationsAPI.getMy();
      setApplications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'bg-green-50 border-green-200 text-green-800';
    if (status === 'rejected') return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-blue-200 mb-4">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
            <h1 className="text-3xl">My Applications</h1>
            <p className="text-blue-100 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadApplications}
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
            <p className="text-gray-500">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-600">{error}</p>
            <button onClick={loadApplications} className="bg-blue-900 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800">
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No Applications Yet</h3>
            <p className="text-gray-400 mb-6">You haven't applied to any courses yet.</p>
            <button
              onClick={() => navigate('/#courses')}
              className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, i) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`border rounded-lg p-6 ${getStatusStyle(app.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(app.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {app.courseId?.courseName || 'Unknown Course'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-medium capitalize px-3 py-1 rounded-full ${
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status}
                    </span>
                    {app.rank && (
                      <p className="text-xs text-gray-500 mt-1">Merit Rank: #{app.rank}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">PCM %</p>
                    <p className="font-bold text-blue-900 text-lg">{app.academicDetails?.pcmPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">12th %</p>
                    <p className="font-medium">{app.academicDetails?.twelfthMarks}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium">{app.courseId?.department || '-'}</p>
                  </div>
                </div>

                {app.status === 'approved' && (
                  <div className="mt-4 bg-green-100 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium">🎉 Congratulations! Your admission has been approved.</p>
                    <p className="text-green-700 text-xs mt-1">Please check your email for next steps including fee payment and document submission.</p>
                  </div>
                )}

                {app.status === 'rejected' && app.rejectionReason && (
                  <div className="mt-4 bg-red-100 rounded-lg p-3">
                    <p className="text-red-800 text-sm font-medium">Reason: {app.rejectionReason}</p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="mt-4 bg-yellow-100 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">⏳ Your application is under review. You'll be notified by email.</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
