import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Home from './components/Home';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <main className="">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* auth related */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<div className='pt-20'>register</div>} />
              <Route path="/logout" element={<div className='pt-20'>logout</div>} />
              <Route path="/profile" element={<div className='pt-20'>profile</div>} />
              <Route path="/settings" element={<div className='pt-20'>settings</div>} />

              {/* app routes */}
              <Route path="/paths" element={<div className='pt-20'>paths</div>} />
              <Route path="/courses" element={<div className='pt-20'>courses</div>} />
              <Route path="/message" element={<div className='pt-20'>message</div>} />
              <Route path="/edura" element={<div className='pt-20'>edura</div>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
