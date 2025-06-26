// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// const ProfileContext = createContext();

// export const ProfileProvider = ({ children }) => {
//   const [profile, setProfile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await axios.get('/api/profiles/me/', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setProfile(response.data);
//       localStorage.setItem('profile', JSON.stringify(response.data));
//     } catch (error) {
//       setError(error.response?.data?.detail || 'Failed to fetch profile');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateProfile = async (updatedData) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put('/api/profiles/me/', updatedData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setProfile(response.data);
//       localStorage.setItem('profile', JSON.stringify(response.data));
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   return (
//     <ProfileContext.Provider value={{ 
//       profile, 
//       setProfile, 
//       isLoading, 
//       error, 
//       fetchProfile,
//       updateProfile 
//     }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };

// export const useProfile = () => useContext(ProfileContext); 

// context/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileService } from '../services/profileService';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from the service
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      localStorage.setItem('profile', JSON.stringify(data)); // optional cache
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile via service
  const updateProfile = async (updatedData) => {
    try {
      const data = await profileService.updateProfile(updatedData);
      setProfile(data);
      localStorage.setItem('profile', JSON.stringify(data));
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Load profile on mount
  // useEffect(() => {
  //   fetchProfile();
  // }, []);
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !profile) {
      fetchProfile();
    } else {
      setIsLoading(false); // stop loading if not logged in
    }
  }, [profile]);


  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        isLoading,
        error,
        fetchProfile,
        updateProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
