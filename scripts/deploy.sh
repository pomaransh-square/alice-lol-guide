# Install .env to variables
while read line;
  do export "$line";
done <.env

yc serverless function version create \
--folder-id=$FOLDER_ID \
--function-name=$npm_package_name \
--runtime nodejs12 \
--entrypoint yc.handle \
--memory 128m \
--execution-timeout 3s \
--source-path ./package.zip
