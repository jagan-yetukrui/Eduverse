import { createSlice } from '@reduxjs/toolkit';

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
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set profile data
    profileRedux: (state, action) => {
      state.userList = [action.payload]; 
    },

    // Add a new skill to the profile
    AddskillRedux: (state, action) => {
      state.userList[0].skills.push(action.payload);
    },

    // Add a new education entry to the profile
    AddeduRedux: (state, action) => {
      state.userList[0].education.push(action.payload);
    },

    // Add a new experience entry to the profile
    AddexpRedux: (state, action) => {
      state.userList[0].experience.push(action.payload);
    },

    // Add a new project entry to the profile
    AddprojectRedux: (state, action) => {
      state.userList[0].projects.push(action.payload);
    },

    // Add a new group involvement to the profile
    AddgroupRedux: (state, action) => {
      state.userList[0].group_involvements.push(action.payload);
    },

    // Add a new language to the profile
    AddlanguageRedux: (state, action) => {
      state.userList[0].languages.push(action.payload);
    },

    // Add a new college work entry to the profile
    AddcollegeRedux: (state, action) => {
      state.userList[0].college_works.push(action.payload);
    },

    // Update profile image
    imageRedux: (state, action) => {
      state.userList[0].image = action.payload;
    },

    // Delete a skill from the profile
    deleteSkillRedux: (state, action) => {
      state.userList[0].skills = state.userList[0].skills.filter(
        (skill) => skill !== action.payload
      );
    },

    // Delete an education entry from the profile
    deleteEduRedux: (state, action) => {
      state.userList[0].education = state.userList[0].education.filter(
        (edu) => edu.degree !== action.payload.degree
      );
    },

    // Delete an experience entry from the profile
    deleteExpRedux: (state, action) => {
      state.userList[0].experience = state.userList[0].experience.filter(
        (exp) => exp.title !== action.payload.title
      );
    },

    // Delete a project entry from the profile
    deleteProjectRedux: (state, action) => {
      state.userList[0].projects = state.userList[0].projects.filter(
        (project) => project.title !== action.payload.title
      );
    },

    // Delete a group involvement entry from the profile
    deleteGroupRedux: (state, action) => {
      state.userList[0].group_involvements = state.userList[0].group_involvements.filter(
        (group) => group.name !== action.payload.name
      );
    },

    // Delete a language entry from the profile
    deleteLanguageRedux: (state, action) => {
      state.userList[0].languages = state.userList[0].languages.filter(
        (lang) => lang !== action.payload
      );
    },

    // Delete a college work entry from the profile
    deleteCollegeRedux: (state, action) => {
      state.userList[0].college_works = state.userList[0].college_works.filter(
        (work) => work !== action.payload
      );
    },
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
