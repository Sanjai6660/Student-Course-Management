import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    const fetchData = async () => {
        try {
            const [coursesRes, enrollmentsRes, announcementsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/enrollments/my'),
                api.get('/announcements')
            ]);
            setCourses(coursesRes.data);
            setMyEnrollments(enrollmentsRes.data);
            setAnnouncements(announcementsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        console.log('Student Page Mounted, User:', user);
        if (!user || user.role !== 'ROLE_STUDENT') {
            console.warn('Redirecting back to login (Student check failed)');
            navigate('/login');
            return;
        }
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const enrollCourse = async (courseId) => {
        try {
            await api.post(`/enrollments/${courseId}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Enrollment failed");
        }
    };

    const isEnrolled = (courseId) => {
        return (Array.isArray(myEnrollments) ? myEnrollments : []).some(e => e.course?.id === courseId);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 space-y-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Student Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your academic profile and course progress.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <span className="block text-gray-800 font-bold leading-none">Welcome back, {user?.name}</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Registered Student</span>
                        </div>
                        <button onClick={handleLogout} className="px-6 py-3 bg-red-50 text-red-600 font-black text-xs rounded-xl hover:bg-red-100 transition shadow-sm active:scale-95">Sign Out</button>
                    </div>
                </div>

                {/* Post Announcement Form for Students */}
                <div className="mb-12 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">✍️</span> 
                        Share a Campus Update
                    </h2>
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            const content = e.target.content.value;
                            try {
                                await api.post('/announcements', { title, content });
                                e.target.reset();
                                fetchData();
                                alert("Your update has been posted to the campus feed!");
                            } catch (err) {
                                alert("Failed to post update. Please try again.");
                            }
                        }}
                        className="space-y-4"
                    >
                        <input 
                            name="title" 
                            placeholder="What's the topic?" 
                            required 
                            className="w-full px-5 py-3 border border-gray-100 rounded-2xl bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:border-blue-400 transition-all font-bold text-gray-800"
                        />
                        <textarea 
                            name="content" 
                            placeholder="Share some details with your fellow students..." 
                            required 
                            rows="2"
                            className="w-full px-5 py-3 border border-gray-100 rounded-2xl bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:border-blue-400 transition-all text-gray-600 resize-none"
                        ></textarea>
                        <div className="flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                                Post to Feed
                            </button>
                        </div>
                    </form>
                </div>

                {/* Announcements Section */}
                {announcements.length > 0 && (
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg shadow-inner">📢</span> 
                            <h2 className="text-xl font-bold text-gray-800">Global Announcements</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 pr-2 custom-scrollbar snap-x">
                            {(Array.isArray(announcements) ? announcements : []).map(ann => (
                                <div key={ann.id} className="min-w-[400px] flex-1 max-w-[500px] p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100/50 relative overflow-hidden group snap-start">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-orange-600 transition-colors">{ann.title}</h3>
                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{ann.content}</p>
                                    {ann.reply && (
                                         <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative">
                                            <div className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Admin Reply</div>
                                            <p className="text-xs text-indigo-900 mt-2">{ann.reply}</p>
                                         </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Available Courses */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                        <h2 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shadow-inner">📚</span> 
                            Course Catalog
                        </h2>
                        <div className="space-y-4">
                            {(Array.isArray(courses) ? courses : []).filter(Boolean).map(course => (
                                <div key={course?.id} className="group border border-gray-100 rounded-3xl bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                                    <div 
                                        className="h-32 w-full bg-cover bg-center border-b border-gray-100" 
                                        style={{backgroundImage: `url(${course?.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fit=crop&w=800&q=80'})`}}
                                    ></div>
                                    <div className="p-6 flex justify-between items-center flex-1">
                                        <div className="pr-10">
                                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors leading-tight">{course?.courseName || 'Unnamed Course'}</h3>
                                            <p className="text-xs text-gray-400 mt-2 line-clamp-1">{course?.description}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {!isEnrolled(course?.id) ? (
                                                <button 
                                                    onClick={() => enrollCourse(course?.id)}
                                                    className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Enroll Course
                                                </button>
                                            ) : (
                                                <span className="px-5 py-3 bg-green-50 text-green-700 text-xs font-black rounded-xl border border-green-100 shadow-sm flex items-center gap-2">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Enrollments */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-60"></div>
                        <h2 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg shadow-inner">🎒</span> 
                            Learning Journey
                        </h2>
                        <div className="space-y-4">
                            {(Array.isArray(myEnrollments) ? myEnrollments : []).map(enrollment => (
                                <div key={enrollment.id} className="border border-gray-100 p-6 rounded-3xl flex flex-col gap-4 bg-gray-50/50 hover:bg-white hover:border-green-100 hover:shadow-xl transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight">{enrollment.course?.courseName || 'Unknown Course'}</h3>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                                enrollment.status === 'COMPLETED' 
                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${enrollment.status === 'COMPLETED' ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
                                                {enrollment.status}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {enrollment.status === 'IN_PROGRESS' && (
                                        <div className="mt-2 pt-4 border-t border-gray-100 flex justify-end">
                                            <button 
                                                onClick={async () => {
                                                    await api.put(`/enrollments/${enrollment.course?.id}/complete`);
                                                    fetchData();
                                                }}
                                                className="px-5 py-2.5 bg-white border-2 border-green-500 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-50 transition-all active:scale-95 shadow-sm"
                                            >
                                                Mark as Completed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
