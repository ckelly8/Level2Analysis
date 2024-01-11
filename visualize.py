import pandas as pd
import os
import matplotlib.pyplot as plt

dataPath = os.path.join(os.getcwd(), 'record/data')

dataFileList = [f for f in os.listdir(dataPath) if f.endswith('.csv')]

df = [pd.read_csv(os.path.join(dataPath, file)) for file in dataFileList]

df = pd.concat(df, ignore_index=True)

df['time'] = pd.to_datetime(df['time'])

df.set_index('time', inplace=True)

plt.figure(figsize=(10, 6)) # Adjust the size of the plot

# Plot the first value column, e.g., in blue
plt.plot(df.index, df['250'], color='blue', label='COM 50')
plt.plot(df.index, df['500'], color='green', label='COM 100')
plt.plot(df.index, df['1000'], color='black', label = 'COM 250')

# Plot the second value column, e.g., in red
plt.plot(df.index, df['price'], color='red', label='price')

plt.title('Time Series Plot')
plt.xlabel('Time')
plt.ylabel('Value')
plt.grid(True)
plt.show()