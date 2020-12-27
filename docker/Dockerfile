FROM ubuntu:20.04
RUN \
  # configure the "expressjs" user
  groupadd expressjs && \
  useradd expressjs -s /bin/bash -m -g expressjs -G sudo && \
  echo 'expressjs:expressjs' |chpasswd && \
  mkdir /home/expressjs/app && \
  export DEBIAN_FRONTEND=noninteractive && \
  export TZ=Europe\Paris && \
  ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
  apt-get update && \
  # install utilities
  apt-get install -y \
    wget \
    sudo && \
  # install node.js
  wget https://nodejs.org/dist/v12.18.3/node-v12.18.3-linux-x64.tar.gz -O /tmp/node.tar.gz && \
  tar -C /usr/local --strip-components 1 -xzf /tmp/node.tar.gz && \
  # cleanup
  apt-get clean && \
  rm -rf \
    /home/expressjs/.cache/ \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# install expressjs-generator

RUN \
  # install the blueprint
  npm install -g express-generator && \
  # fix expressjs user permissions
  chown -R expressjs:expressjs \
    /home/expressjs \
    /usr/local/lib/node_modules && \
  # cleanup
  rm -rf \
    /home/expressjs/.cache/ \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# expose the working directory
USER expressjs
ENV PATH $PATH:/usr/bin
WORKDIR "/home/expressjs/app"
VOLUME ["/home/expressjs/app"]
CMD ["express"]