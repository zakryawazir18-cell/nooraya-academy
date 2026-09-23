// dashboard.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const welcomeHeading = document.getElementById('welcome-user');

    // 1. Check karein ke user login hai ya nahi
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const user = session.user;
    const fullName = user.user_metadata?.full_name || 'Student';

    if (welcomeHeading) {
        welcomeHeading.innerText = `Assalamu Alaikum, ${fullName} 👋`;
    }

    // ==========================================
    // 4. FETCH ENROLLED COURSES & PROGRESS
    // ==========================================
    const enrolledCoursesContainer = document.getElementById('enrolled-courses');
    let enrollments = []; 

    if (enrolledCoursesContainer) {
        const { data: fetchedEnrollments, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', user.id);

        if (error) {
            enrolledCoursesContainer.innerHTML = `<p class="text-red-500 text-sm">Error loading courses: ${error.message}</p>`;
        } else if (fetchedEnrollments.length === 0) {
            enrolledCoursesContainer.innerHTML = `<p class="text-muted text-sm">You are not enrolled in any course yet. <a href="courses.html" class="text-gold font-semibold">Browse Courses</a></p>`;
        } else {
            enrollments = fetchedEnrollments;
            enrolledCoursesContainer.innerHTML = enrollments.map(enrollment => {
                const progressWidth = enrollment.progress || 0;
                const currentLesson = enrollment.current_lesson || 'Not started yet';
                
                return `
                    <div class="mb-6 last:mb-0 bg-ivory p-4 rounded-xl border border-muted/10">
                        <div class="flex justify-between mb-2">
                            <span class="font-semibold text-text text-base">${enrollment.course_title}</span>
                            <span class="font-bold text-gold">${progressWidth}%</span>
                        </div>
                        <div class="progress-bar mb-4"><div class="progress-fill" style="width: ${progressWidth}%"></div></div>
                        <div class="flex items-center text-sm mt-2">
                            <svg class="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            <span class="text-muted">Current Lesson: <span class="text-text font-medium">${currentLesson}</span></span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // ==========================================
    // 6. JOIN CLASS LINK LOGIC
    // ==========================================
    const joinClassBtn = document.getElementById('join-class-btn');
    if (joinClassBtn) {
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select('meeting_link')
            .limit(1);

        if (teachers && teachers.length > 0 && teachers[0].meeting_link) {
            const link = teachers[0].meeting_link;
            joinClassBtn.addEventListener('click', () => {
                window.open(link, '_blank');
            });
        } else {
            joinClassBtn.innerText = "No Class Scheduled Yet";
            joinClassBtn.disabled = true;
            joinClassBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    // ==========================================
    // 7. CERTIFICATE LOGIC
    // ==========================================
    const certSection = document.getElementById('certificate-section');
    const downloadCertBtn = document.getElementById('download-cert-btn');

    if (certSection) {
        const completedCourse = enrollments.find(e => e.progress == 100);

        if (completedCourse) {
            certSection.style.display = 'block';
            
            document.getElementById('cert-student-name').innerText = fullName;
            document.getElementById('cert-course-name').innerText = completedCourse.course_title;
            document.getElementById('cert-date').innerText = new Date().toLocaleDateString();

            downloadCertBtn.addEventListener('click', () => {
                const element = document.getElementById('certificate-content');
                element.style.display = 'block'; 
                html2pdf().from(element).save('Nooraya_Certificate.pdf').then(() => {
                    element.style.display = 'none';
                });
            });
        }
    }

    // ==========================================
    // 5. LOGOUT LOGIC (Sidebar)
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }

    // ==========================================
    // 8. LOGOUT LOGIC (Mobile Bottom Nav)
    // ==========================================
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }
});