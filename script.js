// Configuration
const CONFIG = {
    sheetURL: "https://script.google.com/macros/s/AKfycby58yDY-wSsb6Y5kzxRWZ7NlaxP26EYQNHVELdJ4JRgsXWtGtxml5SYQ5ab7iFsrU1Oow/exec",
    participationIdPrefix: {
        "astro-craft": "AC",
        "moon-modeling": "MM",
        "essay": "EW",
        "quiz": "AQ"
    },
    classOptions: [
        "Class 5", "Class 6", "Class 7", "Class 8", 
        "Class 9", "Class 10", "Class 11", "Class 12",
        "College Student", "Teacher", "Other"
    ]
};

// DOM Elements
const programmeOptions = document.querySelectorAll('.programme-option');
const nextBtnStep1 = document.getElementById('step1-next');
const formStep1 = document.getElementById('form-step-1');
const formStep3 = document.getElementById('form-step-3');
const participantForm = document.getElementById('participant-form');
const successModal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const newRegistrationBtn = document.getElementById('new-registration');
const participationIdElement = document.getElementById('participation-id');
const classSelect = document.getElementById('class');

// State
let selectedProgrammes = [];
let participationIds = {};
let formData = {};
let isSubmitting = false;

// Notification sound
const notificationSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize class dropdown
    initializeClassSelect();

    // Programme selection (multiple allowed)
    programmeOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
            
            // Update selected programmes array
            const programme = option.dataset.programme;
            if (option.classList.contains('selected')) {
                if (!selectedProgrammes.includes(programme)) {
                    selectedProgrammes.push(programme);
                }
            } else {
                selectedProgrammes = selectedProgrammes.filter(p => p !== programme);
            }
            
            // Enable next button if at least one programme is selected
            nextBtnStep1.disabled = selectedProgrammes.length === 0;
        });
    });

    // Step 1 to Step 3 (directly to participant details)
    nextBtnStep1.addEventListener('click', () => {
        formStep1.classList.remove('active');
        formStep3.classList.add('active');
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step3').classList.add('active');
    });

    // Form submission
    participantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm();
    });

    // Modal controls
    closeModal.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    newRegistrationBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        resetForm();
    });

    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});

// Initialize class select dropdown
function initializeClassSelect() {
    classSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select your class';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    classSelect.appendChild(defaultOption);

    CONFIG.classOptions.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option);
    });
}

function submitForm() {
    if (isSubmitting) return;
    
    // Validate class selection
    if (!classSelect.value) {
        alert('Please select your class');
        return;
    }

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    isSubmitting = true;

    // Format programme names for display
    const programmeDisplayNames = {
        "astro-craft": "Astro-Craft Workshop",
        "moon-modeling": "Moon Modeling Workshop",
        "essay": "Essay Writing Competition",
        "quiz": "Astronomy Quiz"
    };

    // Generate participation IDs for each selected programme
    selectedProgrammes.forEach(programme => {
        const prefix = CONFIG.participationIdPrefix[programme] || "MD";
        const randomNum = Math.floor(100 + Math.random() * 900);
        participationIds[programme] = `${prefix}${new Date().getFullYear().toString().slice(-2)}-${randomNum}`;
    });

    formData = {
        programmes: selectedProgrammes.map(p => programmeDisplayNames[p] || p),
        name: document.getElementById('name').value,
        class: classSelect.value,
        school: document.getElementById('school').value,
        address: document.getElementById('address').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value || 'N/A',
        member: document.getElementById('member').value,
        participationIds: participationIds,
        timestamp: new Date().toISOString()
    };

    // Play notification sound
    notificationSound.play().catch(e => console.log("Audio playback failed:", e));

    // Show mandatory requirement message
    const requirementMessage = `
        <div class="requirement-notice">
            <h4><i class="fas fa-exclamation-circle"></i> Mandatory Requirement</h4>
            <p>Please bring <strong>1 OREO Biscuit pack (Small Size 10 Rs. Pack)</strong> to participate in the workshop.</p>
            <p>This is compulsory for all participants.</p>
        </div>
    `;

    // Send data to Google Sheets
    sendDataToGoogleSheets(formData, requirementMessage);
}

function sendDataToGoogleSheets(data, requirementMessage) {
    const formData = new FormData();
    for (const key in data) {
        if (key === 'participationIds') {
            formData.append(key, JSON.stringify(data[key]));
        } else if (key === 'programmes') {
            formData.append(key, data[key].join(', '));
        } else {
            formData.append(key, data[key]);
        }
    }

    const submitBtn = document.querySelector('.submit-btn');

    fetch(CONFIG.sheetURL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        console.log('Success:', text);
        // Display all participation IDs in modal
        let idsHtml = '';
        for (const [programme, id] of Object.entries(data.participationIds)) {
            const displayName = programme.replace('-', ' ').toUpperCase();
            idsHtml += `<p><strong>${displayName}:</strong> ${id}</p>`;
        }
        participationIdElement.innerHTML = idsHtml + requirementMessage;
        successModal.style.display = 'flex';
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit</span><i class="fas fa-paper-plane"></i><div class="btn-glow"></div>';
        isSubmitting = false;
    })
    .catch(error => {
        console.error('Error:', error);
        // Display all participation IDs in modal even if Sheets fails
        let idsHtml = '';
        for (const [programme, id] of Object.entries(data.participationIds)) {
            const displayName = programme.replace('-', ' ').toUpperCase();
            idsHtml += `<p><strong>${displayName}:</strong> ${id}</p>`;
        }
        participationIdElement.innerHTML = idsHtml + requirementMessage;
        successModal.style.display = 'flex';
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit</span><i class="fas fa-paper-plane"></i><div class="btn-glow"></div>';
        isSubmitting = false;
        
        alert('Registration submitted locally, but there was an issue saving to Google Sheets. Please take a screenshot of your participation IDs for reference.');
    });
}

function resetForm() {
    programmeOptions.forEach(opt => opt.classList.remove('selected'));
    selectedProgrammes = [];
    nextBtnStep1.disabled = true;
    
    formStep3.classList.remove('active');
    formStep1.classList.add('active');
    
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    participantForm.reset();
    participationIds = {};
    // Reset class select to default
    classSelect.selectedIndex = 0;
}