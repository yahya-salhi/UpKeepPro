# 🤖 Offline AI Chatbot for User Data Queries

A fully offline AI chatbot that can answer questions about your app's user data using TinyLlama via Ollama, integrated with your existing UpKeepPro application.

## 🚀 Features

- **Completely Offline**: Works without internet connection once set up
- **Natural Language Queries**: Ask questions like "How many users are in my app?"
- **Real-time Data**: Queries live MongoDB data
- **TinyLlama Integration**: Uses local AI via Ollama
- **User-friendly Interface**: Clean React UI integrated with your existing app
- **Smart Query Parsing**: Understands various question formats

## 📋 Prerequisites

Before running the chatbot, ensure you have:

1. **Node.js** (v16+)
2. **MongoDB** (v5+) - running locally
3. **Ollama** - for running TinyLlama locally

## 🛠️ Setup Instructions

### 1. Install Ollama and TinyLlama

```bash
# Install Ollama (visit https://ollama.ai for platform-specific instructions)
# For Windows: Download from https://ollama.ai/download/windows
# For macOS: Download from https://ollama.ai/download/mac
# For Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Pull TinyLlama model
ollama pull tinyllama
```

### 2. Start Ollama Service

```bash
# Start Ollama service (usually runs on http://localhost:11434)
ollama serve
```

### 3. Verify Ollama is Running

```bash
# Test if Ollama is working
curl http://localhost:11434/api/version
```

### 4. Start Your Application

```bash
# Backend (from root directory)
npm run dev

# Frontend (from frontend directory)
cd frontend
npm run dev
```

## 🎯 Usage Examples

Once the application is running, navigate to the **AI Chat** section in your sidebar and try these questions:

### Basic User Queries

- "How many users are in my app?" → **📊 User Count**: There are currently **12** users in your application.
- "How many users are online?" → **🟢 Online Users**: **3** users are currently online and active.
- "How many users are available?" → **✅ Available Users**: **8** users are currently marked as available.

### Role-based Queries

- "How many admin users do we have?" → **👥 Users by Role**: There are **2** users with the "admin" role.
- "Show me users by role" → **👥 Role Distribution**:
  • **REPI**: 5 users
  • **CC**: 3 users
  • **RM**: 2 users

### Grade/Department Queries

- "How many users are in engineering?" → **📍 Users by Location**: There are **4** users in "engineering".
- "Show me user distribution by grade" → **📍 Grade/Department Distribution**:
  • **Engineering**: 4 users
  • **Management**: 3 users
  • **Operations**: 5 users

### 🎨 **New Features**

- **Clean Responses**: No more messy JSON data - responses are formatted beautifully
- **Smart Separation**: User data queries are handled separately from ISO21001 queries
- **Visual Indicators**: Green badges show when you're getting user data vs. educational content
- **Markdown Formatting**: Bold text and proper formatting for easy reading

## 🔧 Technical Implementation

### Backend Components

1. **UserQueryService** (`backend/services/userQuery.service.js`)

   - Parses natural language questions
   - Executes MongoDB queries
   - Generates enhanced prompts for AI

2. **Enhanced Chatbot Controller** (`backend/controllers/chatbot.controller.js`)

   - Integrates user data queries with existing ISO21001 chatbot
   - Routes questions to appropriate services

3. **User Stats Endpoint** (`/api/users/stats`)
   - Provides comprehensive user statistics
   - Real-time data from MongoDB

### Frontend Components

1. **UserDataChatbot** (`frontend/src/components/UserDataChatbot.jsx`)

   - Clean chat interface
   - Suggested questions
   - Real-time responses

2. **AIChat Page** (`frontend/src/pages/AIChat.jsx`)
   - Full-page AI assistant interface
   - Feature overview cards
   - Integrated with existing UI theme

## 🗄️ Database Schema

The chatbot works with your existing User model:

```javascript
{
  username: String,
  email: String,
  role: String, // CC, REPI, RM, FORM, RLOG, CAR, REP
  grade: String, // Used for department/location queries
  isOnline: Boolean,
  availability: String, // available, unavailable
  // ... other existing fields
}
```

## 🔍 Query Processing Flow

1. **User Input**: User types a question in natural language
2. **Query Detection**: System detects if it's a user data query
3. **Query Parsing**: Extract intent and parameters from the question
4. **MongoDB Query**: Execute appropriate database query
5. **Context Generation**: Create enhanced prompt with data context
6. **AI Processing**: Send to TinyLlama via Ollama
7. **Response**: Return formatted answer to user

## 🛡️ Privacy & Security

- **Completely Offline**: No data leaves your local environment
- **No External APIs**: Uses only local TinyLlama model
- **Secure**: Respects existing authentication and authorization
- **GDPR Compliant**: No chat history stored (as per ISO21001 requirements)

## 🚨 Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Restart Ollama service
ollama serve
```

### TinyLlama Model Issues

```bash
# Re-pull the model
ollama pull tinyllama

# List available models
ollama list
```

### Backend API Issues

```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/users/stats

# Check MongoDB connection in backend logs
```

## 📊 Supported Query Types

| Query Type      | Example                 | MongoDB Query                                      |
| --------------- | ----------------------- | -------------------------------------------------- |
| Total Users     | "How many users?"       | `User.countDocuments()`                            |
| Online Users    | "Users online?"         | `User.countDocuments({isOnline: true})`            |
| Available Users | "Available users?"      | `User.countDocuments({availability: "available"})` |
| Role-based      | "How many admins?"      | `User.countDocuments({role: /admin/i})`            |
| Grade-based     | "Users in engineering?" | `User.countDocuments({grade: /engineering/i})`     |

## 🔄 Integration with Existing Features

The AI chatbot seamlessly integrates with your existing:

- **Authentication system**: Respects user login status
- **Theme system**: Supports dark/light mode
- **Navigation**: Added to sidebar under "Apps"
- **ISO21001 chatbot**: Works alongside existing AI features

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Matches your app's theme
- **Suggested Questions**: Helps users get started
- **Real-time Typing**: Shows AI thinking status
- **Data Context Display**: Shows query results metadata
- **Professional Styling**: Consistent with UpKeepPro design

## 📈 Future Enhancements

Potential improvements you could add:

- Voice input/output
- Chart generation from data
- Export query results
- Scheduled reports
- Multi-language support
- Custom query templates

---

**🎉 Your offline AI chatbot is now ready to answer questions about your user data!**

Navigate to `/ai-chat` in your application or click "ai-chat" in the sidebar to start using it.
