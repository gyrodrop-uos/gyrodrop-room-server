#!/bin/bash
set -e

GIT_CRYPT_KEY_PATH="$1"
if [ ! -f "$GIT_CRYPT_KEY_PATH" ]; then
    echo "Error: You must provide the valid path to the git-crypt key file as the first argument."
    exit 1
fi

sudo apt update
sudo apt install -y git-crypt awscli

# decrypt the git crypt files
git-crypt unlock "$GIT_CRYPT_KEY_PATH"
