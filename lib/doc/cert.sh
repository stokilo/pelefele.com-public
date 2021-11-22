#!/bin/sh

PROJECT_DIR=$(pwd)

mkdir ~/my-temp-generate-cert-folder
cd ~/my-temp-generate-cert-folder || exit

git clone https://github.com/OpenVPN/easy-rsa.git
cd easy-rsa/easyrsa3 || exit

./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa build-server-full server nopass
./easyrsa build-client-full client1.domain.tld nopass

mkdir ~/my-temp-cert-folder/
cp pki/ca.crt ~/my-temp-cert-folder/
cp pki/issued/server.crt ~/my-temp-cert-folder/
cp pki/private/server.key ~/my-temp-cert-folder/
cp pki/issued/client1.domain.tld.crt ~/my-temp-cert-folder/
cp pki/private/client1.domain.tld.key ~/my-temp-cert-folder/
cd ~/my-temp-cert-folder/ || exit

SERVER_CERT=`aws acm import-certificate --certificate fileb://server.crt --private-key fileb://server.key --certificate-chain fileb://ca.crt --query CertificateArn --output text`
aws ssm put-parameter --name "server-cert-parameter" --value $SERVER_CERT --type "String" --overwrite

CLIENT_CERT=`aws acm import-certificate --certificate fileb://client1.domain.tld.crt --private-key fileb://client1.domain.tld.key --certificate-chain fileb://ca.crt --query CertificateArn --output text`
aws ssm put-parameter --name "client-cert-parameter" --value $CLIENT_CERT --type "String" --overwrite

cd $PROJECT_DIR || exit
cp template.ovpn aws.ovpn
echo "<ca>" >> aws.ovpn
cat ~/my-temp-cert-folder/ca.crt >> aws.ovpn
echo "</ca>" >> aws.ovpn

echo "<cert>" >> aws.ovpn
cat ~/my-temp-cert-folder/client1.domain.tld.crt >> aws.ovpn
echo "</cert>" >> aws.ovpn

echo "<key>" >> aws.ovpn
cat ~/my-temp-cert-folder/client1.domain.tld.key >> aws.ovpn
echo "</key>" >> aws.ovpn

rm -rf ~/my-temp-generate-cert-folder
rm -rf ~/my-temp-cert-folder
