console.log("ready")
const URI = "http://127.0.0.1:8000/llm"
// const URI = "https://awaited-musical-jaguar.ngrok-free.app/llm"

let dreamInput = document.querySelector(".dream-textarea");
let responseDiv = document.querySelector(".response");
let responseContainer = document.querySelector(".response-container");
let loadingArea = document.querySelector(".loader");
let submitButton = document.querySelector(".submit-button");
let responseImage = document.querySelector(".response-image");
let archetypeHeading = document.querySelector(".archetype-heading");
let serverMessage = document.querySelector(".server-message");
let tabsContainer = document.querySelector(".tabs-container");

document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.querySelector(".dream-textarea");
    console.log("auto resize on")
    if (textarea) {
        textarea.style.overflow = "hidden";                         // Prevent scrollbar
        textarea.style.height = "auto";                             // Reset height initially
        textarea.style.height = textarea.scrollHeight + "px";       // Set height dynamically

        textarea.addEventListener("input", function () {
            this.style.height = "auto";                             // Reset height
            this.style.height = this.scrollHeight + "px";           // Set new height
        });
    }
    
    // Setup tabs functionality
    setupTabs();
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function toTitleCase(str) {
    return str.replace(/_/g, ' ')                         // Convert snake_case to spaces
        .replace(/([a-z])([A-Z0-9])/g, '$1 $2')           // Convert camelCase to spaces
        .replace(/\b\w/g, char => char.toUpperCase());    // Capitalize first letter of each word
}

function generateHTML(data, container) {
    Object.entries(data).forEach(([key, value]) => {

        let heading = document.createElement("div");

        if (key.toLowerCase() == "text" || key.toLowerCase() == "title") {

        } else {
            heading.textContent = toTitleCase(key);
        }
        heading.classList.add("response-heading");
        container.appendChild(heading);

        if (typeof value === "object" && !Array.isArray(value)) {
            // `value` is another object, and not an array

            // heading.classList.add("heading-sub");
            let subContainer = document.createElement("div");
            subContainer.classList.add("response-heading-sub");
            generateHTML(value, subContainer);
            container.appendChild(subContainer);

        } else if (Array.isArray(value)) {
            let listContainer = document.createElement("div");

            value.forEach((item, index) => {

                let paragraph = document.createElement("p");
                let spam = "";
                if (typeof item === "object") {
                    Object.entries(item).forEach(([k, v]) => {
                        spam += v + "."
                    })
                } else {
                    spam = item;
                }
                paragraph.textContent = spam;
                listContainer.appendChild(paragraph);

            });
            container.appendChild(listContainer);

        } else {
            let paragraph = document.createElement("p");
            paragraph.textContent = value;
            container.appendChild(paragraph);
        }
    });
}

document.querySelector(".dream-form").addEventListener("submit", async (event) => {
    event.preventDefault()

    if (!dreamInput.value) {
        console.error("Empty form submitted. KYS");
        return;
    }

    responseDiv.innerHTML = "";
    responseImage.classList.add("invisible")
    archetypeHeading.classList.add("invisible")
    serverMessage.classList.add("invisible")
    tabsContainer.classList.add("invisible")
    console.log("nuked");
    loadingArea.classList.remove("invisible");
    responseContainer.classList.remove("fade-in")

    let formData = new FormData();
    formData.append("dream", dreamInput.value);

    try {
        const response = await fetch(URI, {
            method: "POST",
            body: formData,
        });

        console.log("data exchanged")
        let jsonResponse = await response.json();
        jsonResponse = Object.fromEntries(jsonResponse.map(item => [item._id_, item._text_]));
        console.log(jsonResponse);

        let archetype = jsonResponse.archetype;
        let descriptiveContent = jsonResponse.descriptive_content;

        generateHTML(descriptiveContent, responseDiv);
        responseContainer.classList.add("fade-in")

        loadingArea.classList.add("invisible")
        serverMessage.classList.add("invisible")
        responseImage.style.backgroundImage = `url("../static/assets/${archetype}.webp")`
        responseImage.classList.remove("invisible")
        archetypeHeading.textContent = `The ${archetype}`
        archetypeHeading.classList.remove("invisible")
        tabsContainer.classList.remove("invisible")
        
        // Initialize or update charts after getting response
        initializeCharts();
        populateResourcesTab(archetype);

    } catch (e) {
        console.error(e);
        loadingArea.classList.add("invisible")
        serverMessage.classList.remove("invisible")
        return;
    }
})

submitButton.addEventListener("mouseover", () => {
    if (!dreamInput.value) {
        submitButton.style.cursor = "not-allowed";
    } else {
        submitButton.style.cursor = "pointer";
    }
});

