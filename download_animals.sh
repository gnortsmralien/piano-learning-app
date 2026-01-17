#!/bin/bash
# Download animal sound assets
BASE_URL="https://raw.githubusercontent.com/dev-you-need/AnimalSounds/master/app/src/main/res/raw"

# Define target directory
DEST="public/sounds"
mkdir -p "$DEST"

# List of animals to download
# Farm/Pets
curl -o "$DEST/cat.mp3" "$BASE_URL/cat.mp3"
curl -o "$DEST/dog.mp3" "$BASE_URL/dog.mp3"
curl -o "$DEST/chicken.mp3" "$BASE_URL/chicken.mp3"
curl -o "$DEST/cow.mp3" "$BASE_URL/cow.mp3"
curl -o "$DEST/pig.mp3" "$BASE_URL/pig.mp3"
curl -o "$DEST/sheep.mp3" "$BASE_URL/sheep.mp3"
curl -o "$DEST/duck.mp3" "$BASE_URL/duck.mp3"
curl -o "$DEST/horse.mp3" "$BASE_URL/horse.mp3"
curl -o "$DEST/donkey.mp3" "$BASE_URL/donkey.mp3"
curl -o "$DEST/goat.mp3" "$BASE_URL/goat.mp3"
curl -o "$DEST/rooster.mp3" "$BASE_URL/rooster.mp3"

# Wild
curl -o "$DEST/bear.mp3" "$BASE_URL/bear.mp3"
curl -o "$DEST/lion.mp3" "$BASE_URL/lion.mp3"
curl -o "$DEST/tiger.mp3" "$BASE_URL/tiger.mp3"
curl -o "$DEST/elephant.mp3" "$BASE_URL/elephant.mp3"
curl -o "$DEST/monkey.mp3" "$BASE_URL/monkey.mp3"
curl -o "$DEST/wolf.mp3" "$BASE_URL/wolf.mp3"
curl -o "$DEST/fox.mp3" "$BASE_URL/fox.mp3"
curl -o "$DEST/frog.mp3" "$BASE_URL/frog.mp3"

# Birds/Others
curl -o "$DEST/bird.mp3" "$BASE_URL/bird.mp3"
curl -o "$DEST/crow.mp3" "$BASE_URL/crow.mp3"
curl -o "$DEST/eagle.mp3" "$BASE_URL/eagle.mp3"
curl -o "$DEST/owl.mp3" "$BASE_URL/owl.mp3"
curl -o "$DEST/bee.mp3" "$BASE_URL/bee.mp3"
curl -o "$DEST/cricket.mp3" "$BASE_URL/cricket.mp3"
curl -o "$DEST/mosquito.mp3" "$BASE_URL/mosquito.mp3"
curl -o "$DEST/fly.mp3" "$BASE_URL/fly.mp3"

# Check downloads
for file in "$DEST"/*.mp3; do
    if [ ! -s "$file" ] || grep -q "404: Not Found" "$file"; then
        echo "Failed to download $(basename "$file")"
        rm "$file"
    fi
done
