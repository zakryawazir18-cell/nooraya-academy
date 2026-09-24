// teacher.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();

    if (!session && !window.location.href.includes('teacher-login.html')) {
        window.location.href = 'teacher-login.html';
        return;
    }

    // ==========================================
    // 1. LOGIN LOGIC (for teacher-login.html)
    // ==========================================
    const loginForm = document.getElementById('teacher-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('teacher-email').value;
            const password = document.getElementById('teacher-password').value;
            
            const submitBtn = document.getElementById('teacher-login-btn');
            const messageDiv = document.getElementById('teacher-login-message');
            
            submitBtn.innerText = 'Logging in...';
            submitBtn.disabled = true;
            messageDiv.textContent = '';
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                messageDiv.textContent = "Error: " + error.message;
                messageDiv.className = 'text-red-500 text-sm mt-4 text-center font-medium';
                submitBtn.innerText = 'Login to Dashboard';
                submitBtn.disabled = false;
            } else {
                window.location.href = 'teacher-dashboard.html';
            }
        });
    }

    // ==========================================
    // 2. DASHBOARD LOGIC (for teacher-dashboard.html)
    // ==========================================
    const studentsTableBody = document.getElementById('teacher-students-body');
    
    if (studentsTableBody && session) {
        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: studentsList } = await supabase
            .from('students')
            .select('email, full_name');

        const studentNames = {};
        if (studentsList) {
            studentsList.forEach(s => {
                studentNames[s.email] = s.full_name;
            });
        }

        if (error) {
            studentsTableBody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-red-500">Error loading data.</td></tr>`;
        } else if (enrollments.length === 0) {
            studentsTableBody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-muted">No students enrolled yet.</td></tr>`;
        } else {
            studentsTableBody.innerHTML = enrollments.map(enrollment => {
                const displayName = studentNames[enrollment.student_email] || enrollment.student_email;
                
                return `
                    <tr class="border-b border-muted/5 hover:bg-ivory transition-colors">
                        <td class="py-4 px-4 font-medium text-text">
                            ${displayName} <br> 
                            <span class="text-xs text-muted font-normal">${enrollment.student_email}</span>
                        </td>
                        <td class="py-4 px-4 text-muted">${enrollment.course_title}</td>
                        <td class="py-4 px-4">
                            <input type="number" id="progress-${enrollment.id}" value="${enrollment.progress || 0}" class="form-input w-20 px-2 py-1 rounded-lg text-center" min="0" max="100">
                        </td>
                        <td class="py-4 px-4">
                            <input type="text" id="lesson-${enrollment.id}" value="${enrollment.current_lesson || ''}" class="form-input w-full px-2 py-1 rounded-lg" placeholder="Surah Al-Baqarah">
                        </td>
                        <td class="py-4 px-4">
                            <input type="text" id="day-${enrollment.id}" value="${enrollment.class_day || ''}" class="form-input w-full px-2 py-1 rounded-lg" placeholder="Monday">
                        </td>
                        <td class="py-4 px-4">
                            <input type="text" id="time-${enrollment.id}" value="${enrollment.class_time || ''}" class="form-input w-full px-2 py-1 rounded-lg" placeholder="4:00 PM">
                        </td>
                        <td class="py-4 px-4 text-right">
                            <button onclick="updateProgress(${enrollment.id})" class="btn-gold text-xs py-2 px-4">Save</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // ==========================================
    // 3. LOGOUT LOGIC
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'teacher-login.html';
        });
    }
});

// ==========================================
// 4. UPDATE PROGRESS, LESSON & SCHEDULE FUNCTION (Global)
// ==========================================
window.updateProgress = async (enrollmentId) => {
    const progressInput = document.getElementById(`progress-${enrollmentId}`);
    const lessonInput = document.getElementById(`lesson-${enrollmentId}`);
    const dayInput = document.getElementById(`day-${enrollmentId}`);
    const timeInput = document.getElementById(`time-${enrollmentId}`);
    
    if (!progressInput) return;

    const newProgress = parseInt(progressInput.value);
    const newLesson = lessonInput ? lessonInput.value : '';
    const newDay = dayInput ? dayInput.value : '';
    const newTime = timeInput ? timeInput.value : '';
    
    const { error } = await supabase
        .from('enrollments')
        .update({ 
            progress: newProgress, 
            current_lesson: newLesson,
            class_day: newDay,
            class_time: newTime
        })
        .eq('id', enrollmentId);

    if (error) {
        alert('Error updating data: ' + error.message);
    } else {
        alert('Schedule and progress updated successfully!');
    }
};