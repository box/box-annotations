#!/bin/bash

export NODE_PATH=$NODE_PATH:./node_modules

# Temp versions
OLD_VERSION="XXX"
VERSION="XXX"


# Major, minor, or patch release
major_release=false
minor_release=false
patch_release=false


reset_to_master() {
    # Update to latest code on GitHub master
    git checkout master || return 1

    # Wipe tags
    git tag -l | xargs git tag -d || return 1

    # Add the origin remote if it is not present
    if ! git remote get-url release; then
        git remote add release git@github.com:box/box-annotations.git || return 1
    fi

    # Fetch latest code with tags
    git fetch --tags release || return 1;

    # Reset to latest code and clear unstashed changes
    git reset --hard release/master || return 1

    # Remove old local tags in case a build failed
    git fetch --prune release '+refs/tags/*:refs/tags/*' || exit 1
    git clean -fd || return 1
}

install_dependencies() {
    echo "--------------------------------------------------------"
    echo "Installing all package dependencies"
    echo "--------------------------------------------------------"
    if yarn install; then
        echo "----------------------------------------------------"
        echo "Installed dependencies successfully."
        echo "----------------------------------------------------"
    else
        echo "----------------------------------------------------"
        echo "Error: Failed to run 'yarn install'!"
        echo "----------------------------------------------------"
        exit 1;
    fi
}


build_lint_and_test() {
    # The build command includes linting
    yarn run build && yarn run test || return 1
}


increment_version() {
    # Old version
    OLD_VERSION=$(./build/current_version.sh)

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
    fi

    # The current version being built
    VERSION=$(./build/current_version.sh)
}


update_changelog() {
    echo "----------------------------------------------------------------------"
    echo "Updating CHANGELOG.md"
    echo "----------------------------------------------------------------------"

    if ./node_modules/.bin/conventional-changelog -i CHANGELOG.md --same-file; then
        echo "----------------------------------------------------------------------"
        echo "Updated CHANGELOG successfully"
        echo "----------------------------------------------------------------------"
    else
        echo "----------------------------------------------------------------------"
        echo "Error: Could not update the CHANGELOG for this version"
        echo "----------------------------------------------------------------------"
        return 1
    fi
}


update_readme() {
    echo "----------------------------------------------------------------------"
    echo "Updating README"
    echo "----------------------------------------------------------------------"

    # Replace 'v{VERSION}' string
    sed -i -e "s@v$OLD_VERSION@v$VERSION@g" README.md

    rm README.md-e
}


push_to_github() {
    # Add new files
    git commit -am "Release: $VERSION"

    # Force update tag after updating files
    git tag -a v$VERSION -m $VERSION

    echo "----------------------------------------------------------------------"
    echo "Master version is now at" $VERSION
    echo "----------------------------------------------------------------------"

    # Push release to GitHub
    if $patch_release; then
        if git push github-upstream v$VERSION --no-verify; then
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
        if git push github-upstream master --tags --no-verify; then
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

    # Get latest commited code and tags
    if $patch_release; then
        echo "----------------------------------------------------------------------"
        echo "Starting patch release - skipping reset to master"
        echo "IMPORTANT - your branch should be in the state you want for the patch"
        echo "----------------------------------------------------------------------"
    elif $minor_release; then
        echo "----------------------------------------------------------------------"
        echo "Starting minor release - reset to upstream master"
        echo "----------------------------------------------------------------------"
        reset_to_master || return 1
    else
        echo "----------------------------------------------------------------------"
        echo "Starting major release - reset to upstream master"
        echo "----------------------------------------------------------------------"
        reset_to_master || return 1
    fi

    # Install node modules
    if ! install_dependencies; then
        echo "----------------------------------------------------"
        echo "Error in install_dependencies!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Do testing and linting
    if ! build_lint_and_test; then
        echo "----------------------------------------------------"
        echo "Error in build_lint_and_test!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Must bump version before changelog generation (should not create tag)
    if ! increment_version; then
        echo "----------------------------------------------------"
        echo "Error in increment_version!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Update changelog
    if ! update_changelog; then
        echo "----------------------------------------------------"
        echo "Error in update_changelog!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Update readme
    if ! update_readme; then
        echo "----------------------------------------------------"
        echo "Error in update_readme!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Push to github
    if ! push_to_github; then
        echo "----------------------------------------------------"
        echo "Error in push_to_github!"
        echo "----------------------------------------------------"
        exit 1
    fi

    # Push GitHub release
    echo "----------------------------------------------------------------------"
    echo "Pushing new GitHub release"
    echo "----------------------------------------------------------------------"
    ./node_modules/.bin/conventional-github-releaser

    return 0
}


# Check if we are doing major, minor, or patch release
while getopts "mnp" opt; do
    case "$opt" in
        m )
            major_release=true ;;
        n )
            minor_release=true ;;
        p )
            patch_release=true ;;
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

    if ! reset_to_master; then
        echo "----------------------------------------------------------------------"
        echo "Error while cleaning workspace!"
        echo "----------------------------------------------------------------------"
    else
        echo "----------------------------------------------------------------------"
        echo "Workspace succesfully cleaned!"
        echo "----------------------------------------------------------------------"
    fi;
    exit 1
fi
