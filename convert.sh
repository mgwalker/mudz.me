#!/bin/bash

# for f in rtf/**/*.rtf
# do
#   name="$(basename $f .rtf)"
#   p=${"$(dirname $f)":4}
#   echo "converting $name"
#   textutil $f -convert html -output "html/$p/$name.html"
# done

for f in html/**/*.html
do
  name="$(basename $f .html)"
  p=${"$(dirname $f)":5}
  echo "converting $name"
  docker run -it --rm -v "$(pwd)":/docs pandoc/core -f html -t markdown "/docs/$f" -s -o "/docs/md/$p/$name.md"
done