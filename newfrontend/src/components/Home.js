import React from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div class="flex flex-col items-center justify-center w-full h-screen bg-slate-900">
          <div class="flex w-4/5 py-8">
            <p class="text-slate-100 text-4xl font-bold">Eduverse</p>
          </div>

          <div class="flex w-4/5 h-1/2 p-8 bg-yellow-50 rounded-lg shadow-lg">
            <p class="">Eduverse</p>
          </div>
        </div>
      ) : (
        <div class="flex flex-col items-center justify-center w-full h-screen bg-slate-900">
          <div class="flex flex-col space-y-8 w-4/5 py-8">
            <p class="text-slate-100 text-4xl font-bold">Eduverse</p>
            <p class="text-slate-300 text-xl font-light">
              Welcome to Eduverse. Eduverse, center of excellence for education,
              is a platform that provides a wide range of educational resources
              and services to help students, teachers, and parents achieve their
              academic goals.
            </p>
          </div>
          <div class="grid grid-cols-4 w-4/5 h-fit py-4 rounded-lg gap-4">
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">Python</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">JavaScript</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">Java</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">React</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">Node.js</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">HTML</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">CSS</p>
            </div>
            <div class="flex w-full flex-col items-center bg-slate-800 border border-slate-900/20 p-4 rounded-lg">
              <p className="text-slate-100">SQL</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
