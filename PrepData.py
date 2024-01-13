### Import Modules
import pandas as pd
import os

### Define data attributes and variables
training_data_size = 2400
prediction_size = 800
step_size = 400

### Define data paths
dataPath = os.path.join(os.getcwd(), 'record/data')
dataFileList = [os.path.join(dataPath,f) for f in os.listdir(dataPath) if f.endswith('.csv')]
trainingDataPath = os.path.join(os.getcwd(), 'training_data/train')
predictionDataPath = os.path.join(os.getcwd(), 'training_data/test')

i = 0
for file in dataFileList:
    df = pd.read_csv(file)
    start_index = 1
    train_index = training_data_size
    prediction_index = training_data_size + prediction_size
    while prediction_index < len(df):
        df_train_chunk= df.iloc[start_index:train_index,:-1]
        df_predict_chunk = df.iloc[train_index+1:prediction_index,:-1]
        start_index += step_size
        train_index += step_size
        prediction_index += step_size

        trainDataFile = os.path.join(trainingDataPath,'train_{}.csv'.format(i))
        predictDataFile = os.path.join(predictionDataPath,'test_{}.csv'.format(i))

        df_train_chunk.to_csv(trainDataFile, index=False)
        df_predict_chunk.to_csv(predictDataFile, index=False)
        i += 1

