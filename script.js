// GlobalVisaMath JS Engines

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Schengen 90/180 Calculator
    // ==========================================
    const entryList = document.getElementById('entryList');
    const addTripBtn = document.getElementById('addTripBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const controlDateInput = document.getElementById('controlDate');

    if (controlDateInput) {
        const today = new Date();
        controlDateInput.value = today.toISOString().split('T')[0];
    }

    if (addTripBtn && entryList) {
        let tripCount = 0;
        addTripBtn.addEventListener('click', () => {
            tripCount++;
            const row = document.createElement('div');
            row.className = 'date-row';
            row.innerHTML = `
                <div class="input-group">
                    <label for="entry_${tripCount}" data-tooltip="The day you crossed the border into the Schengen Area (from passport stamp)">Date of Entry ⓘ</label>
                    <input type="date" id="entry_${tripCount}" class="date-input">
                </div>
                <div class="input-group">
                    <label for="exit_${tripCount}" data-tooltip="The day you exited the Schengen Area (from passport stamp)">Date of Exit ⓘ</label>
                    <input type="date" id="exit_${tripCount}" class="date-input">
                </div>
                <button type="button" class="btn-secondary" style="margin-bottom:0; color:var(--danger); border-color:var(--danger);" onclick="this.parentElement.remove()">Remove</button>
            `;
            entryList.appendChild(row);
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSchengen);
    }

    function calculateSchengen() {
        const controlDateVal = controlDateInput.value;
        if (!controlDateVal) {
            alert('Please select a Date of Assessment.');
            return;
        }

        const controlDate = new Date(controlDateVal);
        controlDate.setHours(0, 0, 0, 0);

        const windowStart = new Date(controlDate);
        windowStart.setDate(controlDate.getDate() - 179);

        const trips = [];
        const rows = entryList.querySelectorAll('.date-row');
        let hasErrors = false;

        rows.forEach((row, index) => {
            const entryInput = row.querySelector('input[id^="entry_"]');
            const exitInput = row.querySelector('input[id^="exit_"]');
            
            if (entryInput.value && exitInput.value) {
                const entryDate = new Date(entryInput.value);
                entryDate.setHours(0, 0, 0, 0);
                const exitDate = new Date(exitInput.value);
                exitDate.setHours(0, 0, 0, 0);

                if (exitDate < entryDate) {
                    alert(`Error in Trip ${index + 1}: Exit date cannot be before Entry date.`);
                    hasErrors = true;
                } else {
                    trips.push({ entry: entryDate, exit: exitDate });
                }
            }
        });

        if (hasErrors) return;

        let totalDaysUsed = 0;
        const auditLog = [];

        trips.forEach((trip, index) => {
            const overlapStart = trip.entry > windowStart ? trip.entry : windowStart;
            const overlapEnd = trip.exit < controlDate ? trip.exit : controlDate;

            if (overlapStart <= overlapEnd) {
                const diffTime = Math.abs(overlapEnd - overlapStart);
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                totalDaysUsed += days;
                auditLog.push(`Trip ${index + 1} (${trip.entry.toLocaleDateString()} to ${trip.exit.toLocaleDateString()}): <strong>${days} days</strong> counted in window.`);
            } else {
                auditLog.push(`Trip ${index + 1}: Fell outside the 180-day window.`);
            }
        });

        displaySchengenResults(totalDaysUsed, auditLog, windowStart, controlDate);
    }

    function displaySchengenResults(daysUsed, auditLog, windowStart, windowEnd) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        resultsSection.style.display = 'block';
        
        const daysUsedEl = document.getElementById('daysUsed');
        daysUsedEl.textContent = daysUsed;
        
        const statusMessage = document.getElementById('statusMessage');
        const daysLeft = 90 - daysUsed;

        if (daysUsed > 90) {
            daysUsedEl.className = 'status-number danger';
            statusMessage.innerHTML = `<span style="color: var(--danger)">You have exceeded the 90-day limit by ${daysUsed - 90} days.</span>`;
        } else {
            daysUsedEl.className = 'status-number success';
            statusMessage.innerHTML = `<span style="color: var(--success)">You are compliant. You have ${daysLeft} days remaining in this window.</span>`;
        }

        const auditList = document.getElementById('auditList');
        auditList.innerHTML = `
            <li style="background:#f8fafc; padding:0.75rem; font-weight:500;">
                180-Day Window: ${windowStart.toLocaleDateString()} — ${windowEnd.toLocaleDateString()}
            </li>
        `;
        
        if (auditLog.length === 0) {
            auditList.innerHTML += `<li>No trips found within the 180-day window.</li>`;
        } else {
            auditLog.forEach(log => {
                auditList.innerHTML += `<li>${log}</li>`;
            });
        }
        
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// ==========================================
// 2. Canada Express Entry CRS Calculator
// ==========================================
function calculateCRS() {
    const maritalStatus = document.getElementById('maritalStatus').value;
    const isMarried = maritalStatus === 'married';

    // Age points
    const ageVal = document.getElementById('age').value;
    let agePoints = 0;
    if (isMarried) {
        const marriedAgeMap = {
            '17': 0, '18': 90, '19': 95, '20': 100, '30': 85, '31': 80, '32': 75, '33': 70, 
            '34': 65, '35': 60, '36': 55, '37': 50, '38': 45, '39': 40, '40': 35, '41': 25, 
            '42': 15, '43': 5, '44': 0, '45': 0
        };
        agePoints = marriedAgeMap[ageVal] || 0;
    } else {
        const singleAgeMap = {
            '17': 0, '18': 99, '19': 105, '20': 110, '30': 95, '31': 90, '32': 85, '33': 80, 
            '34': 75, '35': 70, '36': 65, '37': 60, '38': 55, '39': 50, '40': 45, '41': 35, 
            '42': 25, '43': 15, '44': 10, '45': 0
        };
        agePoints = singleAgeMap[ageVal] || 0;
    }

    // Education points
    const eduVal = document.getElementById('education').value;
    let eduPoints = 0;
    const eduMap = {
        'none': 0, 'hs': 30, '1yr': 90, '2yr': 98, '3yr': 120, 'multi': 128, 'masters': 135, 'phd': 150
    };
    eduPoints = eduMap[eduVal] || 0;
    if (isMarried) {
        const marriedEduMap = {
            'none': 0, 'hs': 28, '1yr': 84, '2yr': 91, '3yr': 112, 'multi': 119, 'masters': 126, 'phd': 140
        };
        eduPoints = marriedEduMap[eduVal] || 0;
    }

    // Language points (First official language)
    const langVal = document.getElementById('firstLanguage').value;
    let langPoints = 0;
    const clbMap = {
        'clb4': 0, 'clb5': 6, 'clb6': 9, 'clb7': 17, 'clb8': 23, 'clb9': 31, 'clb10': 34
    };
    langPoints = (clbMap[langVal] || 0) * 4; // Reading, Writing, Speaking, Listening equal weight assumed
    if (isMarried) {
        const marriedClbMap = {
            'clb4': 0, 'clb5': 6, 'clb6': 8, 'clb7': 16, 'clb8': 22, 'clb9': 29, 'clb10': 32
        };
        langPoints = (marriedClbMap[langVal] || 0) * 4;
    }

    // Canadian work experience
    const canWorkVal = document.getElementById('canWork').value;
    let canWorkPoints = 0;
    const workMap = {
        'none': 0, '1yr': 40, '2yr': 56, '3yr': 64, '4yr': 72, '5yr': 80
    };
    canWorkPoints = workMap[canWorkVal] || 0;
    if (isMarried) {
        const marriedWorkMap = {
            'none': 0, '1yr': 35, '2yr': 48, '3yr': 56, '4yr': 64, '5yr': 70
        };
        canWorkPoints = marriedWorkMap[canWorkVal] || 0;
    }

    // Spouse factors
    let spouseEduPoints = 0;
    let spouseLangPoints = 0;
    let spouseWorkPoints = 0;
    if (isMarried) {
        const spouseEduVal = document.getElementById('spouseEducation').value;
        const spouseEduMap = { 'none': 0, 'hs': 2, '1yr': 6, '2yr': 8, '3yr': 10 };
        spouseEduPoints = spouseEduMap[spouseEduVal] || 0;

        const spouseLangVal = document.getElementById('spouseLanguage').value;
        const spouseLangMap = { 'clb4': 0, 'clb5': 6, 'clb7': 12, 'clb9': 20 };
        spouseLangPoints = spouseLangMap[spouseLangVal] || 0;

        const spouseWorkVal = document.getElementById('spouseWork').value;
        const spouseWorkMap = { 'none': 0, '1yr': 5, '2yr': 10 };
        spouseWorkPoints = spouseWorkMap[spouseWorkVal] || 0;
    }

    // Skill transferability (Education + Foreign work)
    const foreignWorkVal = document.getElementById('foreignWork').value;
    let transferabilityPoints = 0;
    
    // Simplification of IRCC complex cross-matrix
    const firstLanguageCLB9 = langVal === 'clb9' || langVal === 'clb10';
    if (foreignWorkVal === '1yr') {
        transferabilityPoints += firstLanguageCLB9 ? 25 : 13;
    } else if (foreignWorkVal === '3yr') {
        transferabilityPoints += firstLanguageCLB9 ? 50 : 25;
    }

    // Additional points (Max 600)
    let additionalPoints = 0;
    if (document.getElementById('siblingCanada').checked) additionalPoints += 15;
    if (document.getElementById('frenchLanguage').checked) additionalPoints += 50;
    if (document.getElementById('canStudy').checked) additionalPoints += 15;
    if (document.getElementById('arrangedJob').checked) additionalPoints += 50;
    if (document.getElementById('pnpNomination').checked) additionalPoints += 600;
    if (additionalPoints > 600) additionalPoints = 600;

    const coreHumanTotal = agePoints + eduPoints + langPoints + canWorkPoints;
    const spouseTotal = spouseEduPoints + spouseLangPoints + spouseWorkPoints;
    const grandTotal = coreHumanTotal + spouseTotal + transferabilityPoints + additionalPoints;

    // Display
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('crsTotalScore').textContent = grandTotal;

    const pointsList = document.getElementById('pointsBreakdownList');
    pointsList.innerHTML = `
        <li>Core Human Capital Points: <strong>${coreHumanTotal}</strong></li>
        ${isMarried ? `<li>Spouse / Partner Factors: <strong>${spouseTotal}</strong></li>` : ''}
        <li>Skill Transferability: <strong>${transferabilityPoints}</strong></li>
        <li>Additional Factors (Provincial Nomination, French, etc.): <strong>${additionalPoints}</strong></li>
    `;

    // Recommendations
    const recsList = document.getElementById('recommendationsList');
    recsList.innerHTML = '';
    
    if (langVal !== 'clb9' && langVal !== 'clb10') {
        recsList.innerHTML += `<li><strong>Improve Language Scores:</strong> Raising your language proficiency to CLB 9+ can unlock higher core human capital points and double your Skill Transferability points.</li>`;
    }
    if (!document.getElementById('frenchLanguage').checked) {
        recsList.innerHTML += `<li><strong>Learn French:</strong> Bilingual proficiency offers up to 50 additional points and makes you eligible for targeted category draws.</li>`;
    }
    if (!document.getElementById('pnpNomination').checked) {
        recsList.innerHTML += `<li><strong>Provincial Nominee Programs (PNP):</strong> Explore provincial pathways. A provincial nomination guarantees an automatic 600 additional CRS points.</li>`;
    }
    if (foreignWorkVal !== '3yr') {
        recsList.innerHTML += `<li><strong>Gain Foreign Experience:</strong> Accumulating 3+ years of continuous foreign work experience maximizes the transferability factor.</li>`;
    }

    if (recsList.innerHTML === '') {
        recsList.innerHTML = '<li>Your Express Entry profile is highly optimized. Ensure all documents are ready for submission.</li>';
    }

    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 3. Green Card Renewal Estimator
// ==========================================
function calculateGCRenewal() {
    const expiryInput = document.getElementById('gcExpiryDate').value;
    if (!expiryInput) {
        alert('Please select your Green Card expiration date.');
        return;
    }

    const expiryDate = new Date(expiryInput);
    expiryDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    const daysRemainingEl = document.getElementById('gcDaysRemaining');
    const statusLabel = document.getElementById('gcStatusLabel');
    const statusMessage = document.getElementById('gcStatusMessage');
    const timelineProgress = document.getElementById('timelineProgress');

    const opensDate = new Date(expiryDate);
    opensDate.setDate(expiryDate.getDate() - 180);

    if (diffDays < 0) {
        // Expired
        daysRemainingEl.textContent = Math.abs(diffDays);
        daysRemainingEl.className = 'status-number danger';
        statusLabel.textContent = 'Days since card expired';
        statusMessage.innerHTML = `<span style="color: var(--danger)"><strong>Urgent: Your Permanent Resident Card is expired.</strong> File Form I-90 immediately to renew.</span>`;
        timelineProgress.style.width = '100%';
        timelineProgress.style.background = 'var(--danger)';
    } else if (diffDays <= 180) {
        // Eligible to renew
        daysRemainingEl.textContent = diffDays;
        daysRemainingEl.className = 'status-number success';
        statusLabel.textContent = 'Days remaining until expiration';
        statusMessage.innerHTML = `<span style="color: var(--success)"><strong>You are eligible to renew.</strong> You are within the recommended 180-day USCIS renewal window. File Form I-90 now.</span>`;
        
        // Progress of filing window
        const percentElapsed = ((180 - diffDays) / 180) * 100;
        timelineProgress.style.width = `${percentElapsed}%`;
        timelineProgress.style.background = 'var(--success)';
    } else {
        // Too early
        daysRemainingEl.textContent = diffDays;
        daysRemainingEl.className = 'status-number';
        statusLabel.textContent = 'Days remaining until expiration';
        statusMessage.innerHTML = `<span><strong>Too early to file.</strong> Your recommended renewal window opens on <strong>${opensDate.toLocaleDateString()}</strong> (180 days prior to expiration). Filing now may result in rejection of application.</span>`;
        timelineProgress.style.width = '0%';
    }

    // Document checklists
    const checklist = document.getElementById('gcDocChecklist');
    checklist.innerHTML = `
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" checked disabled> A copy of your current Permanent Resident Card (Form I-551)
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" checked disabled> Online USCIS Account credentials (for rapid e-filing)
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" checked disabled> Copy of government-issued ID (if card is lost, damaged or has incorrect details)
        </li>
        <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" checked disabled> Payment method for filing fees ($415 online or $465 paper)
        </li>
    `;

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 4. J-1 Visa Compliance Tracker
// ==========================================
function calculateJ1Compliance() {
    const startInput = document.getElementById('dsStart').value;
    const endInput = document.getElementById('dsEnd').value;
    const assessmentInput = document.getElementById('assessmentDate').value;

    if (!startInput || !endInput || !assessmentInput) {
        alert('Please complete all program date fields.');
        return;
    }

    const startDate = new Date(startInput);
    const endDate = new Date(endInput);
    const assessmentDate = new Date(assessmentInput);

    if (endDate < startDate) {
        alert('Error: Program end date cannot be before start date.');
        return;
    }

    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    const daysRemainingEl = document.getElementById('j1DaysRemaining');
    const statusLabel = document.getElementById('j1StatusLabel');
    const statusMessage = document.getElementById('j1StatusMessage');
    const gracePeriodDates = document.getElementById('gracePeriodDates');

    // 30-day grace period
    const graceStart = new Date(endDate);
    graceStart.setDate(endDate.getDate() + 1);
    const graceEnd = new Date(endDate);
    graceEnd.setDate(endDate.getDate() + 30);

    gracePeriodDates.textContent = `${graceStart.toLocaleDateString()} to ${graceEnd.toLocaleDateString()}`;

    if (assessmentDate < startDate) {
        const diffTime = startDate - assessmentDate;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number';
        statusLabel.textContent = 'Days until program start';
        statusMessage.innerHTML = `<span>Your J-1 program status is <strong>Pending</strong>. Your program begins in ${days} days.</span>`;
    } else if (assessmentDate <= endDate) {
        const diffTime = endDate - assessmentDate;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number success';
        statusLabel.textContent = 'Days remaining in program';
        statusMessage.innerHTML = `<span style="color: var(--success)">Your J-1 program status is <strong>Active</strong>. You have ${days} days of program eligibility remaining.</span>`;
    } else if (assessmentDate <= graceEnd) {
        const diffTime = graceEnd - assessmentDate;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number success';
        statusLabel.textContent = 'Days remaining in grace period';
        statusMessage.innerHTML = `<span style="color: #dd6b20">Your J-1 program has ended. You are in the <strong>30-Day Grace Period</strong>. You must depart the U.S. or transfer within ${days} days.</span>`;
    } else {
        const diffTime = assessmentDate - graceEnd;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number danger';
        statusLabel.textContent = 'Days out of compliance';
        statusMessage.innerHTML = `<span style="color: var(--danger)">Your J-1 program and grace period concluded ${days} days ago. Ensure you have departed or filed for adjustment of status.</span>`;
    }

    // Required compliance checks
    const auditChecklist = document.getElementById('j1AuditChecklist');
    auditChecklist.innerHTML = `
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Valid DS-2019 Form signed by Designated School Official (DSO/RO)
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Travel Signature validated within last 12 months (or 6 months for short-term scholars)
        </li>
        <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Mandatory J-1 health insurance compliant with 22 CFR 62.14
        </li>
    `;

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
