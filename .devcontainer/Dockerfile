# syntax=docker/dockerfile:1

FROM debian:trixie-slim AS dev

ARG USER_UID=1000
ARG USER_GID=1000


ENV DEBIAN_FRONTEND=noninteractive
ENV HOME=/home/user
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8


RUN --mount=type=cache,target=/var/cache/apt/ \
    --mount=type=cache,target=/var/lib/apt/ \
    apt-get update && \
    apt-get install --no-install-recommends --yes \
      build-essential \
      ca-certificates \
      curl \
      git \
      locales \
      ssh \
      sudo \
      tmux \
      unzip \
      vim && \
    groupadd --gid $USER_GID user && \
    useradd --create-home --no-log-init --gid $USER_GID --uid $USER_UID --shell /usr/bin/bash user && \
    echo 'user ALL=(root) NOPASSWD:ALL' > /etc/sudoers.d/user && chmod 0440 /etc/sudoers.d/user

RUN git config --system --add safe.directory '*'

SHELL ["/bin/bash", "-c"]

USER user

ARG NODE_VERSION="24"
ARG NVM_VERSION="0.40.3"
ENV NVM_DIR=/home/user/.nvm
ENV NVM_SYMLINK_CURRENT=true
ENV PATH=/home/user/.nvm/current/bin:$PATH

RUN mkdir -p "$NVM_DIR" \
    && curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash \
    && source "$NVM_DIR/nvm.sh" \
    && nvm install "$NODE_VERSION" \
    && nvm alias default "$NODE_VERSION" \
    && nvm use default \
    && npm --version

RUN mkdir -p "$HOME/.history" && \
    echo 'export HISTFILE=$HOME/.history/.bash_history' >> "$HOME/.bashrc" && \
    echo 'export HISTSIZE=10000'                        >> "$HOME/.bashrc" && \
    echo 'export HISTFILESIZE=20000'                    >> "$HOME/.bashrc" && \
    echo 'export HISTCONTROL=ignoredups:erasedups'      >> "$HOME/.bashrc" && \
    echo 'shopt -s histappend'                          >> "$HOME/.bashrc" && \
    echo 'PROMPT_COMMAND="history -a; history -c; history -r"' >> "$HOME/.bashrc" && \
    echo '[[ $- == *i* ]] && bind "\e[A":history-search-backward' >> "$HOME/.bashrc" && \
    echo '[[ $- == *i* ]] && bind "\e[B":history-search-forward'  >> "$HOME/.bashrc" && \
    echo 'if [ -f "$HOME/.bashrc" ]; then . "$HOME/.bashrc"; fi'  > "$HOME/.bash_profile" && \
    echo 'export NVM_DIR=/home/user/.nvm'                          >> "$HOME/.bashrc" && \
    echo 'export PATH=$NVM_DIR/current/bin:$PATH'                 >> "$HOME/.bashrc" && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'          >> "$HOME/.bashrc" && \
    echo '[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"' >> "$HOME/.bashrc"

SHELL ["/bin/bash", "-lc"]

USER root
RUN mkdir -p /workspace && chown user:user /workspace
USER user
