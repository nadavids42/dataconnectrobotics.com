---
title: Massachusetts Weather - Data Cleaning
date: 2025-05-01T16:14:00
---
## Massachusetts Weather Trends Analysis - Phase 1

I moved to Massachusetts in the summer of 2015, and from what I’ve been told, I haven’t experienced a real winter yet. The last one that earned that title was apparently the brutal 2014–2015 season. Curious about how winters (and weather in general) have changed over time, I decided to dig into historical weather data for Massachusetts — going back as far as I could.

This project is a little different from others I’ve done. Instead of just showing the results, I’ll walk you through the process of cleaning and analyzing the raw data, step by step. I’ll share my thought process along the way — from initial exploration to final insights — all inside this notebook.

I don’t promise that the code will be fully cleaned up by the time you see it — but I will do my best to explain why I did what I did, and highlight the bumps, wrong turns, and small victories along the way.

<H3>Finding the Data</H3>

As with most data projects, the first — and sometimes hardest — part is simply finding the data. I can't tell you how many projects I've abandoned over the years just because I couldn’t get the data I needed, or because getting it required jumping through too many hoops.

Luckily, weather data happens to be some of the most complete and accessible historical data we have. Much of it is hosted by the National Oceanic and Atmospheric Administration (NOAA).

NOAA offers a web interface that lets you search by region (I selected Massachusetts), choose a wide time span (I went for 1901 to present), and pick from categories like evaporation, land, precipitation, and more. I was in heaven. I chose precipitation and air temperature to get started. Everything felt suspiciously easy — until I clicked “Next.”

![Error Message](/img/uploads/error1.png "Error Message")

That’s when the bad news hit.

My modest little query — “Give me all the weather data for Massachusetts from 1901 to today” — would’ve returned 105,559 station-years and a delightful 30.84 GB of compressed data.

Compressed.

Needless to say, I had slightly exceeded NOAA’s 1.00 GB / 1,000 station-year limit. The system responded with the gentlest of data slaps. I had to laugh — I was trying to drink from a firehose.

So I poked around a little more and found something amazing: an old-school file directory tucked away on their site. I could browse it year by year, clicking individual links to download raw data files. I grabbed everything from 1970 through the present. Not fast, not efficient… but progress.

Once extracted, the 56 years of data I downloaded came out to nearly 70 GB. This was officially big data territory.

Too big.

Even though my machine is a decent workstation, processing 70 GB would take hours — and I didn’t have that kind of patience. Another path. Another roadblock.

But then it hit me: if that directory was structured like that, maybe I could access it directly — through FTP.

Now we’re cookin’.

I dove back into the NOAA file structure and discovered a list of stations I hadn’t noticed before. Many started with US1MA, and after cross-checking, I confirmed they were all located in Massachusetts.

Boom.
Next stop: the command line.

```
bash wget -r -nd -np -A 'US1MA*.csv.gz' ftp://ftp.ncei.noaa.gov/pub/data/ghcn/daily/by_station/
```

Just a few minutes later, I had a folder full of files—so I opened one to take a quick look. Unfortunately, disappointment struck again: the US1MA stations only report precipitation. I was hoping to model both temperature and precipitation, so this dataset wasn’t going to cut it.

After more digging, I found another list of Massachusetts stations. The catch? These files lacked the clean, consistent headers I’d come to expect. I’d need to find a different way to work with this new batch of data.

```python
# Let's dive into so python to see what we can do with this list 
# of stations and access to the ftp.

import pandas as pd

# Read the tab-separated file of station info
stations_df = pd.read_csv("station_data/ma_stations.csv", sep="\t")

#display the first few rows to verify the data loaded
print(stations_df.head())
```

      USC00190049  42.6500  -73.1000  228.9 MA ADAMS                                       
    0  USC00190120  42.3861  -72.5375   44.2 MA AMHER...                                   
    1  USC00190130  42.6500  -71.1333   84.1 MA ANDOV...                                   
    2  USC00190166  42.4167  -71.1833   54.9 MA ARLIN...                                   
    3  USC00190190  42.6178  -71.9158  337.7 MA ASHBU...                                   
    4  USC00190192  42.6617  -71.9358  349.3 MA ASHBU...                                   

