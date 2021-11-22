### Facebook Login setup

Create new test application using Facebook for developers platform.

Select 'Add Product' and select Facebook Login. 

Copy values from:

![picture 2](images/8e16ace184e4206e2f569a5a2007d70d06b3fc280c4f62699cc2f404217decad.png)  

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add keys

PROD_FACEBOOK_CLIENT_SECRET

DEV_FACEBOOK_CLIENT_SECRET

LOCAL_FACEBOOK_CLIENT_SECRET

PROD_FACEBOOK_CLIENT_ID

DEV_FACEBOOK_CLIENT_ID

LOCAL_FACEBOOK_CLIENT_ID

Set Website URL:

Copy domain name from AWS Cognito admin panel:

![picture 4](images/1f3e771a220a3eda0878519ea61e92b26b790a5d70028c576b45ca3acb51bea2.png)  

![img.png](./images/facebook2.png)

Add Website URL to App Domains under Basic->Settings->App Domains

![img.png](./images/facebook3.png)


![img.png](./images/facebook4.png)


### Google Login setup

Create new application:

![picture 1](images/1860207d590066970193a9b3fe968898072f5396801b3a8f8f7be4c0657f6744.png)  

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add two keys

PROD_GOOGLE_CLIENT_SECRET

DEV_GOOGLE_CLIENT_SECRET

LOCAL_GOOGLE_CLIENT_SECRET

PROD_GOOGLE_CLIENT_ID

DEV_GOOGLE_CLIENT_ID

LOCAL_GOOGLE_CLIENT_ID

Copy domain prefix from AWS Cognito admin panel:

![picture 4](images/1f3e771a220a3eda0878519ea61e92b26b790a5d70028c576b45ca3acb51bea2.png)  



![img.png](./images/google.png)

#### Cloudflare setup

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add 3 keys

PROD_CLOUDFLARE_ACCOUNT_ID
DEV_CLOUDFLARE_ACCOUNT_ID
LOCAL_CLOUDFLARE_ACCOUNT_ID

PROD_CLOUDFLARE_ZONE_ID   
DEV_CLOUDFLARE_ZONE_ID
LOCAL_CLOUDFLARE_ZONE_ID

PROD_CLOUDFLARE_API_TOKEN
DEV_CLOUDFLARE_API_TOKEN
LOCAL_CLOUDFLARE_API_TOKEN

where account and one ids should be copied from Cloudflare admin interface.
Api token should be generated from 'worker template' with adjusted permissions and zone id.

Edit wrangler.toml and fill:

account_id=
zone_id=

replace *pelefele.com (old stokilo.com) domains mapping with your own:

name
routes

for dev and prod profiles. 

![picture 1](images/c7d11d7aea5d8c0ffb4c3ceefb1e9542a7cfa0649c260f880e08e707a15bec56.png)  
