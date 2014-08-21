#!/bin/bash
git checkout gh-pages 2>&1 1>/dev/null
git merge --no-edit  -m "merging master with gh-pages branch" master 
posts=_posts
OPTS=`getopt -o ua --long update,all-sample: -n 'parse-options' -- "$@"`
if [ $? != 0 ] ; then echo "Failed parsing options." >&2 ; exit 1 ; fi

while true; do
        case "$1" in
            -u | --update ) update=true; shift ;;
            -a | --all-sample ) allsample=true shift ;;
            -- ) shift; break ;;
            * ) break ;;
        esac
done
if [ -z $1 ] && [ -z $allsample ]; then
    echo "Please provide the sample name to generate documentation or use -a flag to generate all samples";
    exit;
fi
if [ -n $1 ]; then
    sampleName=$1
    #git checkout master -- $sampleName/docs 2>&1 1>/dev/null
    #git reset HEAD . 2>&1 1>/dev/null
    if [ ! -d $sampleName/docs ]; then
        echo "The value provided is not a sample. Provide a sample name.";
        exit;
    fi
    postName=`echo $sampleName`
    echo "post name $postName"
    post=`ls -al $posts | sed -n 's/..*\('"$postName"'\.markdown$\)/\1/p'`
    if [ -n "$post" ] && [ -z "$update" ]; then
        echo "documentation for $sampleName exists, use -u flag to update the documentation"
        exit
    fi
    
    ts=`date +%F`
    filename="$posts/$ts-$postName.markdown"

    touch $filename
    screenshot=$sampleName/docs/screenshot.png
    cp $screenshot img/screenshots/$postName.png
    
    echo --- > $filename
    echo screenshot: /img/screenshots/$postName.png >> $filename
    echo --- >> $filename

    if [ ! -d samples ]; then
        mkdir samples
    fi
    sampleinstructions=samples/$sampleName.markdown
    touch $sampleinstructions
    echo --- > $sampleinstructions
    echo layout: sample >> $sampleinstructions
    author=`git log --pretty=format:"%ae;%an" -- $sampleName | sort -k 3 -t ';' | uniq -c | sort -r | head -1 | sed -n 's/[0-9][0-9]*\s\([a-z@\.;]*\)/\1/p'`
    author=($(echo $author | tr ';' ' '))
    echo authoremail: ${author[0]} >> $sampleinstructions
    echo authorname: ${author[1]} >> $sampleinstructions
    authorhash=`echo -n ${author[1]} | md5sum | sed 's/\([a-zA-Z0-9][a-zA-Z0-9]*\)\s\s-/\1/'`
    echo authorhash: $authorhash >> $sampleinstructions
    echo --- >> $sampleinstructions
    cat $sampleName/README.md >> $sampleinstructions
fi
