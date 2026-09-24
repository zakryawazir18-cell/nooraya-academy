// admin.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // 1. TOTAL STUDENTS COUNT LANA
    // ==========================================
    const studentCountEl = document.getElementById('student-count');
    if (studentCountEl) {
        const { data: students, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            console.error('Error fetching students:', error);
            studentCountEl.innerText = '0';
        } else {
            studentCountEl.innerText = students.length;
        }
    }

    // ==========================================
    // 2. TRIAL REQUESTS COUNT LANA
    // ==========================================
    const trialCountEl = document.getElementById('trial-count');
    if (trialCountEl) {
        const { count, error } = await supabase
            .from('trial_requests')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching trial count:', error);
            trialCountEl.innerText = '0';
        } else {
            trialCountEl.innerText = count;
        }
    }

    // ==========================================
    // 3. TRIAL REQUESTS TABLE BHARNA
    // ==========================================
    const tableBody = document.getElementById('trial-requests-body');

    if (tableBody) {
        const { data: trials, error } = await supabase
            .from('trial_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-red-500">Error loading data.</td></tr>`;
            return;
        }

        if (trials.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-muted">No trial requests yet.</td></tr>`;
            return;
        }

        tableBody.innerHTML = trials.map(trial => {
            const dateObj = new Date(trial.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            let statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">Pending</span>`;
            if (trial.status === 'Scheduled') {
                statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Scheduled</span>`;
            } else if (trial.status === 'Cancelled') {
                statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">Cancelled</span>`;
            } else if (trial.status === 'Completed') {
                statusBadge = `<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Completed</span>`;
            }

            return `
                <tr class="border-b border-muted/5 hover:bg-ivory transition-colors">
                    <td class="py-4 px-4 font-medium text-text">${trial.student_name}</td>
                    <td class="py-4 px-4 text-muted">${trial.course}</td>
                    <td class="py-4 px-4 text-muted">${formattedDate}</td>
                    <td class="py-4 px-4">${statusBadge}</td>
                    <td class="py-4 px-4 text-right">
                        <button class="text-gold hover:underline font-semibold text-sm">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
        // ==========================================
    // 4. REGISTERED STUDENTS TABLE BHARNA
    // ==========================================
    const studentsTableBody = document.getElementById('students-table-body');
    if (studentsTableBody) {
        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching students:', error);
            studentsTableBody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-red-500">Error loading data.</td></tr>`;
        } else if (students.length === 0) {
            studentsTableBody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-muted">No students registered yet.</td></tr>`;
        } else {
            studentsTableBody.innerHTML = students.map(student => {
                return `
                    <tr class="border-b border-muted/5 hover:bg-ivory transition-colors">
                        <td class="py-4 px-4 font-medium text-text">${student.full_name}</td>
                        <td class="py-4 px-4 text-muted">${student.email}</td>
                        <td class="py-4 px-4 text-muted">${student.country}</td>
                        <td class="py-4 px-4 text-muted">${student.phone}</td>
                    </tr>
                `;
            }).join('');
        }
    }
        // ==========================================
    // 5. ADD NEW COURSE LOGIC
    // ==========================================
    const addCourseForm = document.getElementById('add-course-form');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
                      const title = document.getElementById('course-title').value;
            const level = document.getElementById('course-level').value;
            const desc = document.getElementById('course-desc').value;
            const age = document.getElementById('course-age').value;
            
            const submitBtn = document.getElementById('add-course-btn');
            const messageDiv = document.getElementById('course-message');
            
            submitBtn.innerText = 'Adding...';
            submitBtn.disabled = true;
            
                     const { data, error } = await supabase
                .from('courses')
                .insert([
                    { title: title, description: desc, level: level, age_group: age }
                ]);
                
            if (error) {
                messageDiv.textContent = "Error: " + error.message;
                messageDiv.className = 'text-red-500 text-sm mt-2 font-medium';
                submitBtn.innerText = 'Add Course';
                submitBtn.disabled = false;
            } else {
                messageDiv.textContent = "Course added successfully! It will show on the website.";
                messageDiv.className = 'text-green-600 text-sm mt-2 font-medium';
                addCourseForm.reset();
                submitBtn.innerText = 'Add Course';
                submitBtn.disabled = false;
            }
        });
    }
        // ==========================================
    // 6. COURSE ENROLLMENTS TABLE BHARNA
    // ==========================================
    const enrollmentsTableBody = document.getElementById('enrollments-table-body');
    if (enrollmentsTableBody) {
        const { data: enrollments, error } = await supabase
            .from('enrollments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching enrollments:', error);
            enrollmentsTableBody.innerHTML = `<tr><td colspan="3" class="py-10 text-center text-red-500">Error loading data.</td></tr>`;
        } else if (enrollments.length === 0) {
            enrollmentsTableBody.innerHTML = `<tr><td colspan="3" class="py-10 text-center text-muted">No enrollments yet.</td></tr>`;
        } else {
            enrollmentsTableBody.innerHTML = enrollments.map(enrollment => {
                return `
                    <tr class="border-b border-muted/5 hover:bg-ivory transition-colors">
                        <td class="py-4 px-4 font-medium text-text">${enrollment.student_email}</td>
                        <td class="py-4 px-4 text-muted">${enrollment.course_title}</td>
                        <td class="py-4 px-4"><span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">${enrollment.status}</span></td>
                    </tr>
                `;
            }).join('');
        }
    }
            // ==========================================
    // 8. ADD NEW TEACHER LOGIC
    // ==========================================
    const addTeacherForm = document.getElementById('add-teacher-form');
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('teacher-full-name').value;
            const email = document.getElementById('teacher-email-input').value;
            const specialization = document.getElementById('teacher-specialization').value;
            const imageUrl = document.getElementById('teacher-image-url').value;
            const bio = document.getElementById('teacher-bio').value;
            
            const submitBtn = document.getElementById('add-teacher-btn');
            const messageDiv = document.getElementById('teacher-message');
            
            submitBtn.innerText = 'Adding...';
            submitBtn.disabled = true;
            
            const { data, error } = await supabase
                .from('teachers')
                .insert([
                    { full_name: fullName, email: email, specialization: specialization, image_url: imageUrl, bio: bio }
                ]);
                
            if (error) {
                messageDiv.textContent = "Error: " + error.message;
                messageDiv.className = 'text-red-500 text-sm mt-2 font-medium';
                submitBtn.innerText = 'Add Teacher';
                submitBtn.disabled = false;
            } else {
                messageDiv.textContent = "Teacher added successfully! It will show on the About Us page.";
                messageDiv.className = 'text-green-600 text-sm mt-2 font-medium';
                addTeacherForm.reset();
                submitBtn.innerText = 'Add Teacher';
                submitBtn.disabled = false;
            }
        });
    }
        // ==========================================
    // 7. ACTIVE TEACHERS COUNT LANA
    // ==========================================
    const teacherCountEl = document.getElementById('teacher-count');
    if (teacherCountEl) {
        const { count, error } = await supabase
            .from('teachers')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching teacher count:', error);
            teacherCountEl.innerText = '0';
        } else {
            teacherCountEl.innerText = count;
        }
    }
});