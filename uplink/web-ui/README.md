This project currently uses an ejected CRA (includes hot-reload) and a custom webpack production configuration for modules. Testing is done utilizing Jest.

## Environment Variables
This project uses environment variables for running locally and deploying.

Ensure you have a `.env` file at the root with the appropriate values. Feel free to use the existing `.env.sample` file as a guide.

The following environment variables need to be set based on where the local environment should be pointing:
```
REACT_APP_API_URL=''
REACT_APP_CORE_URL=''
```

## Developing
Ensure that you have run `yarn` to install any neccessary packages.

After successfull package installation, starting the dev server is as easy as running `yarn start`.

### Salesforce Modules
In order to develop for the Salesforce modules, you have to run the particular module's page. In order to do this, replace `<App/>` in the application's `index.tsx` file with the page component (`<SalesforceOverview/>` or `<SalesforceConversation/>`) wrapped by the Salesforce `<Auth/>` component.

The `<Auth/>` requires certain sessionStorage values to exist. The values below are what the component can expect. Keep in mind that this data may have changed from the time of this writing so values such as the `uplinkAuth` may be different.

```
<script>
	sessionStorage.setItem('uplinkSalesforceOrganizationId', '00D1H000000OtjZUAS');
	sessionStorage.setItem('uplinkOrganization', 'lunar');
	sessionStorage.setItem('uplinkAuth', 'bHVuYXI6MTcyYWUxNGNlMTY2ZDY0ZDI2MjU5NGJlODllYjYyMTA=');
	sessionStorage.setItem('uplinkSalesforceUserId', '0051H000009cpJeQAI');
	sessionStorage.setItem('uplinkAuthenticated', true);
	sessionStorage.setItem('uplinkUserPhoneNumber', '(407) 782-8954');
	sessionStorage.setItem('uplinkContactPhoneNumber', '(407) 588-7045');
</script>
```

## Testing
To run tests, run `yarn test`.

`yarn test` will 'watch' for any file changes and will re-run tests automatically.

To get coverage, run `yarn test --coverage`.

## Building
*Before building, please ensure you have performed `git pull` on the branch that you are about to build to avoid having outdated or otherwise unwated code deployed.*

To build the required bundles, ensure your `.env` file is pointing to the correct environments that you would like to build the bundle for.

The following environment variables need to be set based on where the bundle is pointing:
```
REACT_APP_API_URL=''
REACT_APP_CORE_URL=''
```
Ensure that all test are passing by running `yarn test`.

Run `yarn build` to build the bundles.

The build includes two different entries: one for the general web app and one for salesforce. these exist as entries under the names `app` and `salesforce` in the `build/static` folder.

### App

The `app` build for the web application will consist of a static folder along with any additional assets. The build can be found in the `build/` folder. This particular build does not require the `salesforce` folder so feel free to omit it in the deployment.

### Salesforce Modules

The `salesforce` build includes the Salesforce modules found under `src/modules/salesforce`. This build does not require any of the lazy loaded chunks (denoted by name as `number.chunk.filetype`), but does require the common chunk.

Since the deployment for our Salesforce module is not yet automatic and needs to be zipped for upload as a static resource into Salesforce, we need to ensure we are only packaging what is actually required. The zipped folder required here is the `build/static` folder and will look like this:

```
 static
 |- chunks
 |-- common.*
 |- media (include all files)
 |- salesforce (include all files)
```

**Ensure that the SF Visualforce Page has the updated filenames based on what the newly built files have been updated to. The Uplink app version number will exist as part of the filename and will change with every new build to production.**

## Deploying
*Make sure that you have the aws cli configured. More information on configuration can be found [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)*

To deploy, run `yarn run deploy $env` where `$env` is the environment you would like to deploy to.

The available environment argument values are `staging`, `qa`, `prod`. The command will fail if one of these environments is not supplied.

*Note: With CI deployments in place, you should not need to manually deploy a bundle.*

*Note: Keep in mind the staging and qa environment URL's vary against production.*

*Note: deploying to production requires changing your current AWS cli config to point to the production role.*
