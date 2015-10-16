#!/usr/bin/env python
""" BrightBus Data Builder - prepare stops lines info from TNDS data

    Tool to parse TNDS data and gather the bus lines that go at each
    stop.

    Usage:
        build_stop_line_info.py [-f]
        build_stop_line_info.py ( -h | --help | --version )

    Options:
        -f            Overwrite existing output database
        -h, --help    Output this help text and exit.
        --version     Output version and exit
"""
import csv
import glob
import json
import os
import xml.etree.ElementTree

from docopt import docopt

from settings import settings
from utils import out, BuildError, backup_and_remove

__version__ = '0.1'

def get_line_name_index():
    service_file = os.path.join(
        settings['build_folder'],
        settings['tnds_service_file']
    )
    name_index = {}
    with open(service_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            name_index[row['ServiceCode']] = row['LineName']
    return name_index

def build_stop_line_info_file(stop_line_info_file, name_index):
    """ Build the stop line info file """
    file_matches = os.path.join(
        settings['build_folder'],
        settings['tnds_file_glob']
    )
    namespace = {'n': 'http://www.transxchange.org.uk/'}
    ref_xpath = './n:StopPoints/n:AnnotatedStopPointRef/n:StopPointRef'
    stop_sets = {}
    for name in glob.glob(file_matches):
        current_set = os.path.basename(name)[4:-4]
        if current_set not in name_index:
            out('Unknown set {}'.format(current_set))
            line_name = '?'
        else:
            line_name = name_index[current_set]
        out('Parsing set {}...'.format(current_set))
        root = xml.etree.ElementTree.parse(name).getroot()
        for ref in root.findall(ref_xpath, namespace):
            code = ref.text.strip()
            if code not in stop_sets:
                stop_sets[code] = []
            stop_sets[code].append(line_name)
    out('Saving results file {}...'.format(stop_line_info_file))
    with open(stop_line_info_file, 'w') as outfile:
        json.dump(stop_sets, outfile)


def run():
    """ Run the stop line info builder """
    
    arguments = docopt(__doc__, version=__version__)
    settings['overwrite_database'] = arguments['-f']

    stop_line_info_file = os.path.join(
        settings['build_folder'],
        settings['stop_line_info_file']
    )
    if (not settings['overwrite_database']
            and os.path.exists(stop_line_info_file)):
        raise BuildError('Output file {f} already exists. Use -f to overwrite.'.format(
            f=stop_line_info_file
        ))

    out('Build stop name index...')
    name_index = get_line_name_index()
    out('Building stop line info file...')
    backup_and_remove(stop_line_info_file)
    build_stop_line_info_file(stop_line_info_file, name_index)
    out('Done! Bye :)')


if __name__ == '__main__':
    try:
        run()
    except BuildError as e:
        out("Build error: " + str(e), 'error')
