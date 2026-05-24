FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package.json ./
RUN npm install

# 复制源代码
COPY api ./api
COPY data ./data
COPY uploads ./uploads

# 构建后端
RUN npx tsc -p api/tsconfig.json

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "dist/server.js"]
