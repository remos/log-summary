#!/usr/bin/env node

import LogSummary from './LogSummary';

const [,, filename] = process.argv;
if(!filename) {
    console.error('provide filename');
} else {
    const summary = new LogSummary(filename);
    summary.summarize().then((summary)=>{
        console.log(JSON.stringify(summary, null, 4));
    });
}