import React from "react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 z-50 w-full flex justify-between items-center py-4 px-8 bg-slate-900 text-yellow-50 border-b border-yellow-50/20">
      <div className="flex items-center gap-16">
        <a href="/" class="text-2xl font-md">
          Eduverse
        </a>
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <a href="/about">Paths</a>
            </li>
            <li>
              <a href="/courses">Courses</a>
            </li>
            <li>
              <a href="/contact">Message</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="hidden md:block flex items-center space-x-4">
        {isAuthenticated ? (
          <button
            className="bg-indigo-800 text-slate-100 py-2 px-4 rounded-md hover:bg-indigo-600"
            onClick={handleSignOut}
          >
            <p className="text-sm">Sign Out</p>
          </button>
        ) : (
          <a href="/login">
            <button className="bg-indigo-800 text-slate-100 py-2 px-4 rounded-md hover:bg-indigo-600">
              <p className="text-sm">Sign In</p>
            </button>
          </a>
        )}
      </div>

      <button className="md:hidden text-yellow-50 focus:outline-none">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <nav className="absolute top-full left-0 w-full bg-gray-900 text-yellow-50 p-4 hidden md:hidden">
        <ul className="space-y-4">
          <li>
            <a href="#about">Paths</a>
          </li>
          <li>
            <a href="#courses">Courses</a>
          </li>
          <li>
            <a href="#contact">Message</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
