const fs = require('fs');
const path = require('path');
const seedData = require('./data/seedData');

const DB_FILE = process.env.VERCEL 
  ? path.join('/tmp', 'database.json') 
  : path.join(__dirname, 'data', 'database.json');

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.reset();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure every user has a password set
        if (this.data.users) {
          this.data.users.forEach(u => {
            if (!u.password) u.password = 'Mec@2026';
          });
        }
      } catch (err) {
        console.error('Failed to parse database file, resetting to seed data:', err);
        this.reset();
      }
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(seedData));
    if (this.data.users) {
      this.data.users.forEach(u => {
        if (!u.password) u.password = 'Mec@2026';
      });
    }
    this.save();
    console.log('Database initialized from seedData.');
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Users ---
  getUsers(role = null) {
    if (!role) return this.data.users;
    return this.data.users.filter(u => u.role === role);
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const id = `usr_${userData.role.slice(0, 3)}_${Date.now()}`;
    const newUser = {
      id,
      ...userData,
      password: userData.password ? String(userData.password).trim() : 'Mec@2026',
      status: userData.status || 'active',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updatePassword(id, newPassword) {
    const user = this.getUserById(id);
    if (!user) return false;
    user.password = String(newPassword).trim();
    this.save();
    return true;
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  // --- Courses ---
  getCourses() {
    return this.data.courses;
  }

  getCourseById(id) {
    return this.data.courses.find(c => c.id === id);
  }

  createCourse(courseData) {
    const id = `crs_${Date.now()}`;
    const newCourse = {
      id,
      code: courseData.code || `MEC-${Date.now().toString().slice(-4)}`,
      title: courseData.title,
      price: Number(courseData.price) || 0,
      category: courseData.category || 'General',
      totalPlannedSessions: Number(courseData.totalPlannedSessions) || 12,
      hasQuizzes: Boolean(courseData.hasQuizzes),
      description: courseData.description || '',
      createdAt: new Date().toISOString()
    };
    this.data.courses.push(newCourse);
    this.save();
    return newCourse;
  }

  updateCourse(id, updates) {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.totalPlannedSessions !== undefined) updates.totalPlannedSessions = Number(updates.totalPlannedSessions);
    this.data.courses[index] = { ...this.data.courses[index], ...updates };
    this.save();
    return this.data.courses[index];
  }

  // --- Groups ---
  getGroups() {
    return this.data.groups;
  }

  getGroupById(id) {
    return this.data.groups.find(g => g.id === id);
  }

  getGroupsForUser(userId, role) {
    if (role === 'student') {
      return this.data.groups.filter(g => g.studentIds && g.studentIds.includes(userId));
    } else if (role === 'instructor') {
      return this.data.groups.filter(g => g.instructorId === userId);
    } else if (role === 'mentor') {
      return this.data.groups.filter(g => g.mentorId === userId);
    }
    return this.data.groups;
  }

  createGroup(groupData) {
    const id = `grp_${Date.now()}`;
    const newGroup = {
      id,
      name: groupData.name,
      courseId: groupData.courseId,
      instructorId: groupData.instructorId,
      mentorId: groupData.mentorId,
      studentIds: Array.isArray(groupData.studentIds) ? groupData.studentIds : [],
      startDate: groupData.startDate || new Date().toISOString().split('T')[0],
      endDate: groupData.endDate || '',
      schedule: groupData.schedule || 'TBA',
      status: groupData.status || 'active'
    };
    this.data.groups.push(newGroup);

    // Auto-create initial session skeleton if requested or planned
    const course = this.getCourseById(newGroup.courseId);
    const plannedCount = course ? course.totalPlannedSessions : 8;
    for (let i = 1; i <= Math.min(plannedCount, 4); i++) {
      this.data.sessions.push({
        id: `sess_${id}_${i}`,
        groupId: id,
        sessionNumber: i,
        title: `Session ${i}: Foundation Topics`,
        date: new Date(Date.now() + (i - 1) * 7 * 86400000).toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        status: i === 1 ? 'held' : 'scheduled',
        qrCodeToken: `MEC-QR-${id.slice(-4)}-${i}`,
        recordedSession: i === 1 ? {
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '2h 00m',
          summary: 'Orientation and kickoff session.',
          topics: ['Introduction', 'Course Roadmap']
        } : null,
        assignments: [],
        instructorMaterials: [],
        presentations: []
      });
    }

    this.save();
    return newGroup;
  }

  updateGroup(id, updates) {
    const index = this.data.groups.findIndex(g => g.id === id);
    if (index === -1) return null;
    this.data.groups[index] = { ...this.data.groups[index], ...updates };
    this.save();
    return this.data.groups[index];
  }

  // --- Sessions ---
  getSessionsByGroup(groupId) {
    return this.data.sessions
      .filter(s => s.groupId === groupId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);
  }

  getSessionById(id) {
    return this.data.sessions.find(s => s.id === id);
  }

  getSessionByToken(token) {
    if (!token) return null;
    return this.data.sessions.find(s => s.qrCodeToken === token);
  }

  updateSession(id, updates) {
    const index = this.data.sessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.sessions[index] = { ...this.data.sessions[index], ...updates };
    this.save();
    return this.data.sessions[index];
  }

  createSession(sessionData) {
    const groupSessions = this.getSessionsByGroup(sessionData.groupId);
    const sessionNumber = Number(sessionData.sessionNumber) || (groupSessions.length + 1);
    const id = `sess_${sessionData.groupId.slice(-6)}_${Date.now()}`;
    const token = `MEC-QR-S${sessionNumber}-${id.slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newSession = {
      id,
      groupId: sessionData.groupId,
      sessionNumber,
      title: sessionData.title || `Session ${sessionNumber}`,
      date: sessionData.date || new Date().toISOString().split('T')[0],
      startTime: sessionData.startTime || '18:00',
      endTime: sessionData.endTime || '21:00',
      status: sessionData.status || 'scheduled',
      qrCodeToken: token,
      recordedSession: sessionData.recordedSession || null,
      assignments: sessionData.assignments || [],
      instructorMaterials: sessionData.instructorMaterials || [],
      presentations: sessionData.presentations || []
    };

    this.data.sessions.push(newSession);
    this.save();
    return newSession;
  }

  addAssignmentToSession(sessionId, assignmentData) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.assignments) session.assignments = [];
    const newAsgn = {
      id: `asgn_${Date.now()}`,
      title: assignmentData.title,
      description: assignmentData.description || '',
      dueDate: assignmentData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxPoints: Number(assignmentData.maxPoints) || 100,
      attachmentUrl: assignmentData.attachmentUrl || ''
    };

    session.assignments.push(newAsgn);
    this.save();
    return newAsgn;
  }

  addMaterialToSession(sessionId, materialData) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.instructorMaterials) session.instructorMaterials = [];
    const newMat = {
      id: `mat_${Date.now()}`,
      title: materialData.title,
      type: materialData.type || 'code',
      url: materialData.url,
      description: materialData.description || '',
      size: materialData.size || '1.5 MB'
    };

    session.instructorMaterials.push(newMat);
    this.save();
    return newMat;
  }

  addPresentationToSession(sessionId, presentationData) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.presentations) session.presentations = [];
    const newPres = {
      id: `pres_${Date.now()}`,
      title: presentationData.title,
      slidesUrl: presentationData.slidesUrl,
      slideCount: Number(presentationData.slideCount) || 30
    };

    session.presentations.push(newPres);
    this.save();
    return newPres;
  }

  setSessionRecording(sessionId, recordingData) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const topics = Array.isArray(recordingData.topics)
      ? recordingData.topics
      : (recordingData.topics ? String(recordingData.topics).split(',').map(t => t.trim()).filter(Boolean) : []);

    session.recordedSession = {
      videoUrl: recordingData.videoUrl,
      duration: recordingData.duration || '2h 00m',
      summary: recordingData.summary || '',
      topics
    };

    this.save();
    return session.recordedSession;
  }

  // --- Attendance ---
  getAttendanceForStudent(studentId, groupId) {
    return this.data.attendanceRecords.filter(a => a.studentId === studentId && (!groupId || a.groupId === groupId));
  }

  getAttendanceForSession(sessionId) {
    return this.data.attendanceRecords.filter(a => a.sessionId === sessionId);
  }

  getAttendanceForGroup(groupId) {
    return this.data.attendanceRecords.filter(a => a.groupId === groupId);
  }

  recordAttendance({ sessionId, studentId, checkInMethod = 'qr_scan' }) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const group = this.getGroupById(session.groupId);
    if (!group) throw new Error('Group not found');

    if (!group.studentIds.includes(studentId)) {
      throw new Error('Student is not enrolled in this session group');
    }

    // Check if already checked in
    const existing = this.data.attendanceRecords.find(
      a => a.sessionId === sessionId && a.studentId === studentId
    );
    if (existing) {
      return { alreadyRecorded: true, record: existing, session };
    }

    const newRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      groupId: session.groupId,
      studentId,
      status: 'attended',
      checkInMethod,
      checkInTime: new Date().toISOString()
    };

    this.data.attendanceRecords.push(newRecord);
    this.save();
    return { alreadyRecorded: false, record: newRecord, session };
  }

  // Instructor manual attendance toggle
  toggleAttendanceOverride(sessionId, studentId, shouldAttend) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const index = this.data.attendanceRecords.findIndex(
      a => a.sessionId === sessionId && a.studentId === studentId
    );

    if (shouldAttend) {
      if (index === -1) {
        const newRecord = {
          id: `att_man_${Date.now()}`,
          sessionId,
          groupId: session.groupId,
          studentId,
          status: 'attended',
          checkInMethod: 'manual_instructor_override',
          checkInTime: new Date().toISOString()
        };
        this.data.attendanceRecords.push(newRecord);
        this.save();
        return newRecord;
      }
      return this.data.attendanceRecords[index];
    } else {
      if (index !== -1) {
        this.data.attendanceRecords.splice(index, 1);
        this.save();
      }
      return null;
    }
  }

  // --- Submissions ---
  getSubmissionsForStudent(studentId) {
    return this.data.assignmentSubmissions.filter(s => s.studentId === studentId);
  }

  getSubmissionsForGroup(groupId) {
    const sessions = this.getSessionsByGroup(groupId);
    const sessionAssignmentIds = new Set();
    sessions.forEach(s => (s.assignments || []).forEach(a => sessionAssignmentIds.add(a.id)));
    return this.data.assignmentSubmissions.filter(s => sessionAssignmentIds.has(s.assignmentId));
  }

  saveAssignmentSubmission({ assignmentId, studentId, submissionContent, notes = '' }) {
    const index = this.data.assignmentSubmissions.findIndex(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );

    if (index !== -1) {
      this.data.assignmentSubmissions[index] = {
        ...this.data.assignmentSubmissions[index],
        submissionContent,
        notes,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      this.save();
      return this.data.assignmentSubmissions[index];
    }

    const newSub = {
      id: `sub_${Date.now()}`,
      assignmentId,
      studentId,
      submittedAt: new Date().toISOString(),
      submissionContent,
      notes,
      status: 'submitted',
      score: null,
      feedback: ''
    };
    this.data.assignmentSubmissions.push(newSub);
    this.save();
    return newSub;
  }

  // --- Quizzes ---
  getQuizzesForGroup(groupId) {
    return this.data.quizzes.filter(q => q.groupId === groupId);
  }

  getQuizSubmissionsForGroup(groupId) {
    const quizzes = this.getQuizzesForGroup(groupId);
    const quizIds = new Set(quizzes.map(q => q.id));
    return this.data.quizSubmissions.filter(qs => quizIds.has(qs.quizId));
  }

  getQuizSubmissionsForStudent(studentId) {
    return this.data.quizSubmissions.filter(qs => qs.studentId === studentId);
  }
}

const db = new Database();
module.exports = db;
