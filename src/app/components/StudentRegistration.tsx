import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, MapPin, BookOpen, GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { applicationsAPI, coursesAPI, getUser, isLoggedIn, authAPI, saveAuth } from '../services/api';

interface RegistrationData {
  // Course
  courseId: string;
  courseName: string;
  // Personal
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  communityCategory: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  annualIncome: string;
  // Academic
  tenthMarks: string;
  twelfthMarks: string;
  mathsMarks: string;
  physicsMarks: string;
  chemistryMarks: string;
}

export function StudentRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCourseName: string = location.state?.courseName || 'Computer Science & Engineering';
  const passedCourseId: string = location.state?.courseId || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(!isLoggedIn());

  const [formData, setFormData] = useState<RegistrationData>({
    courseId: passedCourseId,
    courseName: passedCourseName,
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    communityCategory: '',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    annualIncome: '',
    tenthMarks: '',
    twelfthMarks: '',
    mathsMarks: '',
    physicsMarks: '',
    chemistryMarks: '',
  });

  // Pre-fill from logged-in user
  useEffect(() => {
    const user = getUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
      setNeedsAccount(false);
    }
  }, []);

  // Load courses to get IDs
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await coursesAPI.getAll();
        setCourses(res.data);
        // If we have a courseName but no courseId, find the matching course
        if (!formData.courseId && passedCourseName) {
          const match = res.data.find((c: any) => c.courseName === passedCourseName);
          if (match) {
            setFormData((prev) => ({ ...prev, courseId: match._id }));
          }
        }
      } catch (e) {
        console.error('Failed to load courses');
      }
    };
    loadCourses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // When course changes, update courseId too
    if (name === 'courseName') {
      const match = courses.find((c) => c.courseName === value);
      setFormData((prev) => ({ ...prev, courseName: value, courseId: match?._id || '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: If student doesn't have an account, register them first
      if (needsAccount) {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const regResult = await authAPI.register({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
        saveAuth(regResult.token, regResult.user);
      }

      // Step 2: Find course ID if needed
      let courseId = formData.courseId;
      if (!courseId) {
        const match = courses.find((c) => c.courseName === formData.courseName);
        courseId = match?._id;
      }
      if (!courseId) {
        throw new Error('Please select a valid course');
      }

      // Step 3: Submit application
      await applicationsAPI.submit({
        courseId,
        tenthMarks: parseFloat(formData.tenthMarks),
        twelfthMarks: parseFloat(formData.twelfthMarks),
        mathsMarks: parseFloat(formData.mathsMarks),
        physicsMarks: parseFloat(formData.physicsMarks),
        chemistryMarks: parseFloat(formData.chemistryMarks),
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        aadharNumber: formData.aadharNumber,
        communityCategory: formData.communityCategory,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        guardianPhone: formData.guardianPhone,
        annualIncome: formData.annualIncome,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl text-blue-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-600 mb-2">
            Your application for <strong>{formData.courseName}</strong> has been received.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You will receive an email notification once reviewed by the admissions team.
            Track your status in the student dashboard.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-900 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl text-blue-900 mb-2">Course Application</h1>
            <p className="text-gray-600">Complete your application for {formData.courseName}</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Course Selection ── */}
            <div>
              <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Selection
              </h2>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Select Course *</label>
                <select
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c.courseName} disabled={c.remainingSeats === 0}>
                      {c.courseName} ({c.remainingSeats > 0 ? `${c.remainingSeats} seats left` : 'Full'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Account Details (if not logged in) ── */}
            {needsAccount && (
              <div>
                <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Create Student Account
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2 text-gray-700">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                      placeholder="Min. 6 characters"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This creates your student account so you can track your application.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Personal Information ── */}
            <div>
              <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                    required readOnly={isLoggedIn()} />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Aadhar Number *</label>
                  <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange}
                    pattern="[0-9]{12}"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
              </div>
            </div>

            {/* ── Address ── */}
            <div>
              <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-700">Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Community Category *</label>
                  <select name="communityCategory" value={formData.communityCategory} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required>
                    <option value="">Select Category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Academic ── */}
            <div>
              <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">10th Percentage *</label>
                  <input type="number" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange}
                    step="0.01" min="0" max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">12th Percentage *</label>
                  <input type="number" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange}
                    step="0.01" min="0" max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Maths Marks (out of 100) *</label>
                  <input type="number" name="mathsMarks" value={formData.mathsMarks} onChange={handleChange}
                    min="0" max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Physics Marks (out of 100) *</label>
                  <input type="number" name="physicsMarks" value={formData.physicsMarks} onChange={handleChange}
                    min="0" max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Chemistry Marks (out of 100) *</label>
                  <input type="number" name="chemistryMarks" value={formData.chemistryMarks} onChange={handleChange}
                    min="0" max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                {formData.mathsMarks && formData.physicsMarks && formData.chemistryMarks && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Your PCM Percentage</p>
                      <p className="text-2xl text-blue-900 font-bold">
                        {((parseFloat(formData.mathsMarks) + parseFloat(formData.physicsMarks) + parseFloat(formData.chemistryMarks)) / 3).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Parent/Guardian ── */}
            <div>
              <h2 className="text-xl mb-4 text-blue-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Father's Name *</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Mother's Name *</label>
                  <input type="text" name="motherName" value={formData.motherName} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Guardian Phone Number *</label>
                  <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange}
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Annual Family Income *</label>
                  <select name="annualIncome" value={formData.annualIncome} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" required>
                    <option value="">Select Income Range</option>
                    <option value="below-2.5">Below 2.5 Lakhs</option>
                    <option value="2.5-5">2.5 - 5 Lakhs</option>
                    <option value="5-10">5 - 10 Lakhs</option>
                    <option value="above-10">Above 10 Lakhs</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={loading}
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
