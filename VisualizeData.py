import pandas as pd
import os

dataPath = os.path.join(os.getcwd(), '/data')

dataFileList = [f for f in os.listdir(dataPath) if f.endswith('.csv')]

dataframes = [pd.read_csv(os.path.join(dataPath, file)) for file in dataFileList]

dataframe = pd.concat(dataframes, ignore_index=True)

print(dataframe)