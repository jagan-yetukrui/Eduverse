# Statterpage Component

A modern, animated hero section component for the EduVerse landing page featuring scroll-based animations and interactive elements. **Now integrated into the main Home.js component with conditional navigation.**

## Features

### 🎯 Big Animated Headline

- **"Welcome to"** appears first with a subtle fade-in animation
- **"EduVerse"** animates in with a spring effect and scale animation
- Uses modern fonts (Inter and Space Grotesk)
- Responsive typography that scales beautifully across devices

### 📜 Scroll-Based Bio Reveal

- Bio text fades in as user scrolls down (30-40% scroll progress)
- Smooth opacity transitions using Framer Motion
- "About Us" button appears with scale animation
- All elements are perfectly timed for optimal user experience

### 🎨 Animated Moving Line

- Fluid SVG line that morphs and animates based on scroll position
- Organic wave-like movements using sine and cosine functions
- GSAP-powered animations with ScrollTrigger
- Gradient stroke with beautiful color transitions

### 📱 Responsive & Futuristic Design

- Full-screen hero section on desktop
- Centered layout on mobile devices
- Soft gradients and glass morphism effects
- Smooth animations that perform well across devices

## Navigation System

### Conditional Navigation

The component now includes a sophisticated navigation system:

- **Unauthenticated Users**: See `LandingHeader` with logo and Login/Register buttons
- **Authenticated Users**: See full `Navbar` with complete navigation options

## Files Structure

```
LandingPage/
├── sections/
│   ├── Statterpage.js      # Main component
│   └── Statterpage.css     # Component styles
Navbar/
├── LandingHeader.js        # Minimal header for landing page
├── LandingHeader.css       # Landing header styles
├── Navbar.js              # Full navigation for authenticated users
└── Navbar.css             # Navbar styles
└── README.md              # This file
```

## Integration

The Statterpage component is now **integrated into the main Home.js** component and will automatically display for non-authenticated users visiting the home page.

### How it works:

- **Non-authenticated users**: See the full Statterpage hero section with LandingHeader
- **Authenticated users**: See the regular feed teaser section with full Navbar
- **Seamless integration**: No additional setup required

## Usage

The component is automatically used in `Home.js`:

```jsx
// In Home.js - automatically imported and used
import Statterpage from "../LandingPage/sections/Statterpage";
import LandingHeader from "../Navbar/LandingHeader";
import Navbar from "../Navbar/Navbar";

// Used in the renderContent function for non-authenticated users
{
  !isAuthenticated ? (
    <div className="landing-page">
      <LandingHeader />
      <Statterpage />
      <section className="ai-status-section">
        {/* Additional content */}
      </section>
    </div>
  ) : (
    // Authenticated user content with Navbar
    <div>
      <Navbar />
      {/* Feed teaser section */}
    </div>
  );
}
```

## Dependencies

- **Framer Motion** - For text and button animations
- **GSAP** - For SVG line animations and ScrollTrigger
- **React Router** - For navigation
- **React** - Core framework

## Customization

### Colors

The component uses a clean white background with black text. You can customize colors in `Statterpage.css`:

```css
.statterpage-container {
  background: #ffffff;
  color: #000000;
}
```

### Text Content

Update the headline and bio text in `Statterpage.js`:

```jsx
<motion.div className="welcome-text">Welcome to</motion.div>
<motion.div className="eduverse-text">
  {splitText("EduVerse")}
</motion.div>

<p className="bio-text">
  AI-powered project mentorship for the next generation of creators and innovators.
</p>
```

### Animation Timing

Adjust animation delays and durations in the component:

```jsx
transition={{ duration: 0.8, delay: 0.2 }}
```

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Requires JavaScript for animations
- Graceful degradation for older browsers

## Performance

- Uses `useCallback` and `useMemo` for optimization
- GSAP ScrollTrigger is properly cleaned up on unmount
- CSS animations are hardware-accelerated
- Responsive images and optimized fonts

## Accessibility

- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios for text readability
