### VPN setup

Edit a shell script template for OpenVpn.

Replace vpn.aws-rest-api.com with your vpn domain name. Add to Route 53 CNAME *.vpn.aws-rest-api.com pointing to the DNS of Vpn endpoint.

```
template.ovpn 
```

Run following shell script before cdk deployment. It is required to run it only one time.

```
./cert.sh
```

Certificates will be deployed to AWS Certificate Manager and referenced in SSM.

Deploy a CDK VPN stack.

Go to Route53 hosted zone for domain and add CNAME like that

```
*.vpn.aws-rest-api.com *. *.cvpn-endpoint-0857299999999abee.prod.clientvpn.me-south-1.amazonaws.com
```

Open aws.ovpn with amazon VPN client or OpenVpn client.

Exclude

```
aws.ovpn
```

from the source code.
