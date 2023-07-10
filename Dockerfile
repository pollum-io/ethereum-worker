FROM node:18.16.1-alpine as builder
WORKDIR /app
COPY yarn.lock .
COPY package.json .
RUN yarn install --frozen-lock-file
COPY ./src src
COPY ./tsconfig.json .
RUN yarn build

# --

FROM node:18.16.1-alpine as runner
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
RUN yarn install --frozen-lock-file --production
COPY --from=builder /app/dist dist

CMD ["yarn", "start"]
