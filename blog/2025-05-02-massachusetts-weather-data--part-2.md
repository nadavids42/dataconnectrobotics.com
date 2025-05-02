---
title: Massachusetts Weather Data -Part 2
date: 2025-05-02T18:42:00
---
## Part 2 — Analyzing the Data

I told myself I’d wait a couple of days before diving back into this dataset — but honestly, I’m too excited. Now that the data is clean, I want to see what kinds of insights we can pull from it.

To start, I’m going to assume that August is the hottest month on average, and February is the coldest. Let’s see how they’ve changed over time.

We’ll use Plotly to explore the data in a more dynamic, interactive way.

---

### Temperature Trends Over Time

First, I want to look at how temperatures have trended over time across the state. We’ll focus on August and February as stand-ins for peak summer and deep winter. Sure, we could calculate the actual warmest and coldest months — but that’s a project for another day.

```python
import pandas as pd
import plotly.express as px

df = pd.read_csv("clean_weather_data.csv", parse_dates=["date"])

df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month

# Filter for August and February -- Make sure it is a copy or you get stuck below!
subset = df[df['month'].isin([2, 8])].copy()

# Group by day of the month and month
monthly_avg = subset.groupby(['year','month'])['TMAX'].mean().reset_index()
```

```python
import plotly.graph_objects as go
fig = go.Figure()

# Plot February
feb = monthly_avg[monthly_avg['month'] == 2]
fig.add_trace(go.Scatter(
    x=feb['year'],
    y=(feb['TMAX']*(9/5))+32,# converting to Fahrenheit
    mode='lines+markers',
    name="February",
    line=dict(color='blue')
))

aug = monthly_avg[monthly_avg['month'] == 8]
fig.add_trace(go.Scatter(
    x=aug['year'],
    y=(aug['TMAX']*(9/5))+32, # converting to Fahrenheit
    mode='lines+markers',
    name="August",
    line=dict(color='red')
))

fig.update_layout(
    title="Average Monthly Max Temperature: August vs. February",
    xaxis_title="Year",
    yaxis_title="Average TMAX (F)",
    template="plotly_dark",
    height=600
)

# fig.show()  // I've commented this out to render the charts differently.  
# I need to be able to display these on my website. 

# Write the chart to html
fig.write_html("charts/fig_temperature_line.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
from IPython.display import IFrame
IFrame(src="charts/fig_temperature_line.html", width='100%', height=600)
```

<iframe
    width="100%"
    height="600"
    src="charts/fig\_temperature\_line.html"
    frameborder="0"
    allowfullscreen

></iframe>

Looking at the chart above, it’s clear there’s some variability — but it’s tough to see the overall trend just by eye. Let’s try to make that clearer by adding a **trend line** to each series.

The code below imports `scikit-learn` to perform a simple linear regression, then defines a function that plots each month with its corresponding trend. I structured it this way since we’re plotting multiple months on the same chart, and I wanted something flexible — I could easily extend this to compare more months if needed.

