# Brightbus

An intuitive bus time application providing bus stop locations, timetables and live bus times in Brighton, UK.

Licensed under the [GPL V3](https://www.gnu.org/licenses/gpl-3.0.txt)

## Platforms
- Android 2.3 ([Cordova](https://cordova.apache.org/) 4.3.0)

## Deployment

These are build & deployment instructions for Debian based Linux distributions. You may need to adapt those depending on your environment. There are a number of dependencies: The Android SDK, [Cordova](https://cordova.apache.org/), [bower](http://bower.io), npm ... Many of these tools have their own quirks, and the instructions I provide here may not work out of the box. I would advice to only try this if you are willing to spend some time making it work!

### Install the Android SDK

To deploy on Android, you will need to instal the Android SDK. These instructions have worked for me, but you'll probably have a bit of work to do to get it right:

```shell
cd /usr/local
sudo wget http://dl.google.com/android/android-sdk_r24.3.4-linux.tgz
sudo tar -xzf android-sdk_r24.3.4-linux.tgz
sudo chmod -R ugo+rwX android-sdk-linux
cd android-sdk-linux
sudo chmod ugo+x tools/android
sudo ./tools/android update sdk --no-ui
```

This done, you must make sure the android SDK is in your path. Edit `~/.bashrc` and set:

```
PATH="$PATH:/usr/local/android-sdk-linux/tools:/usr/local/android-sdk-linux/platform-tools"
```

### Install Cordova and Bower

To support Android 2.3, you must use [Cordova](https://cordova.apache.org/) 4.3.0. This may work with Cordova 5, but has not yet been tested. To manage it's javascript dependencies, the application uses [bower](http://bower.io). To install Cordova and bower, you must first install [npm](http://npmjs.com)... Yes, that's quite a chain of dependencies!

```shell
sudo apt-get install npm
sudo npm -g install cordova@4.3.0
sudo npm -g install bower
```

### Install cordova dependencies

There's a script to do just that:

```bash
./setup.sh
```

### Install Javascript dependencies

```shell
cd www
bower install
```

### Build the stops database

This is done using the Python scripts in `databuilder`. If you are not familiar with Python, I would advise to install Python, [pip]( https://pypi.python.org/pypi/pip) and [virtualenv](https://pypi.python.org/pypi/virtualenv):

```shell
sudo apt-get install python python-pip python-virtualenv
```

Now you can initialize the `databuilder` script and install it's dependencies without polluting your global Python environement:

```shell
cd databuilder
virtualenv .ve
source .ve/bin/activate
pip install -r requirements.txt
deactivate
```

Building the data takes several steps. Before running any of those steps, you need to activate the virtual environmnet:

```shell
cd databuilder
source .ve/bin/activate
```

First you need to download the data. The [Naptan dataset](https://data.gov.uk/dataset/naptan) is directly available, however to get the [Traveline National Dataset](https://data.gov.uk/dataset/traveline-national-dataset) you will need to get an FTP username and password from Traveline by applying at [http://www.travelinedata.org.uk/traveline-open-data/traveline-national-dataset/](http://www.travelinedata.org.uk/traveline-open-data/traveline-national-dataset/).

Once you have the username and password, you can download and extract all the required data by running:

```shell
./download_data_files.py -a <tnds ftp username> -p <tnds ftp password>
```

You can then build an intermediary file that is used to index which bus line stops at which stops (this is why we need the TNDS data - everything else comes from the Naptan database):

```shell
./build_stop_line_info.py
```

And finally you can build the database that is used by **BrightBus**:

```shell
./databuilder.py
```

Running the script will create the stops file in `www/data/stops.json`. You only need to rebuild it if the source data (but stops and lines information) has changed - or possibly when upgrading **Brightbus**, check the release notes for each release.

To exit the virtual environment, you can run:

```shell
deactivate
```

### Run on android!

Plug your android device in and...

```shell
cordova run android
```
If this fails to see your Android device, you might need to restart `adb` **as root**:

```shell
sudo /usr/local/android-sdk-linux/platform-tools/adb kill-server
sudo /usr/local/android-sdk-linux/platform-tools/adb start-server
```

And try again. Good luck!
