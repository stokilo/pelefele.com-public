#### Introduction

Application is making use of 2 domains.

API domain: awss.ws 
WebApp domain: pelefele.com

#### Route53 config for AWSS.WS

Create new hosted zone: awss.ws

Name servers should be configured to resolve domains using AWS name servers.

Note hosted zone id, will be required to be part of AWS Secret: HOSTED_ZONE_ID


#### Domain setup documentation

API endpoint
api.awss.ws 
dev.api.awss.ws
local.api.awss.ws

Static website:
pelefele.com
dev.pelefele.com
localhost:3000  and local.pelefele.com

VPN
vpn.awss.ws
dev.vpn.awss.ws
local.vpn.awss.ws

ES (VPN required):
es.awss.ws
dev.es.awss.ws
local.es.awss.ws


### Cloudflare DNS settings for application

Check cloudflare workers config (admin UI and wrangler.toml) for domains:

pelefele.com 
dev.pelefele.com
local.pelefele.com

### Cloudflare

Deploy stack and manually add DNS entries for static content:

CNAME prod-assets    prod-assets.pelefele.com.s3-website.me-south-1.amazonaws.com
CNAME dev-assets     dev-assets.pelefele.com.s3-website.me-south-1.amazonaws.com
CNAME local-assets   local-assets.pelefele.com.s3-website.me-south-1.amazonaws.com


A pelefele.com 192.0.2.1
AAAA pelefele.com 2001:db8::
CNAME www pelefele.com




