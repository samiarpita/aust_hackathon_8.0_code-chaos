/**
 * Pre-calibrated Demo Dataset & Academic History for Student Misconception Radar
 * Useful for 1-click test, faculty evaluations, and hackathon judging demos.
 */
export const demoExamDataset = {
  courseName: "Data Structures and Algorithms (CSE 2100)",
  examTitle: "Midterm Examination Fall 2026",
  questionNumber: "Q3",
  questionText: "Explain how the base case works in recursion and write a recursive function Node* reverse(Node* head) in C to reverse a singly linked list. Explain your base case condition and pointer redirection.",
  clos: [
    "CLO 1: Understand recursion boundary conditions",
    "CLO 2: Analyze dynamic pointer manipulation without memory leaks"
  ],
  answers: [
    "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
    "Node* reverse(Node* head) {\n  if (head == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next = head;\n  return rest;\n}",
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head.next);\n  head.next.next = head;\n  return rest;\n}",
    "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  return head;\n}",
    "Node* reverse(Node* head) {\n  if (head == NULL) return NULL;\n  head->next = reverse(head->next);\n  return head;\n}",
    "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* newHead = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return newHead;\n}"
  ]
};

export const samplePrecomputedAnalyses = [
  {
    id: "analysis-rec-01",
    course: "CSE 2100: Data Structures",
    title: "Recursion — Base Case",
    questionText: "Explain how the base case works in recursion and implement a recursive function to reverse a singly linked list.",
    clos: [
      "CLO 1: Understand recursion",
      "CLO 2: Analyze algorithms"
    ],
    answerCount: 36,
    misconceptionGroups: [
      {
        label: "Base-case misconception",
        percentage: 42,
        description: "Students invoked recursive calls without verifying empty or single-node boundary conditions, leading to infinite call frames."
      },
      {
        label: "Stack/Heap confusion",
        percentage: 27,
        description: "Confusion between function call-stack unwinding order and dynamic heap node persistence."
      },
      {
        label: "Syntax & Pointer mistakes",
        percentage: 18,
        description: "Improper dereferencing (* vs ->) and omitting disconnection of inverted pointers."
      },
      {
        label: "Correct understanding",
        percentage: 13,
        description: "Complete mastery of base case boundary condition and unwinding redirection."
      }
    ],
    insight: "Most students understand the recursive process but struggle to identify when recursion should stop. The dominant issue is misunderstanding the base case.",
    intervention: "Spend 15 minutes reviewing how to identify and design base cases before introducing the next recursion problem.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "analysis-ptr-02",
    course: "CSE 2100: Data Structures",
    title: "Dynamic Memory & Pointer Lifetime",
    questionText: "Differentiate between malloc() allocation on heap vs local stack frames and explain how dangling pointers occur.",
    clos: [
      "CLO 2: Analyze dynamic pointer structures",
      "CLO 3: Prevent memory leaks"
    ],
    answerCount: 42,
    misconceptionGroups: [
      {
        label: "Dangling pointer & deallocation error",
        percentage: 45,
        description: "Assuming free(ptr) immediately zeroes the pointer variable address."
      },
      {
        label: "Stack address return misconception",
        percentage: 30,
        description: "Returning references to stack-allocated variables outside function scope."
      },
      {
        label: "Proper memory lifecycle management",
        percentage: 25,
        description: "Correct zeroing of pointer after freeing and safe heap allocation checks."
      }
    ],
    insight: "45% of the class treats pointer deallocation as variable deletion, assuming the pointer variable itself is nulled after calling free().",
    intervention: "Use a memory debugger live demo (e.g. Valgrind) to illustrate memory addresses staying alive after deallocation.",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  },
  {
    id: "analysis-tree-03",
    course: "CSE 2103: Advanced Algorithms",
    title: "Binary Tree DFS Traversal Ordering",
    questionText: "Trace recursive in-order traversal of a binary search tree and prove why it produces keys in sorted order.",
    clos: [
      "CLO 1: Understand recursive tree traversals",
      "CLO 4: Prove algorithm correctness"
    ],
    answerCount: 29,
    misconceptionGroups: [
      {
        label: "Visit step order displacement",
        percentage: 38,
        description: "Confusing pre-order root-first processing with in-order left-root-right sequence."
      },
      {
        label: "Null child termination omission",
        percentage: 34,
        description: "Neglecting the base case of leaf node null children checks."
      },
      {
        label: "Rigorous traversal mastery",
        percentage: 28,
        description: "Clear inductive proof showing left subtree <= root <= right subtree ordering."
      }
    ],
    insight: "Over a third of students transpose the visit step in recursion, conflating pre-order visit timing with in-order traversal.",
    intervention: "Have students trace a 3-level tree on paper highlighting the exact moment the print statement executes during stack unwinding.",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];
