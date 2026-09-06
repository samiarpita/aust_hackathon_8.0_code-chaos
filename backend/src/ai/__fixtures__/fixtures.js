/**
 * Test Fixtures for Developer 3 AI Engine
 */

// 1. Standard Problem Statement Recursion Scenario
const recursionFixture = {
  questionText: "Write a recursive function `Node* reverse(Node* head)` in C to reverse a singly linked list. Explain your base case condition and how pointer redirection works during the unwinding phase.",
  clos: [
    "Design recursive algorithms with correct boundary termination and state backtracking.",
    "Manipulate dynamic pointer structures without memory leaks or cyclic references."
  ],
  answers: [
    // Correct 1
    "Node* reverse(Node* head) {\n  if (head == NULL || head->next == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
    // Base-case missing 1
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return rest;\n}",
    // Base-case missing 2
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next = head;\n  return rest;\n}",
    // Pointer cycle omission
    "Node* reverse(Node* head) {\n  if (head == NULL) return head;\n  Node* rest = reverse(head->next);\n  head->next = head;\n  return rest;\n}",
    // Syntax mistakes
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head.next);\n  head.next.next = head;\n  return rest;\n}",
    // Correct 2
    "Node* reverse(Node* head) {\n  if (!head || !head->next) return head;\n  Node* newHead = reverse(head->next);\n  head->next->next = head;\n  head->next = NULL;\n  return newHead;\n}",
    // Base-case missing 3
    "Node* reverse(Node* head) {\n  Node* rest = reverse(head->next);\n  head->next->next = head;\n  return head;\n}",
    // Shallow reversal / stack loss
    "Node* reverse(Node* head) {\n  if (head == NULL) return NULL;\n  head->next = reverse(head->next);\n  return head;\n}"
  ]
};

// 2. Edge Case: Single / Insufficient Submission (< 2 answers)
const smallBatchFixture = {
  questionText: "What is the worst-case time complexity of QuickSort and when does it occur?",
  clos: ["Analyze worst and average case asymptotic complexity for sorting algorithms."],
  answers: [
    "O(n^2) when the pivot chosen is always the smallest or largest element (e.g. sorted array)."
  ]
};

// 3. Edge Case: All Correct
const allCorrectFixture = {
  questionText: "How do you check if a binary tree is empty in C?",
  clos: ["Identify tree node structure and empty tree boundary condition."],
  answers: [
    "if (root == NULL) return 1; else return 0;",
    "return root == NULL;",
    "Check if root is NULL. If root == NULL, the binary tree is empty.",
    "if (!root) { return true; }",
    "A binary tree is empty when root pointer is NULL.",
    "return (root == NULL) ? 1 : 0;"
  ]
};

// 4. Edge Case: Single Dominant Misconception (100% same flaw)
const singleFlawFixture = {
  questionText: "In C, does free(ptr) set ptr to NULL automatically?",
  clos: ["Manage dynamic heap memory allocation and prevent dangling pointers."],
  answers: [
    "Yes, free(ptr) deallocates memory and automatically sets ptr to NULL.",
    "Yes, after calling free(ptr), the pointer becomes NULL.",
    "Yes it sets ptr to NULL so you cannot access it again.",
    "Yes, freeing memory automatically assigns NULL to ptr.",
    "Yes, free(ptr) resets the pointer value to NULL."
  ]
};

module.exports = {
  recursionFixture,
  smallBatchFixture,
  allCorrectFixture,
  singleFlawFixture
};
