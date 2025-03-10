import React from 'react';
import Header from './Header';

const Home = () => {
  return (
<div class="flex flex-col items-center justify-center w-full h-screen bg-slate-900">
      {/* <Header /> */}

      <div class="flex w-3/4 py-8">
        <p class="text-slate-100 text-4xl font-bold">Eduverse</p>
      </div>

      <div class="flex w-3/4 h-1/2 p-8 bg-yellow-50 rounded-lg shadow-lg">
        <p class="">Eduverse</p>
      </div>
    </div>
  );
};

export default Home;