```python
from sklearn.linear_model import LinearRegression


# Re-initialize our fig object or else the graph looks a mess
fig = go.Figure()

# Function to draw the monthly data with regression line
def add_month_trace(df, month, name, color):
    month_df = df[df['month'] == month].dropna()
    X = month_df['year'].values.reshape(-1, 1)
    y = (month_df['TMAX'].values*(9/5)) + 32 # conversion to farenheit
    
    #Plot the raw data
    fig.add_trace(go.Scatter(
        x=month_df['year'],
        y=y,
        mode='lines+markers',
        name=f'{name} (Actual)',
        line=dict(color=color),
        opacity=0.4
    ))
    
    # Linear Regression
    model = LinearRegression().fit(X,y)
    y_pred = model.predict(X)
    
    # Slope per decade (how much does the temp increase?)
    slope_per_year = model.coef_[0]
    slope_per_decade = slope_per_year * 10

    print(f"{name} warming rate: {slope_per_decade:.2f}F per decade")
    
    # Plot Regression Line
    fig.add_trace(go.Scatter(
        x=month_df['year'],
        y=y_pred,
        mode='lines',
        name=f'{name} (Trend)',
        line=dict(color=color, dash='dash'),
        opacity=1
    ))
    
# Add both Months

add_month_trace(monthly_avg, 2, 'February', 'blue')
add_month_trace(monthly_avg, 8, 'August', 'red')

# Layout
fig.update_layout(
    title='Average Monthly TMAX Over Time with Trend Lines',
    xaxis_title='Year',
    yaxis_title='Average TMAX (F)',
    template='plotly_dark',
    height=600
)

# fig.show()

# Write the chart to html
fig.write_html("charts/fig_temperature_trend.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
IFrame(src="charts/fig_temperature_trend.html", width='100%', height=600)
```

    February warming rate: 0.38F per decade
    August warming rate: 0.29F per decade

<iframe
    width="100%"
    height="600"
    src="charts/fig\_temperature\_trend.html"
    frameborder="0"
    allowfullscreen

></iframe>

Adding a trend line makes it easier to cut through the year-to-year noise and focus on the bigger picture: **average maximum temperatures are rising**.

From the regression slopes, we can estimate that February temperatures are increasing by **0.38°F per decade**, while August temperatures are rising more slowly at **0.29°F per decade**.

If these trends continue, winters will keep warming at a faster rate than summers — gradually shrinking the seasonal temperature gap and reshaping what “cold” even means in New England.

```python
import numpy as np

# Let's rebuild our chart again and add future trends

# Re-initialize our fig object or else the graph looks a mess
fig = go.Figure()

# Function to draw the monthly data with regression line
def add_month_trace(df, month, name, color):
    month_df = df[df['month'] == month].dropna()
    X = month_df['year'].values.reshape(-1, 1)
    y = (month_df['TMAX'].values*(9/5)) + 32 # conversion to farenheit
    
    #Plot the raw data
    fig.add_trace(go.Scatter(
        x=month_df['year'],
        y=y,
        mode='lines+markers',
        name=f'{name} (Actual)',
        line=dict(color=color),
        opacity=0.4
    ))
    
    # Linear Regression
    model = LinearRegression().fit(X,y)
    y_pred = model.predict(X)
    
    # Extrapolate the next 50 years
    last_year = X.max()
    future_years = np.arange(last_year + 1, last_year + 51).reshape(-1, 1)
    future_preds = model.predict(future_years)
    
    # Slope per decade (how much does the temp increase?)
    slope_per_year = model.coef_[0]
    slope_per_decade = slope_per_year * 10

    print(f"{name} warming rate: {slope_per_decade:.2f}F per decade")
    
    # Plot Regression Line
    fig.add_trace(go.Scatter(
        x=month_df['year'],
        y=y_pred,
        mode='lines',
        name=f'{name} (Trend)',
        line=dict(color=color, dash='dash'),
        opacity=1
    ))
    
    # Add Extrapolated trend line
    fig.add_trace(go.Scatter(
        x=future_years.flatten(),
        y=future_preds,
        mode='lines',
        name=f'{name} (Extrapolated)',
        line=dict(color=color, dash='dot'),
        opacity=1
    ))
    
# Add both Months

add_month_trace(monthly_avg, 2, 'February', 'blue')
add_month_trace(monthly_avg, 8, 'August', 'red')

# Layout
fig.update_layout(
    title='Average Monthly TMAX Over Time with Trend Lines',
    xaxis_title='Year',
    yaxis_title='Average TMAX (F)',
    template='plotly_dark',
    height=600
)

# fig.show()

# Write the chart to html
fig.write_html("charts/fig_temperature_trend_proj.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
IFrame(src="charts/fig_temperature_trend_proj.html", width='100%', height=600)
```

    February warming rate: 0.38F per decade
    August warming rate: 0.29F per decade

