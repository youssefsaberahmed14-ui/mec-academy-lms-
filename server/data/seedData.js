module.exports = {
  users: [
    // Students
    {
      id: "usr_stu_1",
      name: "Omar Tarek",
      email: "omar.tarek@student.mec.edu",
      role: "student",
      phone: "+20 100 482 9101",
      avatar: "OT",
      status: "active",
      enrolledAt: "2026-09-01"
    },
    {
      id: "usr_stu_2",
      name: "Sarah Mansour",
      email: "sarah.mansour@student.mec.edu",
      role: "student",
      phone: "+20 101 883 4521",
      avatar: "SM",
      status: "active",
      enrolledAt: "2026-09-01"
    },
    {
      id: "usr_stu_3",
      name: "Youssef Nabil",
      email: "youssef.nabil@student.mec.edu",
      role: "student",
      phone: "+20 102 771 9083",
      avatar: "YN",
      status: "active",
      enrolledAt: "2026-09-01"
    },
    {
      id: "usr_stu_4",
      name: "Layla Mahmoud",
      email: "layla.mahmoud@student.mec.edu",
      role: "student",
      phone: "+20 106 332 1190",
      avatar: "LM",
      status: "active",
      enrolledAt: "2026-09-01"
    },
    {
      id: "usr_stu_5",
      name: "Kareem Adel",
      email: "kareem.adel@student.mec.edu",
      role: "student",
      phone: "+20 109 445 6712",
      avatar: "KA",
      status: "active",
      enrolledAt: "2026-09-01"
    },
    {
      id: "usr_stu_6",
      name: "Hoda Zaki",
      email: "hoda.zaki@student.mec.edu",
      role: "student",
      phone: "+20 105 119 3321",
      avatar: "HZ",
      status: "active",
      enrolledAt: "2026-09-15"
    },

    // Instructors
    {
      id: "usr_inst_1",
      name: "Dr. Tarek Ezzat",
      email: "tarek.ezzat@mec.edu",
      role: "instructor",
      specialization: "Lead Full Stack Engineering & Cloud Architecture",
      phone: "+20 100 223 9988",
      avatar: "TE",
      status: "active"
    },
    {
      id: "usr_inst_2",
      name: "Eng. Mona Kamel",
      email: "mona.kamel@mec.edu",
      role: "instructor",
      specialization: "DevOps & Distributed Systems",
      phone: "+20 101 556 7722",
      avatar: "MK",
      status: "active"
    },

    // Mentors
    {
      id: "usr_men_1",
      name: "Ahmed Fathy",
      email: "ahmed.fathy@mec.edu",
      role: "mentor",
      expertise: "Full Stack JavaScript & Database Design",
      phone: "+20 109 334 5511",
      avatar: "AF",
      status: "active"
    },
    {
      id: "usr_men_2",
      name: "Nour El-Din",
      email: "nour.eldin@mec.edu",
      role: "mentor",
      expertise: "Docker, Kubernetes & Infrastructure as Code",
      phone: "+20 102 441 6633",
      avatar: "NE",
      status: "active"
    },

    // Operations Staff
    {
      id: "usr_ops_1",
      name: "Mariam Samir",
      email: "mariam.samir@mec.edu",
      role: "operations",
      department: "Academic Operations & Registrations",
      phone: "+20 100 882 1100",
      avatar: "MS",
      status: "active"
    },

    // Supervisor
    {
      id: "usr_sup_1",
      name: "Dr. Khaled Al-Masry",
      email: "khaled.masry@mec.edu",
      role: "supervisor",
      department: "Director of Academic Quality & Accreditation",
      phone: "+20 100 999 0011",
      avatar: "KM",
      status: "active"
    }
  ],

  courses: [
    {
      id: "crs_fsd_101",
      code: "MEC-FS101",
      title: "Full Stack Web Engineering",
      price: 1250,
      category: "Software Engineering",
      totalPlannedSessions: 16,
      hasQuizzes: true,
      description: "Comprehensive software engineering program covering modern React 19, TypeScript, Node.js, Express microservices, SQL databases, and automated testing.",
      createdAt: "2026-08-15"
    },
    {
      id: "crs_devops_201",
      code: "MEC-DO201",
      title: "Cloud Architecture & DevOps Professional",
      price: 1450,
      category: "Cloud & DevOps",
      totalPlannedSessions: 14,
      hasQuizzes: true,
      description: "Hands-on engineering curriculum covering Docker containerization, Kubernetes cluster orchestration, Terraform IaC, AWS infrastructure, and GitHub Actions CI/CD pipelines.",
      createdAt: "2026-08-20"
    },
    {
      id: "crs_data_301",
      code: "MEC-DA301",
      title: "Data Engineering & Analytics Pipelines",
      price: 1100,
      category: "Data Science",
      totalPlannedSessions: 12,
      hasQuizzes: true,
      description: "Modern data engineering stack featuring Apache Spark, PostgreSQL warehousing, dbt transformations, Kafka streaming, and analytical dashboarding.",
      createdAt: "2026-09-01"
    },
    {
      id: "crs_uiux_105",
      code: "MEC-UX105",
      title: "Design Systems & Product UI/UX",
      price: 950,
      category: "Product & Design",
      totalPlannedSessions: 10,
      hasQuizzes: false,
      description: "Human-centered digital product design, user research methodologies, Figma design tokens, interactive prototyping, and usability validation.",
      createdAt: "2026-09-05"
    }
  ],

  groups: [
    {
      id: "grp_fsd_2026_a",
      name: "Cohort Alpha - Full Stack 2026",
      courseId: "crs_fsd_101",
      instructorId: "usr_inst_1",
      mentorId: "usr_men_1",
      studentIds: [
        "usr_stu_1",
        "usr_stu_2",
        "usr_stu_3",
        "usr_stu_4",
        "usr_stu_5"
      ],
      startDate: "2026-09-10",
      endDate: "2026-11-20",
      schedule: "Mon & Wed 18:00 - 21:00",
      status: "active"
    },
    {
      id: "grp_devops_2026_b",
      name: "Cohort Beta - Cloud DevOps 2026",
      courseId: "crs_devops_201",
      instructorId: "usr_inst_2",
      mentorId: "usr_men_2",
      studentIds: [
        "usr_stu_2",
        "usr_stu_3",
        "usr_stu_6"
      ],
      startDate: "2026-09-25",
      endDate: "2026-12-05",
      schedule: "Tue & Thu 18:30 - 21:30",
      status: "active"
    }
  ],

  // 16 sessions for Cohort Alpha: 15 sessions are 'held', 1 session is 'scheduled' (upcoming).
  sessions: [
    {
      id: "sess_fsd_01",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 1,
      title: "Architectural Foundations & Modern TypeScript",
      date: "2026-09-10",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-01-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 45m",
        summary: "Introduction to modern software paradigms, TypeScript strict typing, and project repository layout.",
        topics: ["TypeScript Compiler & Config", "Generics & Utility Types", "Git Flow & Pull Requests"]
      },
      assignments: [
        {
          id: "asgn_01",
          title: "Assignment 1: TypeScript Domain Modeling",
          description: "Implement a strict typed domain model for an e-commerce order management subsystem with custom discriminated unions.",
          dueDate: "2026-09-14",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_01",
          title: "Lecture Notes & Code Samples.zip",
          type: "code",
          url: "https://github.com/mec-academy/fsd-session-01",
          description: "Clean repository examples covering discriminated unions and generic constraints.",
          size: "4.2 MB"
        },
        {
          id: "mat_02",
          title: "TypeScript Best Practices Reference.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/ts-guide-2026.pdf",
          description: "Official MEC Academy TypeScript style guide and compiler lint rules.",
          size: "1.8 MB"
        }
      ],
      presentations: [
        {
          id: "pres_01",
          title: "Session 01: Modern TypeScript Architecture Deck",
          slidesUrl: "https://slides.mec.edu/fsd-session-01",
          slideCount: 48,
          thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_02",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 2,
      title: "React Component Lifecycle & Composition Patterns",
      date: "2026-09-15",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-02-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 30m",
        summary: "Mastering component composition, compound components, and render props in modern React.",
        topics: ["Compound Components", "Controlled vs Uncontrolled", "Accessibility in React"]
      },
      assignments: [
        {
          id: "asgn_02",
          title: "Assignment 2: Reusable Modal & Data Table UI",
          description: "Build an accessible compound Modal system and paginated Data Table using React and Tailwind CSS.",
          dueDate: "2026-09-19",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_03",
          title: "Component Patterns Sandbox Repo",
          type: "code",
          url: "https://github.com/mec-academy/react-patterns",
          description: "Live workshop starter code with pre-configured Vitest unit tests.",
          size: "3.5 MB"
        }
      ],
      presentations: [
        {
          id: "pres_02",
          title: "Session 02: Advanced React Composition Deck",
          slidesUrl: "https://slides.mec.edu/fsd-session-02",
          slideCount: 42,
          thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_03",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 3,
      title: "Custom Hooks & Client State Machines",
      date: "2026-09-17",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-03-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 50m",
        summary: "Decoupling business logic from UI using custom hooks, state reducers, and async fetch wrappers.",
        topics: ["useReducer + useContext", "Custom Fetch Hook with AbortController", "Race Condition Handling"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_04",
          title: "Hooks Cheat Sheet & Memory Profiling.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/hooks-guide.pdf",
          description: "Understanding closures and memory leaks in React hooks.",
          size: "2.1 MB"
        }
      ],
      presentations: [
        {
          id: "pres_03",
          title: "Session 03: Reactive State Machines",
          slidesUrl: "https://slides.mec.edu/fsd-session-03",
          slideCount: 36,
          thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_04",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 4,
      title: "Server State & TanStack Query Synchronization",
      date: "2026-09-22",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-04-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 40m",
        summary: "Cache invalidation, optimistic updates, and background refetching patterns.",
        topics: ["Query Keys Factory", "Optimistic Mutations", "Infinite Queries"]
      },
      assignments: [
        {
          id: "asgn_03",
          title: "Assignment 3: Optimistic Feed with React Query",
          description: "Implement a social comment feed with real-time optimistic likes and retry logic.",
          dueDate: "2026-09-26",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_05",
          title: "React Query Invalidation Blueprint",
          type: "code",
          url: "https://github.com/mec-academy/tanstack-query-patterns",
          description: "Sample project demonstrating query invalidation strategies.",
          size: "5.1 MB"
        }
      ],
      presentations: [
        {
          id: "pres_04",
          title: "Session 04: Server State Orchestration",
          slidesUrl: "https://slides.mec.edu/fsd-session-04",
          slideCount: 40,
          thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_05",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 5,
      title: "Node.js Core, Streams, & Event Loop Internals",
      date: "2026-09-24",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-05-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "3h 00m",
        summary: "Deep dive into libuv, thread pool, backpressure handling, and streaming large payloads.",
        topics: ["Event Loop Phases", "Readable & Writable Streams", "Buffer Management"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_06",
          title: "Node.js Architecture Diagram.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/nodejs-internals.pdf",
          description: "Detailed visualization of libuv event loop phases.",
          size: "3.2 MB"
        }
      ],
      presentations: [
        {
          id: "pres_05",
          title: "Session 05: Asynchronous Node.js Engine",
          slidesUrl: "https://slides.mec.edu/fsd-session-05",
          slideCount: 50,
          thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_06",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 6,
      title: "Express RESTful API Design & Middleware Pipelines",
      date: "2026-09-29",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-06-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 35m",
        summary: "Structuring production Express apps with layered architecture (controllers, services, repositories).",
        topics: ["Error Boundary Middleware", "Zod Request Validation", "CORS & Security Headers"]
      },
      assignments: [
        {
          id: "asgn_04",
          title: "Assignment 4: Production Express REST API",
          description: "Build a production-grade REST API with input validation, centralized error handling, and structured logging.",
          dueDate: "2026-10-04",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_07",
          title: "Express Layered Boilerplate",
          type: "code",
          url: "https://github.com/mec-academy/express-production-boilerplate",
          description: "Clean boilerplate with ESLint, Jest, and Swagger API docs.",
          size: "4.8 MB"
        }
      ],
      presentations: [
        {
          id: "pres_06",
          title: "Session 06: Enterprise API Architecture",
          slidesUrl: "https://slides.mec.edu/fsd-session-06",
          slideCount: 44,
          thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_07",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 7,
      title: "Relational Modeling, SQL Joins & Query Optimization",
      date: "2026-10-01",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-07-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 45m",
        summary: "Database normalization up to 3NF, indexed execution plans, and transaction isolation levels.",
        topics: ["B-Tree Indexing", "EXPLAIN ANALYZE", "ACID & Row Locks"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_08",
          title: "SQL Query Tuning Guide.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/sql-performance.pdf",
          description: "Practical scenarios of converting sequential scans to index scans.",
          size: "2.7 MB"
        }
      ],
      presentations: [
        {
          id: "pres_07",
          title: "Session 07: High Performance Relational Modeling",
          slidesUrl: "https://slides.mec.edu/fsd-session-07",
          slideCount: 46,
          thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_08",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 8,
      title: "Prisma ORM, Migrations & Transaction Management",
      date: "2026-10-06",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-08-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 30m",
        summary: "Type-safe database queries, declarative migrations, and atomic operations with Prisma.",
        topics: ["Schema Relations", "Interactive Transactions", "Seeding Scripts"]
      },
      assignments: [
        {
          id: "asgn_05",
          title: "Assignment 5: Multi-Tenant Schema & Prisma Queries",
          description: "Design a multi-tenant university registration schema with nested relational queries and transaction rollback tests.",
          dueDate: "2026-10-10",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_09",
          title: "Prisma Migrations Repository",
          type: "code",
          url: "https://github.com/mec-academy/prisma-starter",
          description: "Complete docker-compose PostgreSQL + Prisma template.",
          size: "3.9 MB"
        }
      ],
      presentations: [
        {
          id: "pres_08",
          title: "Session 08: Modern Type-Safe Data Layers",
          slidesUrl: "https://slides.mec.edu/fsd-session-08",
          slideCount: 38,
          thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_09",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 9,
      title: "Authentication, RBAC & JWT Security Protocols",
      date: "2026-10-08",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-09-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "3h 10m",
        summary: "Implementing secure stateless JWT auth with HTTP-only cookies, refresh token rotation, and RBAC guards.",
        topics: ["Access vs Refresh Tokens", "CSRF & XSS Defenses", "Role-Based Route Interceptors"]
      },
      assignments: [
        {
          id: "asgn_06",
          title: "Assignment 6: Secure Auth System with Refresh Rotation",
          description: "Implement JWT authentication with argon2 hashing, cookie storage, and automated token revocation on logout.",
          dueDate: "2026-10-14",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_10",
          title: "Auth Security Checklist.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/owasp-jwt-checklist.pdf",
          description: "OWASP Top 10 web authentication defense matrix.",
          size: "2.3 MB"
        }
      ],
      presentations: [
        {
          id: "pres_09",
          title: "Session 09: Defense-in-Depth Authentication",
          slidesUrl: "https://slides.mec.edu/fsd-session-09",
          slideCount: 52,
          thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_10",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 10,
      title: "Automated Testing: Unit, Integration & E2E",
      date: "2026-10-13",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-10-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 45m",
        summary: "Test pyramid implementation with Vitest, Supertest for API routes, and Playwright for cross-browser E2E.",
        topics: ["Mocking External Services", "Database Test Fixtures", "Flaky Test Elimination"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_11",
          title: "Playwright E2E Test Suite Template",
          type: "code",
          url: "https://github.com/mec-academy/testing-suite",
          description: "Ready-to-run test harness with code coverage reporting.",
          size: "4.4 MB"
        }
      ],
      presentations: [
        {
          id: "pres_10",
          title: "Session 10: Zero-Regressions Testing Pyramid",
          slidesUrl: "https://slides.mec.edu/fsd-session-10",
          slideCount: 45,
          thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_11",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 11,
      title: "Realtime WebSockets & Event-Driven Architecture",
      date: "2026-10-15",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-11-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 35m",
        summary: "Bidirectional real-time communication using Socket.io and Redis Pub/Sub adapter across clusters.",
        topics: ["WebSocket Handshake", "Heartbeats & Reconnection", "Redis Pub/Sub Scaling"]
      },
      assignments: [
        {
          id: "asgn_07",
          title: "Assignment 7: Real-Time Collaborative Canvas",
          description: "Build a multi-user cursor sync and collaborative canvas using WebSockets and room broadcasting.",
          dueDate: "2026-10-20",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_12",
          title: "WebSocket Scaling Architecture.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/socket-scaling.pdf",
          description: "Cluster diagrams and load balancer sticky session configuration.",
          size: "1.9 MB"
        }
      ],
      presentations: [
        {
          id: "pres_11",
          title: "Session 11: High Concurrency Real-Time Protocols",
          slidesUrl: "https://slides.mec.edu/fsd-session-11",
          slideCount: 39,
          thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_12",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 12,
      title: "Caching Layers with Redis & Performance Profiling",
      date: "2026-10-20",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-12-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 40m",
        summary: "Cache-aside patterns, TTL expiration, cache stampede prevention, and clinic.js flame graphs.",
        topics: ["Cache Stampede Prevention", "Redis Data Structures", "CPU Profiling"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_13",
          title: "Redis Cache Patterns Repo",
          type: "code",
          url: "https://github.com/mec-academy/redis-patterns",
          description: "Distributed locks and rate limiting algorithms.",
          size: "3.1 MB"
        }
      ],
      presentations: [
        {
          id: "pres_12",
          title: "Session 12: In-Memory Caching Strategies",
          slidesUrl: "https://slides.mec.edu/fsd-session-12",
          slideCount: 41,
          thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_13",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 13,
      title: "Dockerization, Multi-Stage Builds & Local Compose",
      date: "2026-10-22",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-13-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 55m",
        summary: "Containerizing frontend & backend with Alpine, multi-stage layer caching, and healthchecks in compose.",
        topics: ["Layer Caching", "Non-Root Containers", "Volume Mounting for Dev"]
      },
      assignments: [
        {
          id: "asgn_08",
          title: "Assignment 8: Production Dockerfile & Compose Orchestration",
          description: "Produce minimal Dockerfiles (<150MB) and compose stack running web, api, postgres, and redis.",
          dueDate: "2026-10-26",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_14",
          title: "Docker Multi-Stage Cheatsheet.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/docker-optimization.pdf",
          description: "Techniques for trimming container image sizes.",
          size: "2.4 MB"
        }
      ],
      presentations: [
        {
          id: "pres_13",
          title: "Session 13: Container Architecture & Standards",
          slidesUrl: "https://slides.mec.edu/fsd-session-13",
          slideCount: 47,
          thumbnail: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_14",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 14,
      title: "CI/CD Pipelines with GitHub Actions & Automated Releases",
      date: "2026-10-27",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-14-VLD",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 30m",
        summary: "Automated linting, matrix test workflows, Docker Hub image publishing, and semantic versioning.",
        topics: ["GitHub Secrets", "Matrix Builds", "Automated Semantic Release"]
      },
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_15",
          title: "GitHub Actions Workflow Library",
          type: "code",
          url: "https://github.com/mec-academy/ci-cd-workflows",
          description: "Reusable YAML workflow files for continuous integration.",
          size: "2.8 MB"
        }
      ],
      presentations: [
        {
          id: "pres_14",
          title: "Session 14: Continuous Delivery Pipelines",
          slidesUrl: "https://slides.mec.edu/fsd-session-14",
          slideCount: 37,
          thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_15",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 15,
      title: "Cloud Deployment, Monitoring & Observability",
      date: "2026-10-29",
      startTime: "18:00",
      endTime: "21:00",
      status: "held",
      qrCodeToken: "MEC-QR-ALPHA-15-ACTIVE-9921",
      recordedSession: {
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "2h 50m",
        summary: "Zero-downtime rolling deploys, Prometheus metrics, Grafana dashboards, and structured error alerts.",
        topics: ["Health Check Endpoints", "Log Aggregation", "Synthetic Monitoring"]
      },
      assignments: [
        {
          id: "asgn_09",
          title: "Assignment 9: Deployed Full Stack Application & Live URL",
          description: "Deploy your full-stack application to production with custom domain, SSL certificate, and error tracking.",
          dueDate: "2026-11-05",
          maxPoints: 100
        }
      ],
      instructorMaterials: [
        {
          id: "mat_16",
          title: "Cloud Production Runbook.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/production-runbook.pdf",
          description: "Step-by-step incident response checklist for live production systems.",
          size: "3.5 MB"
        }
      ],
      presentations: [
        {
          id: "pres_15",
          title: "Session 15: Production Observability & Reliability",
          slidesUrl: "https://slides.mec.edu/fsd-session-15",
          slideCount: 54,
          thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      id: "sess_fsd_16",
      groupId: "grp_fsd_2026_a",
      sessionNumber: 16,
      title: "Capstone Project Defenses & Graduation Review",
      date: "2026-11-05",
      startTime: "18:00",
      endTime: "21:00",
      status: "scheduled",
      qrCodeToken: "MEC-QR-ALPHA-16-PENDING",
      recordedSession: null,
      assignments: [],
      instructorMaterials: [
        {
          id: "mat_17",
          title: "Capstone Evaluation Rubric.pdf",
          type: "pdf",
          url: "https://mec.edu/resources/capstone-rubric.pdf",
          description: "Evaluation criteria for architectural defense and peer review.",
          size: "1.2 MB"
        }
      ],
      presentations: []
    }
  ],

  // Pre-seeded Attendance:
  // Note: Exactly 15 sessions are "held".
  // Omar Tarek (usr_stu_1) attended sessions: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 (12 of 15 attended, missed 13, 14, 15).
  // Sarah Mansour (usr_stu_2) attended 14 of 15.
  // Youssef Nabil (usr_stu_3) attended 10 of 15.
  // Layla Mahmoud (usr_stu_4) attended 15 of 15.
  // Kareem Adel (usr_stu_5) attended 9 of 15.
  attendanceRecords: [
    // Omar Tarek - 12 sessions attended
    { id: "att_1_1", sessionId: "sess_fsd_01", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-10T18:04:12Z" },
    { id: "att_1_2", sessionId: "sess_fsd_02", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-15T18:02:45Z" },
    { id: "att_1_3", sessionId: "sess_fsd_03", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-17T18:08:19Z" },
    { id: "att_1_4", sessionId: "sess_fsd_04", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-22T18:01:04Z" },
    { id: "att_1_5", sessionId: "sess_fsd_05", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-24T18:05:30Z" },
    { id: "att_1_6", sessionId: "sess_fsd_06", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-29T18:03:12Z" },
    { id: "att_1_7", sessionId: "sess_fsd_07", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-01T18:06:55Z" },
    { id: "att_1_8", sessionId: "sess_fsd_08", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-06T18:02:18Z" },
    { id: "att_1_9", sessionId: "sess_fsd_09", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-08T18:09:40Z" },
    { id: "att_1_10", sessionId: "sess_fsd_10", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-13T18:03:51Z" },
    { id: "att_1_11", sessionId: "sess_fsd_11", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-15T18:04:22Z" },
    { id: "att_1_12", sessionId: "sess_fsd_12", groupId: "grp_fsd_2026_a", studentId: "usr_stu_1", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-20T18:01:40Z" },

    // Sarah Mansour - 14 sessions attended (missed sess 7)
    { id: "att_2_1", sessionId: "sess_fsd_01", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-10T18:01:10Z" },
    { id: "att_2_2", sessionId: "sess_fsd_02", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-15T18:03:00Z" },
    { id: "att_2_3", sessionId: "sess_fsd_03", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-17T18:02:11Z" },
    { id: "att_2_4", sessionId: "sess_fsd_04", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-22T18:04:19Z" },
    { id: "att_2_5", sessionId: "sess_fsd_05", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-24T18:01:50Z" },
    { id: "att_2_6", sessionId: "sess_fsd_06", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-29T18:02:18Z" },
    { id: "att_2_8", sessionId: "sess_fsd_08", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-06T18:05:00Z" },
    { id: "att_2_9", sessionId: "sess_fsd_09", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-08T18:04:30Z" },
    { id: "att_2_10", sessionId: "sess_fsd_10", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-13T18:02:40Z" },
    { id: "att_2_11", sessionId: "sess_fsd_11", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-15T18:01:12Z" },
    { id: "att_2_12", sessionId: "sess_fsd_12", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-20T18:03:00Z" },
    { id: "att_2_13", sessionId: "sess_fsd_13", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-22T18:02:50Z" },
    { id: "att_2_14", sessionId: "sess_fsd_14", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-27T18:05:15Z" },
    { id: "att_2_15", sessionId: "sess_fsd_15", groupId: "grp_fsd_2026_a", studentId: "usr_stu_2", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-29T18:01:45Z" },

    // Layla Mahmoud - 15 of 15 attended (100%)
    { id: "att_4_1", sessionId: "sess_fsd_01", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-10T18:00:20Z" },
    { id: "att_4_2", sessionId: "sess_fsd_02", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-15T18:01:12Z" },
    { id: "att_4_3", sessionId: "sess_fsd_03", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-17T18:01:40Z" },
    { id: "att_4_4", sessionId: "sess_fsd_04", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-22T18:02:10Z" },
    { id: "att_4_5", sessionId: "sess_fsd_05", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-24T18:03:00Z" },
    { id: "att_4_6", sessionId: "sess_fsd_06", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-29T18:01:15Z" },
    { id: "att_4_7", sessionId: "sess_fsd_07", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-01T18:04:12Z" },
    { id: "att_4_8", sessionId: "sess_fsd_08", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-06T18:01:50Z" },
    { id: "att_4_9", sessionId: "sess_fsd_09", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-08T18:02:10Z" },
    { id: "att_4_10", sessionId: "sess_fsd_10", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-13T18:00:50Z" },
    { id: "att_4_11", sessionId: "sess_fsd_11", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-15T18:03:05Z" },
    { id: "att_4_12", sessionId: "sess_fsd_12", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-20T18:01:30Z" },
    { id: "att_4_13", sessionId: "sess_fsd_13", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-22T18:02:00Z" },
    { id: "att_4_14", sessionId: "sess_fsd_14", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-27T18:04:10Z" },
    { id: "att_4_15", sessionId: "sess_fsd_15", groupId: "grp_fsd_2026_a", studentId: "usr_stu_4", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-29T18:01:25Z" },

    // Youssef Nabil - 10 of 15 attended (missed 3, 5, 8, 12, 14)
    { id: "att_3_1", sessionId: "sess_fsd_01", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-10T18:05:00Z" },
    { id: "att_3_2", sessionId: "sess_fsd_02", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-15T18:04:12Z" },
    { id: "att_3_4", sessionId: "sess_fsd_04", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-22T18:06:10Z" },
    { id: "att_3_6", sessionId: "sess_fsd_06", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-29T18:05:00Z" },
    { id: "att_3_7", sessionId: "sess_fsd_07", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-01T18:07:00Z" },
    { id: "att_3_9", sessionId: "sess_fsd_09", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-08T18:03:45Z" },
    { id: "att_3_10", sessionId: "sess_fsd_10", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-13T18:04:15Z" },
    { id: "att_3_11", sessionId: "sess_fsd_11", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-15T18:06:20Z" },
    { id: "att_3_13", sessionId: "sess_fsd_13", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-22T18:05:10Z" },
    { id: "att_3_15", sessionId: "sess_fsd_15", groupId: "grp_fsd_2026_a", studentId: "usr_stu_3", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-29T18:07:30Z" },

    // Kareem Adel - 9 of 15 attended (missed 6 sessions: 2, 4, 7, 9, 11, 14) -> Flagged as at-risk student!
    { id: "att_5_1", sessionId: "sess_fsd_01", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-10T18:08:00Z" },
    { id: "att_5_3", sessionId: "sess_fsd_03", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-17T18:07:22Z" },
    { id: "att_5_5", sessionId: "sess_fsd_05", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-24T18:06:40Z" },
    { id: "att_5_6", sessionId: "sess_fsd_06", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-09-29T18:08:10Z" },
    { id: "att_5_8", sessionId: "sess_fsd_08", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-06T18:05:40Z" },
    { id: "att_5_10", sessionId: "sess_fsd_10", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-13T18:07:30Z" },
    { id: "att_5_12", sessionId: "sess_fsd_12", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-20T18:06:15Z" },
    { id: "att_5_13", sessionId: "sess_fsd_13", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-22T18:08:00Z" },
    { id: "att_5_15", sessionId: "sess_fsd_15", groupId: "grp_fsd_2026_a", studentId: "usr_stu_5", status: "attended", checkInMethod: "qr_scan", checkInTime: "2026-10-29T18:09:40Z" }
  ],

  // Assignment submissions
  assignmentSubmissions: [
    {
      id: "sub_1_1",
      assignmentId: "asgn_01",
      studentId: "usr_stu_1",
      submittedAt: "2026-09-13T20:15:00Z",
      submissionContent: "https://github.com/omar-tarek/mec-ts-domain-model",
      notes: "Completed all discriminated union types and customer order state guards.",
      status: "graded",
      score: 95,
      feedback: "Superb type ergonomics and strict null checks."
    },
    {
      id: "sub_1_2",
      assignmentId: "asgn_02",
      studentId: "usr_stu_1",
      submittedAt: "2026-09-18T22:30:00Z",
      submissionContent: "https://github.com/omar-tarek/mec-react-modal-table",
      notes: "Compound Modal with keyboard ESC trap and aria-expanded attributes.",
      status: "graded",
      score: 92,
      feedback: "Great accessibility semantics. Minor improvements suggested for mobile table wrap."
    },
    {
      id: "sub_1_3",
      assignmentId: "asgn_03",
      studentId: "usr_stu_1",
      submittedAt: "2026-09-25T19:40:00Z",
      submissionContent: "https://github.com/omar-tarek/mec-query-feed",
      notes: "Implemented optimistic comment insertion and rollback on network timeout.",
      status: "graded",
      score: 98,
      feedback: "Flawless cache rollback on simulated 500 error."
    },
    {
      id: "sub_1_4",
      assignmentId: "asgn_04",
      studentId: "usr_stu_1",
      submittedAt: "2026-10-03T18:20:00Z",
      submissionContent: "https://github.com/omar-tarek/express-production-api",
      notes: "Express layered architecture with Zod schema validation.",
      status: "graded",
      score: 90,
      feedback: "Clean controller layer separation."
    },
    {
      id: "sub_1_5",
      assignmentId: "asgn_05",
      studentId: "usr_stu_1",
      submittedAt: "2026-10-09T21:10:00Z",
      submissionContent: "https://github.com/omar-tarek/prisma-registration-db",
      notes: "Interactive transactions with isolation level tests.",
      status: "graded",
      score: 94,
      feedback: "Strong schema indexing and relation handling."
    },
    {
      id: "sub_1_6",
      assignmentId: "asgn_06",
      studentId: "usr_stu_1",
      submittedAt: "2026-10-13T23:05:00Z",
      submissionContent: "https://github.com/omar-tarek/jwt-rotation-auth",
      notes: "Refresh token rotation with replay attack blacklisting in Redis.",
      status: "graded",
      score: 96,
      feedback: "Excellent token revocation implementation."
    },

    // Sarah Mansour Submissions
    {
      id: "sub_2_1",
      assignmentId: "asgn_01",
      studentId: "usr_stu_2",
      submittedAt: "2026-09-14T10:00:00Z",
      submissionContent: "https://github.com/sarah-m/mec-ts-domain",
      notes: "Fully typed e-commerce state model.",
      status: "graded",
      score: 98,
      feedback: "Spot on."
    },
    {
      id: "sub_2_2",
      assignmentId: "asgn_02",
      studentId: "usr_stu_2",
      submittedAt: "2026-09-19T14:15:00Z",
      submissionContent: "https://github.com/sarah-m/modal-table-kit",
      notes: "Custom Tailwind compound table with filter chips.",
      status: "graded",
      score: 97,
      feedback: "Exceptional UI polish."
    },

    // Kareem Adel Submissions (Missing several assignments)
    {
      id: "sub_5_1",
      assignmentId: "asgn_01",
      studentId: "usr_stu_5",
      submittedAt: "2026-09-17T11:00:00Z",
      submissionContent: "https://github.com/kareem-adel/mec-ts-homework",
      notes: "Submitted 3 days late with basic types.",
      status: "graded",
      score: 74,
      feedback: "Satisfactory but missing generic constraints."
    }
  ],

  // Quizzes for course (since course.hasQuizzes is true)
  quizzes: [
    {
      id: "quiz_01",
      courseId: "crs_fsd_101",
      groupId: "grp_fsd_2026_a",
      sessionId: "sess_fsd_04",
      title: "Quiz 1: React Fundamentals & Async State",
      maxScore: 100,
      passingScore: 70
    },
    {
      id: "quiz_02",
      courseId: "crs_fsd_101",
      groupId: "grp_fsd_2026_a",
      sessionId: "sess_fsd_08",
      title: "Quiz 2: Relational Databases & SQL Querying",
      maxScore: 100,
      passingScore: 70
    },
    {
      id: "quiz_03",
      courseId: "crs_fsd_101",
      groupId: "grp_fsd_2026_a",
      sessionId: "sess_fsd_12",
      title: "Quiz 3: Node.js Security, Auth & Caching",
      maxScore: 100,
      passingScore: 70
    }
  ],

  // Quiz submissions
  quizSubmissions: [
    { id: "qsub_1_1", quizId: "quiz_01", studentId: "usr_stu_1", score: 94, passed: true, submittedAt: "2026-09-23T19:00:00Z" },
    { id: "qsub_1_2", quizId: "quiz_02", studentId: "usr_stu_1", score: 88, passed: true, submittedAt: "2026-10-07T19:15:00Z" },
    { id: "qsub_1_3", quizId: "quiz_03", studentId: "usr_stu_1", score: 92, passed: true, submittedAt: "2026-10-21T19:10:00Z" },

    { id: "qsub_2_1", quizId: "quiz_01", studentId: "usr_stu_2", score: 98, passed: true, submittedAt: "2026-09-23T18:50:00Z" },
    { id: "qsub_2_2", quizId: "quiz_02", studentId: "usr_stu_2", score: 96, passed: true, submittedAt: "2026-10-07T18:55:00Z" },
    { id: "qsub_2_3", quizId: "quiz_03", studentId: "usr_stu_2", score: 95, passed: true, submittedAt: "2026-10-21T18:40:00Z" },

    { id: "qsub_3_1", quizId: "quiz_01", studentId: "usr_stu_3", score: 82, passed: true, submittedAt: "2026-09-23T19:30:00Z" },
    { id: "qsub_3_2", quizId: "quiz_02", studentId: "usr_stu_3", score: 76, passed: true, submittedAt: "2026-10-07T19:40:00Z" },
    { id: "qsub_3_3", quizId: "quiz_03", studentId: "usr_stu_3", score: 80, passed: true, submittedAt: "2026-10-21T19:25:00Z" },

    { id: "qsub_4_1", quizId: "quiz_01", studentId: "usr_stu_4", score: 100, passed: true, submittedAt: "2026-09-23T18:45:00Z" },
    { id: "qsub_4_2", quizId: "quiz_02", studentId: "usr_stu_4", score: 98, passed: true, submittedAt: "2026-10-07T18:40:00Z" },
    { id: "qsub_4_3", quizId: "quiz_03", studentId: "usr_stu_4", score: 96, passed: true, submittedAt: "2026-10-21T18:35:00Z" },

    { id: "qsub_5_1", quizId: "quiz_01", studentId: "usr_stu_5", score: 68, passed: false, submittedAt: "2026-09-24T01:10:00Z" },
    { id: "qsub_5_2", quizId: "quiz_02", studentId: "usr_stu_5", score: 62, passed: false, submittedAt: "2026-10-08T02:20:00Z" }
  ]
};
