import React, { useState,useEffect } from 'react';
import ReactDOM from 'react-dom';

const ProfileDropdown = ({ currentUser, onLogout, onClose, onProfileUpdate}) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: currentUser.username,
    email: currentUser.email || '',
    avatar: currentUser.avatar
  });
  const fileInputRef = React.useRef(null);

 

  // Helper function to convert relative path to full URL
  const getFullImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/48';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return `${imagePath}?cache=${Date.now()}`;
  }
  const api = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const origin = api.replace(/\/api$/, '');
  return `${origin}${imagePath}?cache=${Date.now()}`;
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowEditProfile(false);
        onClose();
        // Reload page to show updated profile picture everywhere
        window.location.reload();
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return(

    <div className="absolute right-0 top-12 w-72 bg-[#1E1E1E] rounded-xl shadow-2xl z-[1000] animate-fade-in border border-gray-700">


      {!showEditProfile ? (
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/20">
            <img
              src={getFullImageUrl(currentUser.avatar)}
              alt={currentUser.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-white drop-shadow">{currentUser.username}</h3>
              <p className="text-sm text-white/80">{currentUser.email || 'No email provided'}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-gray-700">Edit Profile</span>
            </button>


            <div className="border-t border-white/20 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
            <button
              onClick={() => setShowEditProfile(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors duration-200 text-white"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar picker */}
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  try {
                    const token = localStorage.getItem('token');
                    const form = new FormData();
                    form.append('avatar', file);
                    const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/users/avatar', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: form
                    });
                    const data = await res.json();
                    if (data.success) {
                      const url = data.data?.user?.avatar;
                      if (url) {
                        setProfileData(prev => ({ ...prev, avatar: url }));
                      }
                    }
                  } catch (err) {
                    console.error('Avatar upload failed', err);
                  } finally {
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="relative"
                title="Change profile picture"
              >
                <img src={getFullImageUrl(profileData.avatar)} alt="avatar" className="w-12 h-12 rounded-full object-cover border bg-gray-100" />
                <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-xs px-1 rounded">Edit</span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    
  );
};

export default ProfileDropdown;