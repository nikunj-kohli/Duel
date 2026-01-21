export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  acceptance: number;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  inputFormat?: {
    description: string;
    examples: string[];
  };
  testCases: Array<{ input: string; expectedOutput: string }>;
  templates: {
    java: string;
    cpp: string;
    python: string;
    javascript: string;
  };
}

export const PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    acceptance: 49.5,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' }
    ],
    constraints: ['2 <= nums.length <= 10⁴', '-10⁹ <= nums[i] <= 10⁹', 'Only one valid answer exists'],
    inputFormat: {
      description: 'For custom test cases, enter input in the following format:',
      examples: ['Line 1: Space-separated array elements', 'Line 2: Target value', '', 'Example:', '2 7 11 15', '9']
    },
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '[0,1]' },
      { input: '3 2 4\n6', expectedOutput: '[1,2]' },
      { input: '3 3\n6', expectedOutput: '[0,1]' },
    ],
    templates: {
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Your code here\n};'
    }
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    category: 'Linked List',
    acceptance: 41.2,
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
    examples: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807' }
    ],
    constraints: ['The number of nodes in each linked list is in the range [1, 100].', '0 <= Node.val <= 9', 'It is guaranteed that the list represents a number that does not have leading zeros.'],
    testCases: [
      { input: '2 4 3\n5 6 4', expectedOutput: '7 0 8' },
      { input: '0\n0', expectedOutput: '0' },
    ],
    templates: {
      java: 'class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // Your code here\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {ListNode} l1\n * @param {ListNode} l2\n * @return {ListNode}\n */\nvar addTwoNumbers = function(l1, l2) {\n    // Your code here\n};'
    }
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    acceptance: 33.8,
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10⁴', 's consists of English letters, digits, symbols and spaces.'],
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
    ],
    templates: {
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    // Your code here\n};'
    }
  },
  {
    id: '4',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Binary Search',
    acceptance: 36.7,
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1,2,3] and median is 2.' }
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000'],
    testCases: [
      { input: '1 3\n2', expectedOutput: '2.0' },
      { input: '1 2\n3 4', expectedOutput: '2.5' },
    ],
    templates: {
      java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Your code here\n        return 0.0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    // Your code here\n};'
    }
  },
  {
    id: '5',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    acceptance: 27.4,
    description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.',
    examples: [
      { input: 'x = 123', output: '321' },
      { input: 'x = -123', output: '-321' }
    ],
    constraints: ['-2³¹ <= x <= 2³¹ - 1'],
    testCases: [
      { input: '123', expectedOutput: '321' },
      { input: '-123', expectedOutput: '-321' },
      { input: '120', expectedOutput: '21' },
    ],
    templates: {
      java: 'class Solution {\n    public int reverse(int x) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int reverse(int x) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def reverse(self, x: int) -> int:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number} x\n * @return {number}\n */\nvar reverse = function(x) {\n    // Your code here\n};'
    }
  },
  {
    id: '6',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'String',
    acceptance: 42.3,
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' }
    ],
    constraints: ['1 <= s.length <= 2 * 10⁵', 's consists only of printable ASCII characters.'],
    testCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true' },
      { input: 'race a car', expectedOutput: 'false' },
    ],
    templates: {
      java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {string} s\n * @return {boolean}\n */\nvar isPalindrome = function(s) {\n    // Your code here\n};'
    }
  },
  {
    id: '7',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Array',
    acceptance: 54.2,
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }
    ],
    constraints: ['1 <= prices.length <= 10⁵', '0 <= prices[i] <= 10⁴'],
    testCases: [
      { input: '7 1 5 3 6 4', expectedOutput: '5' },
      { input: '7 6 4 3 1', expectedOutput: '0' },
    ],
    templates: {
      java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    // Your code here\n};'
    }
  },
  {
    id: '8',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    acceptance: 62.1,
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 <= Node.val <= 100'],
    testCases: [
      { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4' },
      { input: '\n', expectedOutput: '' },
    ],
    templates: {
      java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nvar mergeTwoLists = function(list1, list2) {\n    // Your code here\n};'
    }
  },
  {
    id: '9',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Array',
    acceptance: 54.3,
    description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }
    ],
    constraints: ['n == height.length', '2 <= n <= 10⁵', '0 <= height[i] <= 10⁴'],
    testCases: [
      { input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49' },
      { input: '1 1', expectedOutput: '1' },
    ],
    templates: {
      java: 'class Solution {\n    public int maxArea(int[] height) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number[]} height\n * @return {number}\n */\nvar maxArea = function(height) {\n    // Your code here\n};'
    }
  },
  {
    id: '10',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Array',
    acceptance: 32.1,
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }
    ],
    constraints: ['3 <= nums.length <= 3000', '-10⁵ <= nums[i] <= 10⁵'],
    testCases: [
      { input: '-1 0 1 2 -1 -4', expectedOutput: '[-1,-1,2][-1,0,1]' },
      { input: '0 1 1', expectedOutput: '[]' },
    ],
    templates: {
      java: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Your code here\n    }\n};',
      python: 'class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        # Your code here\n        pass',
      javascript: '/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nvar threeSum = function(nums) {\n    // Your code here\n};'
    }
  }
];
