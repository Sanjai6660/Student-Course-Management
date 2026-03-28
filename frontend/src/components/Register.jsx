import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DEPARTMENTS = ['CSE', 'ME', 'ECE', 'EEE'];

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dept, setDept] = useState('CSE');
    const [regDigits, setRegDigits] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (regDigits.length !== 6 || !/^\d{6}$/.test(regDigits)) {
            setError('Registration number must be exactly 6 digits.');
            return;
        }

        const regNumber = dept + regDigits;

        try {
            await api.post('/auth/signup', {
                name,
                email,
                password,
                role: 'ROLE_STUDENT',
                regNumber,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div 
            className="relative min-h-screen flex items-center justify-center bg-[#0a0f1c] overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
            onMouseMove={handleMouseMove}
        >
            {/* Interactive Cursor Spotlight */}
            <div 
                className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(800px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(56, 189, 248, 0.15), transparent 40%)`
                }}
            />

            {/* Dynamic SVG & Particle Background */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-sky-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

                <svg className="absolute inset-0 w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="blue-white-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                            {/* White Dot */}
                            <circle cx="2" cy="2" r="1.5" fill="rgba(255, 255, 255, 0.8)" />
                            {/* Blue Dot */}
                            <circle cx="22" cy="22" r="2" fill="rgba(59, 130, 246, 0.9)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#blue-white-dots)" />
                </svg>
            </div>

            <div className="max-w-md w-full relative z-30 space-y-8 p-10 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Register Account
                    </h2>
                    <p className="text-center text-sm text-gray-400 mt-2">Student Registration</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    {/* Full Name */}
                    <input
                        type="text"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* Registration Number */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            Registration Number
                        </label>
                        <div className="flex gap-2 items-stretch">
                            <select
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                                className="px-3 py-3 border border-gray-200 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {DEPARTMENTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <input
                                id="reg-digits"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                placeholder="6-digit number"
                                value={regDigits}
                                onChange={(e) => setRegDigits(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="flex-1 px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50"
                            />
                        </div>
                        {regDigits && (
                            <p className="mt-2 text-xs text-indigo-500 font-bold">
                                Your Reg No: <span className="text-indigo-700 font-black">{dept}{regDigits}</span>
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <input
                        type="email"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password */}
                    <input
                        type="password"
                        required
                        className="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50/50"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg active:scale-95"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
