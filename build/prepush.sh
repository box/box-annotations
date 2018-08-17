#!/bin/bash

# lint, test, and build assets to update translations
prepush() {
    echo "--------------------------------------------------------"
    echo "Linting"
    echo "--------------------------------------------------------"
    yarn lint || exit 1

    echo "--------------------------------------------------------"
    echo "Checking flow types"
    echo "--------------------------------------------------------"
    yarn flow check || exit 1

    echo "--------------------------------------------------------"
    echo "Testing"
    echo "--------------------------------------------------------"
    yarn test || exit 1

    echo "--------------------------------------------------------"
    echo "Building"
    echo "--------------------------------------------------------"
    yarn build || exit 1
}

# Execute this script
if ! prepush; then
    echo "----------------------------------------------------"
    echo "Error: failure in prepush script"
    echo "----------------------------------------------------"
    exit 1
fi
