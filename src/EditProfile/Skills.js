import React, { useState } from 'react';
import './Skills.css';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  skill: yup.string().required('Skill is required'),
});

const Skills = () => {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { skill: '' },
  });
  const [skills, setSkills] = useState([]);

  const onSubmit = (data) => {
    setSkills((prevSkills) => [...prevSkills, data.skill]);
    reset();
  };

  const handleDeleteSkill = (index) => {
    setSkills((prevSkills) => prevSkills.filter((_, i) => i !== index));
  };

  return (
    <div className="skills-container">
      <h2>Skills</h2>

      {/* Form to add new skills */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
          <label>Skill</label>
          <Controller
            name="skill"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input {...field} placeholder="Enter a skill" />
                {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>
        <button type="submit" className="add-button">
          Add Skill
        </button>
      </form>

      {/* Display list of skills */}
      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <span>{skill}</span>
            <button className="delete-button" onClick={() => handleDeleteSkill(index)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
