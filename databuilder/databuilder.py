#!/usr/bin/env python
""" BrightBus Data Builder

    Tool to build the BrightBus stops database from the Naptan and
    TNDS data.

    Prior to running this you must run:
    - download_data_file.py
    - build_stop_line_info.py

    Usage:
        databuilder.py [-f]
        databuilder.py ( -h | --help | --version )

    Options:
        -f            Overwrite existing output database.
        -h, --help    Output this help text and exit.
        --version     Output version and exit.
"""
import csv
import json
import os

from docopt import docopt

from settings import settings
from utils import BuildError, out, run_command, backup_and_remove

__version__ = 'BrightBus Data Builder 0.2.'

def build_stops_database():
    """ Build the stops database """
    stops_file_name = os.path.join(
        settings['build_folder'],
        settings['stops_file']
    )
    naptan_less_count = 0
    database = []
    with open(stops_file_name) as stops_file:
        reader = csv.DictReader(stops_file)
        for row in reader:
            if row['LocalityName'] in settings['localities']:
                obj = {
                    'name': row['CommonName'],
                    'indicator': row['Indicator'],
                    'naptanCode': row['NaptanCode'],
                    'lat': row['Latitude'],
                    'long': row['Longitude'],
                    'bearing': row['Bearing'],
                    'street': row['Street']
                }
                if obj['naptanCode'] != '':
                    database.append(obj)
                else:
                    naptan_less_count += 1
    out("Found {c} stops.".format(c=len(database)))
    if naptan_less_count > 0:
        out("{x} stops didn't have a Naptan code and were ignored.".format(x=naptan_less_count))

    out("Saving database...")
    with open(settings['result_file_path'], 'w') as result_file:
        result_file.write(json.dumps(database))


def run():
    """ Run the data builder """
    global settings

    arguments = docopt(__doc__, version=__version__)
    settings['overwrite_database'] = arguments['-f']

    if (not settings['overwrite_database'] 
            and os.path.exists(settings['result_file_path'])):
        out('Output file {f} already exists. Use -f to overwrite.'.format(
            f=settings['result_file_path']
        ), 'error')
        return

    out('Building the database...')
    backup_and_remove(settings['result_file_path'])
    build_stops_database()

    out('Bye!')


if __name__ == '__main__':
    try:
        run()
    except BuildError as e:
        out("Build error: " + str(e), 'error')