<iframe
    width="100%"
    height="600"
    src="charts/fig\_temperature\_trend\_proj.html"
    frameborder="0"
    allowfullscreen

></iframe>

This chart shows the historical trends in **average monthly maximum temperature (TMAX)** for **February** (blue) and **August** (red), measured in degrees Fahrenheit. Solid lines represent observed data, dashed lines show linear trend lines, and dotted lines extrapolate those trends 50 years into the future.

Both months exhibit a gradual warming trend — but **February’s rise is more pronounced**, increasing by approximately **0.38°F per decade**, compared to **0.29°F per decade** for August. This mirrors what we’ve seen in earlier charts: **winter is warming faster than summer**.

While summers remain relatively stable, **winters are losing their chill**. As the seasonal extremes narrow, Massachusetts is experiencing a subtle but steady shift toward **milder winters and warmer overall conditions**.

---

### Snowfall and Snow Depth Analysis

We’ve seen the temperatures rise — but what does that mean for snowfall? Next, we’ll explore changes in **snow depth** and **total snowfall** to see whether warming winters are translating into less snow, or just snow that doesn’t stick around.

```python
# Focus on Dec - March

winter_months = [12, 1, 2, 3]
subset = df[df['month'].isin(winter_months)].copy()

# Group by year and month to get average snow depth
monthly_avg = subset.groupby(['year','month'])['SNWD'].mean().reset_index()

# Winter Average
winter_avg = subset.groupby('year')['SNWD'].mean().reset_index().dropna()

fig = go.Figure()

X = winter_avg['year'].values.reshape(-1,1)
y = winter_avg['SNWD'].values / 25.4 # convert to inches from mm
    
# Linear Regression
model = LinearRegression().fit(X, y)
y_pred = model.predict(X)
    
    # Slope
slope_per_decade = model.coef_[0] * 10
print(f"Winter snow depth trend {slope_per_decade:.2f} inches per decade")
    
    # Plot Actual
fig.add_trace(go.Scatter(
    x=winter_avg['year'],
    y=winter_avg['SNWD'] / 25.4, # convert to inches from mm
    mode='lines+markers',
    name='Winter Avg (Actual)',
    line=dict(color='deepskyblue'),
    opacity=0.6
))
    
# Plot Trend
fig.add_trace(go.Scatter(
    x=winter_avg['year'],
    y=y_pred,
    mode='lines',
    name='Trend',
    line=dict(color='deepskyblue', dash='dash'),
    opacity=1
))
    
# Extrapolate for future years
last_year = X.max()
future_years = np.arange(last_year + 1, last_year + 51).reshape(-1,1)
future_preds = model.predict(future_years)
fig.add_trace(go.Scatter(
    x=future_years.flatten(),
    y=future_preds,
    mode='lines',
    name='Extrapolated (Next 50 Years)',
    line=dict(color='deepskyblue', dash='dot'),
    opacity=1
))

# Layout
fig.update_layout(
    title="Average Snow Depth in Winter Over Time",
    xaxis_title="Year",
    yaxis_title="Average Snow Depth (inches)",
    template="plotly_dark",
    height=600
)

# fig.show()

# Write the chart to html
fig.write_html("charts/average_snow_depth.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
IFrame(src="charts/average_snow_depth.html", width='100%', height=600)
```

    Winter snow depth trend -0.06 inches per decade

<iframe
    width="100%"
    height="600"
    src="charts/average\_snow\_depth.html"
    frameborder="0"
    allowfullscreen

></iframe>

The chart above shows the average snow depth across Massachussetts in the witner months (December through March) for each year in the dataset. 

While individual years vary significantly, the overall trend is clearly downward: **winter snow depth has decreased over time.**

The dashed line represents the linear trend based on historical data, and the dotted link projects that trend 50 years into the future.  This suggests continued decline in the average winter snowpack.