// Chart functionality
// Dark theme settings for all charts
Chart.defaults.color = '#eee';
Chart.defaults.borderColor = '#333';

// Custom gradient for Bar Chart
function createBarGradient(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#5964F3');
    gradient.addColorStop(0.5, '#F650A0');
    gradient.addColorStop(1, '#DCB7F4');
    return gradient;
}

// Initialize or update all charts
function initializeCharts() {
    createBarChart();
    createDoughnutChart();
    createTimeSeriesChart();
    createRarityGauge();
}

// Function to create the bar chart
function createBarChart() {
    fetch('/get_bar_data')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('barChart').getContext('2d');
            const gradient = createBarGradient(ctx);
            
            // Check if chart instance exists and destroy it
            if (window.barChartInstance) {
                window.barChartInstance.destroy();
            }
            
            window.barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.values,
                        backgroundColor: gradient,
                        borderColor: 'transparent',
                        borderRadius: 5,
                        barPercentage: 0.6,
                        maxBarThickness: 50
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#1e1e2e',
                            titleColor: '#eee',
                            bodyColor: '#eee',
                            borderColor: '#333',
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return `Count: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }).catch(error => {
            console.error("Error fetching bar chart data:", error);
        });
}

// Function to create doughnut chart
function createDoughnutChart() {
    fetch('/get_doughnut_data')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('doughnutChart').getContext('2d');
            
            // Custom colors for doughnut segments
            const colors = [
                '#5964F3', // Blue
                '#F650A0', // Pink
                '#DCB7F4', // Light Purple
                '#64B5F6', // Light Blue
                '#BA68C8'  // Purple
            ];
            
            // Check if chart instance exists and destroy it
            if (window.doughnutChartInstance) {
                window.doughnutChartInstance.destroy();
            }
            
            window.doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.values,
                        backgroundColor: colors,
                        borderColor: '#1e1e2e',
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 15,
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e1e2e',
                            titleColor: '#eee',
                            bodyColor: '#eee',
                            borderColor: '#333',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${context.label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }).catch(error => {
            console.error("Error fetching doughnut chart data:", error);
        });
}

// Function to create time series line chart
function createTimeSeriesChart() {
    fetch('/get_time_series_data')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('timeSeriesChart').getContext('2d');
            
            // Custom colors for different archetypes
            const colors = [
                '#5964F3', // Blue
                '#F650A0', // Pink
                '#DCB7F4', // Light Purple
                '#64B5F6', // Light Blue
                '#BA68C8'  // Purple
            ];
            
            const datasets = data.data.map((item, index) => {
                return {
                    label: item.archetype,
                    data: item.values,
                    borderColor: colors[index % colors.length],
                    backgroundColor: `${colors[index % colors.length]}33`, // Add transparency
                    borderWidth: 2,
                    tension: 0.3, // Smooth curve
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                };
            });
            
            // Check if chart instance exists and destroy it
            if (window.timeSeriesChartInstance) {
                window.timeSeriesChartInstance.destroy();
            }
            
            window.timeSeriesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.dates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e1e2e',
                            titleColor: '#eee',
                            bodyColor: '#eee',
                            borderColor: '#333',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }).catch(error => {
            console.error("Error fetching time series data:", error);
        });
}

// Function to create gauge chart for rarity score
function createRarityGauge() {
    fetch('/get_rarity_score')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('rarityGauge').getContext('2d');
            
            // Create gradient for gauge
            const gradientSegments = ctx.createLinearGradient(0, 0, 200, 0);
            gradientSegments.addColorStop(0, '#64B5F6');    // Common - Blue
            gradientSegments.addColorStop(0.4, '#5964F3');  // Uncommon - Deeper Blue
            gradientSegments.addColorStop(0.7, '#F650A0');  // Rare - Pink
            gradientSegments.addColorStop(1, '#DCB7F4');    // Mythic - Purple
            
            // Check if chart instance exists and destroy it
            if (window.rarityGaugeInstance) {
                window.rarityGaugeInstance.destroy();
            }
            
            // Create gauge chart
            window.rarityGaugeInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [data.score, 100 - data.score],
                        backgroundColor: [
                            gradientSegments,
                            'rgba(62, 62, 75, 0.6)'  // Dark background for empty part
                        ],
                        circumference: 180,
                        rotation: 270,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '75%',
                    plugins: {
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            display: false
                        }
                    }
                },
                plugins: [{
                    id: 'rarityText',
                    afterDraw: (chart) => {
                        const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
                        
                        ctx.save();
                        
                        // Draw score
                        ctx.font = 'bold 24px Segoe UI';
                        ctx.fillStyle = '#eee';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${data.score}`, width / 2 + left, height / 2 + top - 10);
                        
                        // Draw label
                        ctx.font = '14px Segoe UI';
                        ctx.fillStyle = '#ccc';
                        ctx.textAlign = 'center';
                        ctx.fillText('Rarity Score', width / 2 + left, height / 2 + top + 15);
                        
                        // Draw archetype
                        ctx.font = 'italic 14px Segoe UI';
                        ctx.fillStyle = '#aaa';
                        ctx.textAlign = 'center';
                        ctx.fillText(`Archetype: ${data.archetype}`, width / 2 + left, height / 2 + top + 40);
                        
                        // Draw scale markers
                        ctx.font = '11px Segoe UI';
                        ctx.fillStyle = '#999';
                        ctx.textAlign = 'left';
                        ctx.fillText('0', left + 10, bottom - 5);
                        
                        ctx.textAlign = 'right';
                        ctx.fillText('100', right - 10, bottom - 5);
                        
                        ctx.restore();
                    }
                }]
            });
            
            // Update rarity description
            let rarityDescription;
            if (data.score < 25) rarityDescription = "Common";
            else if (data.score < 50) rarityDescription = "Uncommon";
            else if (data.score < 75) rarityDescription = "Rare";
            else rarityDescription = "Mythic";
            
            document.getElementById('rarityDescription').textContent = rarityDescription;
        }).catch(error => {
            console.error("Error fetching rarity score:", error);
        });
}

