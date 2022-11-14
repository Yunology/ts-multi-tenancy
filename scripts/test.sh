#!/bin/bash

echo "Init testing compose containers..."
docker-compose -f docker-compose.yml down && docker-compose --profile test -f docker-compose.yml up -d

[ -d templates ] || mkdir templates

unitCmd="ts-mocha --require 'test/unit/hook.spec.ts' --paths 'test/unit/**/*.ts' --timeout 10000 --exit"
unitCoverCmd="nyc --report-dir coverage/unit $unitCmd"
inteCmd="ts-mocha --require 'test/integrate/hook.spec.ts' --paths 'test/integrate/**/*.ts' --timeout 10000 --exit"
inteCoverCmd="nyc --report-dir coverage/integrate $inteCmd"
covCmd="nyc $unitCmd && nyc --no-clean $inteCmd && nyc report --report-dir coverage/all"
cmd="$unitCmd && $inteCmd"

if [[ $@ == *"unit:coverage"* ]]; then
  eval $unitCoverCmd
elif [[ $@ == *"unit"* ]]; then
  eval $unitCmd
elif [[ $@ == *"integrate:coverage"* ]]; then
  eval $inteCoverCmd
elif [[ $@ == *"integrate"* ]]; then
  eval $inteCmd
elif [[ $@ == *"coverage"* ]]; then
  eval $covCmd
else
  eval $cmd
fi
testExitCode=$?

echo "Stopping testing compose containers..."

docker-compose --profile test -f docker-compose.yml down
dockerDownExitCode=$?

exit $testExitCode || $dockerDownExitCode
