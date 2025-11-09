# Adaptive Learning Platform (MERN Stack)

This is a full-stack Adaptive Learning Platform built using the MERN stack (MongoDB, Express.js, React, Node.js). The application tracks student progress and dynamically assembles quizzes based on their performance using a custom rules engine.

This project features separate dashboards for students and instructors, real-time progress tracking, and a content management system for creating topics and questions.

## Key Features

* **Adaptive Quiz Engine:** Dynamically serves questions based on student mastery. If a student answers correctly, the difficulty increases (Level 1 -> 2). If they answer incorrectly, it decreases.
* **Student Dashboard:** Students can take quizzes, track their mastery level per topic, and see their progress visually.
* **Instructor Dashboard:** Instructors can:
    * **Manage Content:** Create, view, and manage topics and questions of varying difficulty levels.
    * **View Analytics:** Track the progress of all students in one place to identify learning gaps.
* **Authentication & Roles:** Secure JWT (JSON Web Token) authentication with separate roles for "student" and "instructor".

## Tech Stack

* **Backend:**
    * **Node.js:** Runtime environment
    * **Express.js:** Backend framework
    * **MongoDB (with Mongoose):** NoSQL database for storing users, content, and progress.
    * **JSON Web Token (JWT):** For user authentication and authorization.
    * **bcryptjs:** For hashing passwords.

* **Frontend:**
    * **React:** UI library
    * **React Router:** For client-side routing.
    * **React Context API:** For global state management (Authentication).
    * **Axios:** For making API requests to the backend.
    * **Recharts:** For displaying progress charts.
    * **Custom CSS:** Styled components and UI (as seen in `index.css`).

## Project Structure

The project is organized in a "monorepo" style with two main folders:

adaptive-learning-app/

|

+-- backend/

|   |

|   +-- middleware/

|   |   +-- auth.js

|   |

|   +-- models/

|   |   +-- Question.js

|   |   +-- StudentProgress.js

|   |   +-- Topic.js

|   |   +-- User.js

|   |

|   +-- routes/

|   |   +-- analytics.js

|   |   +-- auth.js

|   |   +-- content.js

|   |   +-- quiz.js

|   |

|   +-- .env

|   +-- package.json

|   +-- package-lock.json

|   +-- server.js

|

+-- frontend/

|   |

|   +-- public/

|   |   +-- index.html

|   |

|   +-- src/

|   |   |

|   |   +-- components/

|   |   |   +-- instructor/

|   |   |   |   +-- AnalyticsDashboard.js

|   |   |   |   +-- ContentManagement.js

|   |   |   +-- layout/

|   |   |   |   +-- Navbar.js

|   |   |   +-- routing/

|   |   |   |   +-- ProtectedRoute.js

|   |   |   +-- student/

|   |   |       +-- QuizView.js

|   |   |       +-- StudentProgressChart.js

|   |   |

|   |   +-- context/

|   |   |   +-- AuthContext.js

|   |   |

|   |   +-- pages/

|   |   |   +-- InstructorDashboard.js

|   |   |   +-- LoginPage.js

|   |   |   +-- StudentDashboard.js

|   |   |

|   |   +-- utils/

|   |   |   +-- api.js

|   |   |

|   |   +-- App.js

|   |   +-- index.css

|   |   +-- index.js

|   |

|   +-- .env

|   +-- package.json

|   +-- package-lock.json

|

+-- .gitignore

+-- README.md



## How to Run This Project Locally

Follow these steps to set up and run the project on your local machine.

### Prerequisites

* **Node.js (v16+):** [Download here](https://nodejs.org/)
* **Git:** [Download here](https://git-scm.com/downloads/)
* **MongoDB Atlas Account:** A free MongoDB cluster is required.
    1.  Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    2.  Create a database user and note down the **username** and **password**.
    3.  Whitelist your IP address (use `0.0.0.0/0` for "Allow Access From Anywhere" during development).
    4.  Get your cluster's **Connection String**.

---

### 1. Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/vsrainbow/Adaptive-learning-App.git](https://github.com/vsrainbow/Adaptive-learning-App.git)
    cd Adaptive-learning-App
    ```

2.  **Navigate to the Backend Folder:**
    ```bash
    cd backend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Create `.env` File:**
    * Create a file named `.env` inside the `backend` folder.
    * Add your MongoDB connection string and a JWT secret:

    ```env
    # Replace with your MongoDB Atlas connection string
    MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/adaptive-db?retryWrites=true&w=majority
    
    # Pick any random, long string for your secret
    JWT_SECRET=your_super_secret_jwt_key_here_12345
    ```
    * *(Remember to replace `<username>`, `<password>`, and `<your-cluster-url>`)*

5.  **Run the Backend Server:**
    ```bash
    npm run dev
    ```
    * The server will start on `http://localhost:5001`.

---

### 2. Frontend Setup

1.  **Open a New Terminal** (backend ko chalta rehne dein).

2.  **Navigate to the Frontend Folder:**
    * From the main `Adaptive-learning-App` directory:
    ```bash
    cd frontend
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run the Frontend App:**
    ```bash
    npm start
    ```
    * The React app will automatically open in your browser at `http://localhost:3000`.

*Note: The frontend `package.json` includes a `"proxy": "http://localhost:5001"`, so all API requests from React will be correctly forwarded to your backend server.*

## How to Use the Application

1.  **Register as an Instructor:**
    * Go to `http://localhost:3000`.
    * Click "Register", fill in your details, and select the **`instructor`** role.
2.  **Create Content (VERY IMPORTANT):**
    * As the instructor, go to the "Content Management" tab.
    * **Step A:** Create at least one **Topic** (e.g., Name: "Algebra Basics", Order: 1).
    * **Step B:** Create at least one **Question** for that topic with **Difficulty Level 1**.
    * *(The quiz will fail to start if there is no content for a student to begin with).*
3.  **Register as a Student:**
    * Log out of the instructor account.
    * Register a new user and select the **`student`** role.
4.  **Take a Quiz:**
    * As the student, click "Start Quiz".
    * The engine will serve you the "Algebra Basics" (Order 1) topic's Difficulty 1 question.
    * As you answer correctly, the difficulty will increase.
5.  **Check Analytics:**
    * Log back into your instructor account and view the "Student Analytics" tab to see the student's progress.
