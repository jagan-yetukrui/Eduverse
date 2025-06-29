import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for user registration
export const signupUser = createAsyncThunk(
  'user/signupUser',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('/api/register', userData);
      return response.data; // Return the user data if successful
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data); // Return error if failed
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginData, thunkAPI) => {
    try {
      const response = await axios.post('/api/login', loginData);
      return response.data; // Return user info on successful login
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data); // Handle errors
    }
  }
);

const initialState = {
  userList: [
    {
      firstname: '',
      lastname: '',
      bio: '',
      education: [],
      experience: [],
      skills: [],
      projects: [],
      group_involvements: [],
      languages: [],
      college_works: [],
      profile_visible: true,
    },
  ],
  loading: false,   // Added loading state
  error: null,      // Added error state
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set profile data
    profileRedux: (state, action) => {
      state.userList = [action.payload];
    },
    
    // Additional reducers for profile updates (as in your original code)
    AddskillRedux: (state, action) => {
      state.userList[0].skills.push(action.payload);
    },
    AddeduRedux: (state, action) => {
      state.userList[0].education.push(action.payload);
    },
    AddexpRedux: (state, action) => {
      state.userList[0].experience.push(action.payload);
    },
    AddprojectRedux: (state, action) => {
      state.userList[0].projects.push(action.payload);
    },
    AddgroupRedux: (state, action) => {
      state.userList[0].group_involvements.push(action.payload);
    },
    AddlanguageRedux: (state, action) => {
      state.userList[0].languages.push(action.payload);
    },
    AddcollegeRedux: (state, action) => {
      state.userList[0].college_works.push(action.payload);
    },
    imageRedux: (state, action) => {
      state.userList[0].image = action.payload;
    },
    deleteSkillRedux: (state, action) => {
      state.userList[0].skills = state.userList[0].skills.filter(skill => skill !== action.payload);
    },
    deleteEduRedux: (state, action) => {
      state.userList[0].education = state.userList[0].education.filter(edu => edu.degree !== action.payload.degree);
    },
    deleteExpRedux: (state, action) => {
      state.userList[0].experience = state.userList[0].experience.filter(exp => exp.title !== action.payload.title);
    },
    deleteProjectRedux: (state, action) => {
      state.userList[0].projects = state.userList[0].projects.filter(project => project.title !== action.payload.title);
    },
    deleteGroupRedux: (state, action) => {
      state.userList[0].group_involvements = state.userList[0].group_involvements.filter(group => group.name !== action.payload.name);
    },
    deleteLanguageRedux: (state, action) => {
      state.userList[0].languages = state.userList[0].languages.filter(lang => lang !== action.payload);
    },
    deleteCollegeRedux: (state, action) => {
      state.userList[0].college_works = state.userList[0].college_works.filter(work => work !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle user registration
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = [action.payload]; // Replace user data on successful registration
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle user login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = [action.payload]; // Update user data on successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Exporting actions
export const {
  profileRedux,
  AddskillRedux,
  AddeduRedux,
  AddexpRedux,
  AddprojectRedux,
  AddgroupRedux,
  AddlanguageRedux,
  AddcollegeRedux,
  imageRedux,
  deleteSkillRedux,
  deleteEduRedux,
  deleteExpRedux,
  deleteProjectRedux,
  deleteGroupRedux,
  deleteLanguageRedux,
  deleteCollegeRedux,
} = userSlice.actions;

// Exporting the reducer as default
export default userSlice.reducer;
