// GlobalVisaMath JS Engines

// Cookie Consent — Accept grants analytics/ads storage
function acceptCookies() {
    try { localStorage.setItem('cookieConsent', 'true'); } catch (e) {}
    var banner = document.getElementById('cookieConsent');
    if (banner) banner.classList.add('hidden');
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        });
    }
}

window.addEventListener('load', function () {
    var banner = document.getElementById('cookieConsent');
    if (!banner) return;
    try {
        if (localStorage.getItem('cookieConsent') === 'true') {
            banner.classList.add('hidden');
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    ad_storage: 'granted',
                    analytics_storage: 'granted',
                    ad_user_data: 'granted',
                    ad_personalization: 'granted'
                });
            }
        }
    } catch (e) {}
});

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

/** Local calendar YYYY-MM-DD (avoids UTC shift from toISOString). */
function localYMD(d) {
    const dt = d instanceof Date ? d : new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function eachDayYMD(startDate, endDate) {
    const days = [];
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    while (cur <= end) {
        days.push(localYMD(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return days;
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
        controlDateInput.value = localYMD(new Date());
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
                <div class="input-group" style="flex:0 0 auto; justify-content:flex-end;">
                    <label style="display:flex; align-items:center; gap:0.35rem; white-space:nowrap; font-size:0.85rem;">
                        <input type="checkbox" class="still-in-schengen" id="still_${tripCount}"> Still in Schengen?
                    </label>
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

        // Planning choice: rolling window ends on the assessment date. Days from planned
        // trips (entry after assessment) still count if they fall inside that same window;
        // set assessment to your planned exit to model a future stay. Open stays use
        // assessment as exit when "Still in Schengen?" is checked.
        const windowStart = new Date(controlDate);
        windowStart.setDate(controlDate.getDate() - 179);

        const trips = [];
        const rows = entryList.querySelectorAll('.date-row');
        let hasErrors = false;
        let openStayWarned = false;

        rows.forEach((row, index) => {
            const entryInput = row.querySelector('input[id^="entry_"]');
            const exitInput = row.querySelector('input[id^="exit_"]');
            const stillIn = row.querySelector('.still-in-schengen');
            if (!entryInput || !entryInput.value) return;

            let exitVal = exitInput ? exitInput.value : '';
            if (!exitVal && stillIn && stillIn.checked) {
                exitVal = controlDateVal;
                openStayWarned = true;
            }

            if (!exitVal) {
                showToolError(`Trip ${index + 1}: Enter an exit date, or check "Still in Schengen?" if you have not left yet.`);
                hasErrors = true;
                return;
            }

            const entryDate = parseLocalDate(entryInput.value);
            const exitDate = parseLocalDate(exitVal);

            if (exitDate < entryDate) {
                showToolError(`Error in Trip ${index + 1}: Exit date cannot be before Entry date.`);
                hasErrors = true;
            } else {
                trips.push({ entry: entryDate, exit: exitDate, openStay: !!(stillIn && stillIn.checked && !(exitInput && exitInput.value)) });
            }
        });

        if (hasErrors) return;

        if (trips.length === 0 && rows.length > 0) {
            showToolError('Please enter at least one trip with an entry date (and exit, or mark Still in Schengen).');
            return;
        }

        // Unique calendar-day set so overlapping trips are not double-counted.
        const uniqueDays = new Set();
        const auditLog = [];

        trips.forEach((trip, index) => {
            const overlapStart = trip.entry > windowStart ? trip.entry : windowStart;
            const overlapEnd = trip.exit < controlDate ? trip.exit : controlDate;
            let days = 0;

            if (overlapStart <= overlapEnd) {
                const dayList = eachDayYMD(overlapStart, overlapEnd);
                dayList.forEach((d) => uniqueDays.add(d));
                days = dayList.length;
                auditLog.push(`Trip ${index + 1} (${trip.entry.toLocaleDateString()} to ${trip.exit.toLocaleDateString()}${trip.openStay ? ', still in Schengen' : ''}): <strong>${days} unique day(s)</strong> overlap the window.`);
            } else {
                auditLog.push(`Trip ${index + 1}: Fell outside the 180-day window ending on assessment date.`);
            }
        });

        const totalDaysUsed = uniqueDays.size;
        if (openStayWarned) {
            auditLog.unshift('Open stay: exit treated as the assessment date ("Still in Schengen?").');
        }
        if (trips.length > 1) {
            auditLog.push(`After merging overlaps: <strong>${totalDaysUsed}</strong> unique calendar days in the window.`);
        }

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
            statusMessage.innerHTML = `<span style="display:inline-block; background-color: var(--danger); color: white; padding: 4px 12px; border-radius: 99px; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem;">STATUS: OVER 90 DAYS ❌</span><br><span style="color: var(--danger)">You have exceeded the 90-day limit by ${daysUsed - 90} days.</span>`;
        } else {
            daysUsedEl.style.color = 'var(--primary)';
            statusMessage.innerHTML = `<span style="display:inline-block; background-color: var(--success); color: white; padding: 4px 12px; border-radius: 99px; font-weight: 700; margin-bottom: 8px; font-size: 0.9rem;">STATUS: SAFE ✅</span><br><span style="color: var(--success)">You are compliant. You have ${daysLeft} days remaining in this window.</span>`;
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

        // Cross-sell CTA
        var existingCta = resultsSection.querySelector('.cross-sell-cta');
        if (!existingCta) {
            var ctaDiv = document.createElement('div');
            ctaDiv.className = 'cross-sell-cta';
            ctaDiv.innerHTML = '<span class="cta-icon">📸</span><div class="cta-text"><strong>Applying for a Schengen visa?</strong><p>Get a compliant visa photo in 60 seconds — free, processed in your browser, no photo uploads to our servers.</p></div><a href="schengen-visa-photo-maker.html" class="btn-cta">Make Photo →</a>';
            resultsSection.appendChild(ctaDiv);
        }
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

    // Age points — IRCC CRS grid (Oct 2026): without spouse / with spouse
    const ageVal = document.getElementById('age').value;
    let agePoints = 0;
    // IRCC: ages 20–29 share one band (110 without spouse / 100 with).
    if (isMarried) {
        const marriedAgeMap = {
            '17': 0, '18': 90, '19': 95,
            '20': 100, '21': 100, '22': 100, '23': 100, '24': 100, '25': 100, '26': 100, '27': 100, '28': 100, '29': 100,
            '30': 95, '31': 90, '32': 85, '33': 80, '34': 75, '35': 70, '36': 65, '37': 60, '38': 55, '39': 50,
            '40': 45, '41': 35, '42': 25, '43': 15, '44': 5, '45': 0
        };
        agePoints = marriedAgeMap[ageVal] || 0;
    } else {
        const singleAgeMap = {
            '17': 0, '18': 99, '19': 105,
            '20': 110, '21': 110, '22': 110, '23': 110, '24': 110, '25': 110, '26': 110, '27': 110, '28': 110, '29': 110,
            '30': 105, '31': 99, '32': 94, '33': 88, '34': 83, '35': 77, '36': 72, '37': 66, '38': 61, '39': 55,
            '40': 50, '41': 39, '42': 28, '43': 17, '44': 6, '45': 0
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

    // Language points (First official language) — per ability × 4; less than CLB 4 = 0
    const langVal = document.getElementById('firstLanguage').value;
    let langPoints = 0;
    const clbMap = {
        'below4': 0, 'clb4': 6, 'clb5': 6, 'clb6': 9, 'clb7': 17, 'clb8': 23, 'clb9': 31, 'clb10': 34
    };
    langPoints = (clbMap[langVal] || 0) * 4;
    if (isMarried) {
        // Married CLB 9 is 29 per ability (not 30)
        const marriedClbMap = {
            'below4': 0, 'clb4': 6, 'clb5': 6, 'clb6': 8, 'clb7': 16, 'clb8': 22, 'clb9': 29, 'clb10': 32
        };
        langPoints = (marriedClbMap[langVal] || 0) * 4;
    }

    // Canadian work experience — IRCC work-length grid (current; unchanged length points through Nov 2026)
    const canWorkVal = document.getElementById('canWork').value;
    let canWorkPoints = 0;
    const workMap = {
        'none': 0, '1yr': 40, '2yr': 53, '3yr': 64, '4yr': 72, '5yr': 80
    };
    canWorkPoints = workMap[canWorkVal] || 0;
    if (isMarried) {
        const marriedWorkMap = {
            'none': 0, '1yr': 35, '2yr': 46, '3yr': 56, '4yr': 63, '5yr': 70
        };
        canWorkPoints = marriedWorkMap[canWorkVal] || 0;
    }

    // Spouse factors
    let spouseEduPoints = 0;
    let spouseLangPoints = 0;
    let spouseWorkPoints = 0;
    if (isMarried) {
        const spouseEduVal = document.getElementById('spouseEducation').value;
        const spouseEduMap = { 'none': 0, 'hs': 2, '1yr': 6, '2yr': 7, '3yr': 8, 'multi': 9, 'masters': 10, 'phd': 10 };
        spouseEduPoints = spouseEduMap[spouseEduVal] || 0;

        const spouseLangVal = document.getElementById('spouseLanguage').value;
        // Totals for all 4 abilities: CLB≤4:0, 5–6:4, 7–8:12, 9+:20
        const spouseLangMap = { 'clb4': 0, 'below4': 0, 'clb5': 4, 'clb7': 12, 'clb9': 20 };
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

    // Additional points (Max 600). Job-offer / arranged-employment CRS points removed since 25 Mar 2025 (still 0 as of Oct 2026).
    let additionalPoints = 0;
    if (document.getElementById('siblingCanada').checked) additionalPoints += 15;
    if (document.getElementById('frenchLanguage').checked) {
        // NCLC 7+ French: 25 if English ≤CLB 4 (or none); 50 if English CLB 5+
        const englishAtMostClb4 = (langVal === 'below4' || langVal === 'clb4');
        additionalPoints += englishAtMostClb4 ? 25 : 50;
    }
    const canStudyEl = document.getElementById('canStudy');
    if (canStudyEl) {
        if (canStudyEl.tagName === 'SELECT') {
            if (canStudyEl.value === '1_2yr') additionalPoints += 15;
            else if (canStudyEl.value === '3yr') additionalPoints += 30;
        } else if (canStudyEl.checked) {
            additionalPoints += 15;
        }
    }
    // arrangedJob intentionally ignored — currently 0 CRS points
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

    var crsResults = document.getElementById('resultsSection');
    var existingCta = crsResults.querySelector('.cross-sell-cta');
    if (!existingCta) {
        var ctaDiv = document.createElement('div');
        ctaDiv.className = 'cross-sell-cta';
        ctaDiv.innerHTML = '<span class="cta-icon">📸</span><div class="cta-text"><strong>Preparing your Express Entry application?</strong><p>Create a compliant Canada PR photo — free, processed in your browser (analytics/ads may still load).</p></div><a href="canada-pr-passport-photo-maker.html" class="btn-cta">Make Photo →</a>';
        crsResults.appendChild(ctaDiv);
    }
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

    var gcResults = document.getElementById('resultsSection');
    var existingCta = gcResults.querySelector('.cross-sell-cta');
    if (!existingCta) {
        var ctaDiv = document.createElement('div');
        ctaDiv.className = 'cross-sell-cta';
        ctaDiv.innerHTML = '<span class="cta-icon">📸</span><div class="cta-text"><strong>Renewing your Green Card?</strong><p>Get a compliant US passport photo in 60 seconds — free, no uploads.</p></div><a href="us-visa-passport-photo-maker.html" class="btn-cta">Make Photo →</a>';
        gcResults.appendChild(ctaDiv);
    }
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

    // Required compliance checks — unchecked; user must verify each item
    const auditChecklist = document.getElementById('j1AuditChecklist');
    auditChecklist.innerHTML = `
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="j1CheckDs2019"> Valid DS-2019 Form signed by Designated School Official (DSO/RO)
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="j1CheckTravel"> Travel Signature validated within last 12 months (or 6 months for short-term scholars)
        </li>
        <li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="j1CheckInsurance"> Mandatory J-1 health insurance compliant with 22 CFR 62.14
        </li>
    `;

    resultsSection.scrollIntoView({ behavior: 'smooth' });
    trackEvent('calculate_j1_compliance');

    var j1Results = document.getElementById('resultsSection');
    var existingCta = j1Results.querySelector('.cross-sell-cta');
    if (!existingCta) {
        var ctaDiv = document.createElement('div');
        ctaDiv.className = 'cross-sell-cta';
        ctaDiv.innerHTML = '<span class="cta-icon">📸</span><div class="cta-text"><strong>Need a J-1 visa photo?</strong><p>Create a compliant US visa photo in 60 seconds — free, processed in your browser, no photo uploads to our servers.</p></div><a href="us-visa-passport-photo-maker.html" class="btn-cta">Make Photo →</a>';
        j1Results.appendChild(ctaDiv);
    }
}
