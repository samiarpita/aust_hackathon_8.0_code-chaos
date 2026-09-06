const fetch = globalThis.fetch || require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function run() {
  console.log('--- 1. Fetch Faculties ---');
  const facultiesRes = await fetch(`${API_BASE}/courses/faculties`);
  const faculties = await facultiesRes.json();
  console.log('Faculties count:', faculties.length);
  faculties.forEach(f => {
    console.log(`- ${f.name} (${f.email}) -> ${f.assignmentsCount} assignments`);
  });

  console.log('\n--- 2. Post Assignment as Dr. Sarah Connor / Sarah Rahman ---');
  const sarahFaculty = faculties.find(f => f.email && f.email.includes('sarah')) || faculties[0];
  
  const postPayload = {
    courseCode: 'CSE 3103',
    courseName: 'Database Management Systems',
    assignmentTitle: 'Assignment 3: Multi-Version Concurrency Control (MVCC)',
    assignmentType: 'theory',
    dueDate: '2026-10-25',
    totalMarks: 15,
    questionNumber: 'Q11',
    questionText: 'Explain how Multi-Version Concurrency Control (MVCC) achieves non-blocking read operations without write locks. Contrast with Strict 2PL.',
    correctAnswer: 'MVCC maintains multiple timestamped versions of each data item. Read transactions see a consistent snapshot matching their start timestamp, while write transactions create a newer version without blocking concurrent readers.',
    maxMarks: 15,
    clos: ['CLO 4: Analyze isolation levels, MVCC snapshot isolation, and lock-free concurrency protocols'],
    isSolutionApproved: false,
    diagnosticMisconception: 'Assuming Readers Block Writers in MVCC',
    diagnosticExplanation: 'Under MVCC, readers never acquire locks and do not block writers, nor do writers block readers.',
    remedialAction: 'Review snapshot isolation and version visibility rules.',
    facultyId: sarahFaculty.id,
    facultyName: sarahFaculty.name,
    facultyEmail: sarahFaculty.email
  };

  const postRes = await fetch(`${API_BASE}/courses/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postPayload)
  });

  const postResult = await postRes.json();
  console.log('Post status:', postRes.status);
  console.log('Post result assignment title:', postResult.assignment?.title);
  console.log('Post result assigned faculty:', postResult.assignment?.faculty);

  console.log('\n--- 3. Fetch Student Coursework Catalog ---');
  const studentAssignmentsRes = await fetch(`${API_BASE}/courses/student-assignments`);
  const courses = await studentAssignmentsRes.json();
  console.log('Courses returned:', courses.length);

  let targetFound = null;
  courses.forEach(c => {
    c.assignments.forEach(a => {
      a.questions.forEach(q => {
        if (q.questionNumber === 'Q11' || q.title.includes('MVCC')) {
          targetFound = { course: c.code, exam: a.title, question: q };
        }
      });
    });
  });

  if (targetFound) {
    console.log('\nSUCCESS! Found newly posted assignment in Student Catalog:');
    console.log('- Course:', targetFound.course);
    console.log('- Title:', targetFound.question.title);
    console.log('- Assigned by:', targetFound.question.faculty?.name, `(${targetFound.question.faculty?.email})`);
    console.log('- Marks:', targetFound.question.marks);
  } else {
    console.error('FAILURE: Target assignment Q11 not found in student catalog!');
  }
}

run().catch(err => {
  console.error('Verification failed:', err);
});