Despite colder-era peaks, the most recent years show consistently lower snow depth averages, pointing toward **shallower, shorter-lasting snow cover** in a warming climate.

```python
# Group by year and sum total SNOW
winter_snow = subset.groupby('year')['SNOW'].sum().reset_index().dropna()

# Linear regression
X = winter_snow['year'].values.reshape(-1, 1)
y = winter_snow['SNOW'].values / 25.4
model = LinearRegression().fit(X, y)
y_pred = model.predict(X)

# Extrapolate 50 years
future_years = np.arange(X.max() + 1, X.max() + 51).reshape(-1, 1)
future_preds = model.predict(future_years)

# Calculate trend in inches/decade if needed
slope_per_decade = model.coef_[0] * 10
print(f"Winter snowfall trend: {slope_per_decade:.2f} units per decade")

# Plot
fig = go.Figure()

# Actual data
fig.add_trace(go.Scatter(
    x=winter_snow['year'],
    y=winter_snow['SNOW'] / 25.4,
    mode='lines+markers',
    name='Winter Snowfall (Actual)',
    line=dict(color='snow'),
    opacity=0.6
))

# Trend line
fig.add_trace(go.Scatter(
    x=winter_snow['year'],
    y=y_pred,
    mode='lines',
    name='Trend',
    line=dict(color='snow', dash='dash')
))

# Extrapolated
fig.add_trace(go.Scatter(
    x=future_years.flatten(),
    y=future_preds,
    mode='lines',
    name='Extrapolated (Next 50 Years)',
    line=dict(color='snow', dash='dot'),
    opacity=0.7
))

# Layout
fig.update_layout(
    title='Total Winter Snowfall Over Time',
    xaxis_title='Year',
    yaxis_title='Total Snowfall (mm or cm depending on source)',
    template='plotly_dark',
    height=600
)

# fig.show()

# Write the chart to html
fig.write_html("charts/total_snow.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
IFrame(src="charts/total_snow.html", width='100%', height=600)
```

    Winter snowfall trend: 70.82 units per decade

<iframe
    width="100%"
    height="600"
    src="charts/total\_snow.html"
    frameborder="0"
    allowfullscreen

></iframe>

This chart reveals an interesting — and seemingly contradictory — trend:  
**While average winter temperatures are rising and snow depth is decreasing, total annual snowfall is actually increasing.**

So what’s going on? Here are a few likely reasons:

---

**1. Warmer air holds more moisture**  
Warmer air can carry more water vapor, which leads to heavier precipitation overall.  
If temperatures stay near or below freezing, that means more snow during storms.

---

**2. More frequent melting between snowfalls**  
Slightly warmer winters mean more thaw cycles. Snow melts faster between storms, reducing average snow depth even when snowfall is frequent.

---

**3. Fewer, but more intense snowstorms**  
We're seeing a shift toward shorter, more extreme snow events.  
You might get 8 inches in a single day — but it's gone by the weekend.

---

**4. More rain at the edges of winter**  
Warmer shoulder seasons lead to more rain instead of snow in early and late winter.  
This shortens the snow season and can wash away fresh snow quickly.

---

In short: **more snow is falling**, but **less of it sticks around.**

```python
import plotly.express as px

# Aggregate by station -- let's do TMAX, but we could do anything
station_avg = df.groupby(['station_id','lat','lon','town'])['TMAX'].mean().reset_index()

# Convert to Fahrenheit 
station_avg['TMAX_F'] = station_avg['TMAX'] * 9/5 + 32

# Plot using Plotly Geo
fig = px.scatter_geo(
    station_avg,
    lat='lat',
    lon='lon',
    color='TMAX_F',
    hover_name='town',
    size_max=15,
    color_continuous_scale='RdYlBu_r',
#     projection='natural earth',
    title='Average Maximum Temperature by Station (F)'
)

fig.update_geos(
    scope="usa",
    center={"lat": 42.3, "lon": -71.8},
    projection_scale=6,
    showland=True,
    landcolor="rgb(230,230,230)",
    showcountries=True,
    showsubunits=True
)

fig.update_layout(height=600)
# fig.show()

# Write the chart to html
fig.write_html("charts/map_1.html", include_plotlyjs='cdn', full_html=False)

# read the html file into the notebook
IFrame(src="charts/map_1.html", width='100%', height=600)
```

