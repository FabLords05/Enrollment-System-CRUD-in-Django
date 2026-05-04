import React, { useState } from 'react';
import axios from 'axios';

interface RegisterProps {
  onRegister?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '', // CHANGED: 'name' to 'full_name' to match Django model
    password: '',
    re_password: '',
  });
  
  // NEW: State for the image file
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // NEW: Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.re_password) {
      setError('Passwords do not match.');
      setTimeout(() => setLoading(false), 500);
      return;
    }

    try {
      /** 
       * CHANGED: Using FormData instead of JSON to support Image Upload
       */
      const data = new FormData();
      data.append('email', formData.email);
      data.append('full_name', formData.full_name); // Matches backend field
      data.append('password', formData.password);
      data.append('re_password', formData.re_password);
      
      if (profilePicture) {
        data.append('profile_picture', profilePicture); // Matches backend field
      }

      const response = await axios.post('http://localhost:8000/auth/users/', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Required for files
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess('Registration successful! Please check your email to activate your account.');
        setFormData({ email: '', full_name: '', password: '', re_password: '' });
        setProfilePicture(null);
        
        if (onRegister) {
          onRegister();
        }
      }
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMessages = Object.keys(errorData).map(key => {
          return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorData[key]}`;
        });
        setError(errorMessages.join(' '));
      } else {
        setError('Registration failed. Please check your backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 text-sm rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="full_name">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name" // CHANGED: match state and backend
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* NEW: Profile Picture Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="profile_picture">
              Profile Picture
            </label>
            <input
              type="file"
              id="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="re_password">
              Confirm Password
            </label>
            <input
              type="password"
              id="re_password"
              name="re_password"
              placeholder="Repeat your password"
              value={formData.re_password}
              onChange={handleInputChange}
              className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Register Account'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;