```python
# Now Let's get the station IDs as a list

station_ids = stations_df.iloc[:,0].tolist()

print(station_ids[:10])
```

    ['USC00190120  42.3861  -72.5375   44.2 MA AMHERST                            HCN      ', 'USC00190130  42.6500  -71.1333   84.1 MA ANDOVER                                     ', 'USC00190166  42.4167  -71.1833   54.9 MA ARLINGTON                                   ', 'USC00190190  42.6178  -71.9158  337.7 MA ASHBURNHAM                                  ', 'USC00190192  42.6617  -71.9358  349.3 MA ASHBURNHAM N                                ', 'USC00190213  42.5133  -72.8508  408.4 MA ASHFIELD                                    ', 'USC00190214  42.5458  -72.7803  294.1 MA ASHFIELD 2 NE                               ', 'USC00190218  42.2500  -71.4667   70.1 MA ASHLAND                                     ', 'USC00190257  42.5833  -72.2167  259.1 MA ATHOL                                       ', 'USC00190270  41.9333  -71.3333   30.5 MA ATTLEBORO                                   ']

As you can see this didn't work.  What's going on here?

In my earlier code, I used \`\`\`sep="\\t"\`\`\` because I thought I had a tab separated document.  However, This doesn't appear to be the case.  Let's try delimiting the file by whitespace instead.

```python
# df = pd.read_csv("station_data/ma_stations.csv", delim_whitespace=True, engine="python")

# print(df.head())

# The above does not work. Some towns have more than one word names.

stations_df = pd.read_fwf("station_data/ma_stations.csv", header=None)

print(stations_df.head(10))
```

                 0        1        2      3   4              5    6   7
    0  USC00190049  42.6500 -73.1000  228.9  MA          ADAMS  NaN NaN
    1  USC00190120  42.3861 -72.5375   44.2  MA        AMHERST  HCN NaN
    2  USC00190130  42.6500 -71.1333   84.1  MA        ANDOVER  NaN NaN
    3  USC00190166  42.4167 -71.1833   54.9  MA      ARLINGTON  NaN NaN
    4  USC00190190  42.6178 -71.9158  337.7  MA     ASHBURNHAM  NaN NaN
    5  USC00190192  42.6617 -71.9358  349.3  MA   ASHBURNHAM N  NaN NaN
    6  USC00190213  42.5133 -72.8508  408.4  MA       ASHFIELD  NaN NaN
    7  USC00190214  42.5458 -72.7803  294.1  MA  ASHFIELD 2 NE  NaN NaN
    8  USC00190218  42.2500 -71.4667   70.1  MA        ASHLAND  NaN NaN
    9  USC00190257  42.5833 -72.2167  259.1  MA          ATHOL  NaN NaN

```python
# OK, now we're in business!

# columns 6 & 7 look like bad data so we'll drop them

stations_df = stations_df.drop([6,7], axis=1)

print(stations_df.head(10))
```

                 0        1        2      3   4              5
    0  USC00190049  42.6500 -73.1000  228.9  MA          ADAMS
    1  USC00190120  42.3861 -72.5375   44.2  MA        AMHERST
    2  USC00190130  42.6500 -71.1333   84.1  MA        ANDOVER
    3  USC00190166  42.4167 -71.1833   54.9  MA      ARLINGTON
    4  USC00190190  42.6178 -71.9158  337.7  MA     ASHBURNHAM
    5  USC00190192  42.6617 -71.9358  349.3  MA   ASHBURNHAM N
    6  USC00190213  42.5133 -72.8508  408.4  MA       ASHFIELD
    7  USC00190214  42.5458 -72.7803  294.1  MA  ASHFIELD 2 NE
    8  USC00190218  42.2500 -71.4667   70.1  MA        ASHLAND
    9  USC00190257  42.5833 -72.2167  259.1  MA          ATHOL

```python
# Give the columns names to make things easier later

stations_df.columns = ["station_id", "lat", "lon", "elevation", "state", "town"]

station_ids = stations_df["station_id"].tolist()

# Visualize weather station locations across Massachusetts

