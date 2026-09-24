// about.js

import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const teachersContainer = document.getElementById('teachers-container');

    if (teachersContainer) {
        // Supabase se teachers ka data fetch karna
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select('*');

        if (error) {
            console.error('Error fetching teachers:', error);
            teachersContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Error loading teachers.</p>`;
            return;
        }

        // Agar koi teacher nahi mila
        if (!teachers || teachers.length === 0) {
            teachersContainer.innerHTML = `<p class="text-muted text-center col-span-full">No teachers available at the moment.</p>`;
            return;
        }

        // Teachers ko HTML cards mein convert karna
        teachersContainer.innerHTML = teachers.map(teacher => {
            // Agar image_url khali ho toh default image lagana
            const imageUrl = teacher.image_url || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f34?q=80&w=600&auto=format&fit=crop';
            
            return `
                <div class="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-muted/5 hover:-translate-y-2 overflow-hidden text-center group">
                    <div class="relative h-56 bg-primary-dark overflow-hidden">
                        <img src="${imageUrl}" alt="${teacher.full_name}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-60"></div>
                    </div>
                    <div class="p-6">
                        <h4 class="text-lg font-bold text-primary-dark">${teacher.full_name}</h4>
                        <p class="text-gold text-sm font-semibold mb-2">${teacher.specialization || 'Teacher'}</p>
                        <p class="text-muted text-sm">${teacher.bio || ''}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
});