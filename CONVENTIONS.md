I want to establish clear coding conventions and a style guide to optimize the testing process in our development workflow. Moving forward, please adhere to the following guidelines when implementing features and writing tests:

Coding Conventions & Testing Guidelines:

	1.	Feature-Driven Testing:
	•	Focus on Core Features: Only create tests for the core features that are intended to be part of the final product. If a feature is experimental or temporary, do not create tests for it unless explicitly requested.
	•	Context-Aware Test Creation: Understand from the context of the prompt which features are meant to be permanent and require robust testing. For example, if I ask for a feature like updating the position of a DreamNode, create tests that cover the intended functionality, but avoid testing temporary implementations like using the cursor position to move the node.
	2.	Selective Test Coverage:
	•	Avoid Over-Testing: Do not create tests for trivial details like specific font sizes or inline styles unless these are crucial to the functionality or design integrity of the app.
	•	Prioritize Functional Tests: Focus on testing key behaviors, state changes, interactions, and integrations rather than superficial aspects of the UI that are less likely to change.
	3.	Maintainability:
	•	Refactor and Remove Unnecessary Tests: As features evolve, ensure that tests remain relevant. Remove or refactor tests that are no longer necessary or have become redundant due to changes in the codebase.
	•	Follow Industry Standards: Implement tests following industry-standard practices, ensuring they are maintainable, scalable, and aligned with the overall goals of the project.
	4.	Automated Testing Workflow:
	•	TDD Approach: Whenever I request a new feature, implement the feature and the associated tests simultaneously if the feature is intended to be permanent. Ensure that tests are tightly coupled with the feature’s functionality.
	•	Continuous Improvement: Regularly review and update the test suite to ensure it remains effective and efficient, removing any tests that no longer serve a purpose or are overly granular.

Please adjust your testing approach to align with these guidelines to maintain a clean and professional codebase. This will help us focus on meaningful test coverage and reduce unnecessary test bloat.

Unit tests should be stored in the src/components/__tests__ directory