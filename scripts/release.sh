#!/bin/bash -e

export NODE_PATH=$NODE_PATH:./node_modules

# Temp versions
OLD_VERSION="XXX"
NEW_VERSION="$2"
VERSION="XXX"


# Release types
custom_release=false
major_release=false
minor_release=false
patch_release=false
pre_release=false

reset_tags() {
    # Wipe tags
    echo "----------------------------------------------------------------------"
    echo "Wiping local tags"
    echo "----------------------------------------------------------------------"
    git tag -l | xargs git tag -d || return 1

    # Add the origin remote if it is not present
    if ! git remote get-url release; then
        git remote add release git@github.com:box/box-annotations.git || return 1
    fi

    # Fetch latest code with tags
    echo "----------------------------------------------------------------------"
    echo "Fetching latest upstream code + tags"
    echo "----------------------------------------------------------------------"
    git fetch --tags release || return 1;
}


reset_to_previous_version() {
    if OLD_VERSION === "XXX"; then
        echo "----------------------------------------------------------------------"
        echo "Error while cleaning workspace!"
        echo "----------------------------------------------------------------------"
        return 1;
    fi

    # Reset and fetch upstream with tags
    reset_tags || return 1;

    # Reset to previous release version and clear unstashed changes
    echo "----------------------------------------------------------------------"
    echo "Resetting to v" $OLD_VERSION
    echo "----------------------------------------------------------------------"
    git reset --hard OLD_VERSION || return 1
    git clean -f  || return 1
}


reset_to_master() {
    # Update to latest code on GitHub master
    git checkout master || return 1

    # Reset and fetch upstream with tags
    reset_tags || return 1;

    # Reset to latest code and clear unstashed changes
    echo "----------------------------------------------------------------------"
    echo "Resetting to upstream/master"
    echo "----------------------------------------------------------------------"
    git reset --hard release/master || return 1
    git clean -f  || return 1
}

build_lint_and_test() {
    # The build command includes linting
    yarn build && yarn test && yarn test:e2e || return 1
}


increment_version() {
    # Old version
    OLD_VERSION=$(./scripts/current_version.sh)

    if $major_release; then
        echo "----------------------------------------------------------------------"
        echo "Bumping major version..."
        echo "----------------------------------------------------------------------"
        npm --no-git-tag-version version major
    elif $minor_release; then
        echo "----------------------------------------------------------------------"
        echo "Bumping minor version..."
        echo "----------------------------------------------------------------------"
        npm --no-git-tag-version version minor
    elif $patch_release; then
        echo "----------------------------------------------------------------------"
        echo "Bumping patch version..."
        echo "----------------------------------------------------------------------"
        npm --no-git-tag-version version patch
    elif $pre_release; then
        echo "----------------------------------------------------------------------"
        echo "Bumping prerelease version..."
        echo "----------------------------------------------------------------------"
        npm --no-git-tag-version --preid=beta version prerelease
    elif $custom_release; then
        echo "----------------------------------------------------------------------"
        echo "Bumping to custom version..."
        echo "----------------------------------------------------------------------"
        npm --no-git-tag-version version $NEW_VERSION
    fi

    # The current version being built
    VERSION=$(./scripts/current_version.sh)
}

push_to_github() {
    # Add new files
    git commit -am "chore(release): $VERSION"

    # Force update tag after updating files
    git tag -a v$VERSION -m $VERSION

    echo "----------------------------------------------------------------------"
    echo "Master version is now at" $VERSION
    echo "----------------------------------------------------------------------"

    # Push release to GitHub
    if $patch_release; then
        if git push release v$VERSION --no-verify; then
            echo "----------------------------------------------------------------------"
            echo "Pushed version" $VERSION "to git successfully"
            echo "----------------------------------------------------------------------"
        else
            echo "----------------------------------------------------------------------"
            echo "Error while pushing version" $VERSION "to git"
            echo "----------------------------------------------------------------------"
            return 1
        fi
    else
        if git push release master --tags --no-verify; then
            echo "----------------------------------------------------------------------"
            echo "Pushed version" $VERSION "to git successfully"
            echo "----------------------------------------------------------------------"
        else
            echo "----------------------------------------------------------------------"
            echo "Error while pushing version" $VERSION "to git"
            echo "----------------------------------------------------------------------"
            return 1
        fi
    fi
}


# Check out latest code from git, build assets, increment version, and push tags
push_new_release() {
    if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]] ; then
        echo "----------------------------------------------------"
        echo "Your branch is dirty!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Get latest committed code and tags
    if $patch_release; then
        echo "----------------------------------------------------------------------"
        echo "Starting patch release - skipping reset to master"
        echo "IMPORTANT - your branch should be in the state you want for the patch"
        echo "----------------------------------------------------------------------"
    else
        echo "----------------------------------------------------------------------"
        echo "Starting standard release - reset to upstream master"
        echo "----------------------------------------------------------------------"
        reset_to_master || return 1
    fi

    # Run build script, linting, and tests
    build_lint_and_test || return 1

    # Bump the version number
    increment_version || return 1

    # Push to GitHub
    push_to_github || return 1

    # Push GitHub release
    echo "----------------------------------------------------------------------"
    echo "Pushing new GitHub release"
    echo "----------------------------------------------------------------------"
    ./node_modules/.bin/conventional-github-releaser

    # Push NPM release
    echo "----------------------------------------------------------------------"
    echo "Pushing new NPM release"
    echo "----------------------------------------------------------------------"
    ./scripts/publish.sh

    return 0
}

# Check if we are doing major, minor, or patch release
while getopts "cmnpx" opt; do
    case "$opt" in
        c )
            custom_release=true ;;
        m )
            major_release=true ;;
        n )
            minor_release=true ;;
        p )
            patch_release=true ;;
        x )
            pre_release=true ;;
    esac
done


# Execute this entire script
if ! push_new_release; then
    echo "----------------------------------------------------------------------"
    echo "Error while pushing new release!"
    echo "----------------------------------------------------------------------"

    echo "----------------------------------------------------------------------"
    echo "Cleaning workspace by checking out master and removing tags"
    echo "----------------------------------------------------------------------"

    if $patch_release; then
        # Only reset to previous version for patch releases
        reset_to_previous_version || return 1

    # Reset to upstream/master for major/minor releases
    elif ! reset_to_master; then
        echo "----------------------------------------------------------------------"
        echo "Error while cleaning workspace!"
        echo "----------------------------------------------------------------------"
    else
        echo "----------------------------------------------------------------------"
        echo "Workspace successfully cleaned!"
        echo "----------------------------------------------------------------------"
    fi;
    exit 1
fi