import matplotlib.pyplot as plt

plt.figure(figsize=(8, 6))
plt.scatter(stations_df['lon'], stations_df['lat'], alpha=0.6, edgecolor='black')
plt.title("Massachusetts Weather Station Locations")
plt.xlabel("Longitude")
plt.ylabel("Latitude")
plt.grid(True)
plt.show()
```

    
![Station Locations](/img/uploads/output_9_0.png "Station Locations")
    

```python
# You can see the shape of Massachusetts!

# Now the fun part!  Let's use a script to download all the data
# we want from NOAA.

import os
import urllib.request

ftp_base = "ftp://ftp.ncei.noaa.gov/pub/data/ghcn/daily/by_station/"
output_dir = "station_data"

for station_id in station_ids:
    url = f"{ftp_base}{station_id}.csv.gz"
    dest = os.path.join(output_dir, f"{station_id}.csv.gz")
    
    if not os.path.exists(dest):
        print(f"Downloading {station_id}...")
        try:
            urllib.request.urlretrieve(url,dest)
        except Exception as e:
            print(f"Failed to download {station_id}: {e}")
```

After running the script above, we ended up with 274 files containing 449.2 MB of data.  This should be manageable.  

<h3>Getting to know the Data</h3>

Next we need to take a look at some of the data we've downloaded and see what it's structure is and how much work we need to do to clean it up.

```python
df = pd.read_csv("station_data/USC00199780.csv", header=None)

print(df.head(10))
```

                 0         1     2    3    4    5  6      7
    0  USC00199780  19630801  PRCP    0  NaN  NaN  0  800.0
    1  USC00199780  19630802  PRCP  203  NaN  NaN  0  800.0
    2  USC00199780  19630803  PRCP    3  NaN  NaN  0  800.0
    3  USC00199780  19630804  PRCP    3  NaN  NaN  0  800.0
    4  USC00199780  19630805  PRCP    0  NaN  NaN  0  800.0
    5  USC00199780  19630806  PRCP    0  NaN  NaN  0  800.0
    6  USC00199780  19630807  PRCP    0  NaN  NaN  0  800.0
    7  USC00199780  19630808  PRCP    8  NaN  NaN  0  800.0
    8  USC00199780  19630809  PRCP  140  NaN  NaN  0  800.0
    9  USC00199780  19630810  PRCP   91  NaN  NaN  0  800.0

```python
df.info()
```

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 18445 entries, 0 to 18444
    Data columns (total 8 columns):
     #   Column  Non-Null Count  Dtype  
    ---  ------  --------------  -----  
     0   0       18445 non-null  object 
     1   1       18445 non-null  int64  
     2   2       18445 non-null  object 
     3   3       18445 non-null  int64  
     4   4       3782 non-null   object 
     5   5       1 non-null      object 
     6   6       18445 non-null  int64  
     7   7       7932 non-null   float64
    dtypes: float64(1), int64(3), object(4)
    memory usage: 1.1+ MB

```python
# Now lets create dfs for all the files

import glob
import os

csv_folder = "station_data/"
csv_files = glob.glob(os.path.join(csv_folder, "USC*.csv"))

# Create a list of dfs // Using low_memory=False due to error 

dfs = [pd.read_csv(file, header=None, low_memory=False) for file in csv_files]

for df in dfs[:3]:
    print(df.columns)
    print(df.head())
