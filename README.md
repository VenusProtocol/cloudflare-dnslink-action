# Venus Cloudflare DNSLink Github Action

## Introduction

A GitHub Action to update the DNSLink TXT record of a DNS using [Cloudflare](https://www.cloudflare.com).

## Usage

```yaml
- name: Update DNSLink TXT record
  uses: VenusProtocol/cloudflare-dnslink-action@main
  with:
    cid: QmXWKHN72K3bLnJPt4KhV9qVBUvuptwrD7WK7xjB85ewbk
    purge: true
    cloudflareHostname: app.venus.io
    cloudflareApiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    cloudflareZoneId: ${{ secrets.CLOUDFLARE_ZONE_ID }}
```