// Resource tab content generator
function populateResourcesTab(archetype) {
    const resourcesGrid = document.querySelector('.resources-grid');
    resourcesGrid.innerHTML = ''; // Clear existing content
    
    // Resource data based on archetype
    const resourceData = getResourcesForArchetype(archetype);
    
    // Generate resource cards
    resourceData.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        
        card.innerHTML = `
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <div class="resource-links">
                ${resource.links.map(link => `
                    <a href="#" class="resource-link" onclick="return false;">
                        ${link.type} <span class="resource-arrow">→</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        resourcesGrid.appendChild(card);
    });
}

// Get resources based on archetype
function getResourcesForArchetype(archetype) {
    // Default resources
    const defaultResources = [
        {
            title: "Understanding Jungian Archetypes",
            description: "An introduction to Carl Jung's theory of archetypes and their significance in dream interpretation.",
            links: [
                { type: "Article", url: "#" },
                { type: "Video", url: "#" }
            ]
        },
        {
            title: "Dream Symbolism Dictionary",
            description: "Comprehensive guide to common dream symbols and their potential meanings across cultures.",
            links: [
                { type: "Reference", url: "#" }
            ]
        }
    ];
    
    // Archetype-specific resources
    const archetypeResources = {
        "explorer": [
            {
                title: "The Explorer Archetype",
                description: "Deep dive into the Explorer archetype and its manifestations in dreams, literature, and culture.",
                links: [
                    { type: "Study", url: "#" },
                    { type: "Examples", url: "#" }
                ]
            }
        ],
        "hero": [
            {
                title: "The Hero's Journey",
                description: "Joseph Campbell's monomyth and its connection to the Hero archetype in dreams.",
                links: [
                    { type: "Analysis", url: "#" },
                    { type: "Practice", url: "#" }
                ]
            }
        ],
        "caregiver": [
            {
                title: "The Nurturing Mind",
                description: "Understanding the Caregiver archetype and its psychological significance.",
                links: [
                    { type: "Research", url: "#" },
                    { type: "Applications", url: "#" }
                ]
            }
        ],
        "everyman": [
            {
                title: "The Everyman in Dreams",
                description: "Exploring the commonality and significance of the Everyman archetype in dream analysis.",
                links: [
                    { type: "Guide", url: "#" }
                ]
            }
        ],
        "outlaw": [
            {
                title: "Rebellion in Dreams",
                description: "The psychological significance of the Outlaw archetype in dream interpretation.",
                links: [
                    { type: "Case Studies", url: "#" }
                ]
            }
        ],
        "sage": [
            {
                title: "Wisdom and Knowledge",
                description: "Exploring the Sage archetype's appearances in dreams and its connection to personal growth.",
                links: [
                    { type: "Analysis", url: "#" },
                    { type: "Practices", url: "#" }
                ]
            }
        ],
        "creator": [
            {
                title: "Creative Expression in Dreams",
                description: "Understanding how the Creator archetype manifests in dreams and waking life.",
                links: [
                    { type: "Workshop", url: "#" },
                    { type: "Examples", url: "#" }
                ]
            }
        ]
    };
    
    // Combine default resources with archetype-specific ones
    let resources = [...defaultResources];
    
    if (archetypeResources[archetype]) {
        resources = [...archetypeResources[archetype], ...resources];
    }
    
    return resources;
}