<iframe
    width="100%"
    height="600"
    src="charts/map\_1.html"
    frameborder="0"
    allowfullscreen

></iframe>

I don't love the above visual. Let's try to make it better. Also, what's with all the black dots?  Perhaps we'll drop null TMAX\_F values.

### Taking a Look at Station Data

The map above feels a bit sparse considering how many stations are in the dataset. That got me thinking — maybe not all stations are tracking temperature data. Let’s take a closer look and see which elements each station actually reports.

```python
df = pd.read_csv("clean_weather_data.csv", parse_dates=["date"])

df['TMAX'].isna().sum()  # how many TMAX are null 
```

    1335714

```python
# Find the stations missing TMAX

missing_tmax = df[df['TMAX'].isna()]
missing_tmax['station_id'].value_counts()
```

    station\_id
    USC00192997    35105
    USC00194760    32619
    USC00193702    32493
    USC00195285    31534
    USC00190801    30137
                   ...  
    USC00191343        1
    USC00199221        1
    USC00192026        1
    USC00198755        1
    USC00199972        1
    Name: count, Length: 263, dtype: int64

```python
# Just for sanity's sake, let's make sure these missing records are in our original file as well.

merged_df[merged_df['station_id'].isin(missing_tmax['station_id'].unique())]['element'].value_counts()
```

    element
    PRCP    3047340
    SNOW    2340341
    TMIN    1844805
    TMAX    1836784
    SNWD    1640505
    Name: count, dtype: int64

```python
tmax_counts = df.groupby('station_id')['TMAX'].count().reset_index(name='tmax_count')
tmax_counts.sort_values('tmax_count')
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>station\_id</th>
      <th>tmax\_count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>152</th>
      <td>USC00195095</td>
      <td>0</td>
    </tr>
    <tr>
      <th>68</th>
      <td>USC00192369</td>
      <td>0</td>
    </tr>
    <tr>
      <th>216</th>
      <td>USC00198041</td>
      <td>0</td>
    </tr>
    <tr>
      <th>243</th>
      <td>USC00198843</td>
      <td>0</td>
    </tr>
    <tr>
      <th>186</th>
      <td>USC00196699</td>
      <td>0</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>130</th>
      <td>USC00194313</td>
      <td>43320</td>
    </tr>
    <tr>
      <th>101</th>
      <td>USC00193505</td>
      <td>43714</td>
    </tr>
    <tr>
      <th>1</th>
      <td>USC00190120</td>
      <td>47558</td>
    </tr>
    <tr>
      <th>121</th>
      <td>USC00194105</td>
      <td>47790</td>
    </tr>
    <tr>
      <th>23</th>
      <td>USC00190736</td>
      <td>48221</td>
    </tr>
  </tbody>
</table>
<p>274 rows × 2 columns</p>
</div>

```python
valid_stations = tmax_counts[tmax_counts['tmax_count'] > 100]['station_id']
df_filtered = df[df['station_id'].isin(valid_stations)]

