// Configuration
const CONFIG = {
    storytellingTopics: [
        "The museum of futures should be...",
        "If I could design a museum of the future, it would include...",
        "Museums in the future must focus on...",
        "Museums in the future must focus on...",
        "The museum of my dreams looks like...",
        "How can museums better serve my community?",
        "Museums should help people understand...",
        "My museum would be a space for...",
        "If a museum was built in my neighbourhood, I’d want it to...",
        "How can museums keep young people interested in the digital age?"
    ],
    sketchGroups: [
        { name: "Group A (Class 5-7)", topics: [] },
        { name: "Group B (Class 8-10)", topics: [] }
    ],
    classOptions: {
        storytelling: Array.from({length: 10}, (_, i) => `Class ${i+1}`),
        sketchA: ["Class 5", "Class 6", "Class 7"],
        sketchB: ["Class 8", "Class 9", "Class 10"]
    },
    sheetURL: "https://script.google.com/macros/s/AKfycby58yDY-wSsb6Y5kzxRWZ7NlaxP26EYQNHVELdJ4JRgsXWtGtxml5SYQ5ab7iFsrU1Oow/exec",
    participationIdPrefix: {
        storytelling: "ST",
        sketch: "SK"
    }
};

// DOM Elements
const programmeOptions = document.querySelectorAll('.programme-option');
const nextBtnStep1 = document.getElementById('step1-next');
const formStep1 = document.getElementById('form-step-1');
const formStep2 = document.getElementById('form-step-2');
const formStep3 = document.getElementById('form-step-3');
const step2Title = document.getElementById('step2-title');
const optionsContainer = document.getElementById('options-container');
const backBtnStep2 = document.getElementById('step2-back');
const nextBtnStep2 = document.getElementById('step2-next');
const step3Title = document.getElementById('step3-title');
const classGroup = document.getElementById('class-group');
const classSelect = document.getElementById('class');
const backBtnStep3 = document.getElementById('step3-back');
const participantForm = document.getElementById('participant-form');
const successModal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const downloadPdfBtn = document.getElementById('download-pdf');
const newRegistrationBtn = document.getElementById('new-registration');
const participationIdElement = document.getElementById('participation-id');

// State
let currentProgramme = null;
let currentTopic = null;
let currentGroup = null;
let participationId = null;
let formData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Programme selection
    programmeOptions.forEach(option => {
        option.addEventListener('click', () => {
            programmeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            nextBtnStep1.disabled = false;
            currentProgramme = option.dataset.programme;
        });
    });

    // Step 1 to Step 2
    nextBtnStep1.addEventListener('click', () => {
        formStep1.classList.remove('active');
        formStep2.classList.add('active');
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        
        if (currentProgramme === 'storytelling') {
            step2Title.textContent = "Select Story Telling Topic";
            renderStorytellingTopics();
        } else {
            step2Title.textContent = "Select Sketch & Draw Group";
            renderSketchGroups();
        }
    });

    // Step 2 back to Step 1
    backBtnStep2.addEventListener('click', () => {
        formStep2.classList.remove('active');
        formStep1.classList.add('active');
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        currentTopic = null;
        currentGroup = null;
        nextBtnStep2.disabled = true;
    });

    // Step 2 to Step 3
    nextBtnStep2.addEventListener('click', () => {
        formStep2.classList.remove('active');
        formStep3.classList.add('active');
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        
        if (currentProgramme === 'storytelling') {
            step3Title.textContent = "Story Telling Participant Details";
            renderClassOptions('storytelling');
        } else {
            step3Title.textContent = "Sketch & Draw Participant Details";
            if (currentGroup === 'Group A (Class 5-7)') {
                renderClassOptions('sketchA');
            } else {
                renderClassOptions('sketchB');
            }
        }
    });

    // Step 3 back to Step 2
    backBtnStep3.addEventListener('click', () => {
        formStep3.classList.remove('active');
        formStep2.classList.add('active');
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step2').classList.add('active');
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

    downloadPdfBtn.addEventListener('click', generatePdf);

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

// Functions
function renderStorytellingTopics() {
    optionsContainer.innerHTML = '';
    CONFIG.storytellingTopics.forEach(topic => {
        const option = document.createElement('div');
        option.className = 'option-item';
        option.innerHTML = `
            <div class="option-glow"></div>
            <h4>${topic}</h4>
            <div class="neon-border"></div>
        `;
        option.addEventListener('click', () => {
            document.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            option.classList.add('selected');
            currentTopic = topic;
            nextBtnStep2.disabled = false;
        });
        optionsContainer.appendChild(option);
    });
}

function renderSketchGroups() {
    optionsContainer.innerHTML = '';
    CONFIG.sketchGroups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'option-item';
        groupElement.innerHTML = `
            <div class="option-glow"></div>
            <h4>${group.name}</h4>
            <p>Topics: ${group.topics.join(', ')}</p>
            <div class="neon-border"></div>
        `;
        groupElement.addEventListener('click', () => {
            document.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            groupElement.classList.add('selected');
            currentGroup = group.name;
            nextBtnStep2.disabled = false;
        });
        optionsContainer.appendChild(groupElement);
    });
}

