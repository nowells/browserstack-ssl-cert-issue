# Demonstrates the SSL Certificate issue

```
npm install

# You will need to add the following line to yuor /etc/hosts (which requires root)
echo "127.0.0.1 maestro-healthcheck.localhost.opower.it" >> /etc/hosts
```

## To see the bug run

```
BROWSERSTACK_USERNAME=user BROWSERSTACK_ACCESS_KEY=accessKey npm start
```

## To see the same code with no bug

```
PAGE_LOAD_STRATEGY=normal BROWSERSTACK_USERNAME=user BROWSERSTACK_ACCESS_KEY=accessKey npm start
```
