#!/usr/bin/env python
""" BrightBus Data Builder

    Tool to download the Naptan database and create a json file
    containing brighton & hove stops.

    Usage:
        databuilder.py [-d] [-f]
        databuilder.py ( -h | --help | --version )

    Options:
        -d            Download the Naptan code file, even if we have a local 
                      copy. Implies -f.
        -f            Overwrite existing database.
        -h, --help    Output this help text and exit.
        --version     Output version and exit.
"""
import csv
import json
import os
import subprocess
import sys

from docopt import docopt

__version__ = 'BrightBus Data Builder 0.1. Naptan schema 20150921.'
root=os.path.dirname(os.path.realpath(__file__))
settings={
    'build_folder': os.path.join(root, '.build'),
    'result_file_path': os.path.join(root, '..', 'www', 'data', 'stops.json'),
    'naptan_url': 'http://www.dft.gov.uk/NaPTAN/snapshot/NaPTANcsv.zip',
    'naptan_zip_file': 'NaPTANcsv.zip',
    'stops_file': 'Stops.csv',
    'download_command': ['/usr/bin/wget', '{naptan_url}', '-O', '{build_folder}/{naptan_zip_file}'],
    'extract_command': ['/usr/bin/unzip', '{build_folder}/{naptan_zip_file}', '{stops_file}', '-d', '{build_folder}'],
    'download_if_cached': False,
    'overwrite_database': False,
    'indicator_as_prefix': ['in', 'adj', 'opp', 'o/s'],
    'localities': ['Brighton', 'Hove']
}

class BuildError(Exception):
    """ Exception used to report building errors """
    pass


def out(message, level='info'):
    """ Output a message to the user.

    Args:
        message (str): Message to output
        level (str, Optional): Type of message. One of
            'info' (default), 'warning', 'error'.
    """
    print message


def run_command(command, values):
    """ Execute the given shell command after replacing
        the placeholders with given values.

    Args:
        command (array): Command to run_commandute, as an array of
            parameters.
        values (dict): Dict of placeholder name to value, to
            be replaced in al parts of the command array.

    Returns:
        str: Command output

    Raises:
        BuildError: if the command failed
    """
    final_command = []
    for part in command:
        final_command.append(part.format(**values))
    try:
        output = subprocess.check_output(final_command)
    except subprocess.CalledProcessError as e:
        raise BuildError(
            'Failed running {cmd}: {e}'.format(
                cmd=' '.join(final_command),
                e=str(e)
            )
        )
    return output


def backup_and_remove(filename):
    """ Backup and remove the given file

    The file is backed up and remove by appending a ~
    to it's name. If such a file exists already, it is
    deleted first.

    Args:
        filename (str): Name of file to backup and remove
    Raises:
        BuildError: On build errors
    """
    if os.path.exists(filename):
        if os.path.exists(filename + '~'):
            try:
                os.remove(filename + '~')
            except Exception as e:
                raise BuildError(
                    'Failed to remove backup file {f}: {e}'.format(
                        f=filename+'~',
                        e=str(e)
                    ))
        try:
            os.rename(filename, filename + '~')
        except Exception as e:
            raise BuildError(
                'Failed to backup file {f}: {e}'.format(
                    f=filename,
                    e=str(e)
            ))


def ensure_build_folder():
    """ Ensure the build folder exists.

    If we are to overwrite the naptan file or database,
    those files are renamed with an appened ~ at the end
    (existing backup files are deleted)

    Raises:
        BuildError: If we cannot create the build folder
    """
    global settings
    path=settings['build_folder']
    if not os.path.exists(path):
        try:
            os.makedirs(path)
        except Exception as e:
            raise BuildError("Failed creating build folder: " + str(e))
    if settings['download_if_cached']:
        backup_and_remove(os.path.join(
            settings['build_folder'], settings['naptan_zip_file']
        ))
        backup_and_remove(os.path.join(
            settings['build_folder'], settings['stops_file']
        ))
    if settings['overwrite_database']:
        backup_and_remove(settings['result_file_path'])
    elif os.path.exists(settings['result_file_path']):
        raise BuildError("Results file {f} already exists. Use -f to overwite.".format(f=settings['result_file_path']))


def download_and_extract_stops_file():
    """ Download and extract the stops file

    Will re-use cached files if found.
    """
    global settings
    naptan_zip_file = os.path.join(
        settings['build_folder'],
        settings['naptan_zip_file']
    )
    stops_file = os.path.join(
        settings['build_folder'],
        settings['stops_file']
    )
    if os.path.exists(stops_file):
        out('Cached stops file {f} found, using that.'.format(
            f=stops_file
        ))
        return
    if os.path.exists(naptan_zip_file):
        out('Cached naptan file {f} found, using that.'.format(
            f=naptan_zip_file
        ))
    else:
        out('Downloading {u}...'.format(u=settings['naptan_url']))
        run_command(settings['download_command'], settings)
        out('Done.')
    if not os.path.exists(naptan_zip_file):
        raise BuildError(
            'File {f} does not exist after downloading it?'.format(
                f=naptan_zip_file
        ))
    out('Extracting {s} from {f}...'.format(
        s=settings['stops_file'],
        f=naptan_zip_file
    ))
    run_command(settings['extract_command'], settings)
    if not os.path.exists(stops_file):
        raise BuildError(
            'File {f} does not exist after extracting it?'.format(
                f=stops_file
        ))

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

    # Read arguments and update settings
    arguments = docopt(__doc__, version=__version__)
    settings['download_if_cached'] = arguments['-d']
    settings['overwrite_database'] = arguments['-f']

    # Prepare build folder
    out('Preparing build folder...')
    ensure_build_folder()

    # Get the Naptan zip file, and extra the stops file
    out('Downloading and extracting stops file...')
    download_and_extract_stops_file()

    # Build the database
    out('Building the database...')
    build_stops_database()

    out('Bye!')


if __name__ == '__main__':
    try:
        run()
    except BuildError as e:
        out("Build error: " + str(e), 'error')
