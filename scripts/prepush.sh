#!/bin/bash

# lint, test, and build assets
prepush() {
    echo "--------------------------------------------------------"
    echo "Checking types"
    echo "--------------------------------------------------------"
    yarn lint:ts || exit 1

    echo "--------------------------------------------------------"
    echo "Building"
    echo "--------------------------------------------------------"
    yarn build || exit 1

    echo "--------------------------------------------------------"
    echo "Testing"
    echo "--------------------------------------------------------"
    git fetch upstream
    yarn test --changedSince=upstream/master || exit 1
}

# Execute this script
if ! prepush; then
    echo "----------------------------------------------------"
    echo "Error: failure in prepush script"
    echo "----------------------------------------------------"
    exit 1
fi
