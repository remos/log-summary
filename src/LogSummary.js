import fs from 'fs';
import readline from 'readline';
import HashTally from './HashTally';

export function extractIpAndUrlFromLog(log) {
    /*
    const split = log.split(' ', 7);
    return [split[0], split[6]];
    */
    return log.match(/([^\s]+) .+? "[^\s]+ (.+?) [^\s]+"/).slice(1, 3);
}

export default class LogSummary {
    constructor(stream) {
        if(!stream) {
            throw 'missing stream!';
        } else if(typeof stream === 'string') {
            stream = fs.createReadStream(stream);
        }

        this.stream = stream;
    }

    async parse() {
        if(this.parsed || this.parsing) {
            return this.parsed || this.parsing;
        }

        const ipAddresses = new HashTally();
        const urls = new HashTally();

        this.parsing = new Promise((resolve)=>{
            const rl = readline.createInterface(this.stream);

            rl.on('line', (line)=>{
                const [ipAddress, url] = extractIpAndUrlFromLog(line);
                ipAddresses.increment(ipAddress);
                urls.increment(url);
            });

            rl.on('close', ()=>{
                resolve(this.parsed = {
                    ipAddresses,
                    urls
                });
            });
        });

        return this.parsing;
    }

    async summarize() {
        const {ipAddresses, urls} = await this.parse();

        return {
            uniqueIpCount: ipAddresses.countKeys(),
            top3IpAddresses: ipAddresses.top(3),
            top3Urls: urls.top(3)
        };
    }
}