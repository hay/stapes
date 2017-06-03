#!/bin/bash

# execution helpers
yell() { echo "$0: $*" >&2; }
die() { yell "$*"; exit 111; }
try() { "$@" || die "cannot $*"; }
asuser() { sudo su - "$1" -c "${*:2}"; }

# forces deb apps to not ask us questions
export DEBIAN_FRONTEND=noninteractive

# allow script to be ran from any location
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd ${CURRENT_DIR}

# set versions to be installed
NVM_VERSION=v0.17.3
NODE_VERSION=0.10.32

# some useful constants
APP_USER=vagrant
APP_ROOT=/vagrant
USER_HOME=/home/${APP_USER}

VIRTUALENV_NAME="vagrant"

# Install base system
base_system() {
    # fix DNS servers. checks for string to be stateless
    if ! grep -q "8.8.8.8" /etc/resolv.conf; then
        try sudo rm -f /etc/resolv.conf
        # Adds google dns to dns list
        try echo "nameserver 8.8.8.8" > /etc/resolv.conf
        # Sets file as immutable
        try chattr +i /etc/resolv.conf
    fi

    # allow sudo without password (for automation)
    echo "%sudo ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/10-sudo

    try cat << EOF > /etc/apt/sources.list
deb http://gb.archive.ubuntu.com/ubuntu trusty main universe multiverse restricted
deb http://gb.archive.ubuntu.com/ubuntu trusty-updates main universe multiverse restricted
deb http://gb.archive.ubuntu.com/ubuntu trusty-security main universe multiverse restricted
deb http://gb.archive.ubuntu.com/ubuntu trusty-backports main universe multiverse restricted
EOF

    # local dev stuff
    try sudo locale-gen en_GB.UTF-8

    # apt-fast
    try add-apt-repository -y ppa:saiarcot895/myppa
    try apt-get update
    try apt-get install -y apt-fast

    # sys deps
    try apt-fast install -f -y $(cat ${APP_ROOT}/apt-requirements.txt)

    # upgrade stuff
    try apt-fast upgrade -y

    # Fixes ubuntu node path
    sudo ln -s /usr/bin/nodejs /usr/bin/node || true
}

base_user() {
    # install node venv
    if ! grep -q "nvm use" ${USER_HOME}/.profile; then
        try asuser ${APP_USER} \
            "curl https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash"
        try asuser ${APP_USER} "echo 'source ~/.nvm/nvm.sh' >> ~/.profile"
        try asuser ${APP_USER} "nvm install ${NODE_VERSION}"
        try asuser ${APP_USER} "echo 'nvm use ${NODE_VERSION}' >> ~/.profile"
    fi

    try asuser ${APP_USER} "npm install -g grunt-cli"
}

base_system
base_user
