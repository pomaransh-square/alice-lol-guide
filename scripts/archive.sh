# Delete previos version
rm -f package.zip;
rm -rf node_modules;

# Install only needs deps for size optimize
npm install --production;

# Zipping new version
zip -r package.zip node_modules;
zip -r ../package.zip ./build/*;

# Update deps (for continious development)
rm -rf node_modules && \
npm ci
