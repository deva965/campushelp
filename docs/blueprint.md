# **App Name**: CampusHelp – Smart Complaint & Support System

## Core Features:

- User Authentication: Secure user authentication with student and admin roles via Firebase Authentication.
- Complaint Submission: Students submit complaints with title, description, category, location, and optional image upload. Stores the data in Firestore with fields: id, userId, title, description, category, location, status, createdAt.
- Complaint Tracking: Students can track the status of their complaints (Pending, In Progress, Resolved) in real-time.
- Admin Dashboard: Admins can view, filter, and update complaint statuses, adding resolution remarks.
- Real-time Notifications: Firebase Cloud Messaging notifies students of complaint status changes.
- AI-Powered Smart Tagging: An AI tool that uses Gemini via Genkit to automatically categorize complaints. This improves routing of the complaint to the appropriate team and makes complaint analysis easier.
- AI Complaint Summarization: Generates short summaries for admins using Gemini via Genkit, facilitating quicker review and action.
- Geolocation integration: Integrate Google Maps API for precise issue location tagging during complaint submission.

## Style Guidelines:

- Primary color: Soft blue (#7EC4CF) to convey trust and reliability, nodding to the 'Help' concept.
- Background color: Light gray (#F0F0F0), near-white, to provide a clean and neutral backdrop that enhances readability.
- Accent color: Teal (#2E8A99), a slightly desaturated analogous color, for interactive elements and important notifications to draw user attention without overwhelming the interface.
- Font pairing: 'Space Grotesk' for headlines, giving a tech-forward impression, paired with 'Inter' for body text, optimizing readability for descriptions and remarks.
- Consistent use of simple, clear icons to represent complaint categories and status indicators.
- Clean, intuitive layout with a focus on ease of navigation for both students and administrators. Utilizes Tailwind CSS for a clean student dashboard and simple admin panel, with a mobile-responsive design.
- Subtle transitions and animations to provide feedback on user interactions (e.g., status updates).