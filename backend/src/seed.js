const bcrypt = require('bcryptjs');
const { run, get, all, initDB } = require('./db');

const initialCourses = [
  {
    course_name: 'IBM Full Stack Software Developer Professional Certificate',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer',
    duration: 64,
    has_project: 1,
    category: 'Computer Science',
    level: 'Intermediate',
    description: 'Master Cloud Native, Python, Django, HTML, CSS, JavaScript, React, Node.js, Express, Docker, Kubernetes, Microservices, and Capstone Project.',
    tags: 'fullstack,cloud,react,node,docker,capstone'
  },
  {
    course_name: 'Meta Front-End Developer Professional Certificate',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    duration: 48,
    has_project: 1,
    category: 'Web Development',
    level: 'Beginner',
    description: 'Learn modern React, JavaScript algorithms, responsive CSS UI frameworks, version control, and build a portfolio-ready capstone web app.',
    tags: 'react,javascript,frontend,meta,capstone'
  },
  {
    course_name: 'Google Data Analytics Professional Certificate',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    duration: 36,
    has_project: 1,
    category: 'Data Science',
    level: 'Beginner',
    description: 'Gain in-demand skills in spreadsheet calculations, SQL database querying, Tableau data visualization, and R programming case study project.',
    tags: 'data analytics,sql,tableau,r,google,project'
  },
  {
    course_name: 'CS50’s Introduction to Computer Science',
    platform: 'edX',
    course_link: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
    duration: 40,
    has_project: 1,
    category: 'Computer Science',
    level: 'Beginner',
    description: 'An intellectual enterprise of computer science and art of programming by Harvard University. Includes substantial problem sets and a final project.',
    tags: 'c,python,sql,harvard,algorithms,project'
  },
  {
    course_name: 'Deep Learning Specialization by Andrew Ng',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/specializations/deep-learning',
    duration: 32,
    has_project: 1,
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    description: 'Build and train deep neural networks, CNNs, RNNs, Transformers, and apply them to real computer vision and NLP programming projects.',
    tags: 'deep learning,neural networks,nlp,andrew ng,project'
  },
  {
    course_name: 'Introduction to Algorithms and Data Structures',
    platform: 'edX',
    course_link: 'https://www.edx.org/learn/algorithms/columbia-university-data-structures-and-algorithms',
    duration: 24,
    has_project: 0,
    category: 'Computer Science',
    level: 'Intermediate',
    description: 'Fundamental data structures, search algorithms, sorting complexities, asymptotic notation, and graph algorithms theoretical foundations.',
    tags: 'algorithms,data structures,trees,graphs,complexity'
  },
  {
    course_name: 'Google Cybersecurity Professional Certificate',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    duration: 35,
    has_project: 1,
    category: 'Cybersecurity',
    level: 'Beginner',
    description: 'Learn SIEM tools, Linux command line, Python automation, SQL security queries, packet analysis with Wireshark, and portfolio incident reports.',
    tags: 'cybersecurity,siem,linux,python,google,portfolio'
  },
  {
    course_name: 'The Web Developer Bootcamp 2026',
    platform: 'Udemy',
    course_link: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
    duration: 52,
    has_project: 1,
    category: 'Web Development',
    level: 'Beginner',
    description: 'Comprehensive bootcamp covering HTML5, CSS3, JavaScript ES6+, NodeJS, Express, MongoDB, RESTful APIs, and full-scale CRUD YelpCamp clone project.',
    tags: 'nodejs,express,mongodb,javascript,fullstack'
  },
  {
    course_name: 'Introduction to Cloud Computing Essentials',
    platform: 'edX',
    course_link: 'https://www.edx.org/learn/cloud-computing/the-linux-foundation-introduction-to-cloud-infrastructure',
    duration: 22,
    has_project: 0,
    category: 'Cloud Computing',
    level: 'Beginner',
    description: 'Overview of cloud architecture, IaaS, PaaS, SaaS, virtualization, container basics, and enterprise cloud migration strategies.',
    tags: 'cloud,iaas,paas,linux,virtualization'
  },
  {
    course_name: 'Machine Learning with Python',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/learn/machine-learning-with-python',
    duration: 21,
    has_project: 1,
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    description: 'Supervised vs unsupervised learning, regression, classification, clustering, SciKit-Learn, and real-world evaluation metrics project.',
    tags: 'python,scikit-learn,regression,clustering,project'
  },
  {
    course_name: 'Foundations of Project Management',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/learn/project-management-foundations',
    duration: 18,
    has_project: 0,
    category: 'Business & Management',
    level: 'Beginner',
    description: 'Core project management terminology, methodologies (Agile, Waterfall, Lean), project charters, and documentation techniques.',
    tags: 'management,agile,waterfall,scrum'
  },
  {
    course_name: 'Full Stack Open: Deep Dive Into Modern Web Development',
    platform: 'Coursera',
    course_link: 'https://www.coursera.org/learn/full-stack-open-helsinki',
    duration: 38,
    has_project: 1,
    category: 'Web Development',
    level: 'Intermediate',
    description: 'University of Helsinki comprehensive curriculum on React, Redux, Node.js, GraphQL, TypeScript, CI/CD, and full-stack application development.',
    tags: 'react,graphql,typescript,cicd,project'
  }
];

