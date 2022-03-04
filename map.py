import os 
import pandas as pd
import geopandas as gdp
import matplotlib.pyplot as plt
import plotly.express as px
from urllib.request import urlopen
import json

from __future__ import print_function
from flask import Flask, render_template, make_response
from flask import redirect, request, jsonify, url_for

import io
import os
import uuid
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import numpy as np

app = Flask(__name__)
app.secret_key = 's3cr3t'
app.debug = True
app._static_folder = os.path.abspath("templates/static/")

@app.route('/', methods=['GET'])
def index():
    title = 'Home Page'
    return render_template('index.html',
                           title=title)



def plot_map():
    df = pd.read_csv('seasonal_disparities_20th_century.csv')


    fips = df[['FIPSCode']]
    new_fips = []
    for i, row in fips.items():
        for j in range(0, len(fips)):
            string = str(row[j])
            if len(string) == 4:
                zero_filled_number = string.zfill(5)
                new_fips.append(zero_filled_number)
            else:
                new_fips.append(string)



    df['FIPS'] = new_fips

    past = df[df.YEAR == 2000]

    present = df[df.YEAR == 2021]

    past = past[past.Season == 'Winter']

    present = present[present.Season == 'Winter']


    with urlopen('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json') as response:
        counties = json.load(response)



    # past map 
    fig = px.choropleth(past, geojson=counties, locations='FIPS', color='PRECIPITATION_MA',
                            color_continuous_scale="Viridis",
                            range_color=(0, 12),
                            scope="usa",
                            labels={'PRECIPITATION_MA':'Precipitation(in.)', 'FIPSCode':'County Code'}
                            )
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    plt.savefig("map_past.png")