df_filtered.head()
```

<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>station\_id</th>
      <th>date</th>
      <th>town</th>
      <th>state</th>
      <th>lat</th>
      <th>lon</th>
      <th>elevation</th>
      <th>PRCP</th>
      <th>SNOW</th>
      <th>SNWD</th>
      <th>TMAX</th>
      <th>TMIN</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>USC00190049</td>
      <td>1893-01-01</td>
      <td>ADAMS</td>
      <td>MA</td>
      <td>42.65</td>
      <td>-73.1</td>
      <td>228.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>3.3</td>
      <td>-9.4</td>
    </tr>
    <tr>
      <th>1</th>
      <td>USC00190049</td>
      <td>1893-01-02</td>
      <td>ADAMS</td>
      <td>MA</td>
      <td>42.65</td>
      <td>-73.1</td>
      <td>228.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>8.3</td>
      <td>-1.1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>USC00190049</td>
      <td>1893-01-03</td>
      <td>ADAMS</td>
      <td>MA</td>
      <td>42.65</td>
      <td>-73.1</td>
      <td>228.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>3.3</td>
      <td>-13.3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>USC00190049</td>
      <td>1893-01-04</td>
      <td>ADAMS</td>
      <td>MA</td>
      <td>42.65</td>
      <td>-73.1</td>
      <td>228.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>-1.1</td>
      <td>-15.6</td>
    </tr>
    <tr>
      <th>4</th>
      <td>USC00190049</td>
      <td>1893-01-05</td>
      <td>ADAMS</td>
      <td>MA</td>
      <td>42.65</td>
      <td>-73.1</td>
      <td>228.9</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>-3.9</td>
      <td>-11.1</td>
    </tr>
  </tbody>
</table>
</div>

Let’s zoom out and take a more complete look at what each station is actually recording.

The heatmap below shows a matrix of weather elements by station. Each cell indicates whether that station has ever reported a given element — like temperature, precipitation, or snow depth. This gives us a quick way to spot gaps in coverage and understand why certain stations may be excluded from earlier analyses.

```python
import seaborn as sns

df_long = combined_df.drop(['s_flag','value','units'], axis=1)

df_long.head()

# Count non-missing records per station and element
element_counts = df_long.dropna(subset=['value_converted']).groupby(['station_id','element']).size().reset_index(name='count')

# convert to binary: 1 if element appears at all
element_counts['has_data'] = 1

# Pivot to matrix format
element_matrix = element_counts.pivot(index='station_id', columns='element', values='has_data').fillna(0)

# Plot as heatmap
plt.figure(figsize=(10,8))
sns.heatmap(element_matrix, cmap='YlGnBu', cbar=False, linewidths=0.5, linecolor='gray')
plt.title("Weather Elements Tracked by Station")
plt.xlabel("Weather Element")
plt.ylabel("Station ID")
plt.tight_layout()
plt.show()
```

    
![elements matrix](/img/uploads/output_67_0.png "elements matrix")
    

Now we can see that there are a lot of stations that simply don't track TMAX and TMIN!  This is why our map above is show shotty!

## Wrapping Up: What the Data Tells Us

After exploring mroe than a century of Massachusetts weather data, a few clear trends emerged:

- **Winter temperatures are rising,** especially in February — and faster than summer months.
- **Average snow depth is decreasing,** even as **total snowfall is increasing**, likely due to warmer, wetter air and more frequent melt cycles.
- **Station coverage varies widely**, and many don't track temperature — highlighting the importance of cleaning and vetting sources before jumping to conclusions.

There aren't just abstract numbers — they reflect real, tangible changes in New England's witners.  Snowstorms may still hit hard, but the snow sticks around less.  Winters are getting shorter, and the freeze-thaw cycle is intensifying. 

## What's Next?

This was just the first phase of looking at MA weather data.  Here's where I'd go next:

- Add precipitation and extreme event analysis — are storms more intense or erratic now?
- Compare multiple states (e.g., MA vs. VT vs. NY) for regional context.
- Build an interactive dashboard or storytelling site to let others explore the data dynamically.  
- Overlay socioeconomic data (school closings, plow budgets, or energy use) to examine real-world impacts. 

## Final Thoughts

Working with this much data wasn't easy — but it was deeply rewarding.  The process mirrored the climate story istelf: messy, nonlinear and full of surprises!

In a time when climate debates rage on, this project reminded me of something simple: **look at the data**. It doesn't yell. It doesn't spin. But it's always talking — if you're willing to listen!
