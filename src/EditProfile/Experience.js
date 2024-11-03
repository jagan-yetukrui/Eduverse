import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PlacesAutocomplete from 'react-google-places-autocomplete';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import './Experience.css';

const schema = yup.object().shape({
  experiences: yup.array().of(
    yup.object().shape({
      companyName: yup.string().required('Company name is required'),
      location: yup.string().required('Location is required'),
      workMode: yup.string().required('Work mode is required'),
      startDate: yup.date().required('Start date is required'),
      endDate: yup.date().nullable(),
      currentlyWorking: yup.boolean(),
    })
  ),
});

const Experience = () => {
  const { control, handleSubmit, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      experiences: [
        {
          companyName: '',
          location: '',
          workMode: '',
          startDate: '',
          endDate: '',
          currentlyWorking: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  });

  const watchExperiences = watch('experiences');

  const onSubmit = (data) => {
    console.log('Submitted Data:', data);
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const years = differenceInYears(end, start);
    const months = differenceInMonths(end, start) % 12;
    return (
      (years > 0 ? years + ' year' + (years > 1 ? 's ' : ' ') : '') +
      (months > 0 ? months + ' month' + (months > 1 ? 's' : '') : '')
    );
  };

  return (
    <div className="experience-container">
      <h2>Professional Experience</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((item, index) => (
          <div key={item.id} className="experience-item">
            <div className="input-group">
              <label>Company Name</label>
              <Controller
                name={`experiences[${index}].companyName`}
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input {...field} placeholder="Company Name" />
                    {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div className="input-group">
              <label>Location</label>
              <Controller
                name={`experiences[${index}].location`}
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <PlacesAutocomplete
                      selectProps={{
                        ...field,
                        placeholder: 'Location',
                        onChange: (val) => field.onChange(val.label),
                      }}
                    />
                    {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div className="input-group">
              <label>Work Mode</label>
              <Controller
                name={`experiences[${index}].workMode`}
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <select {...field}>
                      <option value="">Select...</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                    {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <Controller
                name={`experiences[${index}].startDate`}
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input type="date" {...field} max={format(new Date(), 'yyyy-MM-dd')} />
                    {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>
            <div className="input-group">
              <label>
                <Controller
                  name={`experiences[${index}].currentlyWorking`}
                  control={control}
                  render={({ field }) => (
                    <input type="checkbox" {...field} checked={field.value} />
                  )}
                />
                Currently Working Here
              </label>
            </div>
            {!watchExperiences[index].currentlyWorking && (
              <div className="input-group">
                <label>End Date</label>
                <Controller
                  name={`experiences[${index}].endDate`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        type="date"
                        {...field}
                        min={watchExperiences[index].startDate}
                        max={format(new Date(), 'yyyy-MM-dd')}
                      />
                      {fieldState.error && <p className="error-text">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>
            )}
            <div className="duration">
              Duration:{' '}
              {calculateDuration(
                watchExperiences[index].startDate,
                watchExperiences[index].currentlyWorking ? null : watchExperiences[index].endDate
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            append({
              companyName: '',
              location: '',
              workMode: '',
              startDate: '',
              endDate: '',
              currentlyWorking: false,
            })
          }
        >
          Add Experience
        </button>
        <button type="submit" className="submit-button">
          Save Experiences
        </button>
      </form>
    </div>
  );
};

export default Experience;
