// auth.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. REGISTRATION LOGIC (register.html)
    // ==========================================
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('reg-full-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const country = document.getElementById('reg-country').value;
            const phone = document.getElementById('reg-phone').value;
            
            const submitBtn = document.getElementById('reg-submit-btn');
            const messageDiv = document.getElementById('reg-message');
            
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
                        country: country,
                        phone: phone,
                        role: 'student'
                    }
                }
            });
            
            if (error) {
                messageDiv.textContent = "Auth Error: " + error.message;
                messageDiv.className = 'text-red-500 text-sm mt-4 text-center font-medium';
                submitBtn.innerText = 'Create Account';
                submitBtn.disabled = false;
                return; // Agar auth mein error hai toh aage na badhein
            }
            
            // 2. Students table mein data save karna
            const user = data.user;
            if (user) {
                const { error: insertError } = await supabase.from('students').insert([
                    { 
                        full_name: fullName, // Yahan ka spell check karein
                        email: email,        // Yahan ka spell check karein
                        country: country,    // Yahan ka spell check karein
                        phone: phone         // Yahan ka spell check karein
                    }
                ]);

                // Agar table mein data save na ho toh error dikhana
                if (insertError) {
                    messageDiv.textContent = "DB Error: " + insertError.message;
                    messageDiv.className = 'text-red-500 text-sm mt-4 text-center font-medium';
                    submitBtn.innerText = 'Create Account';
                    submitBtn.disabled = false;
                } else {
                    messageDiv.textContent = 'Account created successfully! Redirecting to login...';
                    messageDiv.className = 'text-green-600 text-sm mt-4 text-center font-medium';
                    registerForm.reset();
                    submitBtn.innerText = 'Create Account';
                    submitBtn.disabled = false;
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            }
        });
    }

    // ==========================================
    // 2. LOGIN LOGIC (login.html)
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const submitBtn = document.getElementById('login-submit-btn');
            const messageDiv = document.getElementById('login-message');
            
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
                window.location.href = 'dashboard.html';
            }
        });
    }
});