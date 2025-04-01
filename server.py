from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Custom JSON encoder to handle NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

# Configure Flask to use the custom encoder
app.json_encoder = NumpyEncoder

# Sample data generation - replace with your actual data source
def generate_sample_data():
    archetypes = ['explorer', 'everyman', 'hero', 'outlaw', 'sage', 'creator', 'caregiver']
    weights = [0.3, 0.2, 0.15, 0.1, 0.1, 0.1, 0.05]  # Probability weights
    
    # Generate random data with specified distribution
    data = np.random.choice(archetypes, size=100, p=weights)
    df = pd.DataFrame(data, columns=['archetype'])
    
    # Add some other random data for demonstration
    df['value'] = np.random.randint(10, 100, size=len(df))
    
    return df

# Generate time series data for archetypes
def generate_time_series_data():
    archetypes = ['explorer', 'everyman', 'hero', 'outlaw', 'sage']
    end_date = datetime.now()
    
    # Generate dates for the past 6 months
    dates = [(end_date - timedelta(days=i*30)).strftime('%Y-%m') for i in range(6)]
    dates.reverse()  # Chronological order
    
    data = []
    for archetype in archetypes:
        # Generate somewhat smooth trend with some randomness
        base_value = np.random.randint(5, 15)
        trend = np.random.choice([-1, 0, 1])  # Trend direction
        values = []
        
        for i in range(len(dates)):
            # Value changes with some trend and randomness
            val = max(1, base_value + trend * i + np.random.randint(-3, 4))
            # Convert NumPy int64 to regular Python int
            val = int(val)
            values.append(val)
        
        data.append({
            'archetype': archetype,
            'values': values
        })
    print({
        'dates': dates,
        'data': data
    })
    return {
        'dates': dates,
        'data': data
    }

# Calculate rarity score based on archetype distribution
def calculate_rarity_score(archetype):
    # Rarity is inversely proportional to frequency
    archetype_weights = {
        'explorer': 0.3,
        'everyman': 0.2,
        'hero': 0.15,
        'outlaw': 0.1,
        'sage': 0.1,
        'creator': 0.1,
        'caregiver': 0.05
    }
    
    # Calculate base rarity (rare archetypes = high score)
    base_rarity = 100 - (archetype_weights.get(archetype, 0.5) * 100)
    
    # Add some randomness for variability
    randomness = np.random.normal(0, 10)
    
    # Ensure score is between 0 and 100
    score = max(0, min(100, base_rarity + randomness))
    
    # Convert to native Python float
    score = float(round(score, 1))
    
    return score

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_bar_data')
def get_bar_data():
    df = generate_sample_data()
    
    # Convert to the format expected by Chart.js
    counts = df['archetype'].value_counts()
    
    # Convert NumPy types to native Python types
    data = {
        'labels': counts.index.tolist(),
        'values': [int(val) for val in counts.values.tolist()]
    }
    
    return jsonify(data)

@app.route('/get_doughnut_data')
def get_doughnut_data():
    df = generate_sample_data()
    
    # Convert to the format expected by Chart.js
    counts = df['archetype'].value_counts().head(5)  # Only top 5 for doughnut chart
    
    # Convert NumPy types to native Python types
    data = {
        'labels': counts.index.tolist(),
        'values': [int(val) for val in counts.values.tolist()]
    }
    
    return jsonify(data)

@app.route('/get_time_series_data')
def get_time_series_data():
    time_data = generate_time_series_data()
    # No need for additional conversion since we're already 
    # converting in the generate_time_series_data function
    return jsonify(time_data)

@app.route('/get_rarity_score')
def get_rarity_score():
    # For demo purposes, just pick a random archetype
    archetypes = ['explorer', 'everyman', 'hero', 'outlaw', 'sage', 'creator', 'caregiver']
    selected_archetype = np.random.choice(archetypes)
    
    score = calculate_rarity_score(selected_archetype)
    
    return jsonify({
        'score': score,
        'archetype': selected_archetype
    })

if __name__ == '__main__':
    app.run(debug=True)