function renderClassOptions(type) {
    classSelect.innerHTML = '';
    const options = CONFIG.classOptions[type];
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option;
        optElement.textContent = option;
        classSelect.appendChild(optElement);
    });
}


// Add a new variable to track submission state
let isSubmitting = false;

// Modify the submitForm function
function submitForm() {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Get the submit button
    const submitBtn = document.querySelector('.submit-btn');
    
    // Disable the button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    isSubmitting = true;

    // Collect form data
    formData = {
        programme: currentProgramme === 'storytelling' ? 'Story Telling' : 'Sketch & Draw',
        topic: currentProgramme === 'storytelling' ? currentTopic : currentGroup,
        name: document.getElementById('name').value,
        class: document.getElementById('class').value,
        school: document.getElementById('school').value,
        address: document.getElementById('address').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value || 'N/A',
        timestamp: new Date().toISOString()
    };

    // Generate participation ID
    const prefix = currentProgramme === 'storytelling' 
        ? CONFIG.participationIdPrefix.storytelling 
        : CONFIG.participationIdPrefix.sketch;
    const randomNum = Math.floor(100 + Math.random() * 900);
    participationId = `${prefix}${new Date().getFullYear().toString().slice(-2)}-${randomNum}`;
    formData.participationId = participationId;

    // Send data to Google Sheets
    sendDataToGoogleSheets(formData);
}

// Update the sendDataToGoogleSheets function
function sendDataToGoogleSheets(data) {
    // Create form data object
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    // Get the submit button reference
    const submitBtn = document.querySelector('.submit-btn');

    // Send data to Google Sheets
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
        // Show success modal
        participationIdElement.textContent = participationId;
        successModal.style.display = 'flex';
        
        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit</span><i class="fas fa-paper-plane"></i><div class="btn-glow"></div>';
        isSubmitting = false;
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback - still show success modal even if Sheets fails
        participationIdElement.textContent = participationId;
        successModal.style.display = 'flex';
        
        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit</span><i class="fas fa-paper-plane"></i><div class="btn-glow"></div>';
        isSubmitting = false;
        
        alert('Registration submitted locally, but there was an issue saving to Google Sheets. Please take a screenshot of your participation ID for reference.');
    });
}

// ... (keep all other functions the same)

function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [210, 75]
    });

    // Add background gradient
    const gradient = doc.createLinearGradient(0, 0, 210, 75);
    gradient.addColorStop(0, '#0072ff');
    gradient.addColorStop(1, '#00c6ff');
    doc.setFillColor(gradient);
    doc.rect(0, 0, 210, 75, 'F');
    
    // Add semi-transparent white overlay
    doc.setFillColor(255, 255, 255, 0.8);
    doc.rect(5, 5, 200, 65, 'F');

    // Add logo and header
    doc.setFontSize(16);
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('DSC Innovation Hub Purulia', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 114, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Creative Arts Programme Participation Certificate', 105, 22, { align: 'center' });

    // Add participant details
    doc.setFontSize(10);
    doc.setTextColor(10, 25, 47);
    doc.text(`Name: ${formData.name}`, 20, 35);
    doc.text(`Class: ${formData.class}`, 20, 40);
    doc.text(`School: ${formData.school}`, 20, 45);
    
    doc.text(`Programme: ${formData.programme}`, 110, 35);
    doc.text(`Topic: ${formData.topic}`, 110, 40);
    doc.text(`Participation ID: ${participationId}`, 110, 45);

    // Add decorative elements
    doc.setDrawColor(0, 198, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 30, 80, 30);
    doc.line(110, 30, 190, 30);

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This certificate confirms participation in the Creative Arts Programme organized by DSC Innovation Hub Purulia.', 105, 60, { align: 'center' });
    doc.text('For any queries, contact: dscpurulia@example.com | +91 XXXXX XXXXX', 105, 65, { align: 'center' });

    // Add holographic seal effect
    doc.setFillColor(0, 198, 255, 0.1);
    doc.circle(180, 20, 10, 'F');
    doc.setFillColor(255, 255, 255, 0.3);
    doc.circle(182, 18, 4, 'F');

    // Save the PDF
    doc.save(`Participation_${participationId}.pdf`);
}

function resetForm() {
    // Reset all form fields and steps
    programmeOptions.forEach(opt => opt.classList.remove('selected'));
    nextBtnStep1.disabled = true;
    currentProgramme = null;
    currentTopic = null;
    currentGroup = null;
    
    formStep3.classList.remove('active');
    formStep2.classList.remove('active');
    formStep1.classList.add('active');
    
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    
    participantForm.reset();
    optionsContainer.innerHTML = '';
    nextBtnStep2.disabled = true;
}
