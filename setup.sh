#!/usr/bin/env bash

# The root of the project is where the root git is.
ROOT=`git rev-parse --show-toplevel`
if [ ! $? -eq 0 ]; then
  echo "Please run $0 within the application tree."
  exit 1
fi

if [ -d $ROOT/platforms ]; then
  echo "$ROOT/platforms already exists - it looks like this was setup already."
  exit 1
fi

if [ -d $ROOT/plugins ]; then
  echo "$ROOT/plugins already exists - it looks like this was setup already."
  exit
fi

echo "Adding plugins...."
cordova plugin add org.apache.cordova.device
cordova plugin add org.apache.cordova.console

echo "Adding platforms...."
cordova platform add android

echo "All done!"
