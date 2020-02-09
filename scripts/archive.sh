rm -f package.zip && \
rm -rf node_modules && \
npm install --production && \
zip -r package.zip node_modules && \
cd build && \
zip -r ../package.zip * && \
rm -rf node_modules && \
npm ci
