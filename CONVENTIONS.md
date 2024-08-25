To streamline development and ensure alignment with your vision, here are a few coding conventions and guidelines:

	1.	File System Access: Always use Electron’s file system APIs (fs, path) to access files directly from the local system. Avoid using Fetch API or any web-based methods for local file access.
	2.	Component Responsibility:
	•	Keep components focused on single responsibilities.
	•	DreamNode should handle the 3D representation and basic metadata loading.
	•	DreamTalk and DreamSong should focus solely on displaying content.
	3.	Data Flow and State Management:
	•	Ensure a clear data flow from DreamNodeGrid to DreamNode and its sub-components. Use React’s state management or context API to manage shared state where necessary.
	4.	Error Handling:
	•	Implement robust error handling, especially around file access and asynchronous operations. Make sure the app gracefully handles missing files, inaccessible directories, or other potential issues.
	5.	Modularization: If any component grows too complex, consider breaking it down further. For example, if DreamNode starts handling too many 3D interactions, a dedicated class or utility for 3D transformations might be helpful.

By following these principles, your project should maintain a clean, modular, and scalable architecture, allowing you to build on a solid foundation as the application grows in complexity.