#!/bin/bash

# Directory to save sounds
TARGET_DIR="/Users/j/IdeaProjects/own/piano/public/sounds"
mkdir -p "$TARGET_DIR"

# Base URL for raw files
BASE_URL="https://raw.githubusercontent.com/dev-you-need/vehicleSounds/master/app/src/main/res/raw"

# List of files to download
FILES=(
  "ambulance.mp3"
  "autocrane.mp3"
  "bulldozer.mp3"
  "bus.mp3"
  "concrete_mixer.mp3"
  "dump_truck.mp3"
  "excavator.mp3"
  "ferry.mp3"
  "fire_truck.mp3"
  "funicular.mp3"
  "garbage_truck.mp3"
  "helicopter.mp3"
  "metro.mp3"
  "plane.mp3"
  "police.mp3"
  "snowplow_truck.mp3"
  "street_flusher.mp3"
  "suburban_train.mp3"
  "taxi.mp3"
  "tow_truck.mp3"
  "tractor.mp3"
  "train.mp3"
  "tram.mp3"
  "trolleybus.mp3"
  "tuktuk.mp3"
  "water_taxi.mp3"
)

echo "Downloading sounds to $TARGET_DIR..."

for file in "${FILES[@]}"; do
  echo "Downloading $file..."
  curl -s -o "$TARGET_DIR/$file" "$BASE_URL/$file"
  if [ $? -eq 0 ]; then
    echo "✔ $file downloaded"
  else
    echo "✘ Failed to download $file"
  fi
done

echo "Download complete."
