import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('analytics');
    
    // Announcement Form State
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');

    const navigate = useNavigate();
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    useEffect(() => {
        console.log('Admin Page Mounted, User:', user);
        if (!user || user.role !== 'ROLE_ADMIN') {
            console.warn('Redirecting back to login (Admin check failed)');
            navigate('/login');
            return;
        }
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'courses') {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/enrollments/all')
                ]);
                setCourses(coursesRes.data);
                setEnrollments(enrollmentsRes.data);
            } else if (activeTab === 'announcements') {
                const res = await api.get('/announcements');
                setAnnouncements(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/users');
                setUsers(res.data);
            } else if (activeTab === 'inbox') {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const createCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', { courseName, description, imageUrl });
            setCourseName('');
            setDescription('');
            setImageUrl('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create course");
        }
    };

    const postAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', { title: annTitle, content: annContent });
            setAnnTitle('');
            setAnnContent('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post announcement");
        }
    };

    const getEnrollmentCount = (courseId) => {
        return (Array.isArray(enrollments) ? enrollments : []).filter(e => e.course?.id === courseId).length;
    };

    const toggleBlockUser = async (userId) => {
        try {
            await api.put(`/users/${userId}/block`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update block status");
        }
    };

    const deleteUser = async (userId) => {
        if(window.confirm("Delete this user permanently?")) {
            try {
                await api.delete(`/users/${userId}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete user");
            }
        }
    };

    const replyToAnnouncement = async (annId, replyContent) => {
        if(!replyContent.trim()) return;
        try {
            await api.put(`/announcements/${annId}/reply`, { content: replyContent });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post reply");
        }
    };

    const dismissNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            fetchData();
        } catch (error) {
            console.error("Failed to dismiss notification", error);
        }
    };

    const applyCoursePreset = (preset) => {
        if (preset === 'cs') {
            setCourseName('Introduction to Computer Science');
            setDescription('Fundamental concepts of programming, algorithms, and data structures.');
            setImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?fit=crop&w=800&q=80');
        } else if (preset === 'ai') {
            setCourseName('Artificial Intelligence Fundamentals');
            setDescription('Core principles of AI, machine learning, and neural networks.');
            setImageUrl('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?fit=crop&w=800&q=80');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full shadow-sm z-10">
                <div className="p-8 border-b border-gray-50">
                    <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">ACADEMIA ADMIN</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-purple-50 text-purple-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>📊</span> Platform Analytics
                    </button>
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-purple-50 text-purple-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>📚</span> Course Hub
                    </button>
                    <button 
                        onClick={() => setActiveTab('announcements')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-purple-50 text-purple-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>📢</span> Announcements
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>👥</span> User Directory
                    </button>
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'inbox' ? 'bg-purple-50 text-purple-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-3"><span>🔔</span> System Inbox</div>
                        {notifications.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>}
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-gray-50">
                         <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
                         <div className="overflow-hidden">
                             <div className="text-sm font-bold truncate">{user?.name}</div>
                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Administrator</div>
                         </div>
                    </div>
                    <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors">Sign Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10">
                {activeTab === 'courses' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 leading-tight">Course Management</h1>
                                <p className="text-gray-500 mt-1">Design, publish and monitor student enrollment across all departments.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Create Form */}
                            <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit sticky top-10">
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">✨</span> 
                                    New Course
                                </h2>
                                <div className="flex gap-2 mb-4">
                                    <button onClick={() => applyCoursePreset('cs')} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg hover:bg-blue-100 transition-all">Preset: CS</button>
                                    <button onClick={() => applyCoursePreset('ai')} className="px-3 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded-lg hover:bg-purple-100 transition-all">Preset: AI</button>
                                </div>
                                <form onSubmit={createCourse} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Official Title</label>
                                        <input
                                            type="text" required
                                            className="w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all bg-gray-50/50"
                                            value={courseName} onChange={(e) => setCourseName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Syllabus Overview</label>
                                        <textarea
                                            className="w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all bg-gray-50/50 resize-none"
                                            rows="4" value={description} onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cover Image URL (Optional)</label>
                                        <input
                                            type="url" placeholder="https://..."
                                            className="w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all bg-gray-50/50"
                                            value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-purple-200 hover:shadow-purple-300 transform active:scale-95 transition-all"
                                    >
                                        Launch Course
                                    </button>
                                </form>
                            </div>

                            {/* List and Tracker */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
                                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">📑</span> 
                                        Academic Directory
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(Array.isArray(courses) ? courses : []).map(course => (
                                            <div key={course.id} className="rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all shadow-sm hover:shadow-md relative group overflow-hidden flex flex-col">
                                                <div 
                                                    className="h-24 w-full bg-cover bg-center" 
                                                    style={{backgroundImage: `url(${course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fit=crop&w=800&q=80'})`}}
                                                ></div>
                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm("Delete this course? Warning: This may affect enrollments.")) {
                                                            await api.delete(`/courses/${course.id}`);
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all text-sm"
                                                >
                                                    🗑️
                                                </button>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="font-bold text-gray-800 line-clamp-1 pr-6">{course.courseName}</h3>
                                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 h-8 flex-1">{course.description}</p>
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                                            {getEnrollmentCount(course.id)} Enrolled
                                                        </span>
                                                        <span className="text-[10px] text-gray-300 font-mono">ID: {course.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Enrollment Table */}
                                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
                                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg">📈</span> 
                                        Recent Activity
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                    <th className="pb-4">Student</th>
                                                    <th className="pb-4">Course</th>
                                                    <th className="pb-4">Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(Array.isArray(enrollments) ? enrollments : []).slice(0, 5).map(e => (
                                                    <tr key={e.id}>
                                                        <td className="py-4 text-xs font-bold text-gray-800">{e.user?.name || 'Unknown student'}</td>
                                                        <td className="py-4 text-xs text-gray-500">{e.course?.courseName || 'Deleted course'}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${e.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                                {e.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Global Broadcast</h1>
                        <p className="text-gray-500 mb-10">Send updates, reminders or important alerts to all university students.</p>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 mb-12">
                             <form onSubmit={postAnnouncement} className="space-y-6">
                                <input 
                                    placeholder="Subject Title" 
                                    className="w-full text-2xl font-black border-none focus:ring-0 placeholder-gray-200"
                                    value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required
                                />
                                <textarea 
                                    placeholder="Write your announcement message here..." 
                                    className="w-full min-h-[150px] text-lg text-gray-600 border-none focus:ring-0 placeholder-gray-100 resize-none"
                                    value={annContent} onChange={(e) => setAnnContent(e.target.value)} required
                                ></textarea>
                                <div className="pt-6 flex justify-between items-center border-t border-gray-50">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Visibility: All Registered Users</div>
                                    <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">Broadcast Message</button>
                                </div>
                             </form>
                        </div>

                        <div className="space-y-6">
                            {(Array.isArray(announcements) ? announcements : []).map(ann => (
                                <div key={ann.id} className="p-8 bg-white border border-gray-50 rounded-3xl shadow-lg relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full"></div>
                                     <div className="flex justify-between items-start mb-4">
                                         <div>
                                            <h3 className="text-xl font-bold text-gray-800">{ann.title}</h3>
                                            <div className="mt-1 flex items-center gap-3">
                                                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">By {ann.author?.name || 'System'}</span>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <button 
                                                onClick={async () => {
                                                    if(window.confirm("Delete this announcement?")) {
                                                        await api.delete(`/announcements/${ann.id}`);
                                                        fetchData();
                                                    }
                                                }}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                             >
                                                🗑️
                                             </button>
                                             <span className="text-[10px] bg-gray-50 px-3 py-1 rounded-full font-bold text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                         </div>
                                     </div>
                                     <p className="text-gray-600 leading-relaxed mb-4">{ann.content}</p>
                                     
                                     {ann.author?.role === 'ROLE_STUDENT' && !ann.reply && (
                                         <form onSubmit={(e) => {
                                             e.preventDefault();
                                             replyToAnnouncement(ann.id, e.target.replyText.value);
                                         }} className="mt-4 flex gap-2">
                                             <input name="replyText" required placeholder="Type an admin reply..." className="flex-1 px-4 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                                             <button type="submit" className="px-4 py-2 bg-purple-100 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-200 transition-all">Reply</button>
                                         </form>
                                     )}
                                     {ann.reply && (
                                         <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl relative">
                                            <div className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Admin Reply</div>
                                            <p className="text-sm text-indigo-900 mt-2">{ann.reply}</p>
                                         </div>
                                     )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <h1 className="text-3xl font-black text-gray-900">User Directory</h1>
                            {/* Create Admin Toggle/Button could go here if needed, but let's put form above table */}
                        </div>

                        {/* Manage Users Form */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 mb-10">
                            <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">👤</span> 
                                Manual User Registration
                            </h2>
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await api.post('/auth/signup', { 
                                            name: e.target.name.value, 
                                            email: e.target.email.value, 
                                            password: e.target.password.value, 
                                            role: e.target.role.value 
                                        });
                                        alert("User registered successfully");
                                        e.target.reset();
                                        fetchData();
                                    } catch (err) {
                                        alert(err.response?.data?.message || "Failed to register user");
                                    }
                                }} 
                                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                            >
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Full Name</label>
                                    <input name="name" required className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Email Address</label>
                                    <input name="email" type="email" required className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Secure Password</label>
                                    <input name="password" type="password" required className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2 ml-1">Assigned Role</label>
                                    <select name="role" className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none appearance-none">
                                        <option value="ROLE_STUDENT">Student</option>
                                        <option value="ROLE_ADMIN">Administrator</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
                                    Create Account
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="px-8 py-6">Registered Member</th>
                                        <th className="px-8 py-6">Email Contact</th>
                                        <th className="px-8 py-6">Account Status</th>
                                        <th className="px-8 py-6 text-right">Reference ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(Array.isArray(users) ? users : []).map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{u.name.charAt(0)}</div>
                                                    <span className="font-bold text-gray-800">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500">{u.email}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest mr-2 ${u.role === 'ROLE_ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                                    {u.role.replace('ROLE_', '')}
                                                </span>
                                                {u.blocked && (
                                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black tracking-widest bg-red-50 text-red-600">
                                                        BLOCKED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right space-x-2">
                                                {u.role !== 'ROLE_ADMIN' && (
                                                    <>
                                                        <button onClick={() => toggleBlockUser(u.id)} className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all ${u.blocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                                                            {u.blocked ? 'Unblock' : 'Block'}
                                                        </button>
                                                        <button onClick={() => deleteUser(u.id)} className="px-4 py-2 text-[10px] font-bold rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                                                            Remove
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'inbox' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 leading-tight">System Inbox</h1>
                                <p className="text-gray-500 mt-1">Automated administrative alerts and student enrollment notifications.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <div className="text-center p-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                                    <span className="text-4xl">📭</span>
                                    <p className="mt-4 text-gray-500 font-bold">Inbox is empty</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                                                📣
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{notif.message}</p>
                                                <p className="text-[10px] font-black tracking-widest text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => dismissNotification(notif.id)}
                                            className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 leading-tight">Platform Analytics</h1>
                                <p className="text-gray-500 mt-1">Real-time statistics on course enrollments and student engagement.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Total Courses</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{courses.length}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">📚</div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Total Enrollments</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{enrollments.length}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center text-xl">📈</div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Total Users</p>
                                    <h3 className="text-3xl font-black text-gray-800 mt-1">{users.length}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">👥</div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 h-[450px]">
                            <h2 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">📊</span> 
                                Course Popularity
                            </h2>
                            <ResponsiveContainer width="100%" height="80%">
                                <BarChart data={(Array.isArray(courses) ? courses : []).map(c => ({ name: c.courseName, students: getEnrollmentCount(c.id) }))}>
                                    <XAxis dataKey="name" tick={{fontSize: 10}} hide={true} />
                                    <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="students" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
