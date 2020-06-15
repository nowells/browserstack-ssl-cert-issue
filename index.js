const browserstack = require('browserstack-local');
const getCertificate = require('./get-cybervillains-certificate');
const wd = require('wd');
const webdriver = require('selenium-webdriver');
const http2 = require('http2');
const {promisify} = require('util');

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

(async() => {
    try {
        await runWithBrowserstack(runTest);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
})();

async function runTest() {
    const server = await getTestServer();
    const port = server.address().port;
    const healthcheckUrl = `https://maestro-healthcheck.localhost.opower.it:${port}`;

    console.log(`Running server with cybervillains certificates at: ${healthcheckUrl}`);

    for (let i = 0; i < 100; i += 1) {
        const capabilities = {
            'browserstack.local': true,
            'browserstack.debug': true,
            'browserstack.console': 'verbose',
            'browserstack.networkLogs': true,
            pageLoadStrategy: process.env.PAGE_LOAD_STRATEGY || 'none',
            seleniumVersion: '3.141.59',
            acceptInsecureCerts: true,
            acceptSslCerts: true,
            browserName: 'safari',
            os_version: 'Catalina',
            os: 'OS X',
        };
        const browserBuilder = new webdriver.Builder()
            .usingServer(`https://${username}:${accessKey}@hub-cloud.browserstack.com/wd/hub`)
            .withCapabilities(capabilities);
        const browser = await browserBuilder.build();
        const jobId = await browser.getSession().then(sessionData => {
            return sessionData.getId();
        });

        console.log(`https://automate.browserstack.com/dashboard/v2/builds/bda4c1c2d9dd9210fc8c04dfcdb54c5efeead865/sessions/${jobId}`);

        await browser.get(healthcheckUrl);

        let healthcheckData;

        try {
            await browser.wait(async() => {
                healthcheckData = await browser.executeScript("return document.body.innerText");

                return /hello world/.test(healthcheckData);
            }, 2000);
        }
        catch (err) {
            console.log(`Last did not access healtcheck endpoint successfully: ${healthcheckData}`);
            throw err;
        }
        finally {
            await browser.quit();
        }
    }
}

async function getTestServer() {
    const serverOpts = {
        allowHTTP1: true,
        SNICallback: (async(domain, cb) => {
            try {
                cb(null, await getCertificate(domain));
            }
            catch (err) {
                console.error(err);
                cb(err);
            }
        }),
    };

    const server = http2.createSecureServer(
        serverOpts,
        (req, res) => {
            res.writeHead(200);
            res.end('hello world\n');
        }
    );

    await server.listen();

    return server;
}

async function runWithBrowserstack(fn) {
    const bsLocal = new browserstack.Local();
    const stop = promisify(bsLocal.stop.bind(bsLocal));

    await promisify(bsLocal.start.bind(bsLocal))({
        key: accessKey,
        forceLocal: true,
        verbose: true,
    });

    try {
        process.on('SIGINT', async() => {
            console.log('Stopping tunnel and then stopping.');
            await stop();
            process.exit(1);
        });

        await fn();
    }
    finally {
        await stop();
    }
}
