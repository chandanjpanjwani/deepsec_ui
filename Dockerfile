# Stage 1 — builder 
FROM node:22.19.0 AS builder

RUN apt-get update && apt-get install python3 git opam ocaml vim \
libnss3 libdrm2  libgbm1 libx11-xcb1 libxcb-dri3-0 libxtst6 \ 
libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0  libcups2 \
libasound2 xserver-xorg-video-all xserver-xorg-input-all \
xserver-xorg-core xinit x11-xserver-utils libgtk-3-dev \
libxss-dev libxss1 make g++ \
-yq --no-install-suggests --no-install-recommends  \
&& apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /deepsec_ui
COPY . .
ENV DISPLAY=:0

#Setting deepsec api path
ENV PATH="$PATH:/deepsec_ui/deepsec/"

# install exact deps and perform an electron build
RUN npm ci --no-audit --prefer-offline
RUN npm run electron:build

RUN git clone https://github.com/DeepSec-prover/deepsec.git


RUN opam init -a -y --disable-sandboxing \
&& opam install ocamlfind ocamlbuild -y 
RUN cd deepsec && eval $(opam env) && make

CMD bash

