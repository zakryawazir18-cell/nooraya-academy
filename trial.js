// trial.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const trialForm = document.getElementById('trial-form');
    
    // Agar free-trial page par form hai to hi ye code chalega
    if (trialForm) {
        trialForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Form ka default reload rokena
            
            // 1. Input fields se data lena
            const studentName = document.getElementById('trial-student-name').value;
            const age = document.getElementById('trial-age').value;
            const email = document.getElementById('trial-email').value;
            const whatsapp = document.getElementById('trial-whatsapp').value;
            const course = document.getElementById('trial-course').value;
            const teacherGender = document.getElementById('trial-teacher-gender').value;
            const preferredDays = document.getElementById('trial-days').value;
            const preferredTime = document.getElementById('trial-time').value;
            
            // 2. Button aur Message UI ko update karna
            const submitBtn = document.getElementById('trial-submit-btn');
            const messageDiv = document.getElementById('trial-message');
            
            submitBtn.innerText = 'Booking your class...';
            submitBtn.disabled = true;
            messageDiv.textContent = '';
            messageDiv.classList.remove('hidden');
            
            // 3. Supabase ko data bhejna (Insert karna)
            const { data, error } = await supabase
                .from('trial_requests')
                .insert([
                    { 
                        student_name: studentName,
                        age: age,
                        email: email,
                        whatsapp: whatsapp,
                        course: course,
                        teacher_gender: teacherGender,
                        preferred_days: preferredDays,
                        preferred_time: preferredTime,
                        status: 'New' // Default status
                    }
                ]);
            
            // 4. Result check karna (Success ya Error)
            if (error) {
                messageDiv.textContent = "Error: " + error.message;
                messageDiv.className = 'mt-4 text-center p-4 rounded-xl bg-red-50 text-red-600 font-medium';
                submitBtn.innerText = 'Book My Free Trial Class →';
                submitBtn.disabled = false;
            } else {
                messageDiv.textContent = 'Success! Your free trial request has been received. We will contact you on WhatsApp shortly, In Sha Allah.';
                messageDiv.className = 'mt-4 text-center p-4 rounded-xl bg-green-50 text-green-700 font-medium';
                trialForm.reset(); // Form clear kar dega
                submitBtn.innerText = 'Book My Free Trial Class →';
                submitBtn.disabled = false;
            }
        });
    }
});