// GlobalVisaMath JS Engines

// Analytics tracking helper
function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}

function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function ensureFormErrorContainer() {
    var error = document.getElementById('formError');
    if (error) return error;

    var target = document.querySelector('.action-row') || document.querySelector('.input-section') || document.querySelector('.calculator-panel') || document.querySelector('main') || document.body;
    error = document.createElement('div');
    error.id = 'formError';
    error.className = 'form-error';
    error.style.display = 'none';
    error.setAttribute('role', 'alert');
    error.setAttribute('aria-live', 'assertive');
    if (target && target.parentNode) {
        target.parentNode.insertBefore(error, target.nextSibling);
    } else {
        document.body.insertBefore(error, document.body.firstChild);
    }
    return error;
}

function showToolError(message) {
    var error = ensureFormErrorContainer();
    error.textContent = message;
    error.style.display = 'block';
}

function clearToolError() {
    var error = document.getElementById('formError');
    if (error) {
        error.textContent = '';
        error.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('visaHamburger');
    const navLinks = document.getElementById('visaNavLinks');
    if (hamburger && navLinks) {
        var visaMenuOpen = false;
        function closeVisaMenu() {
            visaMenuOpen = false;
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            visaMenuOpen = !visaMenuOpen;
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', visaMenuOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                closeVisaMenu();
            }
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', closeVisaMenu);
        });
    }

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
        clearToolError();
    if (!controlDateVal) {
            showToolError('Please select a Date of Assessment.');
            return;
        }

        const controlDate = parseLocalDate(controlDateVal);

        const windowStart = new Date(controlDate);
        windowStart.setDate(controlDate.getDate() - 179);

        const trips = [];
        const rows = entryList.querySelectorAll('.date-row');
        let hasErrors = false;

        rows.forEach((row, index) => {
            const entryInput = row.querySelector('input[id^="entry_"]');
            const exitInput = row.querySelector('input[id^="exit_"]');
            
            if (entryInput.value && exitInput.value) {
                const entryDate = parseLocalDate(entryInput.value);
                const exitDate = parseLocalDate(exitInput.value);

                if (exitDate < entryDate) {
                    showToolError(`Error in Trip ${index + 1}: Exit date cannot be before Entry date.`);
                    hasErrors = true;
                } else {
                    trips.push({ entry: entryDate, exit: exitDate });
                }
            }
        });

        if (hasErrors) return;
        
        if (trips.length === 0 && rows.length > 0) {
            showToolError('Please enter at least one trip with both entry and exit dates.');
            return;
        }

        let totalDaysUsed = 0;
        const auditLog = [];

        trips.forEach((trip, index) => {
            const overlapStart = trip.entry > windowStart ? trip.entry : windowStart;
            const overlapEnd = trip.exit < controlDate ? trip.exit : controlDate;

            if (overlapStart <= overlapEnd) {
                const diffTime = Math.abs(overlapEnd - overlapStart);
                const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                totalDaysUsed += days;
                auditLog.push(`Trip ${index + 1} (${trip.entry.toLocaleDateString()} to ${trip.exit.toLocaleDateString()}): <strong>${days} days</strong> counted in window.`);
            } else {
                auditLog.push(`Trip ${index + 1}: Fell outside the 180-day window.`);
            }
        });

        displaySchengenResults(totalDaysUsed, auditLog, windowStart, controlDate);
        trackEvent('calculate_schengen', { days_used: totalDaysUsed, trips_count: trips.length });
    }

    function displaySchengenResults(daysUsed, auditLog, windowStart, windowEnd) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        resultsSection.style.display = 'block';
        
        const daysUsedEl = document.getElementById('daysUsed');
        daysUsedEl.textContent = daysUsed;
        
        const schengenCircle = document.getElementById('schengenCircle');
        if (schengenCircle) {
            const circumference = 282.74;
            const pct = Math.min(daysUsed / 90, 1.0);
            const offset = circumference - (pct * circumference);
            schengenCircle.style.strokeDasharray = `${circumference}`;
            schengenCircle.style.strokeDashoffset = `${offset}`;
            if (daysUsed > 90) {
                schengenCircle.style.stroke = 'var(--danger)';
            } else {
                schengenCircle.style.stroke = 'var(--accent)';
            }
        }

        const statusMessage = document.getElementById('statusMessage');
        const daysLeft = 90 - daysUsed;

        if (daysUsed > 90) {
            daysUsedEl.style.color = 'var(--danger)';
            statusMessage.innerHTML = `<span style="color: var(--danger)">You have exceeded the 90-day limit by ${daysUsed - 90} days.</span>`;
        } else {
            daysUsedEl.style.color = 'var(--primary)';
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
        clearToolError();
        const maritalStatusEl = document.getElementById('maritalStatus');
        if (!maritalStatusEl) return; // guard for wrong page
        const maritalStatus = maritalStatusEl.value;
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
        'clb4': 6, 'clb5': 6, 'clb6': 9, 'clb7': 17, 'clb8': 23, 'clb9': 31, 'clb10': 34
    };
    langPoints = (clbMap[langVal] || 0) * 4; // Reading, Writing, Speaking, Listening equal weight assumed
    if (isMarried) {
        const marriedClbMap = {
            'clb4': 6, 'clb5': 6, 'clb6': 8, 'clb7': 16, 'clb8': 22, 'clb9': 30, 'clb10': 32
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
        const spouseEduMap = { 'none': 0, 'hs': 2, '1yr': 6, '2yr': 7, '3yr': 8, 'multi': 9, 'masters': 10 };
        spouseEduPoints = spouseEduMap[spouseEduVal] || 0;

        const spouseLangVal = document.getElementById('spouseLanguage').value;
        const spouseLangMap = { 'clb4': 0, 'clb5': 4, 'clb7': 12, 'clb9': 20 };
        spouseLangPoints = spouseLangMap[spouseLangVal] || 0;

        const spouseWorkVal = document.getElementById('spouseWork').value;
        const spouseWorkMap = { 'none': 0, '1yr': 5, '2yr': 7, '3yr': 8, '4yr': 9, '5yr': 10 };
        spouseWorkPoints = spouseWorkMap[spouseWorkVal] || 0;
    }

    // Skill transferability factors
    let transferabilityPoints = 0;
    
    // Language proficiency category for transferability
    const hasCLB9Plus = langVal === 'clb9' || langVal === 'clb10';
    const hasCLB7Or8 = langVal === 'clb7' || langVal === 'clb8';
    
    // Education category
    const isSingleEdu = eduVal === '1yr' || eduVal === '2yr' || eduVal === '3yr';
    const isMultiEdu = eduVal === 'multi' || eduVal === 'masters' || eduVal === 'phd';
    
    // Canadian work category
    const canWork1Yr = canWorkVal === '1yr';
    const canWork2YrPlus = canWorkVal !== 'none' && canWorkVal !== '1yr';
    
    // Foreign work category
    const foreignWorkVal = document.getElementById('foreignWork').value;
    const isForeign1To2 = foreignWorkVal === '1yr';
    const isForeign3Plus = foreignWorkVal === '3yr';

    // 1. Education + Language (Max 50 points)
    let eduLangPoints = 0;
    if (isMultiEdu) {
        if (hasCLB9Plus) eduLangPoints = 50;
        else if (hasCLB7Or8) eduLangPoints = 25;
    } else if (isSingleEdu) {
        if (hasCLB9Plus) eduLangPoints = 25;
        else if (hasCLB7Or8) eduLangPoints = 13;
    }

    // 2. Education + Canadian Work Experience (Max 50 points)
    let eduCanWorkPoints = 0;
    if (isMultiEdu) {
        if (canWork2YrPlus) eduCanWorkPoints = 50;
        else if (canWork1Yr) eduCanWorkPoints = 25;
    } else if (isSingleEdu) {
        if (canWork2YrPlus) eduCanWorkPoints = 25;
        else if (canWork1Yr) eduCanWorkPoints = 13;
    }

    // 3. Foreign Work Experience + Language (Max 50 points)
    let foreignLangPoints = 0;
    if (isForeign3Plus) {
        if (hasCLB9Plus) foreignLangPoints = 50;
        else if (hasCLB7Or8) foreignLangPoints = 25;
    } else if (isForeign1To2) {
        if (hasCLB9Plus) foreignLangPoints = 25;
        else if (hasCLB7Or8) foreignLangPoints = 13;
    }

    // 4. Foreign Work Experience + Canadian Work Experience (Max 50 points)
    let foreignCanWorkPoints = 0;
    if (isForeign3Plus) {
        if (canWork2YrPlus) foreignCanWorkPoints = 50;
        else if (canWork1Yr) foreignCanWorkPoints = 25;
    } else if (isForeign1To2) {
        if (canWork2YrPlus) foreignCanWorkPoints = 25;
        else if (canWork1Yr) foreignCanWorkPoints = 13;
    }

    // Combine categories:
    const subTotalA = Math.min(50, eduLangPoints + eduCanWorkPoints);
    const subTotalB = Math.min(50, foreignLangPoints + foreignCanWorkPoints);
    transferabilityPoints = subTotalA + subTotalB;

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

    const crsCircle = document.getElementById('crsCircle');
    if (crsCircle) {
        const circumference = 282.74;
        const pct = Math.min(grandTotal / 1200, 1.0);
        const offset = circumference - (pct * circumference);
        crsCircle.style.strokeDasharray = `${circumference}`;
        crsCircle.style.strokeDashoffset = `${offset}`;
    }

    const pointsList = document.getElementById('pointsBreakdownList');
    pointsList.innerHTML = `
        <li>Core Human Capital Points: <strong>${coreHumanTotal}</strong> (Age: ${agePoints}, Education: ${eduPoints}, Language: ${langPoints}, Canadian Work: ${canWorkPoints})</li>
        ${isMarried ? `<li>Spouse / Partner Factors: <strong>${spouseTotal}</strong> (Education: ${spouseEduPoints}, Language: ${spouseLangPoints}, Canadian Work: ${spouseWorkPoints})</li>` : ''}
        <li>Skill Transferability: <strong>${transferabilityPoints}</strong> / 100 (Education Factors: ${subTotalA}/50, Experience Factors: ${subTotalB}/50)</li>
        <li>Additional Factors: <strong>${additionalPoints}</strong> / 600</li>
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
    trackEvent('calculate_crs', { score: grandTotal, marital_status: maritalStatus });
}

// ==========================================
// 3. Green Card Renewal Estimator
// ==========================================
function calculateGCRenewal() {
    clearToolError();
    const expiryInput = document.getElementById('gcExpiryDate').value;
    if (!expiryInput) {
        showToolError('Please select your Green Card expiration date.');
        return;
    }

    const expiryDate = parseLocalDate(expiryInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

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
    trackEvent('calculate_gc_renewal', { days_remaining: diffDays });
}

// ==========================================
// 4. J-1 Visa Compliance Tracker
// ==========================================
function calculateJ1Compliance() {
    clearToolError();
    const startInput = document.getElementById('dsStart').value;
    const endInput = document.getElementById('dsEnd').value;
    const assessmentInput = document.getElementById('assessmentDate').value;

    if (!startInput || !endInput || !assessmentInput) {
        showToolError('Please complete all program date fields.');
        return;
    }

    const startDate = parseLocalDate(startInput);
    const endDate = parseLocalDate(endInput);
    const assessmentDate = parseLocalDate(assessmentInput);

    if (endDate < startDate) {
        showToolError('Error: Program end date cannot be before start date.');
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
        const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number';
        statusLabel.textContent = 'Days until program start';
        statusMessage.innerHTML = `<span>Your J-1 program status is <strong>Pending</strong>. Your program begins in ${days} days.</span>`;
    } else if (assessmentDate <= endDate) {
        const diffTime = endDate - assessmentDate;
        const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number success';
        statusLabel.textContent = 'Days remaining in program';
        statusMessage.innerHTML = `<span style="color: var(--success)">Your J-1 program status is <strong>Active</strong>. You have ${days} days of program eligibility remaining.</span>`;
    } else if (assessmentDate <= graceEnd) {
        const diffTime = graceEnd - assessmentDate;
        const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
        daysRemainingEl.textContent = days;
        daysRemainingEl.className = 'status-number success';
        statusLabel.textContent = 'Days remaining in grace period';
        statusMessage.innerHTML = `<span style="color: #dd6b20">Your J-1 program has ended. You are in the <strong>30-Day Grace Period</strong>. You must depart the U.S. or transfer within ${days} days.</span>`;
    } else {
        const diffTime = assessmentDate - graceEnd;
        const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
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
    trackEvent('calculate_j1_compliance');
}
