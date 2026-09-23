// courses.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const coursesContainer = document.getElementById('courses-container');

    // Check if user is logged in (naya aur behtar tareeqa)
    const { data: { user } } = await supabase.auth.getUser();

    if (coursesContainer) {
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*');

        if (error) {
            coursesContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Error loading courses.</p>`;
            return;
        }

        if (courses.length === 0) {
            coursesContainer.innerHTML = `<p class="text-muted text-center col-span-full">No courses available at the moment.</p>`;
            return;
        }

        coursesContainer.innerHTML = courses.map(course => {
            // Agar user login hai toh Enroll Now button, warna Login button
            const actionButton = user 
                ? `<button onclick="enrollNow('${course.id}', '${course.title.replace(/'/g, "\\'")}')" class="text-sm font-semibold text-gold hover:text-primary-dark transition-colors">Enroll Now →</button>`
                : `<a href="login.html" class="text-sm font-semibold text-gold hover:text-primary-dark transition-colors">Login to Enroll →</a>`;

                        return `
                <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-muted/5 hover:-translate-y-2 group flex flex-col">
                    <div class="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-primary-dark">${course.title}</h3>
                    <p class="text-muted text-sm mb-6 flex-grow">${course.description}</p>
                    <div class="flex justify-between items-center mt-4 pt-4 border-t border-muted/10">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full">${course.level}</span>
                            <span class="text-xs font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full">${course.age_group || 'All Ages'}</span>
                        </div>
                        ${actionButton}
                    </div>
                </div>
            `;
        }).join('');
    }
});

// Global function for enrollment
window.enrollNow = async (courseId, courseTitle) => {
    // User ko fresh check karna
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert('Please login first to enroll in a course.');
        window.location.href = 'login.html';
        return;
    }

    // Check if already enrolled
    const { data: existing } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId);

    if (existing && existing.length > 0) {
        alert('You are already enrolled in this course!');
        return;
    }

    // Insert into enrollments table
    const { error } = await supabase.from('enrollments').insert([
        { 
            student_id: user.id, 
            student_email: user.email,
            course_id: courseId,
            course_title: courseTitle,
            status: 'Active'
        }
    ]);

    if (error) {
        alert('Error enrolling in course: ' + error.message);
    } else {
        alert('Successfully enrolled in ' + courseTitle + '! Redirecting to your dashboard...');
        window.location.href = 'dashboard.html';
    }
};