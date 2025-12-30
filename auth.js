// ==================== Authentication System ====================
// Manages user login, signup, validation, and session management

class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
  }

  // Load all registered users from localStorage
  loadUsers() {
    const stored = localStorage.getItem('healthconnect_users');
    return stored ? JSON.parse(stored) : [];
  }

  // Load current logged-in user
  loadCurrentUser() {
    const stored = localStorage.getItem('healthconnect_currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  // Save all users to localStorage
  saveUsers() {
    localStorage.setItem('healthconnect_users', JSON.stringify(this.users));
  }

  // Save current user session
  saveCurrentUser(user) {
    localStorage.setItem('healthconnect_currentUser', JSON.stringify(user));
    this.currentUser = user;
  }

  // Clear current user session (logout)
  logout() {
    localStorage.removeItem('healthconnect_currentUser');
    this.currentUser = null;
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password (minimum 8 characters)
  isValidPassword(password) {
    return password && password.length >= 8;
  }

  // Check if email already exists
  emailExists(email) {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Check if username exists
  usernameExists(username) {
    return this.users.some(user => user.username && user.username.toLowerCase() === username.toLowerCase());
  }

  // Validate login credentials
  validateLogin(emailOrUsername, password) {
    const errors = [];

    if (!emailOrUsername || emailOrUsername.trim() === '') {
      errors.push('Email or username is required');
    }

    if (!password || password === '') {
      errors.push('Password is required');
    }

    return errors;
  }

  // Find user by email or username
  findUser(emailOrUsername) {
    const searchTerm = emailOrUsername.toLowerCase();
    return this.users.find(user => 
      user.email.toLowerCase() === searchTerm || 
      (user.username && user.username.toLowerCase() === searchTerm)
    );
  }

  // Authenticate user login
  login(emailOrUsername, password) {
    const user = this.findUser(emailOrUsername);

    if (!user) {
      return {
        success: false,
        message: 'User not found. Please check your email or sign up.'
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please try again.'
      };
    }

    // Create session user object (don't store password in session)
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      loginTime: new Date().toISOString()
    };

    this.saveCurrentUser(sessionUser);

    return {
      success: true,
      message: 'Login successful!',
      user: sessionUser
    };
  }

  // Validate signup inputs
  validateSignup(name, email, password, confirmPassword) {
    const errors = {};

    // Name validation
    if (!name || name.trim() === '') {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    } else if (this.emailExists(email)) {
      errors.email = 'Email already registered. Try logging in.';
    }

    // Password validation
    if (!password || password === '') {
      errors.password = 'Password is required';
    } else if (!this.isValidPassword(password)) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword || confirmPassword === '') {
      errors.confirm = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }

    return errors;
  }

  // Create new user account
  signup(name, email, password, confirmPassword) {
    const errors = this.validateSignup(name, email, password, confirmPassword);

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors: errors
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: email.toLowerCase().trim().split('@')[0], // username based on email
      password: password, // In production, this should be hashed
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    return {
      success: true,
      message: 'Account created successfully! Redirecting to login...',
      user: newUser
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }
}

// ==================== Initialize and Setup ====================

// Create global auth instance
const auth = new AuthSystem();

// Auto-redirect if already logged in (on login/signup pages)
function checkAuthOnPageLoad() {
  const currentPage = window.location.pathname;
  
  // Only redirect if on login/signup pages AND already authenticated
  if ((currentPage.includes('index.html') || currentPage.includes('signup.html')) && auth.isAuthenticated()) {
    window.location.href = 'welcome.html';
  }
}

// Redirect to login if not authenticated (on protected pages)
function requireAuth() {
  if (!auth.isAuthenticated()) {
    window.location.href = 'index.html';
  }
}

// Don't auto-redirect - let each page handle it manually
// This prevents redirect loops

// ==================== Login Form Handling ====================

const loginForm = document.getElementById('form-login');
if (loginForm) {
  loginForm.addEventListener('submit', handleLoginSubmit);
}

function handleLoginSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const statusDiv = document.getElementById('loginStatus');

  // Clear previous errors
  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validate inputs
  const validationErrors = auth.validateLogin(email, password);
  if (validationErrors.length > 0) {
    showError('login-email', validationErrors[0]);
    statusDiv.textContent = validationErrors[0];
    statusDiv.classList.add('show');
    return;
  }

  // Attempt login
  const result = auth.login(email, password);

  if (result.success) {
    statusDiv.textContent = result.message;
    statusDiv.classList.add('show', 'success');
    loginForm.classList.add('loading');
    
    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 1000);
  } else {
    statusDiv.textContent = result.message;
    statusDiv.classList.add('show');
    showError('login-email', result.message);
  }
}

// ==================== Signup Form Handling ====================

const signupForm = document.getElementById('form-signup');
if (signupForm) {
  signupForm.addEventListener('submit', handleSignupSubmit);
}

function handleSignupSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm');
  const statusDiv = document.getElementById('signupStatus');

  // Clear previous errors
  clearErrors();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  // Attempt signup
  const result = auth.signup(name, email, password, confirm);

  if (result.success) {
    statusDiv.textContent = result.message;
    statusDiv.classList.add('show', 'success');
    signupForm.classList.add('loading');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } else {
    // Show errors for each field
    if (result.errors.name) {
      showError('signup-name', result.errors.name);
    }
    if (result.errors.email) {
      showError('signup-email', result.errors.email);
    }
    if (result.errors.password) {
      showError('signup-password', result.errors.password);
    }
    if (result.errors.confirm) {
      showError('signup-confirm', result.errors.confirm);
    }

    statusDiv.textContent = 'Please fix the errors above';
    statusDiv.classList.add('show');
  }
}

// ==================== Toggle Login/Signup ====================

const toggleToSignup = document.getElementById('toggleToSignup');
const toggleToLogin = document.getElementById('toggleToLogin');
const loginFormDiv = document.getElementById('loginForm');
const signupFormDiv = document.getElementById('signupForm');

if (toggleToSignup) {
  toggleToSignup.addEventListener('click', () => {
    clearErrors();
    loginFormDiv.style.display = 'none';
    signupFormDiv.style.display = 'block';
  });
}

if (toggleToLogin) {
  toggleToLogin.addEventListener('click', () => {
    clearErrors();
    signupFormDiv.style.display = 'none';
    loginFormDiv.style.display = 'block';
  });
}

// ==================== Utility Functions ====================

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorDiv = input.nextElementSibling;

  if (input && errorDiv && errorDiv.classList.contains('error-message')) {
    input.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
  }
}

function clearErrors() {
  const inputs = document.querySelectorAll('.form-group input');
  inputs.forEach(input => {
    input.classList.remove('error');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
      errorDiv.classList.remove('show');
      errorDiv.textContent = '';
    }
  });

  const statusDivs = document.querySelectorAll('.form-status');
  statusDivs.forEach(div => {
    div.classList.remove('show', 'success');
    div.textContent = '';
  });
}

// Clear errors on input
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('form-group input') || e.target.parentElement?.classList.contains('form-group')) {
    const input = e.target.tagName === 'INPUT' ? e.target : e.target;
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
      input.classList.remove('error');
      errorDiv.classList.remove('show');
    }
  }
});

// Clear errors when input changes
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', function() {
    this.classList.remove('error');
    const errorDiv = this.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
      errorDiv.classList.remove('show');
    }
  });
});

// Add logout functionality
function logout() {
  auth.logout();
  window.location.href = 'index.html';
}
