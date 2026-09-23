// parent.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // 1. PARENT REGISTRATION LOGIC
    // ==========================================
    const parentRegisterForm = document.getElementById('parent-register-form');
    
    if (parentRegisterForm) {
        parentRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('parent-full-name').value;
            const email = document.getElementById('parent-email').value;
            const password = document.getElementById('parent-password').value;
            const phone = document.getElementById('parent-phone').value;
            
            const submitBtn = document.getElementById('parent-submit-btn');
            const messageDiv = document.getElementById('parent-message');
            
            submitBtn.innerText = 'Creating Account...';
            submitBtn.disabled = true;
            messageDiv.textContent = '';
            
            // 1. Supabase Auth mein account banana
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        role: 'parent' // Yeh role batayega ke ye parent hai
                    }
                }
            });
            
            if (error) {
                messageDiv.textContent = "Error: " + error.message;
                messageDiv.className = 'text-red-500 text-sm mt-4 text-center font-medium';
                submitBtn.innerText = 'Create Parent Account';
                submitBtn.disabled = false;
            } else {
                // 2. Parents table mein data save karna
                const user = data.user;
                if (user) {
                    await supabase.from('parents').insert([
                        { 
                            full_name: fullName,
                            email: email,
                            phone: phone
                        }
                    ]);
                }

                messageDiv.textContent = 'Account created successfully! Redirecting to login...';
                messageDiv.className = 'text-green-600 text-sm mt-4 text-center font-medium';
                parentRegisterForm.reset();
                submitBtn.innerText = 'Create Parent Account';
                submitBtn.disabled = false;
                
                // 3. 2 second baad parent login page par bhej dena
                setTimeout(() => {
                    window.location.href = 'parent-login.html';
                }, 2000);
            }
        });
    }

    // ==========================================
    // 2. PARENT LOGIN LOGIC
    // ==========================================
    const parentLoginForm = document.getElementById('parent-login-form');
    
    if (parentLoginForm) {
        parentLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('parent-login-email').value;
            const password = document.getElementById('parent-login-password').value;
            
            const submitBtn = document.getElementById('parent-login-btn');
            const messageDiv = document.getElementById('parent-login-message');
            
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
                // Agar login successful hai toh parent dashboard par bhej dein
                window.location.href = 'parent-dashboard.html';
            }
        });
    }

    // ==========================================
    // 3. PARENT DASHBOARD LOGIC
    // ==========================================
    const childrenContainer = document.getElementById('children-container');
    const addChildForm = document.getElementById('add-child-form');

    if (childrenContainer || addChildForm) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'parent-login.html';
            return;
        }
        const parentEmail = session.user.email;

        // --- A. Fetch Children Function ---
        const fetchChildren = async () => {
            const { data: links, error: linkError } = await supabase
                .from('parent_child_link')
                .select('student_email')
                .eq('parent_email', parentEmail);

            if (linkError || !links || links.length === 0) {
                childrenContainer.innerHTML = `<p class="text-muted text-sm">No children linked yet. Add your child above.</p>`;
                return;
            }

            const studentEmails = links.map(l => l.student_email);
            
            // Fetch enrollments for these students
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('*')
                .in('student_email', studentEmails);

            if (enrollError || !enrollments || enrollments.length === 0) {
                childrenContainer.innerHTML = studentEmails.map(email => `<p class="text-muted">No active courses found for ${email}.</p>`).join('');
                return;
            }

            // Group enrollments by student email
            const groupedData = {};
            enrollments.forEach(e => {
                if (!groupedData[e.student_email]) groupedData[e.student_email] = [];
                groupedData[e.student_email].push(e);
            });

            // Display data
            childrenContainer.innerHTML = Object.keys(groupedData).map(email => {
                const courses = groupedData[email];
                return `
                    <div class="card p-6 md:p-8">
                        <div class="flex items-center justify-between mb-6 border-b pb-4">
                            <div>
                                <h3 class="text-lg font-bold text-primary-dark">Student: ${email}</h3>
                                <p class="text-sm text-muted">Active Courses: ${courses.length}</p>
                            </div>
                        </div>
                        <div class="space-y-6">
                            ${courses.map(course => {
                                return `
                                    <div>
                                        <div class="flex justify-between mb-2">
                                            <span class="font-medium text-text">${course.course_title}</span>
                                            <span class="font-bold text-gold">${course.progress || 0}%</span>
                                        </div>
                                        <div class="progress-bar mb-4"><div class="progress-fill" style="width: ${course.progress || 0}%"></div></div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div class="bg-ivory p-3 rounded-xl">
                                                <p class="text-xs text-muted font-semibold mb-1">Attendance</p>
                                                <p class="text-sm text-text">${course.attendance || '100%'}</p>
                                            </div>
                                            <div class="bg-ivory p-3 rounded-xl">
                                                <p class="text-xs text-muted font-semibold mb-1">Teacher Notes</p>
                                                <p class="text-sm text-text">${course.teacher_notes || 'No notes yet.'}</p>
                                            </div>
                                            <div class="bg-ivory p-3 rounded-xl md:col-span-2">
                                                <p class="text-xs text-muted font-semibold mb-1">Homework</p>
                                                <p class="text-sm text-text">${course.homework || 'No homework assigned.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        };

        await fetchChildren();

        // --- B. Add Child Logic ---
        if (addChildForm) {
            addChildForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const childEmail = document.getElementById('child-email').value;
                const btn = document.getElementById('add-child-btn');
                const msg = document.getElementById('child-message');

                btn.innerText = 'Linking...';
                btn.disabled = true;
                msg.textContent = '';

                const { data, error } = await supabase
                    .from('parent_child_link')
                    .insert([
                        { parent_email: parentEmail, student_email: childEmail }
                    ]);

                if (error) {
                    msg.textContent = "Error: " + error.message;
                    msg.className = "text-red-500 text-sm mt-2";
                } else {
                    msg.textContent = "Child linked successfully!";
                    msg.className = "text-green-600 text-sm mt-2";
                    addChildForm.reset();
                    fetchChildren(); // Reload data
                }
                
                btn.innerText = 'Link Child';
                btn.disabled = false;
            });
        }
    }

    // ==========================================
    // 4. LOGOUT LOGIC
    // ==========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'parent-login.html';
        });
    }
});