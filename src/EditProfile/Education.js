import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PlacesAutocomplete from 'react-google-places-autocomplete';
import { format } from 'date-fns';
import './Education.css';

// Define validation schema with Yup
const schema = yup.object().shape({
  education: yup.array().of(
    yup.object().shape({
      university: yup.string().required('University name is required'),
      degree: yup.string().required('Degree is required'),
      major: yup.string().required('Major is required'),
      startDate: yup.date().required('Start date is required'),
      endDate: yup.date().required('End date is required'),
      location: yup.string(),
      bio: yup.string(),
    })
  ),
});

const Education = () => {
  const { control, handleSubmit, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      education: [
        {
          university: '',
          degree: '',
          major: '',
          startDate: '',
          endDate: '',
          location: '',
          bio: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const onSubmit = (data) => {
    console.log('Submitted Data:', data);
  };

  const currentYear = new Date().getFullYear();
  const startYearOptions = Array.from(
    { length: 60 },
    (_, index) => currentYear - index
  );
  const endYearOptions = Array.from(
    { length: 10 },
    (_, index) => currentYear + index
  );

  return React.createElement(
    'div',
    { className: 'education-container' },
    React.createElement('h2', null, 'Education History'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit(onSubmit) },
      fields.map((item, index) =>
        React.createElement(
          'div',
          { key: item.id, className: 'education-item' },
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'University'),
            React.createElement(Controller, {
              name: `education[${index}].university`,
              control: control,
              render: ({ field, fieldState }) =>
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(PlacesAutocomplete, {
                    ...field,
                    selectProps: {
                      ...field,
                      placeholder: 'Type your university',
                      onChange: (val) => field.onChange(val.label),
                    },
                  }),
                  fieldState.error &&
                    React.createElement(
                      'p',
                      { className: 'error-text' },
                      fieldState.error.message
                    )
                ),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'Degree'),
            React.createElement(Controller, {
              name: `education[${index}].degree`,
              control: control,
              render: ({ field, fieldState }) =>
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement('input', {
                    ...field,
                    placeholder: 'Type your degree (e.g., B.Sc, M.A)',
                  }),
                  fieldState.error &&
                    React.createElement(
                      'p',
                      { className: 'error-text' },
                      fieldState.error.message
                    )
                ),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'Major'),
            React.createElement(Controller, {
              name: `education[${index}].major`,
              control: control,
              render: ({ field, fieldState }) =>
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement('input', {
                    ...field,
                    placeholder: 'Type your major (e.g., Computer Science)',
                  }),
                  fieldState.error &&
                    React.createElement(
                      'p',
                      { className: 'error-text' },
                      fieldState.error.message
                    )
                ),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'Start Date'),
            React.createElement(Controller, {
              name: `education[${index}].startDate`,
              control: control,
              render: ({ field, fieldState }) =>
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    'select',
                    field,
                    React.createElement('option', { value: '' }, 'Select Start Year'),
                    startYearOptions.map((year) =>
                      React.createElement(
                        'option',
                        { key: year, value: `${year}-01-01` },
                        year
                      )
                    )
                  ),
                  fieldState.error &&
                    React.createElement(
                      'p',
                      { className: 'error-text' },
                      fieldState.error.message
                    )
                ),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'End Date'),
            React.createElement(Controller, {
              name: `education[${index}].endDate`,
              control: control,
              render: ({ field, fieldState }) =>
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    'select',
                    field,
                    React.createElement('option', { value: '' }, 'Select End Year'),
                    endYearOptions.map((year) =>
                      React.createElement(
                        'option',
                        { key: year, value: `${year}-01-01` },
                        year
                      )
                    )
                  ),
                  fieldState.error &&
                    React.createElement(
                      'p',
                      { className: 'error-text' },
                      fieldState.error.message
                    )
                ),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'Location (optional)'),
            React.createElement(Controller, {
              name: `education[${index}].location`,
              control: control,
              render: ({ field }) =>
                React.createElement(PlacesAutocomplete, {
                  ...field,
                  selectProps: {
                    ...field,
                    placeholder: 'Location (optional)',
                    onChange: (val) => field.onChange(val.label),
                  },
                }),
            })
          ),
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('label', null, 'Bio/Description (optional)'),
            React.createElement(Controller, {
              name: `education[${index}].bio`,
              control: control,
              render: ({ field }) =>
                React.createElement('textarea', {
                  ...field,
                  placeholder: 'Describe your time at the university',
                }),
            })
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => remove(index),
              className: 'delete-button',
            },
            'Delete'
          )
        )
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => append({ university: '', degree: '', major: '', startDate: '', endDate: '', location: '', bio: '' }),
          className: 'add-button',
        },
        'Add Education'
      ),
      React.createElement(
        'button',
        { type: 'submit', className: 'submit-button' },
        'Save Education History'
      )
    )
  );
};

export default Education;
