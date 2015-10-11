#!/usr/bin/env python
""" BrightBus Data Builder - Data Downloader

    Tool to download and extract the datafiles needed to build the BrightBus 
    bus stop and line information database.

    The datafiles are:

    - Naptan stops database
    - TNDS service database

    Usage:
        download_data.py [-d] -a USERNAME -p PASSWORD
        download_data.py ( -h | --help | --versin )

    Options:
        -a USERNAME    TNDS FTP user name
        -p PASSWORD    TNDS FTP password
        -d             Download the databases, even if we have a local copy.
        -h, --help     Output this help text and exit
        --version      Output version and exit
"""
import os
from docopt import docopt
from settings import settings
from utils import BuildError, out, run_command, backup_and_remove

__version__ = 'BrightBus Data Downloader 0.2'

commands={
    'download_naptan': [
        '/usr/bin/wget', 
        '{naptan_url}', 
        '-O', '{build_folder}/{naptan_zip_file}'
    ],
    'extract_naptan': [
        '/usr/bin/unzip', '-u',
        '{build_folder}/{naptan_zip_file}', '{stops_file}', 
        '-d', '{build_folder}'
    ],
    'download_tnds_stops': [
        '/usr/bin/wget', 
        '--user={tnds_ftp_username}', '--password={tnds_ftp_password}', 
        '{tnds_ftp}/{tnds_stops_zip_file}', 
        '-O', '{build_folder}/{tnds_stops_zip_file}'
    ],
    'extract_tnds_stops': [
        '/usr/bin/unzip', '-u',
        '{build_folder}/{tnds_stops_zip_file}',
        '-d', '{build_folder}'
    ],
    'download_tnds_service': [
        '/usr/bin/wget', 
        '--user={tnds_ftp_username}', '--password={tnds_ftp_password}', 
        '{tnds_ftp}/{tnds_service_file}', 
        '-O', '{build_folder}/{tnds_service_file}'
    ],
}

def ensure_build_folder():
    """ Ensure the build folder exists.

    Raises:
        BuildError: If we cannot create the build folder, or it is not empty.
    """
    global commands
    path=settings['build_folder']
    if not os.path.exists(path):
        try:
            os.makedirs(path)
        except Exception as e:
            raise BuildError("Failed creating build folder: " + str(e))


def download_and_extract_naptan_stops_file():
    """ Download and extract the naptan stops file 
   
   Raises:
       BuildError
    """
    global commands
    naptan_zip_file = os.path.join(
        settings['build_folder'],
        settings['naptan_zip_file']
    )
    stops_file = os.path.join(
        settings['build_folder'],
        settings['stops_file']
    )
    if not settings['download_if_cached'] and os.path.exists(naptan_zip_file):
        out('Cached file {f} found, re-using.'.format(
            f=naptan_zip_file
        ))
    else:
        out('Downloading {u}...'.format(u=settings['naptan_url']))
        backup_and_remove(naptan_zip_file)
        run_command(commands['download_naptan'], settings)
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
    run_command(commands['extract_naptan'], settings)
    if not os.path.exists(stops_file):
        raise BuildError(
            'File {f} does not exist after extracting it?'.format(
                f=stops_file
        ))


def download_and_extract_tnds_files():
    """ Download the TNDS stops zip file, and the TNDS
        service index file.

    Raises:
        BuildError
    """
    global commands
    tnds_stops_zip_file = os.path.join(
        settings['build_folder'],
        settings['tnds_stops_zip_file']
    )
    if not settings['download_if_cached'] and os.path.exists(tnds_stops_zip_file):
        out('Cached file {f} found, re-using.'.format(
            f=tnds_stops_zip_file
        ))
    else:
        out('Downloading {s}/{f}...'.format(
            s=settings['tnds_ftp'],
            f=settings['tnds_stops_zip_file']
        ))
        backup_and_remove(tnds_stops_zip_file)
        run_command(commands['download_tnds_stops'], settings)
        out('Done.')
    if not os.path.exists(tnds_stops_zip_file):
        raise BuildError(
            'File {f} does not exist after download it?'.format(
                f=tnds_zip_file
        ))
    out('Extracting files from {f} to {d}...'.format(
        f=tnds_stops_zip_file,
        d=settings['build_folder']
    ))
    run_command(commands['extract_tnds_stops'], settings)
    tnds_service_file = os.path.join(
        settings['build_folder'],
        settings['tnds_service_file']
    )
    if not settings['download_if_cached'] and os.path.exists(tnds_service_file):
        out('Cached file {f} found, re-using.'.format(
            f=tnds_service_file
        ))
    else:
        out('Downloading {s}/{f}...'.format(
            s=settings['tnds_ftp'],
            f=settings['tnds_service_file']
        ))
        run_command(commands['download_tnds_service'], settings)
        out('Done.')
    if not os.path.exists(tnds_service_file):
        raise BuildError(
            'File {f} does not exist after download it?'.format(
                f=tnds_service_file
        ))

def run():
    """ Run the data downloader """
    arguments = docopt(__doc__, version=__version__)
    if arguments['-a'] is None or arguments['-p'] is None:
        out('TNDS FTP username and password required. Specify -n to skip TNDS data.')
        return
    settings['download_if_cached'] = arguments['-d']
    settings['tnds_ftp_username'] = arguments['-a']
    settings['tnds_ftp_password'] = arguments['-p']

    out('Preparing build folder...')
    ensure_build_folder()

    out('Downloading and extracting Naptan stops file...')
    download_and_extract_naptan_stops_file()

    out('Downloading and extracting TNDS database...')
    download_and_extract_tnds_files()

    out('Bye!')

if __name__ == '__main__':
    try:
        run()
    except BuildError as e:
        out("Build error: " + str(e), 'error')
