#!/usr/bin/env bash

# Versioning
# To bump the version number in /ui/native/package.json
# we use `npm version` with either a minor or patch version bump
# Then we use react-native-version to bump the version code
set -e
REPO_ROOT=$(git rev-parse --show-toplevel)

$REPO_ROOT/scripts/enforce-nix.sh

FLAVOR=${FLAVOR:-production}

# Check if git user + email to make sure we can commit when running in CI 
if [ -z "$(git config --global --get user.email)" ]; then
  git config --global user.email "dev@fedibtc.com"
  git config --global user.name "Fedi Dev CI"
fi

pushd $REPO_ROOT/ui/native

# Here we bump the version and commit to the repo, but only allow if
# script is running on a release branch or backport branch in CI
echo "Checking GITHUB_REF: $GITHUB_REF"
if [[ $GITHUB_REF == refs/heads/release/* ]] || [[ $GITHUB_REF == refs/heads/backport/* ]]; then
  # Compare release/backport branch with current version to determine
  # major vs minor vs patch version bump
  BRANCH_VERSION="${GITHUB_REF##*/}"
  echo "Branch version: $BRANCH_VERSION"

  # get current version from package.json
  CURRENT_VERSION="$(npm pkg get version --ws false | sed 's/"//g')"
  echo "Current version: $CURRENT_VERSION"

  if [[ $GITHUB_REF == refs/heads/release/* ]]; then
    CURRENT_MINOR_VERSION="$(cut -d '.' -f 1,2 <<< "$CURRENT_VERSION")"
    if [[ "$CURRENT_MINOR_VERSION" != "$BRANCH_VERSION" ]] && [[ "$BRANCH_VERSION" == *"."* ]]; then
      echo "Bumping npm minor version to $BRANCH_VERSION.0"
      npm version --allow-same-version --force $BRANCH_VERSION.0
    else
      echo 'Bumping npm patch version'
      npm version --allow-same-version --force patch
    fi
  elif [[ $GITHUB_REF == refs/heads/backport/* ]]; then
    echo "Bumping npm version to $BRANCH_VERSION"
    npm version --allow-same-version --force $BRANCH_VERSION
  fi

  # app stores expect these version codes to increment so update
  # react native version numbers to match npm
  echo "Bumping version numbers to match npm"

  # Android: just use react-native-version
  npx react-native-version --never-amend --never-increment-build --target android

  # npm should have new version in package.json
  NEW_VERSION="$(npm pkg get version  --ws false | sed 's/"//g')"

  # iOS: Navigate to xcode project and update version using agvtool
  # using only the major.minor version to avoid excessive review times
  # on Testflight.
  # Check if agvtool is available
  if command -v agvtool >/dev/null 2>&1; then
    echo "Bumping iOS marketing version to match npm"
    pushd $REPO_ROOT/ui/native/ios
    nix develop .#xcode -c agvtool new-marketing-version $NEW_VERSION
    popd
  else
    echo "Error: agvtool is not installed. Could not bump iOS version"
  fi

  echo "Pushing version commit to git branch"
  echo "NEW_VERSION=$NEW_VERSION" >> $GITHUB_OUTPUT
  echo "BRANCH_NAME=$(echo ${GITHUB_REF#refs/heads/})" >> $GITHUB_OUTPUT
  git add package.json android/app/build.gradle ios/ && git commit -m "chore: bump version for ${NEW_VERSION}" && git push
  # remove unstaged changes
  rm $REPO_ROOT/ui/package-lock.json
  git restore $REPO_ROOT
else
  echo "Not on a release branch. Don't push version commit."
fi

popd
