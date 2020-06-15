'use strict';

const crypto = require('crypto');
const tls = require('tls');
const path = require('path');
const stripIndent = require('strip-indent');
const tempy = require('tempy');
const execa = require('execa');
const fsExtra = require('fs-extra');
const certificates = {};

module.exports = getCybervillainsCertificate;

async function getCybervillainsCertificate(domain) {
    certificates[domain] = certificates[domain] || (async() => {
        const commonName = 'browser-tests.hexxie.com';
        const keyDir = tempy.directory();
        const now = new Date();
        const startYear = `${now.getFullYear() - 1}`;
        const startMonth = `${now.getMonth() + 1}`.padStart(2, '0');
        const startYearMonth = `${startYear}${startMonth}`;

        await fsExtra.writeFile(
            path.join(keyDir, 'rootca.key'),
            stripIndent(`
                -----BEGIN RSA PRIVATE KEY-----
                MIICXQIBAAKBgQCFUIVmGsyHzLyVAT+aoakcodrZK2CPcFWff0o9ZeLZVmOBzgug
                8uTmAUQpqNk/TfBF6wMV2SilD84Jm94CLwECfQz+sKIh8ss7WSef3G4ZafBGxwSL
                xlit09DqYd5BDz0thVio4h//qVeqmNGLfpZM3MMa42SGof91R0F1A5vF9QIDAQAB
                AoGAEVuTkuDIYqIYp7n64xJLZ4v3Z7FLKEHzFApJy0a5y5yA5kTCpNkbTos5qcbv
                SlvGfgQEadLVhPBS3lNqC5S9J7iUmmdpveXxV5ZaOsK3Zh+QCURfjLvqLH5Fzn1c
                341YTCXpPdlbZElbARh3WKtW7R4c5GNNdf7zrWRqjYsXacECQQD4CVJ0l2AOTfLh
                0uOXr1wwblIVscNv5WO9WLERtDWZP2EhDkRFMFsV8gTTvs01LiX0PRkuUjP+C6/e
                g1DlBrqxAkEAiZhE4Ui7AHF6CYg+eamQKf4ECn4KgZ/y68Tan9YiULRXOx4HSpsM
                3g+uPvwWnp9Pd/0gVSmQlJn3oNi5LQtIhQJBANF6ZgYL1lceY/NuvUJdGrnYYkDq
                Ocml7P98CUePb/j2OxzExMm+Vh8JoCQIr5yrVeiZNUwWpsx2qFh/hPF4JnECQCej
                /8wryPxStQcEAoPIjykZ7o4bS+mWbETynM3Jwm8f1bXJa+5ZhzZ+rAOnWtjuKtX1
                zhfa9rVpOkdTyN2qT4UCQQD35VDm82aDi9mC8Zs1T/SrYKwRJuz25JPM8Yh9xiuK
                7iI4qfwwaX99fo09cH0pfUdx+z7QyNba8bMfTWe8qPHm
                -----END RSA PRIVATE KEY-----
            `).trim()
        );
        await fsExtra.writeFile(
            path.join(keyDir, 'rootca.crt'),
            stripIndent(`
                -----BEGIN CERTIFICATE-----
                MIIClTCCAf6gAwIBAgIBATANBgkqhkiG9w0BAQUFADBZMRowGAYDVQQKDBFDeWJl
                clZpbGxpYW5zLmNvbTEuMCwGA1UECwwlQ3liZXJWaWxsaWFucyBDZXJ0aWZpY2F0
                aW9uIEF1dGhvcml0eTELMAkGA1UEBhMCVVMwHhcNMTEwMjEwMDMwMDEwWhcNMzEx
                MDIzMDMwMDEwWjBZMRowGAYDVQQKDBFDeWJlclZpbGxpYW5zLmNvbTEuMCwGA1UE
                CwwlQ3liZXJWaWxsaWFucyBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTELMAkGA1UE
                BhMCVVMwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAIVQhWYazIfMvJUBP5qh
                qRyh2tkrYI9wVZ9/Sj1l4tlWY4HOC6Dy5OYBRCmo2T9N8EXrAxXZKKUPzgmb3gIv
                AQJ9DP6woiHyyztZJ5/cbhlp8EbHBIvGWK3T0Oph3kEPPS2FWKjiH/+pV6qY0Yt+
                lkzcwxrjZIah/3VHQXUDm8X1AgMBAAGjbTBrMB0GA1UdDgQWBBQKvBeVNGu8hxtb
                TP31Y4UttI/1bDASBgNVHRMBAf8ECDAGAQH/AgEAMAsGA1UdDwQEAwIBBjApBgNV
                HSUEIjAgBggrBgEFBQcDAQYIKwYBBQUHAwkGCmCGSAGG+EUBCAEwDQYJKoZIhvcN
                AQEFBQADgYEAD/6m8czx19uRPuaHVYhsEX5QGwJ4Y1NFswAByAuSBQB9KI9P2C7I
                muf1aOoslUC4TxnC6g9H5/XmlK1zbZ+2YuABOb08CTXBC2x3ewJnm94DGPBRzj9o
                0rXGEC+jsqsziBw+kg69xFn7PH09ZKUCue8POaaN/z5VoQMoM4ZNTP4=
                -----END CERTIFICATE-----
            `).trim()
        );
        await fsExtra.writeFile(path.join(keyDir, 'rootca.srl'), crypto.randomBytes(8).toString('hex'));
        await fsExtra.writeFile(
            path.join(keyDir, 'openssl.csr.cnf'),
            stripIndent(`
                [req]
                default_bits = 2048
                prompt = no
                default_md = sha256
                distinguished_name = dn

                [ dn ]
                C=US
                ST=Virginia
                O=Example
                emailAddress=test@example.com
                CN=${commonName}
            `).trim()
        );
        await fsExtra.writeFile(
            path.join(keyDir, 'openssl.cert.cnf'),
            stripIndent(`
                [ ca ]
                default_ca = cybervillains_ca

                [ cybervillains_ca ]
                certificate       = ./rootca.crt
                database          = ./index.txt
                private_key       = ./rootca.key
                serial            = ./rootca.srl
                default_crl_days  = 7
                default_days      = 3560
                new_certs_dir     = ./certs
                default_md        = sha256
                default_startdate = ${startYearMonth}01000000Z
                policy            = cybervillains_ca_policy
                x509_extensions   = certificate_extensions

                [ cybervillains_ca_policy ]
                commonName              = supplied
                stateOrProvinceName     = supplied
                countryName             = supplied
                organizationName        = supplied
                emailAddress            = optional

                [ certificate_extensions ]
                basicConstraints   = critical,CA:false
                subjectAltName     = DNS:${domain}
            `).trim()
        );
        await fsExtra.writeFile(path.join(keyDir, 'index.txt'), '');
        await fsExtra.mkdir(path.join(keyDir, 'certs'));

        await execa(
            'openssl',
            [
                'genrsa',
                '-out', 'key.pem',
                '2048'
            ],
            {cwd: keyDir}
        );

        await execa(
            'openssl',
            [
                'req',
                '-new',
                '-sha256',
                '-config', 'openssl.csr.cnf',
                '-key', 'key.pem',
                '-subj', `/C=US/ST=Virginia/O=Example/CN=${commonName}`,
                '-out', 'csr.pem'
            ],
            {cwd: keyDir}
        );

        await execa(
            'openssl',
            [
                'ca',
                '-batch',
                '-config', 'openssl.cert.cnf',
                '-out', 'cert.pem',
                '-cert', 'rootca.crt',
                '-keyfile', 'rootca.key',
                '-infiles', 'csr.pem',
            ],
            {cwd: keyDir}
        );

        const cert = await fsExtra.readFile(path.join(keyDir, 'cert.pem'), 'utf8');
        const key = await fsExtra.readFile(path.join(keyDir, 'key.pem'), 'utf8');
        const ca = await fsExtra.readFile(path.join(keyDir, 'rootca.crt'), 'utf8');

        return tls.createSecureContext({
            key,
            cert,
            ca: [ca],
        });
    })();

    return await certificates[domain];
}