const seedDB = async () => {
  await initDB();

  // Only create admin if explicitly specified via environment variables
  let adminId = null;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await get('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (!existingAdmin) {
      const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const adminName = process.env.ADMIN_NAME || 'CourseFinder Administrator';
      const result = await run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [adminName, adminEmail, adminHash, 'admin']
      );
      adminId = result.id;
      console.log(`Initial administrator created from environment config: ${adminEmail}`);
    } else {
      adminId = existingAdmin.id;
    }
  }

  const existingUser = await get('SELECT * FROM users WHERE email = ?', ['student@university.edu']);
  let studentId = existingUser ? existingUser.id : null;

  if (!existingUser) {
    const userHash = await bcrypt.hash('student123', 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Alex Rivera (Student)', 'student@university.edu', userHash, 'user']
    );
    studentId = result.id;
    console.log('Student user created: student@university.edu / student123');
  }

  // Insert seed courses if courses table is empty
  const courseCount = await get('SELECT COUNT(*) as count FROM courses');
  if (courseCount.count === 0) {
    for (const c of initialCourses) {
      await run(
        `INSERT INTO courses (course_name, platform, course_link, duration, has_project, category, description, level, tags, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.course_name, c.platform, c.course_link, c.duration, c.has_project, c.category, c.description, c.level, c.tags, adminId]
      );
    }
    console.log(`Seeded ${initialCourses.length} initial courses into database.`);
  }

  // Insert some sample personal course statuses for the student
  const studentStatuses = await get('SELECT COUNT(*) as count FROM personal_course_status WHERE user_id = ?', [studentId]);
  if (studentStatuses.count === 0) {
    // Student already completed IBM Full Stack (id 1)
    await run(
      'INSERT INTO personal_course_status (user_id, course_id, status, notes) VALUES (?, ?, ?, ?)',
      [studentId, 1, 'COMPLETED', 'Finished for 3-credit senior technical elective requirement. Capstone submitted!']
    );

    // Student is currently in progress with Meta Front-End (id 2)
    await run(
      'INSERT INTO personal_course_status (user_id, course_id, status, notes) VALUES (?, ?, ?, ?)',
      [studentId, 2, 'IN_PROGRESS', 'Working on Module 5: React Advanced Components and Hooks.']
    );

    // Student has marked CS50 as not completed (or saved for later)
    await run(
      'INSERT INTO personal_course_status (user_id, course_id, status, notes) VALUES (?, ?, ?, ?)',
      [studentId, 4, 'NOT_COMPLETED', 'Planning to take next semester.']
    );
    console.log('Seeded sample personal course status records for student.');
  }

  // Insert sample pending community course submission for the admin review queue
  const submissionsCount = await get('SELECT COUNT(*) as count FROM course_submissions');
  if (submissionsCount.count === 0) {
    await run(
      `INSERT INTO course_submissions (submitting_user_id, course_name, platform, course_link, duration, has_project, category, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        'Applied Data Science with Python Specialization',
        'Coursera',
        'https://www.coursera.org/specializations/data-science-python',
        34,
        1,
        'Data Science',
        '5-course series by University of Michigan introducing data science in Python, pandas, visualization, machine learning, text mining and network analysis.',
        'Pending'
      ]
    );

    await run(
      `INSERT INTO course_submissions (submitting_user_id, course_name, platform, course_link, duration, has_project, category, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        'Android App Development Specialization',
        'Coursera',
        'https://www.coursera.org/specializations/android-app-development',
        28,
        1,
        'Mobile Development',
        'Vanderbilt University specialization covering Android Studio, Java/Kotlin, UI components, background services, and capstone mobile application.',
        'Pending'
      ]
    );

    console.log('Seeded sample pending community submissions for admin review queue.');
  }

  console.log('Seed completed successfully!');
};

if (require.main === module) {
  seedDB()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedDB };
