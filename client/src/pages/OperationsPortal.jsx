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
  Tag
} from 'lucide-react';

export default function OperationsPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'groups' | 'users'
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);

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
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student',
    password: 'Mec@2026',
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
        category: 'Software Engineering',
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
        showSuccess(`Course "${courseForm.title}" added with price $${courseForm.price}.`);
      }
      setCourseModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save course');
    }
  };

  // Group handlers (A group links a course, an instructor, a mentor, and its enrolled students)
  const handleOpenGroupModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        courseId: group.courseId,
        instructorId: group.instructorId,
        mentorId: group.mentorId,
        studentIds: group.studentIds || [],
        schedule: group.schedule,
        status: group.status
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        name: `Cohort ${String.fromCharCode(65 + groups.length)} - ${new Date().getFullYear()}`,
        courseId: courses[0]?.id || '',
        instructorId: instructors[0]?.id || '',
        mentorId: mentors[0]?.id || '',
        studentIds: students.slice(0, 4).map(s => s.id),
        schedule: 'Mon & Wed 18:00 - 21:00',
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
        showSuccess(`Group "${groupForm.name}" updated successfully.`);
      } else {
        await apiRequest('/operations/groups', {
          method: 'POST',
          body: JSON.stringify(groupForm)
        });
        showSuccess(`Group "${groupForm.name}" linked with course, instructor, mentor, and ${groupForm.studentIds.length} students.`);
      }
      setGroupModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save group');
    }
  };

  // Toggle student selection in group modal
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
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/operations/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      showSuccess(`New ${userForm.role} "${userForm.name}" added successfully.`);
      setUserModalOpen(false);
      setUserForm({ name: '', email: '', role: 'student', phone: '', specialization: '' });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Operations & Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">MEC Academic Operations Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Courses, Staff & Group Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer curriculum pricing, enroll learners, and link groups with courses, instructors, and mentors.
          </p>
        </div>

        {/* Global Action Banner */}
        <div className="flex items-center gap-3">
          {activeTab === 'courses' && (
            <button
              onClick={() => handleOpenCourseModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          )}

          {activeTab === 'groups' && (
            <button
              onClick={() => handleOpenGroupModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Linked Group</span>
            </button>
          )}

          {activeTab === 'users' && (
            <button
              onClick={() => setUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Instructor / Mentor / Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'courses'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'groups'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Groups & Cohorts ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Instructors, Mentors & Students ({instructors.length + mentors.length + students.length})</span>
        </button>
      </div>

      {/* ========================================================
          1. COURSES VIEW (Requirement: "Add, list, and edit courses, with each course's price visible in the list.")
         ======================================================== */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar with Category and Prominent Price */}
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

      {/* ========================================================
          2. GROUPS VIEW (Requirement: "A group links a course, an instructor, a mentor, and its enrolled students.")
         ======================================================== */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                
                {/* Header */}
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

                {/* The 4 Interlinked Entities: Course, Instructor, Mentor, Enrolled Students */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  
                  {/* Linked Course */}
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                      Linked Course
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.course?.title}</span>
                    <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                      ${grp.course?.price} USD
                    </span>
                  </div>

                  {/* Linked Instructor */}
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                      Assigned Instructor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.instructor?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{grp.instructor?.email}</span>
                  </div>

                  {/* Linked Mentor */}
                  <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                      Assigned Mentor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">{grp.mentor?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{grp.mentor?.email}</span>
                  </div>

                </div>

                {/* Enrolled Students Roster */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Enrolled Students ({grp.students?.length || 0})</span>
                    <span className="text-slate-400 font-normal">
                      {grp.heldSessionsCount || 0} of {grp.sessionsCount || 0} sessions held
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

      {/* ========================================================
          3. USER MANAGEMENT VIEW (Instructors, Mentors, Students)
         ======================================================== */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Instructors Column */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Instructors ({instructors.length})</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {instructors.map((inst) => (
                <div key={inst.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inst.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Faculty</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{inst.email}</span>
                  <span className="text-[10px] text-slate-400 block">{inst.specialization || 'Lead Instructor'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mentors Column */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Mentors ({mentors.length})</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {mentors.map((men) => (
                <div key={men.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{men.name}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">Advisory</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{men.email}</span>
                  <span className="text-[10px] text-slate-400 block">{men.expertise || 'Student Mentor'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Students Column */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Enrolled Students ({students.length})</h3>
              </div>
            </div>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {students.map((stu) => (
                <div key={stu.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{stu.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Enrolled</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{stu.email}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{stu.phone || 'Phone verified'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          ADD/EDIT COURSE MODAL
         ======================================================== */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCourse ? 'Edit Course Details' : 'Add New Curriculum Course'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify pricing, course code, planned session count, and quiz requirements.
            </p>

            <form onSubmit={handleSaveCourse} className="mt-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Distributed Systems Engineering"
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Course Price input (Crucial requirement) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planned Sessions Count</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={courseForm.totalPlannedSessions}
                    onChange={(e) => setCourseForm({ ...courseForm, totalPlannedSessions: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Uses Quizzes?</label>
                  <select
                    value={courseForm.hasQuizzes ? 'yes' : 'no'}
                    onChange={(e) => setCourseForm({ ...courseForm, hasQuizzes: e.target.value === 'yes' })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="yes">Yes (Quizzes & Gradebook Sheet)</option>
                    <option value="no">No Quizzes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Overview / Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Summary of course scope and syllabus..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD/EDIT GROUP MODAL (Linking Course, Instructor, Mentor, Enrolled Students)
         ======================================================== */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              {editingGroup ? 'Edit Group Links' : 'Create New Cohort Group'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Link the course, instructor, mentor, and select the enrolled student roster.
            </p>

            <form onSubmit={handleSaveGroup} className="mt-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Group / Cohort Name</label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. Cohort Gamma - Full Stack 2026"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Course Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Curriculum</label>
                <select
                  required
                  value={groupForm.courseId}
                  onChange={(e) => setGroupForm({ ...groupForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} — ${c.price} USD ({c.totalPlannedSessions} sessions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor & Mentor Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Instructor</label>
                  <select
                    required
                    value={groupForm.instructorId}
                    onChange={(e) => setGroupForm({ ...groupForm, instructorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Mentor</label>
                  <select
                    required
                    value={groupForm.mentorId}
                    onChange={(e) => setGroupForm({ ...groupForm, mentorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {mentors.map(men => (
                      <option key={men.id} value={men.id}>
                        {men.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enrolled Students Multi-Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enrolled Students ({groupForm.studentIds.length} selected)
                </label>
                <div className="p-3 border border-slate-300 rounded-xl max-h-40 overflow-y-auto space-y-1.5 bg-slate-50">
                  {students.map(st => {
                    const isSelected = groupForm.studentIds.includes(st.id);
                    return (
                      <label 
                        key={st.id} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-100/70 border border-amber-300' : 'bg-white hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="font-medium text-slate-800">{st.name} ({st.email})</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudentInGroup(st.id)}
                          className="h-4 w-4 text-amber-600 rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Schedule</label>
                <input
                  type="text"
                  value={groupForm.schedule}
                  onChange={(e) => setGroupForm({ ...groupForm, schedule: e.target.value })}
                  placeholder="e.g. Mon & Wed 18:00 - 21:00"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  {editingGroup ? 'Save Group Links' : 'Link & Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD USER MODAL (Instructor, Mentor, Student)
         ======================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">Add Academic User</h3>
            <p className="text-xs text-slate-500 mt-0.5">Register a new instructor, mentor, or student.</p>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Ziad Mansour"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Academy Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. ziad.mansour@mec.edu"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Initial Account Password</label>
                  <span className="text-[10px] text-amber-700 font-medium">User can change it after login</span>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="e.g. Mec@2026"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-indigo-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+20 100 ..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
