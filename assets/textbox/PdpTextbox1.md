Explanation of Code Changes
validateInput Updates: Each type now allows empty values (to permit deletions) and has specific handling for each input type:

num: Only positive integers.
intNum: Positive and negative integers.
desNum: Positive and negative decimal numbers.
alpNum: Checks against exactAlpha, exactNumeric, and an optional custom pattern regex.
maskText and Toggle Visibility:

Eye Icon: A toggle button displays or hides text based on maskText and toggles showText to reveal text when clicked.
Conditional Type: The input field alternates between type="text" and type="password" based on showText.
Pattern Matching: pattern prop allows you to pass custom regex for alpNum validation (e.g., email pattern), while exactAlpha and exactNumeric enforce character limits.