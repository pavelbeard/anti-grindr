# scripts/setenv.sh
#!/usr/bin/env bash

export $(grep -v '^#' .testing.env | xargs)