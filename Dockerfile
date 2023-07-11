FROM node:18.16.1-alpine as builder
WORKDIR /app

## -- Coping and installing project dependencies
COPY yarn.lock .
COPY package.json .
RUN yarn install --frozen-lock-file
COPY ./src src
COPY ./tsconfig.json .

## -- Transpiling
RUN yarn build

## -- Compile js to binary
RUN yarn pkg .

# --

FROM alpine as runner
WORKDIR /app

## -- Installing general depencies
RUN apk add --upgrade --no-cache openssl libgcc libstdc++ ncurses-libs libc6-compat gcompat ca-certificates wget

## -- Installing glibc and glibc locales dependencies (It's needed to run the binary file )
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-2.35-r1.apk
RUN apk add --allow-untrusted --force-overwrite glibc-2.35-r1.apk

RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-bin-2.35-r1.apk
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-i18n-2.35-r1.apk
RUN apk add glibc-bin-2.35-r1.apk glibc-i18n-2.35-r1.apk
RUN /usr/glibc-compat/bin/localedef -i en_US -f UTF-8 en_US.UTF-8

## -- Cleaning remmaining packages
RUN rm glibc-bin-2.35-r1.apk glibc-i18n-2.35-r1.apk glibc-2.35-r1.apk

## -- Setup binary file
COPY --from=builder /app/bin/ethereum-worker-linux /bin/ethp
RUN chmod +x /bin/ethp

CMD ["ethp"]