```

    Index([0, 1, 2, 3, 4, 5, 6, 7], dtype='int64')
                 0         1     2    3    4   5  6   7
    0  USC00190214  20120501  TMAX  150  NaN NaN  7 NaN
    1  USC00190214  20120502  TMAX   83  NaN NaN  7 NaN
    2  USC00190214  20120503  TMAX  100  NaN NaN  7 NaN
    3  USC00190214  20120504  TMAX  111  NaN NaN  7 NaN
    4  USC00190214  20120505  TMAX  228  NaN NaN  7 NaN
    Index([0, 1, 2, 3, 4, 5, 6, 7], dtype='int64')
                 0         1     2    3    4    5  6   7
    0  USC00193946  19310101  PRCP    0  NaN  NaN  6 NaN
    1  USC00193946  19310102  PRCP    0  NaN  NaN  6 NaN
    2  USC00193946  19310103  PRCP    0  NaN  NaN  6 NaN
    3  USC00193946  19310104  PRCP    0  NaN  NaN  6 NaN
    4  USC00193946  19310105  PRCP  226  NaN  NaN  6 NaN
    Index([0, 1, 2, 3, 4, 5, 6, 7], dtype='int64')
                 0         1     2  3    4   5  6      7
    0  USC00196316  19670601  PRCP  0  NaN NaN  0  800.0
    1  USC00196316  19670602  PRCP  0  NaN NaN  0  800.0
    2  USC00196316  19670603  PRCP  0  NaN NaN  0  800.0
    3  USC00196316  19670604  PRCP  0  NaN NaN  0  800.0
    4  USC00196316  19670605  PRCP  0  NaN NaN  0  800.0

We don't want to work with columns called 0, 1, 2, etc.  Let's give them some names, but what do they mean?

From the NOAA website, I found the following:

```
The "station".csv files contain all daily elements for that GHCN station for its entire period of record. 
Each element-day is provided on a separate line and all files are updated daily for the entire period of record.

The following information serves as a definition of each field for all element-day records. 
Each field described below is separated by a comma ( , ) and follows the order below:

ID = 11 character station identification code
YEAR/MONTH/DAY = 8 character date in YYYYMMDD format (e.g. 19860529 = May 29, 1986)
ELEMENT = 4 character indicator of element type 
DATA VALUE = 5 character data value for ELEMENT 
M-FLAG = 1 character Measurement Flag 
Q-FLAG = 1 character Quality Flag 
S-FLAG = 1 character Source Flag 
OBS-TIME = 4-character time of observation in hour-minute format (i.e. 0700 =7:00 am); if no ob time information 
is available, the field is left empty

