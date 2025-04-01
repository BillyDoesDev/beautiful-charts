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

// Function to create the bar chart
function createBarChart() {
    fetch('/get_bar_data')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('barChart').getContext('2d');
            const gradient = createBarGradient(ctx);
            
            new Chart(ctx, {
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
            
            new Chart(ctx, {
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
            
            new Chart(ctx, {
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
            
            // Create gauge chart
            new Chart(ctx, {
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
        });
}

// Create charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    createBarChart();
    createDoughnutChart();
    createTimeSeriesChart();
    createRarityGauge();
});