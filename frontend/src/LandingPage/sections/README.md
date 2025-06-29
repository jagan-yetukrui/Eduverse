# Landing Page Sections

This directory contains the modular sections that compose the EduVerse landing page.

## Components

### Statterpage.js

- **Purpose**: Hero section with animated headline and bio
- **Features**: Scroll-triggered animations, SVG line morphing, responsive design
- **Dependencies**: Framer Motion, GSAP

### FeaturesSection.js

- **Purpose**: "Why EduVerse" features showcase with four key value propositions
- **Features**:
  - Glassmorphism cards with hover effects
  - Scroll-triggered entrance animations
  - Responsive grid layout (4 columns → 2x2 → 1 column)
  - Custom SVG icons for each feature
  - Animated background line
- **Dependencies**: Framer Motion
- **Content**:
  1. **AI Project Guidance**: Get matched to projects that fit your skills, interests, and goals—instantly.
  2. **Skill Validation**: Build a portfolio of real, verifiable work—no fake certificates.
  3. **Peer Collaboration**: Find collaborators, form teams, and grow together on real-world projects.
  4. **Personalized Path**: Your journey, your way: every experience is uniquely tailored for you.

## Design System

### Glassmorphism Effects

- Background: `rgba(255, 255, 255, 0.13)`
- Backdrop filter: `blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Box shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`

### Typography

- **Primary Font**: Space Grotesk
- **Fallback**: General Sans
- **Headlines**: 700 weight, negative letter-spacing
- **Body**: 400 weight, optimized line-height

### Animations

- **Entrance**: Fade in + slide up with stagger
- **Hover**: Scale + lift with enhanced shadows
- **Icons**: Scale and opacity changes on hover
- **Background**: Animated SVG lines with scroll triggers

### Responsive Breakpoints

- **Desktop**: 4-column grid, left-aligned text
- **Tablet (1200px)**: 2x2 grid, centered text
- **Mobile (900px)**: Single column, centered layout
- **Small Mobile (480px)**: Optimized spacing and typography

## Usage

```jsx
import FeaturesSection from "../LandingPage/sections/FeaturesSection";

// In your landing page component
<div className="landing-page">
  <Statterpage />
  <FeaturesSection />
  {/* Other sections */}
</div>;
```

## Customization

### Adding New Features

1. Add feature object to the `features` array in `FeaturesSection.js`
2. Include title, description, and custom SVG icon
3. Animations and styling will be applied automatically

### Modifying Animations

- Edit `containerVariants`, `cardVariants`, and `textVariants` in the component
- Adjust timing and easing functions as needed
- Use Framer Motion's `useInView` hook for scroll triggers

### Styling Changes

- Modify `FeaturesSection.css` for visual updates
- Glassmorphism effects are defined in `.feature-card`
- Responsive breakpoints are clearly marked in media queries

## Performance Notes

- Uses `useInView` with `once: true` for optimal performance
- SVG icons are inline for fast loading
- Animations are hardware-accelerated via CSS transforms
- Lazy loading ready for future optimization