See section III of the GHCN-Daily readme.txt file (ftp://ftp.ncdc.noaa.gov/pub/data/ghcn/daily/readme.txt)
for an explanation of ELEMENT codes and their units as well as the M-FLAG, Q-FLAG and S-FLAG.

The OBS-TIME field is populated with the observation times contained in NOAA/NCEI's HOMR station history database.  
```

```python
custom_columns = ['station_id','date','element','value','m_flag','q_flag','s_flag','obs_time']

for i, df in enumerate(dfs):
    if df.shape[1] == len(custom_columns):
        df.columns = custom_columns
    else:
        print(f"Skipping file {i} - has {df.shape[1]} columns instead of 8")
```

```python
# I originally had a misformed file but I figured out it was my ma_stations.csv.  
# This code is to check for files with different shapes.  It currently returns no results

for i, df in enumerate(dfs):
    if df.shape[1] != 8:
        print(f"File {i} - {df.shape[1]} columns")
        print(df.head())
```

```python
# Now how do things look

for df in dfs[:3]:
    print(df.columns)
    print(df.head())
```

    Index(['station\_id', 'date', 'element', 'value', 'm\_flag', 'q\_flag', 's\_flag',
           'obs\_time'],
          dtype='object')
        station\_id      date element  value m\_flag  q\_flag  s\_flag  obs\_time
    0  USC00190214  20120501    TMAX    150    NaN     NaN       7       NaN
    1  USC00190214  20120502    TMAX     83    NaN     NaN       7       NaN
    2  USC00190214  20120503    TMAX    100    NaN     NaN       7       NaN
    3  USC00190214  20120504    TMAX    111    NaN     NaN       7       NaN
    4  USC00190214  20120505    TMAX    228    NaN     NaN       7       NaN
    Index(['station\_id', 'date', 'element', 'value', 'm\_flag', 'q\_flag', 's\_flag',
           'obs\_time'],
          dtype='object')
        station\_id      date element  value m\_flag q\_flag  s\_flag  obs\_time
    0  USC00193946  19310101    PRCP      0    NaN    NaN       6       NaN
    1  USC00193946  19310102    PRCP      0    NaN    NaN       6       NaN
    2  USC00193946  19310103    PRCP      0    NaN    NaN       6       NaN
    3  USC00193946  19310104    PRCP      0    NaN    NaN       6       NaN
    4  USC00193946  19310105    PRCP    226    NaN    NaN       6       NaN
    Index(['station\_id', 'date', 'element', 'value', 'm\_flag', 'q\_flag', 's\_flag',
           'obs\_time'],
          dtype='object')
        station\_id      date element  value m\_flag  q\_flag  s\_flag  obs\_time
    0  USC00196316  19670601    PRCP      0    NaN     NaN       0     800.0
    1  USC00196316  19670602    PRCP      0    NaN     NaN       0     800.0
    2  USC00196316  19670603    PRCP      0    NaN     NaN       0     800.0
    3  USC00196316  19670604    PRCP      0    NaN     NaN       0     800.0
    4  USC00196316  19670605    PRCP      0    NaN     NaN       0     800.0

```python
# Now let's combine all our dfs into a single data_frame

combined_df = pd.concat(dfs, ignore_index=True)

# Record count per station
combined_df['station_id'].value_counts().head(20).plot(kind='barh', figsize=(10,6))
plt.title("Top 20 Stations by Record Count")
plt.xlabel("Number of Records")
plt.ylabel("Station ID")
plt.tight_layout()
plt.show()
```

    
![Top 20 Stations](/img/uploads/output_19_0.png "Top 20 Stations")
    

```python
# And make our date strings into actual dates

combined_df['date'] = pd.to_datetime(combined_df['date'], errors='coerce')
```

```python
# Check for duplicates or missing values

combined_df.drop_duplicates(inplace=True)
print(combined_df.isnull().sum())
```

    station\_id           0
    date                 0
    element              0
    value                0
    m\_flag        10670419
    q\_flag        12527792
    s\_flag               0
    obs\_time       7412302
    dtype: int64

```python
# have too many null values for m_flag, q_flag and obs_time.  Let's drop them

columns_to_drop = ['m_flag','q_flag','obs_time']

combined_df.drop(columns_to_drop, axis=1, inplace=True)

print(combined_df.info())
```

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 12602744 entries, 0 to 12602743
    Data columns (total 5 columns):
     #   Column      Dtype         
    ---  ------      -----         
     0   station\_id  object        
     1   date        datetime64[ns]
     2   element     object        
     3   value       int64         
     4   s\_flag      object        
    dtypes: datetime64[ns](1), int64(1), object(3)
    memory usage: 480.8+ MB
    None

```python
print(combined_df.head())
```

        station\_id                          date element  value s\_flag
    0  USC00190214 1970-01-01 00:00:00.020120501    TMAX    150      7
    1  USC00190214 1970-01-01 00:00:00.020120502    TMAX     83      7
    2  USC00190214 1970-01-01 00:00:00.020120503    TMAX    100      7
    3  USC00190214 1970-01-01 00:00:00.020120504    TMAX    111      7
    4  USC00190214 1970-01-01 00:00:00.020120505    TMAX    228      7

```python
# Uh oh... I don't think our dates parsed correctly.  Let's have a closer look.

print(combined_df['date'][:100])
```

    0    1970-01-01 00:00:00.020120501
    1    1970-01-01 00:00:00.020120502
    2    1970-01-01 00:00:00.020120503
    3    1970-01-01 00:00:00.020120504
    4    1970-01-01 00:00:00.020120505
                      ...             
    95   1970-01-01 00:00:00.020120503
    96   1970-01-01 00:00:00.020120504
    97   1970-01-01 00:00:00.020120505
    98   1970-01-01 00:00:00.020120506
    99   1970-01-01 00:00:00.020120507
    Name: date, Length: 100, dtype: datetime64[ns]

Looks like all the dates defaulted to 1970. Let's try that again.

```python
# recreate our combined_df as the original has malformed dates

combined_df = pd.concat(dfs, ignore_index=True)

print(combined_df['date'][:100])
```

    0     20120501
    1     20120502
    2     20120503
    3     20120504
    4     20120505
            ...   
    95    20120503
    96    20120504
    97    20120505
    98    20120506
    99    20120507
    Name: date, Length: 100, dtype: int64

```python
# Let's try to parse them again a different way

combined_df['date'] = pd.to_datetime(combined_df['date'], format='%Y%m%d', errors='coerce')

print(combined_df['date'][:100])
```

    0    2012-05-01
    1    2012-05-02
    2    2012-05-03
    3    2012-05-04
    4    2012-05-05
            ...    
    95   2012-05-03
    96   2012-05-04
    97   2012-05-05
    98   2012-05-06
    99   2012-05-07
    Name: date, Length: 100, dtype: datetime64[ns]

```python
# Did we succeed in translating all dates??

print(combined_df['date'].head())
print(combined_df['date'].isna().sum(), "unparsed dates")
```

    0   2012-05-01
    1   2012-05-02
    2   2012-05-03
    3   2012-05-04
    4   2012-05-05
    Name: date, dtype: datetime64[ns]
    0 unparsed dates

```python
combined_df.drop_duplicates(inplace=True)
print(combined_df.isnull().sum())
```

    station\_id           0
    date                 0
    element              0
    value                0
    m\_flag        10670419
    q\_flag        12527792
    s\_flag               0
    obs\_time       7412302
    dtype: int64

```python
# Re-drop our collumns form our good combined_df data frame

columns_to_drop = ['m_flag','q_flag','obs_time']

combined_df.drop(columns_to_drop, axis=1, inplace=True)

print(combined_df.info())
```

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 12602744 entries, 0 to 12602743
    Data columns (total 5 columns):
     #   Column      Dtype         
    ---  ------      -----         
     0   station\_id  object        
     1   date        datetime64[ns]
     2   element     object        
     3   value       int64         
     4   s\_flag      object        
    dtypes: datetime64[ns](1), int64(1), object(3)
    memory usage: 480.8+ MB
    None

Now that we have a pretty clean dataset, we need to translate the value into actual units that mean something to us.  From the description of the NOAA data online, I found the following:

```
ELEMENT is the element type. There are five core elements as well as a number
of addition elements.  
	   
The five core elements are:

PRCP = Precipitation (tenths of mm)
SNOW = Snowfall (mm)
SNWD = Snow depth (mm)
TMAX = Maximum temperature (tenths of degrees C)
TMIN = Minimum temperature (tenths of degrees C)
```

```python
# Let's make sure we don't have any elements other than the abov, core elements

print(combined_df['element'].unique())
```

    ['TMAX' 'TMIN' 'TOBS' 'PRCP' 'SNOW' 'SNWD' 'WT01' 'WT03' 'WT05' 'WESD'
     'WT11' 'WT04' 'DAPR' 'MDPR' 'WT16' 'WT18' 'DASF' 'MDSF' 'WT06' 'WT14'
     'DAWM' 'MDWM' 'WDMV' 'EVAP' 'MNPN' 'MXPN' 'DAEV' 'MDEV' 'WT09' 'WT08'
     'WT07' 'WT10' 'WESF' 'SN53' 'SX53']

```python
# Let's get rid of the elements that are not core elements

valid_elements = ['TMAX','TMIN','PRCP','SNOW','SNWD']

combined_df = combined_df[combined_df['element'].isin(valid_elements)]
```

```python
# Distribution of element types
combined_df['element'].value_counts().plot(kind='bar', color='skyblue')
plt.title("Distribution of Measurement Types")
plt.ylabel("Record Count")
plt.xticks(rotation=45)
plt.show()
```

    
![Elements](/img/uploads/output_34_0.png "Elements")
    

```python
# Now we can convert the value column for the elements that we care about

def convert_value(row):
    if row['element'] in ['TMAX','TMIN']:
        return row['value'] / 10.0 # tenths of C -> C
    elif row['element'] == 'PRCP':
        return row['value'] / 10.0 # tents of mm -> mm
    elif row['element'] in ['SNOW','SNWD']:
        return row['value'] # already in mm
    else:
        return row['value'] #fallback if none of the other cases or null 
    
combined_df.loc[:,'value_converted'] = combined_df.apply(convert_value, axis=1) #added .loc to clear warning

# Let's also assign units so that we know what we're looking at

def assign_units(element):
    if element in ['TMAX','TMIN']:
        return 'C'
    elif element == 'PRCP':
        return 'mm'
    elif element in ['SNOW','SNWD']:
        return 'mm'
    else:
        return 'unknkown'
    
combined_df.loc[:,'units'] = combined_df['element'].apply(assign_units)
```

```python
# Plot TMAX trend for a sample station
sample_station = combined_df[combined_df['station_id'] == combined_df['station_id'].value_counts().idxmax()]
sample_tmax = sample_station[sample_station['element'] == 'TMAX']

import matplotlib.dates as mdates

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(sample_tmax['date'], sample_tmax['value_converted'], linewidth=0.8)
ax.set_title("Sample Station – TMAX Over Time")
ax.set_ylabel("Max Temperature (°C)")
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
ax.xaxis.set_major_locator(mdates.YearLocator(5))  # every 5 years
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

    
![TMAX Over Time \(Sample\)](/img/uploads/output_36_0.png "TMAX Over Time \(Sample\)")
    

I had to play with the plot above a bit before I could get it to look decent.  Key changes are that I only sampled data for every 5 years rather than all the data present.  It was also helpful to put the axis labels at a 45 degree angle. 

```python
# checking null values again

print(combined_df.isnull().sum())
```

    station\_id         0
    date               0
    element            0
    value              0
    s\_flag             0
    value\_converted    0
    units              0
    dtype: int64

```python
print(combined_df.count())
```

    station\_id         10839372
    date               10839372
    element            10839372
    value              10839372
    s\_flag             10839372
    value\_converted    10839372
    units              10839372
    dtype: int64

OK, about 10 million records!

I think our last few steps before we can start analyzing this data is to combine it with our ma\_stations.csv and flatten it out

We want each record to be a station, date, all the various elements for that date and their corresponding units

```python
# first merge the combined_df with stations_df

merged_df = combined_df.merge(stations_df, on='station_id', how='left')

# Look for unmatched stations
missing_stations = merged_df[merged_df['lat'].isnull()]
print("Unmatched station IDs:", missing_stations['station_id'].unique())
```

    Unmatched station IDs: []

```python
# OK, things look pretty good so far, let's make the file flat

pivoted = merged_df.pivot_table(
    index=['station_id','date','town','state','lat','lon','elevation'],
    columns='element',
    values='value_converted'
).reset_index()

print(pivoted.count())
```

    element
    station\_id    3202432
    date          3202432
    town          3202432
    state         3202432
    lat           3202432
    lon           3202432
    elevation     3202432
    PRCP          3076640
    SNOW          2362797
    SNWD          1658479
    TMAX          1866718
    TMIN          1874738
    dtype: int64

```python
# 3.2 million station days.  That's a lot of data to build out some fun visualizations!

# Now let's save this data for future analysis

pivoted.to_csv("clean_weather_data.csv", index=False)
```

<h3>Data Cleaning Conclusions</h3>

What started as a straightforward task—loading and cleaning a batch of CSVs—quickly turned into a reminder of how messy real-world data can be. Even though the files came from the same source, they weren’t consistently structured. Some were missing expected columns, others had malformed rows, and most required extra context to make sense of what they contained. Unit conversions were another critical step: temperature and precipitation values came in scaled integers (tenths of degrees or millimeters), and without converting them early, any downstream analysis would have been misleading.

Merging in station metadata—latitude, longitude, elevation, and name—was what really brought the dataset to life. Before that, each record was just a raw number with a cryptic ID. Afterward, those records had location and meaning.

This cleaning process also revealed just how deceptive “quick wins” can be. Loading the files was fast—but preparing them for analysis took iteration, inspection, and a fair amount of troubleshooting. Pandas made much of this possible to automate, but at the scale of 10 million records, even common operations like merging or applying functions had to be handled thoughtfully.

In the end, the result is a dataset that’s analysis-ready—but getting there meant transforming raw numbers into context-rich, interpretable information.

At this stage, I now have over 3 million weather records across hundreds of stations, all standardized and enriched with location metadata. The data is ready for time-series analysis, regional comparisons, and trend modeling — which will form the focus of the next phase.
