import os

root=os.path.dirname(os.path.realpath(__file__))
settings={
    'build_folder': os.path.join(root, '.build'),
    'result_file_path': os.path.join(root, '..', 'www', 'data', 'stops.json'),
    'naptan_url': 'http://www.dft.gov.uk/NaPTAN/snapshot/NaPTANcsv.zip',
    'naptan_zip_file': 'NaPTANcsv.zip',
    'stops_file': 'Stops.csv',
    'localities': ['Brighton', 'Hove'],
    'tnds_ftp': 'ftp://ftp.tnds.basemap.co.uk',
    'tnds_stops_zip_file': 'SE.zip',
    'tnds_service_file': 'servicereport.csv',
}
