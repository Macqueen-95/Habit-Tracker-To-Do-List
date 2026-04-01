# FlowTrack - Habit Tracker & To Do List

FlowTrack is a client-side productivity web app that combines task management, habit tracking, and progress analytics in a modern multi-page interface.

The project is built with HTML, CSS, and JavaScript, uses LocalStorage for persistence, and also includes a React-based task section to demonstrate React syllabus coverage.

## Core Features

### Authentication
- Register and login with username and password
- User-wise data isolation using LocalStorage

### Dashboard
- Quick stats (total tasks, completed tasks, habits, best streak)
- Quick add task form
- Tasks due today
- Habit summary
- Weekly completion progress bar

### Tasks
- Add, edit, delete tasks
- Deadline, priority, and category support
- Mark complete / undo
- Filter by all, pending, completed, high-priority
- React Task Board section (search, filter, quick stats, toggle)

### Habits
- Add, edit, delete habits
- Mark today completion
- Current streak and longest streak tracking
- Calendar-style consistency heatmap (LeetCode-inspired)
- Streak at risk warning
- Freeze token support to protect streaks

### Analytics
- Completion ring for task completion percentage
- Weekly productivity bar graph
- Habit streak summary list

### Calendar
- Month-wise planner view
- Click any day to see tasks and completed habits

### Settings
- Theme switch (dark/light)
- Daily goal setting
- Reminder enable/disable and time setup
- Test notification button
- Freeze token management
- Reset account data
- Demo mode data seeding for presentation

### Bonus UX Features
- Confetti celebration when all today's tasks and habits are completed
- Responsive layout across desktop/mobile
- Animated UI and improved navigation

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- React (CDN-based component on Tasks page)
- Browser LocalStorage
- Browser Notifications API

## Project Structure

```
.
├── index.html          # Login page
├── register.html       # Register page
├── dashboard.html      # Dashboard overview
├── tasks.html          # Task management + React Task Board
├── habits.html         # Habit manager + consistency calendar heatmap
├── analytics.html      # Charts and progress insights
├── calendar.html       # Month-wise planner view
├── settings.html       # Theme, reminders, demo mode, reset
├── script.js           # App logic and page rendering
└── style.css           # Global styling and responsive UI
```

## How to Run

1. Open the project folder.
2. Open `index.html` in a browser.
3. Register a new user and login.
4. Use sidebar navigation to explore all pages.

No backend or installation is required.

## Data Persistence

Data is stored in LocalStorage and includes:
- user accounts
- tasks
- habits and streak history
- freeze tokens
- reminder settings
- theme and daily goal

Note: Clearing browser data removes saved project data.

## Demo Flow (For Viva/Review)

1. Login and show Dashboard metrics.
2. Add 2 tasks (different priorities) and mark one completed.
3. Go to Habits, add a habit, mark today, show streak update.
4. Show heatmap and streak at-risk + freeze token usage.
5. Open Calendar page and click a day to show details.
6. Open Analytics page and explain ring + weekly bars.
7. Open Settings:
	- change theme
	- enable reminder + test notification
	- load demo data for quick full showcase
8. Complete today's pending items to trigger confetti.

## Educational Value

This project demonstrates:
- DOM manipulation
- modular page rendering
- data modeling in LocalStorage
- responsive UI/UX design
- simple analytics visualization
- browser APIs (Notifications)
- React integration in an existing non-React codebase

## License

This project is developed for academic/educational use.
