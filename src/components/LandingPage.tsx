// taskpilot-frontend/src/components/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Define animation variants for common use
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each child animation
      delayChildren: 0.3    // Delay before children start animating
    }
  }
};

interface LandingPageProps {
  onGetStarted: () => void; // Callback when Get Started button is clicked
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  // Define your app's core features here
  const features = [
    {
      title: "Intuitive Task Management",
      description: "Organize your tasks with ease, set due dates, priorities, and descriptions.",
      // image: "/path/to/task-management-feature.png" // Placeholder for an illustrative image/gif
    },
    {
      title: "Smart Categorization",
      description: "Group tasks into custom categories for better organization and filtering.",
      // image: "/path/to/categorization-feature.png"
    },
    {
      title: "Real-time Progress Tracking",
      description: "Track time spent on tasks, manage subtasks, and monitor completion.",
      // image: "/path/to/time-tracking-feature.png"
    },
    {
      title: "Recurring Tasks & Notifications",
      description: "Set tasks to repeat automatically and receive timely notifications.",
      // image: "/path/to/notifications-feature.png"
    },
    {
      title: "Calendar Integration",
      description: "Visualize your schedule with a clear calendar view for upcoming tasks.",
      // image: "/path/to/calendar-feature.png"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-background text-primary dark:bg-dark-background dark:text-dark-primary font-sans"
    >
      {/* Hero Section: Project Introduction */}
      <section className="relative flex flex-col items-center justify-center h-screen-75 md:h-screen-75 lg:h-screen-75 text-center px-4 overflow-hidden">
        <motion.div
          variants={fadeIn}
          className="z-10 max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight"
            variants={fadeIn}
          >
            Welcome to <span className="text-accent">TaskPilot</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-secondary mb-10 max-w-2xl mx-auto"
            variants={fadeIn}
          >
            Your ultimate companion for organizing, tracking, and completing your daily tasks with precision and ease.
          </motion.p>
          <motion.button
            variants={fadeIn}
            onClick={onGetStarted}
            className="px-8 py-4 bg-accent text-white text-lg font-semibold rounded-full shadow-lg hover:bg-accent-dark transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent-dark/50 dark:bg-dark-accent dark:hover:bg-dark-accent-dark"
          >
            Get Started
          </motion.button>
        </motion.div>
        {/* Placeholder for subtle background animations or patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-surface dark:from-dark-background dark:to-dark-surface opacity-50 z-0"></div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4 text-center bg-surface dark:bg-dark-surface border-t border-b border-border dark:border-dark-border">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Meet the Developer</h2>
          <p className="text-lg md:text-xl text-secondary mb-6">
            Hi, I'm <span className="font-semibold text-primary">Saksham Maithani</span>, a passionate CS Student.
          </p>
          <p className="text-md text-tertiary">
            TaskPilot is a culmination of my learning and dedication to building intuitive and effective software. I hope it helps you stay organized and productive!
          </p>
          {/* Optional: Add a placeholder for an avatar here */}
          {/* <img src="/path/to/your/avatar.jpg" alt="Saksham Maithani" className="rounded-full w-24 h-24 mx-auto mt-8 shadow-md" /> */}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-3xl md:text-4xl font-heading font-bold text-center mb-12"
        >
          Key Features
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Adjust amount for when animation triggers
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn} // Each feature item will fade in
              className="bg-surface dark:bg-dark-surface p-8 rounded-lg shadow-md border border-border dark:border-dark-border flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg"
            >
              {/* Optional: Feature Icon/Image */}
              {/* {feature.image && (
                <img src={feature.image} alt={feature.title} className="w-20 h-20 mb-6 object-contain" />
              )} */}
              <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
              <p className="text-secondary text-base">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Call to Action Section (Repeated at bottom) */}
      <section className="py-20 px-4 text-center bg-accent dark:bg-dark-accent text-white">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Conquer Your Tasks?</h2>
          <p className="text-lg mb-10 opacity-90">
            Join TaskPilot now and experience the power of effortless organization.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-accent text-lg font-semibold rounded-full shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Start Managing Tasks
          </button>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default LandingPage;