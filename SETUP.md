# Quick Setup Guide

## Fix: MongoDB Connection Error

The 500 error on admin login is because MongoDB is not running. Here are your options:

### Option 1: Install MongoDB Locally (Recommended for Development)

**Ubuntu/Debian:**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify it's running
sudo systemctl status mongodb
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_safety_hub
   ```

### Option 3: Use Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After MongoDB is Running

1. **Seed the database** (creates admin user):
   ```bash
   cd server
   npm run seed
   ```

2. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

3. **Login with**:
   - Username: `admin`
   - Password: `admin123`

## Verify MongoDB Connection

Test if MongoDB is accessible:
```bash
mongosh mongodb://localhost:27017/campus_safety_hub
```

Or check if the port is open:
```bash
netstat -an | grep 27017
# or
lsof -i :27017
```

