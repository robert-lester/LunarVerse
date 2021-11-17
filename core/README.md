# Core
> Authentication in one place

Core is an application that runs the authorization and authentication for the various applications within Lunar. The project is written in Typescript 3.5.3 and the compiled webpack bundle is running on AWS Lambdas on Node 10.16.1.

## Offline
To run the API for the first time offline, run the following commands:
```bash
~/core: yarn
~/core: sls offline
```

To run the API on a different stage or a different port, you can add `--port` and `--stage` flags:
```bash
~/core: sls offline --stage=production --port=8000
```

### Authenticating Offline
You can easily get Auth Tokens for the API or the frontend while developing by running core continuously offline and storing your credentials in [Postman](https://www.getpostman.com/) or [Insomnia](https://insomnia.rest/).

You can login using this function:

> `POST /core/login`

```typescript
email: string
orgSlug: string
password: string
```

## API Documentation
Coming soon...