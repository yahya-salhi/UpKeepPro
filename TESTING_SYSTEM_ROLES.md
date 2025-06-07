# Testing System - Role-Based Access Control

## 🎯 Overview

The testing system now implements strict role-based access control where only **STAG** (stagiaire) users can take tests, while **FORM** (formateur) users can create and manage tests.

## 👥 User Roles

### **STAG (Stagiaire) - Students**
- **Primary Role**: Take tests and view their results
- **Permissions**:
  - ✅ View available tests
  - ✅ Take published tests
  - ✅ View their own test results
  - ✅ Access "My Results" page
  - ❌ Cannot create or edit tests
  - ❌ Cannot view other students' results

### **FORM (Formateur) - Teachers**
- **Primary Role**: Create, manage tests and monitor student performance
- **Permissions**:
  - ✅ Create and edit tests
  - ✅ Add questions to tests
  - ✅ Publish/unpublish tests
  - ✅ View all student results for their tests
  - ✅ Access results dashboard with analytics
  - ✅ Export results data
  - ❌ Cannot take tests
  - ❌ Cannot access "My Results" page

### **REPI/CC (Admins)**
- **Primary Role**: System administration
- **Permissions**:
  - ✅ All formateur permissions
  - ✅ Create user accounts
  - ✅ Manage system settings
  - ✅ View all tests and results
  - ❌ Cannot take tests

## 🔐 Access Control Implementation

### **Backend Middleware**

1. **`authorizeStagiaire`** - Only stagiaires can access
   - Test taking endpoints
   - Personal results viewing

2. **`authorizeFormateur`** - Only formateurs and admins can access
   - Test creation and management
   - Results dashboard
   - Question management

3. **`authorizeStagiaireOrFormateur`** - Both roles can access
   - Individual result viewing (with ownership checks)

### **Frontend Route Protection**

```javascript
// Only stagiaires can take tests
<Route path="/tests/:testId/take" 
       element={authUser?.role === "STAG" ? <TakeTest /> : <Navigate to="/login" />} />

// Only stagiaires can view their results
<Route path="/my-results" 
       element={authUser?.role === "STAG" ? <MyResults /> : <Navigate to="/login" />} />

// Only formateurs can access results dashboard
<Route path="/test-results-dashboard" 
       element={authUser?.role === "FORM" || authUser?.isAdmin ? <TestResultsDashboard /> : <Navigate to="/login" />} />
```

## 🚀 User Experience by Role

### **Stagiaire Interface**
- **Tests Page**: Shows "Available Tests" with "Take Test" buttons
- **Sidebar**: Shows "my-results" link
- **Test Cards**: Only shows "Take Test" and "View" actions
- **Results**: Can only see their own results with detailed breakdowns

### **Formateur Interface**
- **Tests Page**: Shows "Test Management" with creation tools
- **Sidebar**: Shows "test-results-dashboard" link
- **Test Cards**: Shows "Edit", "Publish", "Delete" actions
- **Results**: Can see all student results for their tests with analytics

## 📊 API Endpoints by Role

### **Stagiaire Endpoints**
```
POST /api/tests/attempts/start/:testId     - Start test attempt
GET  /api/tests/attempts/:attemptId/questions - Get test questions
POST /api/tests/attempts/:attemptId/answer    - Submit answer
POST /api/tests/attempts/:attemptId/complete  - Complete test
GET  /api/tests/my-results                     - Get personal results
```

### **Formateur Endpoints**
```
POST /api/tests                          - Create test
PUT  /api/tests/:id                      - Update test
DELETE /api/tests/:id                    - Delete test
POST /api/tests/questions                - Create question
GET  /api/tests/formateur-results        - Get all student results
```

### **Shared Endpoints**
```
GET /api/tests                           - View tests (filtered by role)
GET /api/tests/:id                       - View test details
GET /api/tests/attempts/:attemptId       - View specific result (with ownership check)
```

## 🛡️ Security Features

1. **Server-side Validation**: All permissions checked on backend
2. **Ownership Checks**: Users can only access their own data
3. **Role Verification**: Middleware validates user roles on every request
4. **Frontend Guards**: UI elements hidden/shown based on roles
5. **Route Protection**: Unauthorized access redirects to login

## 🎓 How to Use

### **For Administrators**
1. Create STAG users for students
2. Create FORM users for teachers
3. Assign appropriate roles during user creation

### **For Formateurs**
1. Login with FORM role
2. Create tests and add questions
3. Publish tests for students
4. Monitor results via dashboard

### **For Stagiaires**
1. Login with STAG role
2. View available tests
3. Take published tests
4. Check results in "My Results"

## ⚠️ Important Notes

- **Role Changes**: Require database update and user re-login
- **Test Access**: Only published tests are available to stagiaires
- **Results Privacy**: Stagiaires can only see their own results
- **Data Isolation**: Formateurs only see results for tests they created
- **Admin Override**: REPI/CC roles have access to all features except test-taking

This role-based system ensures proper separation of concerns and maintains data privacy while providing appropriate functionality for each user type.
