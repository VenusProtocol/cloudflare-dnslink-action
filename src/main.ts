import { getInput, getBooleanInput, setFailed } from '@actions/core';
import axios from 'axios';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

const run = async () => {
  const cloudflareApiToken = getInput('cloudflareApiToken');
  const cloudflareZoneId = getInput('cloudflareZoneId');
  const cloudflareWeb3HostnameId = getInput('cloudflareWeb3HostnameId');
  const cid = getInput('cid');
  const shouldPurge = getBooleanInput('purge');

  const headers = {
    Authorization: `Bearer ${cloudflareApiToken}`,
    'Content-Type': 'application/json',
  };

  // Update DNSLink TXT record
  console.log('Updating DNSLink TXT record');
  const output = await axios.patch(
    `${CLOUDFLARE_API_URL}/zones/${cloudflareZoneId}/web3/hostnames/${cloudflareWeb3HostnameId}`,
    {
      dnslink: `/ipfs/${cid}`,
    },
    {
      headers,
    },
  );

  if (!output.data.success) {
    setFailed('Failed to update DNSLink TXT record');
    output.data.errors.map(console.log);
    return;
  }

  if (shouldPurge) {
    // Purge cache
  }
};

run();
