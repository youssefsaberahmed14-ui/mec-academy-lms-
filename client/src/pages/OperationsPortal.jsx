import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { 
  Sliders, 
  BookOpen, 
  Users, 
  Layers, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  DollarSign, 
  GraduationCap, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  KeyRound,
  Search,
  Mail,
  Phone,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

export default function OperationsPortal() {
  const { user } = useAuth();
  
  // Active Separate Page: 'courses' | 'groups' | 'students' | 'instructors' | 'mentors'
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['courses', 'groups', 'students', 'instructors', 'mentors'].includes(hash) ? hash : 'courses';
  });

  const switchPage = (page) => {
    setActivePage(page);
    window.location.hash = page;
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['courses', 'groups', 'students', 'instructors', 'mentors'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    code: '',
    price: '',
    category: 'Software Engineering',
    totalPlannedSessions: 14,
    hasQuizzes: true,
    description: ''
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    courseId: '',
    instructorId: '',
    mentorId: '',
    studentIds: [],
    schedule: 'Mon & Wed 18:00 - 21:00',
    status: 'active'
  });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalRole, setUserModalRole] = useState('student');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    phone: '',
    specialization: ''
  });

  const [actionSuccess, setActionSuccess] = useState('');

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, groupsRes, instRes, menRes, stuRes] = await Promise.all([
        apiRequest('/operations/courses'),
        apiRequest('/operations/groups'),
        apiRequest('/operations/users?role=instructor'),
        apiRequest('/operations/users?role=mentor'),
        apiRequest('/operations/users?role=student')
      ]);

      setCourses(coursesRes.courses || []);
      setGroups(groupsRes.groups || []);
      setInstructors(instRes.users || []);
      setMentors(menRes.users || []);
      setStudents(stuRes.users || []);
    } catch (err) {
      console.error('Operations load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Course handlers
  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title,
        code: course.code,
        price: course.price,
        category: course.category,
        totalPlannedSessions: course.totalPlannedSessions,
        hasQuizzes: course.hasQuizzes,
        description: course.description
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        code: `MEC-${Math.floor(100 + Math.random() * 900)}`,
        price: 1200,
        category: 'Cloud Engineering',
        totalPlannedSessions: 16,
        hasQuizzes: true,
        description: ''
      });
    }
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await apiRequest(`/operations/courses/${editingCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(courseForm)
        });
        showSuccess(`Course "${courseForm.title}" updated successfully.`);
      } else {
        await apiRequest('/operations/courses', {
          method: 'POST',
          body: JSON.stringify(courseForm)
        });
        showSuccess(`New course "${courseForm.title}" created with price $${courseForm.price}.`);
      }
      setCourseModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save course');
    }
  };

  // Group handlers
  const handleOpenGroupModal = (grp = null) => {
    if (grp) {
      setEditingGroup(grp);
      setGroupForm({
        name: grp.name,
        courseId: grp.courseId,
        instructorId: grp.instructorId,
        mentorId: grp.mentorId,
        studentIds: grp.studentIds || [],
        schedule: grp.schedule,
        status: grp.status
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        name: `Cohort ${String.fromCharCode(65 + groups.length)} - Spring 2026`,
        courseId: courses[0]?.id || '',
        instructorId: instructors[0]?.id || '',
        mentorId: mentors[0]?.id || '',
        studentIds: [],
        schedule: 'Sun & Tue 19:00 - 22:00',
        status: 'active'
      });
    }
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await apiRequest(`/operations/groups/${editingGroup.id}`, {
          method: 'PUT',
          body: JSON.stringify(groupForm)
        });
        showSuccess(`Group "${groupForm.name}" updated with 4-way links.`);
      } else {
        await apiRequest('/operations/groups', {
          method: 'POST',
          body: JSON.stringify(groupForm)
        });
        showSuccess(`Cohort "${groupForm.name}" created and interlinked.`);
      }
      setGroupModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save group');
    }
  };

  const toggleStudentInGroup = (studentId) => {
    setGroupForm(prev => {
      const exists = prev.studentIds.includes(studentId);
      return {
        ...prev,
        studentIds: exists 
          ? prev.studentIds.filter(id => id !== studentId)
          : [...prev.studentIds, studentId]
      };
    });
  };

  // User handlers
  const handleOpenUserModal = (role) => {
    setUserModalRole(role);
    setUserForm({
      name: '',
      email: '',
      role: role,
      password: '',
      phone: '',
      specialization: role === 'instructor' ? 'Cloud & Distributed Systems' : role === 'mentor' ? 'Technical Advisory' : ''
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/operations/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      showSuccess(`New ${userForm.role} "${userForm.name}" created successfully.`);
      setUserModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading Academic Operations Data...</p>
      </div>
    );
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstructors = instructors.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Operations & Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">MEC Academic Operations Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Academy Management System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer curriculum pricing, enroll learners, and link groups with courses, instructors, and mentors.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Separate Pages Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => switchPage('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'courses'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Pricing</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'courses' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'groups'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cohort Groups (4-Way Links)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'groups' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {groups.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'students'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students Directory</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'students' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {students.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('instructors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'instructors'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Instructors Faculty</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'instructors' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {instructors.length}
          </span>
        </button>

        <button
          onClick={() => switchPage('mentors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activePage === 'mentors'
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Mentors & Advisors</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activePage === 'mentors' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {mentors.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          PAGE 1: COURSES & PRICING
          ========================================================================= */}
      {activePage === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Page 1 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Curriculum Offerings</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Course Offerings & Pricing Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, list, and edit courses, with each course's price visible directly in the list.
              </p>
            </div>

            <button
              onClick={() => handleOpenCourseModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    
                    {/* Course Price Visible in List */}
                    <span className="text-base font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-0.5 shadow-xs">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>{course.price.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold ml-0.5">USD</span>
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-700 block mb-1">
                    {course.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Sessions: <strong>{course.totalPlannedSessions} planned</strong></div>
                    <div>Quizzes: <strong>{course.hasQuizzes ? 'Active' : 'None'}</strong></div>
                  </div>

                  <button
                    onClick={() => handleOpenCourseModal(course)}
                    className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Course</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: COHORT GROUPS (4-WAY LINKS)
          ========================================================================= */}
      {activePage === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Page 2 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Curriculum Delivery Units</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Cohort Groups & Four-Way Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                A group strictly links a Course, an Instructor, a Mentor, and its enrolled Students.
              </p>
            </div>

            <button
              onClick={() => handleOpenGroupModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Linked Group</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-600 font-bold block mb-0.5">
                      {grp.schedule}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{grp.name}</h3>
                  </div>
                  <button
                    onClick={() => handleOpenGroupModal(grp)}
                    className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Group Links</span>
                  </button>
                </div>

                {/* The 4 Interlinked Entities */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                      1. Linked Course
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.course?.title}</span>
                    <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                      ${grp.course?.price} USD
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                      2. Assigned Faculty
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.instructor?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{grp.instructor?.email}</span>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                      3. Assigned Mentor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.mentor?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{grp.mentor?.email}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>4. Enrolled Students ({grp.students?.length || 0})</span>
                    <span className="text-slate-400 font-normal">
                      {grp.heldSessionsCount || 0} of {grp.sessionsCount || 0} sessions completed
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {grp.students?.map((stu) => (
                      <span key={stu.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        {stu.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: STUDENTS DIRECTORY
          ========================================================================= */}
      {activePage === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Page 3 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Learners Registry</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Enrolled Students Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register new students, set their initial login credentials, and inspect their active cohort assignments.
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal('student')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6">Enrolled Cohorts</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stu) => {
                    const studentGroups = groups.filter(g => g.studentIds?.includes(stu.id));
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                            {stu.avatar || stu.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{stu.name}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">{stu.email}</td>
                        <td className="py-4 px-6 font-mono text-slate-500">{stu.phone || '+20 100 000 0000'}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {studentGroups.length > 0 ? (
                              studentGroups.map(g => (
                                <span key={g.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                                  {g.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px]">Not assigned yet</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            Active Enrolled
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 4: INSTRUCTORS FACULTY
          ========================================================================= */}
      {activePage === 'instructors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 4 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Faculty Registry</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Faculty & Instructors Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard instructors, configure their initial credentials, and supervise teaching assignments.
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal('instructor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Instructor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((inst) => {
              const assignedGroups = groups.filter(g => g.instructorId === inst.id);
              return (
                <div key={inst.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm">
                        {inst.avatar || inst.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{inst.name}</h3>
                        <span className="text-xs text-blue-600 font-semibold">{inst.specialization || 'Lead Instructor'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-600 truncate">{inst.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-600">{inst.phone || '+20 100 111 2222'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Teaching Cohorts ({assignedGroups.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedGroups.map(g => (
                        <span key={g.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-100">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 5: MENTORS & ADVISORS
          ========================================================================= */}
      {activePage === 'mentors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Page 5 of 5</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">Advisory Staff</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Mentors & Academic Advisors Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage academic coaches, assign cohort advisory duties, and configure access passwords.
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal('mentor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Mentor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((men) => {
              const assignedGroups = groups.filter(g => g.mentorId === men.id);
              return (
                <div key={men.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-sm">
                        {men.avatar || men.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{men.name}</h3>
                        <span className="text-xs text-purple-600 font-semibold">{men.expertise || 'Student Mentor'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-600 truncate">{men.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-600">{men.phone || '+20 100 333 4444'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Mentored Cohorts ({assignedGroups.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedGroups.map(g => (
                        <span key={g.id} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium border border-purple-100">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* MODAL 1: ADD / EDIT COURSE */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCourse ? 'Edit Course Details' : 'Create New Academy Course'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Specify title, code, public pricing, and syllabus structure.</p>

            <form onSubmit={handleSaveCourse} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems Architecture & Microservices"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Planned Sessions</label>
                  <input
                    type="number"
                    required
                    value={courseForm.totalPlannedSessions}
                    onChange={(e) => setCourseForm({ ...courseForm, totalPlannedSessions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Outline syllabus, key technologies, and prerequisites..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT GROUP */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editingGroup ? 'Edit Cohort Group Links' : 'Create New Cohort Group'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Link a Course, an Instructor, a Mentor, and enrolled Students.</p>

            <form onSubmit={handleSaveGroup} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">1. Linked Course</label>
                  <select
                    value={groupForm.courseId}
                    onChange={(e) => setGroupForm({ ...groupForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} (${c.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">2. Instructor</label>
                  <select
                    value={groupForm.instructorId}
                    onChange={(e) => setGroupForm({ ...groupForm, instructorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {instructors.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">3. Mentor</label>
                  <select
                    value={groupForm.mentorId}
                    onChange={(e) => setGroupForm({ ...groupForm, mentorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {mentors.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Timing</label>
                <input
                  type="text"
                  value={groupForm.schedule}
                  onChange={(e) => setGroupForm({ ...groupForm, schedule: e.target.value })}
                  placeholder="e.g. Mon & Wed 18:00 - 21:00"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Enrolled Students ({groupForm.studentIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2.5 space-y-1 bg-slate-50">
                  {students.map((stu) => {
                    const isSelected = groupForm.studentIds.includes(stu.id);
                    return (
                      <div
                        key={stu.id}
                        onClick={() => toggleStudentInGroup(stu.id)}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-100/80 text-amber-950 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{stu.name} ({stu.email})</span>
                        <div className={`h-4 w-4 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER USER (STUDENT / INSTRUCTOR / MENTOR) */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              Register New {userForm.role}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set their profile and assign their initial password.
            </p>

            <form onSubmit={handleSaveUser} className="mt-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Sarah Mohamed"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder={`name@${userForm.role === 'student' ? 'student.' : ''}mec.edu`}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Initial Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Enter initial password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+20 100 123 4567"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {userForm.role !== 'student' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization / Department</label>
                  <input
                    type="text"
                    value={userForm.specialization}
                    onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                    placeholder="e.g. Distributed Systems Architecture"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Create {userForm.role}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
