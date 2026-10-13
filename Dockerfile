FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY proto ./proto
RUN HUSKY=0 pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build


FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000 50051

CMD ["node", "dist/main.js"]
