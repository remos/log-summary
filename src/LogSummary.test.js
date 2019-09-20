import LogSummary, {
    extractIpAndUrlFromLog,
    __RewireAPI__ as RewireAPI
} from './LogSummary';

import {Readable} from 'stream';

import sinon from 'sinon';

describe('extractIpAndUrlFromLog', ()=>{
    it('extracts correctly with no spaces in url', ()=>{
        expect(extractIpAndUrlFromLog(
            '50.112.00.11 - admin [11/Jul/2018:17:33:01 +0200] "GET /asset.css HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"'
        )).toStrictEqual(['50.112.00.11', '/asset.css']);
    });

    // Despite possibly being an invalid log entry
    it('extracts correctly with spaces in url', ()=>{
        expect(extractIpAndUrlFromLog(
            '50.112.00.10 - admin [11/Jul/2018:17:33:01 +0200] "GET /this is invalid, and yet HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"'
        )).toStrictEqual(['50.112.00.10', '/this is invalid, and yet']);
    });
});

describe('LogSummary', ()=>{
    it('functions end to end', async ()=>{
        const testEntries = [
            '177.71.128.21 - - [10/Jul/2018:22:21:28 +0200] "GET /intranet-analytics/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86_64; fr-FR) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"',
            '168.41.191.40 - - [09/Jul/2018:10:11:30 +0200] "GET http://example.net/faq/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"',
            '168.41.191.41 - - [11/Jul/2018:17:41:30 +0200] "GET /this/page/does/not/exist/ HTTP/1.1" 404 3574 "-" "Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"',
            '168.41.191.40 - - [09/Jul/2018:10:10:38 +0200] "GET http://example.net/blog/category/meta/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"',
            '177.71.128.21 - - [10/Jul/2018:22:22:08 +0200] "GET /blog/2018/08/survey-your-opinion-matters/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"',
            '168.41.191.9 - - [09/Jul/2018:23:00:42 +0200] "GET /docs/manage-users/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3"',
            '168.41.191.40 - - [09/Jul/2018:10:11:56 +0200] "GET /blog/category/community/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86_64; ca-ad) AppleWebKit/531.2+ (KHTML, like Gecko) Safari/531.2+ Epiphany/2.30.6"',
            '168.41.191.34 - - [10/Jul/2018:22:01:17 +0200] "GET /faq/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86_64; fr-FR) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"',
            '177.71.128.21 - - [10/Jul/2018:22:21:03 +0200] "GET /docs/manage-websites/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0"',
            '50.112.00.28 - - [11/Jul/2018:15:49:46 +0200] "GET /faq/how-to-install/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86_64; ca-ad) AppleWebKit/531.2+ (KHTML, like Gecko) Safari/531.2+ Epiphany/2.30.6"',
            '50.112.00.11 - admin [11/Jul/2018:17:31:56 +0200] "GET /asset.js HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"',
            '72.44.32.11 - - [11/Jul/2018:17:42:07 +0200] "GET /to-an-error HTTP/1.1" 500 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0"',
            '72.44.32.10 - - [09/Jul/2018:15:48:07 +0200] "GET / HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0" junk extra',
            '168.41.191.9 - - [09/Jul/2018:22:56:45 +0200] "GET /docs/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0" 456 789',
            '168.41.191.43 - - [11/Jul/2018:17:43:40 +0200] "GET /moved-permanently HTTP/1.1" 301 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"',
            '168.41.191.43 - - [11/Jul/2018:17:44:40 +0200] "GET /temp-redirect HTTP/1.1" 307 3574 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) RockMelt/0.9.58.494 Chrome/11.0.696.71 Safari/534.24"',
            '168.41.191.40 - - [09/Jul/2018:10:12:03 +0200] "GET /docs/manage-websites/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0"',
            '168.41.191.34 - - [10/Jul/2018:21:59:50 +0200] "GET /faq/how-to/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)"',
            '72.44.32.10 - - [09/Jul/2018:15:49:48 +0200] "GET /translations/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5"',
            '79.125.00.21 - - [10/Jul/2018:20:03:40 +0200] "GET /newsletter/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)"',
            '50.112.00.11 - admin [11/Jul/2018:17:31:05 +0200] "GET /hosting/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"',
            '72.44.32.10 - - [09/Jul/2018:15:48:20 +0200] "GET /download/counter/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"',
            '50.112.00.11 - admin [11/Jul/2018:17:33:01 +0200] "GET /asset.css HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6"',
        ];

        const stream = new Readable();
        stream._read = ()=>{};

        testEntries.forEach((line)=>{
            stream.push(line + "\n");
        });
        stream.push(null);

        const summary = new LogSummary(stream);

        expect(await summary.summarize())
            .toStrictEqual({
                uniqueIpCount: 11,
                top3IpAddresses: [
                    '168.41.191.40',
                    '177.71.128.21',
                    '50.112.00.11'
                ],
                top3Urls: [
                    '/docs/manage-websites/',
                    '/intranet-analytics/',
                    '/this/page/does/not/exist/'
                ],
            });
    });

    it('generates expected summary', async ()=>{
        class StubbedLogSummary extends LogSummary {
            constructor(parsed) {
                const stream = new Readable();
                stream._read = ()=>{};
                super(stream);

                this.parsed = parsed;
            }

            async parse() {
                return this.parsed;
            }
        }

        const parsed = {
            ipAddresses: {
                countKeys: sinon.fake.returns(10),
                top: sinon.fake.returns(['a', 'b', 'c'])
            },

            urls: {
                top: sinon.fake.returns(['q', 'r', 's'])
            }
        };

        const summary = new StubbedLogSummary(parsed);
        expect(await summary.summarize()).toStrictEqual({
            uniqueIpCount: 10,
            top3IpAddresses: ['a', 'b', 'c'],
            top3Urls: ['q', 'r', 's'],
        });

        expect(parsed.ipAddresses.countKeys.calledOnce).toBeTruthy();
        expect(parsed.ipAddresses.top.calledOnceWith(3)).toBeTruthy();
        expect(parsed.urls.top.calledOnceWith(3)).toBeTruthy();
    });

    it('throws an exception when given no stream', ()=>{
        expect(()=>new LogSummary()).toThrow();
    });

    it('attempts to get a file stream when given a filename', ()=>{
        const mockedFs = {
            createReadStream: sinon.fake.returns(new Readable())
        };

        RewireAPI.__set__('fs', mockedFs);

        new LogSummary('testFile.txt');

        expect(mockedFs.createReadStream.calledOnceWith('testFile.txt')).toBeTruthy();

        RewireAPI.__ResetDependency__('fs');
    });

    it('only parses once', async ()=>{
        const stream = new Readable();
        stream._read = ()=>{};

        stream.push('72.44.32.10 - - [09/Jul/2018:15:48:20 +0200] "GET /download/counter/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"' + "\n");
        stream.push(null);

        const summary = new LogSummary(stream);
        await summary.parse();
        await summary.parse();
    });

    it('returns the same promise during processing', async ()=>{
        const createInterface = sinon.spy(RewireAPI.__get__('readline'), 'createInterface');
        const stream = new Readable();
        stream._read = ()=>{};

        stream.push('72.44.32.10 - - [09/Jul/2018:15:48:20 +0200] "GET /download/counter/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"' + "\n");

        const summary = new LogSummary(stream);
        summary.parse();
        summary.parse();

        expect(createInterface.calledOnce).toBeTruthy();

        stream.push(null);

        expect(createInterface.calledOnce).toBeTruthy();

        createInterface.restore();
    });
});