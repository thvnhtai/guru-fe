import type { SupportedLanguage } from "@/types/room";

export const CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `# Solution for LeetCode problem
# Modify the function below to solve the problem

def solution(args):
    """
    Args: problem-specific parameters
    Returns: problem-specific return type
    """
    # Your code here
    pass


# Test your solution
if __name__ == "__main__":
    # Example test case
    result = solution(...)
    print(result)
`,

  javascript: `/**
 * Solution for LeetCode problem
 * Modify the function below to solve the problem
 */

/**
 * @param {*} args - problem-specific parameters
 * @return {*} problem-specific return type
 */
var solution = function(args) {
    // Your code here
};

// Test your solution
if (typeof module !== 'undefined' && module.exports) {
    // Example test case
    console.log(solution(...));
}
`,

  java: `/**
 * Solution for LeetCode problem
 * Modify the class/method below to solve the problem
 */

class Solution {
    /**
     * @param args problem-specific parameters
     * @return problem-specific return type
     */
    public Object solution(Object args) {
        // Your code here
        return null;
    }
}

// Test your solution
// Uncomment below to test locally
/*
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Example test case
        System.out.println(sol.solution(...));
    }
}
*/
`,

  cpp: `/**
 * Solution for LeetCode problem
 * Modify the function below to solve the problem
 */

// #include <vector>
// #include <string>
// #include <iostream>
// using namespace std;

class Solution {
public:
    /**
     * args: problem-specific parameters
     * return: problem-specific return type
     */
    int solution(int args) {
        // Your code here
        return 0;
    }
};

/*
// Test your solution
int main() {
    Solution sol;
    // Example test case
    cout << sol.solution(...) << endl;
    return 0;
}
*/
`,
};
