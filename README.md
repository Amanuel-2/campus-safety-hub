# Campus Safety Hub 🛡️

A comprehensive campus safety management platform built with the MERN stack. Report incidents, manage lost & found items, and visualize safety data on an interactive map.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **🚨 Incident Reporting** - Report safety concerns, suspicious activities, theft, and emergencies
- **🔍 Lost & Found** - Report lost items or browse found items with contact information
- **🗺️ Interactive Map** - View all incidents and lost items on an OpenStreetMap-powered map
- **👨‍💼 Admin Dashboard** - Manage reports, update statuses, and oversee campus safety
- **🔐 Secure Authentication** - JWT-based admin authentication
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet / React-Leaflet** - Interactive maps
- **Vite** - Build tool

### Backend
- **Express 5** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/campus_safety_hub.git
cd campus_safety_hub
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_safety_hub
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- Default admin account (username: `admin`, password: `admin123`)
- Sample incidents and lost items

### 5. Start the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

### Incidents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/incidents` | Get all incidents | No |
| GET | `/api/incidents/:id` | Get single incident | No |
| POST | `/api/incidents` | Create incident | No |
| PATCH | `/api/incidents/:id` | Update incident status | Yes |
| DELETE | `/api/incidents/:id` | Delete incident | Yes |

### Lost Items

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/lost-items` | Get all items | No |
| GET | `/api/lost-items/:id` | Get single item | No |
| POST | `/api/lost-items` | Create item | No |
| PATCH | `/api/lost-items/:id` | Update item status | Yes |
| DELETE | `/api/lost-items/:id` | Delete item | Yes |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/register` | Register new admin |

## Project Structure

```
campus_safety_hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Global styles
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── index.js           # Server entry point
│   ├── seed.js            # Database seeder
│   └── package.json
│
└── README.md
```

## Usage

### Reporting an Incident

1. Navigate to "Report Incident" from the home page
2. Fill in the incident details (title, type, severity, description)
3. Click on the map to mark the location
4. Choose to report anonymously or provide contact info
5. Submit the report

### Lost & Found

1. Navigate to "Lost & Found" from the home page
2. **Browse Items**: Search and filter existing items
3. **Report Item**: Submit a lost or found item with details

### Admin Dashboard

1. Navigate to "Admin" and log in (default: admin/admin123)
2. View statistics and recent reports
3. Update incident/item statuses using dropdowns
4. Delete resolved or invalid reports

### Map View

1. Navigate to "Map View" to see all reports on a map
2. Toggle layers to show/hide incidents or lost items
3. Click markers to view details
4. View recent activity in the sidebar

## Customization

### Campus Coordinates

Update the default map center in `MapPicker.jsx` and `MapView.jsx`:

```javascript
const defaultCenter = [YOUR_LAT, YOUR_LNG];
```

### Styling

The application uses CSS variables for theming. Modify `index.css`:

```css
:root {
  --accent-primary: #ff6b35;    /* Primary accent color */
  --accent-secondary: #4ecdc4;  /* Secondary accent color */
  --bg-primary: #0a0a0f;        /* Main background */
  /* ... other variables */
}
```

## Security Considerations

For production deployment:

1. Use a strong `JWT_SECRET`
2. Set up HTTPS
3. Configure CORS properly
4. Remove the `/api/auth/register` endpoint or protect it
5. Add rate limiting
6. Implement input sanitization

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for campus safety

