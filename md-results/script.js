/* script.js */

// Raw CSV data string (as provided by the user)
const csvData = `jurisdiction,harris,trump,oliver,stein,kennedy,others,total
Allegany,9231,22141,130,136,363,136,32137
Anne Arundel,171945,128892,2141,2429,3375,2790,311572
Baltimore City,195109,27984,892,3222,1875,1672,230754
Baltimore County,249958,149560,2240,4195,3858,3104,412915
Calvert,23438,29361,297,232,554,309,54191
Caroline,4860,11053,84,99,180,54,16330
Carroll,36867,62273,845,629,1182,855,102651
Cecil,17628,33871,291,286,536,219,52831
Charles,63454,26145,334,828,889,447,92097
Dorchester,6954,9390,57,138,191,42,16772
Frederick,82409,68753,970,1378,1494,1110,156114
Garrett,3456,11983,75,48,223,53,15838
Harford,62453,83050,1023,935,1559,1070,150090
Howard,124764,49425,1246,3341,1712,1803,182291
Kent,5251,5561,60,82,114,60,11128
Montgomery,386581,112637,2416,8009,4276,5302,519221
Prince George's,347038,45008,1038,5369,3428,2128,404009
Queen Anne's,11273,20200,174,153,336,211,32347
Saint Mary's,23531,33582,409,352,669,411,58954
Somerset,4054,5805,32,85,114,47,10137
Talbot,11119,11125,109,120,194,163,22830
Washington,27260,44054,363,513,811,331,73332
Wicomico,21513,24065,205,371,544,214,46912
Worcester,12431,19632,139,184,342,153,32881`;

// Candidate information including name, party, and CSS class
const candidateInfo = {
    harris: { name: "Harris", party: "D", class: "harris" },
    trump: { name: "Trump", party: "R", class: "trump" },
    oliver: { name: "Oliver", party: "L", class: "oliver" }, // Assuming Libertarian
    stein: { name: "Stein", party: "G", class: "stein" },   // Assuming Green
    kennedy: { name: "Kennedy", party: "I", class: "kennedy" }, // Assuming Independent
    others: { name: "Others", party: "", class: "others" }     // No party for Others
};

// Function to parse the CSV data string into an array of objects
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const candidateKeys = Object.keys(candidateInfo);
    const orderedHeaders = ['jurisdiction', ...candidateKeys, 'total'];

    if (headers.length !== orderedHeaders.length || !headers.every((h, i) => orderedHeaders.includes(h))) {
         console.error("CSV headers do not match expected format:", headers);
    }

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
         if (values.length !== headers.length) {
            console.warn(`Skipping row ${i + 1}: Incorrect number of columns.`);
            continue;
        }
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j];
            const value = values[j].trim();
            if (key === 'jurisdiction') {
                 entry[key] = value;
            } else {
                 const numValue = parseInt(value, 10);
                 entry[key] = isNaN(numValue) ? 0 : numValue;
            }
        }
        result.push(entry);
    }
    return result;
}

// Function to calculate statewide totals
function calculateStatewideTotals(data) {
    const totals = { total: 0 };
    Object.keys(candidateInfo).forEach(key => {
        totals[key] = 0;
    });

    data.forEach(county => {
        Object.keys(candidateInfo).forEach(key => {
            if (county.hasOwnProperty(key) && typeof county[key] === 'number') {
                totals[key] += county[key];
            }
        });
        if (county.hasOwnProperty('total') && typeof county.total === 'number') {
             totals.total += county.total;
        }
    });
    return totals;
}

