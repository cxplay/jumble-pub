#!/bin/sh
exec zypak-wrapper.sh /app/nostrmoe/nostrmoe \
  --ozone-platform-hint=auto \
  --disable-features=FallbackToSWIfGLES3NotSupported \
  "$@"
