#!/usr/bin/env bash

mkdir -p android
convert -background none -density 300 -resize 96x96  icon.svg android/icon-96-xhdpi.png
convert -background none -density 300 -resize 72x72  icon.svg android/icon-72-hdpi.png
convert -background none -density 300 -resize 48x48  icon.svg android/icon-48-mdpi.png
convert -background none -density 300 -resize 36x36  icon.svg android/icon-36-ldpi.png
