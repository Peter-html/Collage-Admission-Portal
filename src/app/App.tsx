import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AchievementPopup } from './components/AchievementPopup';
import LoginModal from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StudentRegistration } from './components/StudentRegistration';
import { ManagerDashboard } from './components/ManagerDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Award, Users, BookOpen, TrendingUp, CheckCircle, XCircle, ChevronLeft, ChevronRight, Building2, Briefcase, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { coursesAPI } from './services/api';

// Courses are now loaded dynamically from the backend API

const management = [
  { name: 'Dr. Rajesh Kumar', role: 'Principal', image: 'https://images.unsplash.com/photo-1758685734408-19dd0cc86d2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Dr. Priya Sharma', role: 'Vice Principal', image: 'https://images.unsplash.com/photo-1758270704296-a59b8f4e7dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Dr. Arun Menon', role: 'Dean - Academics', image: 'https://images.unsplash.com/photo-1758270704349-1ad411aa1281?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Dr. Kavitha Reddy', role: 'Dean - Research', image: 'https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
];

const testimonials = [
  { name: 'Arjun Patel', batch: '2024', text: 'The placement support and industry exposure at SRI helped me secure my dream job at Google. Forever grateful!', company: 'Google' },
  { name: 'Sneha Krishnan', batch: '2023', text: 'Excellent faculty and state-of-the-art labs. The research opportunities here are world-class.', company: 'Microsoft' },
  { name: 'Vikram Singh', batch: '2025', text: 'The college environment fostered both academic and personal growth. Best decision of my life!', company: 'Amazon' },
];

const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture'];

function HomePage() {
  const navigate = useNavigate();
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentManagement, setCurrentManagement] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll()
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([])) // fallback: empty list
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAchievementPopup(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextManagement = () => {
    setCurrentManagement((prev) => Math.min(prev + 1, management.length - 3));
  };

  const prevManagement = () => {
    setCurrentManagement((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showAchievementPopup && <AchievementPopup onClose={() => setShowAchievementPopup(false)} />}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <Navbar onLoginClick={() => setShowLoginModal(true)} />

      <section id="home" className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1761318044223-a2dc78a104a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="College Campus"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-5xl mb-4">Welcome to ST.JOSEPH Engineering College</h1>
            <p className="text-xl mb-8 text-blue-100">Building Tomorrow's Engineers Today</p>
            <div className="flex gap-4">
              <a
                href="#courses"
                className="bg-white text-blue-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Apply Now
              </a>
              <button
                onClick={() => setShowAchievementPopup(true)}
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                View Achievements
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1695205846379-70ca8519b716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="College Building"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-4xl mb-6 text-blue-900">About Our College</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Established in 1995, ST.JOSEPH Engineering College has been at the forefront of technical education in South India.
                As an autonomous institution affiliated to Anna University, we offer undergraduate and postgraduate programs
                in various engineering disciplines.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our state-of-the-art infrastructure, experienced faculty, and industry partnerships ensure that students receive
                world-class education and are well-prepared for successful careers in engineering and technology.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Users className="w-8 h-8 text-blue-900 mb-2" />
                  <h3 className="text-2xl text-blue-900">5000+</h3>
                  <p className="text-gray-600 text-sm">Students</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Award className="w-8 h-8 text-blue-900 mb-2" />
                  <h3 className="text-2xl text-blue-900">95%</h3>
                  <p className="text-gray-600 text-sm">Placement Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="management" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-blue-900">Our Management</h2>
            <p className="text-gray-600">Meet our experienced leadership team</p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              {management.slice(currentManagement, currentManagement + 3).map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-xl mb-1">{member.name}</h3>
                    <p className="text-blue-900">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {management.length > 3 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevManagement}
                  disabled={currentManagement === 0}
                  className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextManagement}
                  disabled={currentManagement >= management.length - 3}
                  className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="courses" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-blue-900">Available Courses</h2>
            <p className="text-gray-600">2026-27 Academic Year Admissions</p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-blue-900 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                    <h3 className="text-lg">{course.courseName}</h3>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Total Seats:</span> {course.totalSeats}
                    </p>
                    <p className={course.remainingSeats > 0 ? 'text-green-600' : 'text-red-600'}>
                      <span className="font-medium">Available:</span> {course.remainingSeats}
                    </p>
                    <p className="text-gray-600 text-xs">
                      <span className="font-medium">Eligibility:</span> Min {course.eligibility?.minPercentage}% in 12th with Maths & Physics
                    </p>
                    {course.cutoff && (
                      <p className="text-gray-600 text-xs">
                        <span className="font-medium">Cutoff PCM:</span> {course.cutoff}%
                      </p>
                    )}
                  </div>

                  <button
                    disabled={course.remainingSeats === 0}
                    onClick={() => course.remainingSeats > 0 && navigate('/register', { state: { courseName: course.courseName, courseId: course._id } })}
                    className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      course.remainingSeats > 0
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {course.remainingSeats > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Apply Now
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Seats Full
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Latest Announcements</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-blue-300 text-sm mb-2">April 15, 2026</div>
              <h3 className="text-xl mb-3">Admission Open for 2026-27</h3>
              <p className="text-blue-100 text-sm">Online applications now open for all undergraduate programs. Apply before May 31, 2026.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-blue-300 text-sm mb-2">April 10, 2026</div>
              <h3 className="text-xl mb-3">Placement Drive Success</h3>
              <p className="text-blue-100 text-sm">150+ students placed in top companies with average package of 8.5 LPA.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
              <div className="text-blue-300 text-sm mb-2">April 5, 2026</div>
              <h3 className="text-xl mb-3">New Research Center</h3>
              <p className="text-blue-100 text-sm">State-of-the-art AI & ML Research Center inaugurated with industry collaboration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-blue-900">Our Placement Partners</h2>
            <p className="text-gray-600">Top companies hiring our graduates</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companies.map((company) => (
              <div
                key={company}
                className="bg-white rounded-lg shadow p-8 flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-blue-900 mx-auto mb-2" />
                  <p className="text-gray-700">{company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-blue-900">Student Testimonials</h2>
            <p className="text-gray-600">Hear from our successful alumni</p>
          </div>

          <div className="relative">
            <div className="bg-blue-50 rounded-lg p-8 md:p-12">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonials[currentTestimonial].text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl text-blue-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">Batch of {testimonials[currentTestimonial].batch}</p>
                    <p className="text-sm text-blue-700">Placed at {testimonials[currentTestimonial].company}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<StudentRegistration />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}