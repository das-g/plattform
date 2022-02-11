SERVER=${SERVER:-api}

if [ "$SERVER" = "styleguide" ]
then
  yarn turbo run build \
    --scope="@project-r/styleguide" \
    --no-deps --include-dependencies
else
  yarn turbo run build \
    --scope="@orbiting/$SERVER-app" \
    --no-deps --include-dependencies
fi