// Function to format numbers with commas
function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) {
        return 'N/A';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to display results (either statewide or county) using bars
function displayResults(containerElement, titleElement, title, data, totalVotes) {
    titleElement.textContent = title;
    containerElement.innerHTML = '';

    if (!data || typeof totalVotes !== 'number' || totalVotes <= 0) {
        containerElement.innerHTML = '<p class="text-center text-gray-500">No data available or total votes are zero.</p>';
        return;
    }

    const totalVotesP = document.createElement('p');
    totalVotesP.className = 'text-sm font-semibold text-gray-600 mb-3';
    totalVotesP.textContent = `Total Votes: ${formatNumber(totalVotes)}`;
    containerElement.appendChild(totalVotesP);

    Object.keys(candidateInfo).forEach(key => {
        if (!data.hasOwnProperty(key)) {
            console.warn(`Data for candidate "${key}" not found.`);
            return;
        }

        const votes = data[key];
        if (typeof votes !== 'number') {
             console.warn(`Invalid vote count for candidate "${key}":`, votes);
             return;
        }

        const percentage = ((votes / totalVotes) * 100).toFixed(1);
        const info = candidateInfo[key];
        const displayName = info.name;
        const party = info.party ? `(${info.party})` : '';
        const cssClass = info.class;

        const barContainer = document.createElement('div');
        barContainer.className = 'result-bar-container';

        const label = document.createElement('div');
        label.className = 'result-bar-label text-sm';
        label.textContent = `${displayName} ${party}`;

        const barWrapper = document.createElement('div');
        barWrapper.className = 'result-bar-wrapper';

        const bar = document.createElement('div');
        bar.className = `result-bar ${cssClass}`;
        bar.style.width = '0%'; // Initial width for animation
        // Set text content for the bar itself (might be hidden on small bars)
        bar.textContent = `${percentage}% (${formatNumber(votes)})`;

        // --- Add Tooltip ---
        // Set the title attribute for the hover tooltip
        const tooltipText = `${displayName} ${party}: ${formatNumber(votes)} votes (${percentage}%)`;
        bar.setAttribute('title', tooltipText);
        // Also set the title on the wrapper in case the bar itself is 0 width or very small
        barWrapper.setAttribute('title', tooltipText);


        barWrapper.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(barWrapper);
        containerElement.appendChild(barContainer);

        // --- Animation Trigger ---
        setTimeout(() => {
            bar.style.width = `${percentage}%`;
        }, 10);
    });
}

// --- Main Execution ---

document.addEventListener('DOMContentLoaded', () => {
    const electionData = parseCSV(csvData);
    if (!electionData || electionData.length === 0) {
        console.error("Failed to parse election data or data is empty.");
        document.body.innerHTML = '<p class="text-red-600 font-bold text-center p-8">Error loading election data. Please check the console.</p>';
        return;
    }

    const statewideTotals = calculateStatewideTotals(electionData);

    const countySelect = document.getElementById('county-select');
    const statewideContainer = document.getElementById('statewide-totals-container');
    const countyContainer = document.getElementById('county-percentages-container');
    const countyTitleElement = document.getElementById('county-results-title');
    const statewideTitleElement = document.createElement('div'); // Dummy element

    // Populate county dropdown
    electionData.sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction));
    electionData.forEach(county => {
        const option = document.createElement('option');
        option.value = county.jurisdiction;
        option.textContent = county.jurisdiction;
        countySelect.appendChild(option);
    });

    // Display initial results
    displayResults(statewideContainer, statewideTitleElement, '', statewideTotals, statewideTotals.total);
    displayResults(countyContainer, countyTitleElement, 'Statewide Results', statewideTotals, statewideTotals.total);

    // Add event listener for county selection change
    countySelect.addEventListener('change', (event) => {
        const selectedCountyName = event.target.value;

        if (selectedCountyName) {
            const selectedCountyData = electionData.find(county => county.jurisdiction === selectedCountyName);
            if (selectedCountyData) {
                displayResults(countyContainer, countyTitleElement, `${selectedCountyName} County Results`, selectedCountyData, selectedCountyData.total);
            } else {
                countyContainer.innerHTML = '<p class="text-center text-gray-500">County data not found.</p>';
                countyTitleElement.textContent = 'County Results';
            }
        } else {
             displayResults(countyContainer, countyTitleElement, 'Statewide Results', statewideTotals, statewideTotals.total);
        }
    });
});
